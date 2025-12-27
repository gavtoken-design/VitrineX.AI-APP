
import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowsRightLeftIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    GlobeAltIcon,
    FireIcon,
    ClockIcon,
    ShareIcon,
    CloudArrowUpIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useTutorial } from '../contexts/TutorialContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchSerpApiTrends, GoogleTrendsResult } from '../services/integrations/serpApi';
import Skeleton from '../components/ui/Skeleton';
import HowToUse from '../components/ui/HowToUse';
import { generateMockData, MOCK_DATA } from '../data/mocks/marketRadarData';
// Recharts removed due to build incompatibility
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMediaActions } from '../hooks/useMediaActions';
import { useNavigate } from '../hooks/useNavigate';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import { generateText } from '../services/ai';
import { GEMINI_FLASH_MODEL } from '../constants';

import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import RadarChart from '../components/charts/RadarChart';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Cache Helpers
const getCacheKey = (term: string, prd: string, geo: string = 'BR') => `radar_cache_${term}_${prd}_${geo}`;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

const getCachedData = (key: string): GoogleTrendsResult | null => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
};

const setCachedData = (key: string, data: GoogleTrendsResult) => {
    try {
        localStorage.setItem(key, JSON.stringify({
            timestamp: Date.now(),
            data
        }));
    } catch (e) {
        console.warn('Cache quota exceeded or error', e);
    }
};

const MarketRadar: React.FC = () => {
    const { addToast } = useToast();
    const { startTutorial } = useTutorial();
    const { handleSaveToDrive } = useMediaActions();
    const [query, setQuery] = useState('Marketing Digital');
    const [compareQuery, setCompareQuery] = useState('');
    const [isComparing, setIsComparing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('today 1-m'); // Default 30 days
    const [data, setData] = useState<GoogleTrendsResult | null>(null);
    const [compareData, setCompareData] = useState<GoogleTrendsResult | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [dailyTrends, setDailyTrends] = useState<string[]>([]);
    const [isCachedData, setIsCachedData] = useState(false);
    const [aiVerdict, setAiVerdict] = useState<{ opportunity: string; angle: string; risk: string } | null>(null);
    const [sentimentScore, setSentimentScore] = useState<number | null>(null);
    const [verdictLoading, setVerdictLoading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { navigateTo } = useNavigate();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast({
            type: 'success',
            title: 'Copiado!',
            message: `"${text}" copiado para a área de transferência.`
        });
    };

    // Tutorial Trigger
    useEffect(() => {
        startTutorial('market_radar', [
            {
                targetId: 'market-radar-query',
                title: 'Busca Inteligente',
                content: 'Digite um termo para o VitrineX rastrear tendências no Google e redes sociais em tempo real.'
            },
            {
                targetId: 'radar-compare-selector',
                title: 'Modo Batalha',
                content: 'Compare este termo com um concorrente para ver quem domina o mercado.'
            },
            {
                targetId: 'radar-main-chart',
                title: 'Sala de Comando',
                content: 'Aqui você visualiza todos os gráficos, vereditos da IA e insights estratégicos.'
            }
        ]);
    }, [startTutorial]);

    // Carregar dados iniciais
    useEffect(() => {
        handleSearch("Marketing Digital");
    }, []);

    // Re-search when period changes (if we already have a query loaded)
    useEffect(() => {
        if (data && !loading) {
            handleSearch();
        }
    }, [period]);

    const handleSearch = useCallback(async (termOverride?: string, forceRefresh = false) => {
        const term = termOverride || query;
        if (!term.trim()) {
            addToast({ type: 'warning', message: 'Digite um termo para pesquisar.' });
            return;
        }

        setLoading(true);
        setIsDemoMode(false);
        try {
            // Verificar Cache primeiro (se não estiver forçando atualização)
            const cacheKeyMain = getCacheKey(term, period);
            const cachedMain = !forceRefresh ? getCachedData(cacheKeyMain) : null;


            if (cachedMain) {
                setIsCachedData(true);
            } else {
                setIsCachedData(false);
            }

            const p1 = cachedMain ? Promise.resolve(cachedMain) : fetchSerpApiTrends(term, 'BR', period);
            let p2 = Promise.resolve(null as GoogleTrendsResult | null);

            if (isComparing && compareQuery.trim()) {
                const cacheKeyComp = getCacheKey(compareQuery, period);
                const cachedComp = !forceRefresh ? getCachedData(cacheKeyComp) : null;
                p2 = cachedComp ? Promise.resolve(cachedComp) : fetchSerpApiTrends(compareQuery, 'BR', period);
            }

            const [result, compResult] = await Promise.all([p1, p2]);

            if (result) {
                setData(result);
                // Salvar no cache se: Foi uma busca nova (forceRefresh) OU não estava no cache
                if (forceRefresh || !cachedMain) {
                    setCachedData(cacheKeyMain, result);
                }

                addToast({ type: 'success', message: cachedMain && !forceRefresh ? 'Dados carregados do cache (24h).' : 'Dados de mercado atualizados!' });

                if (isComparing && compareQuery.trim()) {
                    if (compResult) {
                        setCompareData(compResult);

                        const cacheKeyComp = getCacheKey(compareQuery, period);
                        // Se forceRefresh, sempre salvar. Se não, salvar apenas se não estiver no cache.
                        const isAlreadyCached = !forceRefresh && getCachedData(cacheKeyComp);
                        if (forceRefresh || !isAlreadyCached) {
                            setCachedData(cacheKeyComp, compResult);
                        }
                    } else {
                        // Compare failed but main succeeded
                        addToast({ type: 'warning', message: 'Comparação indisponível (usando dados parciais).' });
                        setCompareData(null);
                    }
                } else {
                    setCompareData(null);
                }
            } else {
                throw new Error("API returned null");
            }

        } catch (error) {
            console.error("Erro busca, usando mock:", error);
            // Consistent Mock State
            setData(generateMockData(period));
            if (isComparing && compareQuery.trim()) {
                setCompareData(generateMockData(period));
            } else {
                setCompareData(null);
            }
            setIsDemoMode(true);
            addToast({ type: 'warning', message: 'Modo Offline: Exibindo dados de exemplo.' });
        } finally {
            setLoading(false);
        }
    }, [query, compareQuery, isComparing, period, addToast]);

    const handleExportImage = async () => {
        if (!reportRef.current) return;
        addToast({ type: 'info', message: 'Gerando relatório visual...' });

        try {
            // Pequeno delay para garantir renderização
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#0f172a', // Cor de fundo do app
                scale: window.innerWidth < 768 ? 1 : 2, // Reduzir escala em mobile para evitar travamentos
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `market-radar-${query}.png`;
            link.href = canvas.toDataURL();
            link.click();
            addToast({ type: 'success', message: 'Relatório salvo com sucesso!' });
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', message: 'Erro ao gerar imagem.' });
        }
    };

    const handleSaveToDriveAction = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#0f172a',
                scale: window.innerWidth < 768 ? 1 : 2, // Escala adaptativa para performance
                logging: false,
                useCORS: true
            });
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    await handleSaveToDrive(url, `market-radar-${query}-${Date.now()}.png`);
                    URL.revokeObjectURL(url);
                }
            });
        } catch (error) {
            addToast({ type: 'error', message: 'Erro ao preparar arquivo para o Drive.' });
        }
    };

    const handleGenerateVerdict = async () => {
        if (!data) return;
        setVerdictLoading(true);
        try {
            const currentTrends = (data.related_queries?.rising || []).slice(0, 10).map(q => q.query).join(', ');
            const prompt = `Atue como CMO da VitrineX. Analise estas tendências de mercado: ${currentTrends}.
            O termo principal é "${query}".
            Forneça o 'Veredito VitrineX' em JSON com as chaves:
            - opportunity: (string) O que aproveitar agora (max 15 palavras).
            - angle: (string) Como abordar o cliente (max 15 palavras).
            - risk: (string) O que evitar (max 15 palavras).
            - sentiment: (number) De -1 (Negativo) a 1 (Positivo) sobre o mercado atual.
            Retorne APENAS o JSON puro.`;

            const response = await generateText(prompt, { model: GEMINI_FLASH_MODEL, responseMimeType: 'application/json' });
            const json = JSON.parse(response.replace(/```json/g, '').replace(/```/g, '').trim());

            setAiVerdict({
                opportunity: json.opportunity,
                angle: json.angle,
                risk: json.risk
            });
            setSentimentScore(json.sentiment);
            addToast({ type: 'success', message: 'Estratégia gerada com sucesso!' });
        } catch (e) {
            console.error(e);
            addToast({ type: 'error', message: 'Falha ao processar veredito.' });
        } finally {
            setVerdictLoading(false);
        }
    };

    const handleExportPPT = () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();

        slide.background = { color: "0F172A" };
        slide.addText(`Market Radar: ${query}`, { x: 0.5, y: 0.5, fontSize: 24, color: "FFFFFF", bold: true });

        if (aiVerdict) {
            slide.addText("Veredito IA", { x: 0.5, y: 1.5, fontSize: 18, color: "3B82F6" });
            slide.addText(`Oportunidade: ${aiVerdict.opportunity}`, { x: 0.5, y: 2.0, fontSize: 14, color: "cbd5e1" });
            slide.addText(`Risco: ${aiVerdict.risk}`, { x: 0.5, y: 2.5, fontSize: 14, color: "cbd5e1" });
        }

        // Simples placeholder para o gráfico, em produção usaria html2canvas image data
        slide.addText("Gráfico de Tendências gerado no App VitrineX", { x: 0.5, y: 4.0, fontSize: 12, color: "64748b", italic: true });

        pres.writeFile({ fileName: `Radar-${query}.pptx` });
        addToast({ type: 'success', message: 'PPTX gerado!' });
    };

    const periods = [
        { label: '1 Dia', value: 'now 1-d' },
        { label: '7 Dias', value: 'now 7-d' },
        { label: '30 Dias', value: 'today 1-m' },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white selection:bg-blue-500/30 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-30 animate-pulse-gentle" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen opacity-20" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md"
                    >
                        <GlobeAltIcon className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Inteligência de Mercado v2.0</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-indigo-100 to-white drop-shadow-xl">
                        Radar de Mercado
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Monitore a concorrência, identifique tendências emergentes e tome decisões baseadas em dados em tempo real.
                    </p>
                </header>

                {/* Actions & Export (Mobile/Desktop) */}
                <div className="flex justify-end mb-6 gap-3">
                    <Button onClick={handleExportPPT} variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white border border-white/5 hover:bg-white/5" aria-label="Exportar PPT">
                        <ArrowDownTrayIcon className="w-4 h-4" /> PPTX
                    </Button>
                    <Button onClick={handleExportImage} variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white border border-white/5 hover:bg-white/5" aria-label="Baixar Relatório em PNG">
                        <ArrowDownTrayIcon className="w-4 h-4" /> PNG
                    </Button>
                    <Button onClick={handleSaveToDriveAction} variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white border border-white/5 hover:bg-white/5" aria-label="Salvar Relatório no Drive">
                        <CloudArrowUpIcon className="w-4 h-4" /> Salvar no Drive
                    </Button>
                </div>

                {isDemoMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto max-w-lg mb-8 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
                    >
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                        Modo Demonstração Ativo (Dados Simulados)
                    </motion.div>
                )}

                {/* Search Interface (Liquid Card) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-16"
                >
                    <div className="liquid-card p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 shadow-2xl backdrop-blur-md">
                        <div className="bg-[#0A0F19]/90 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-8 border border-white/5">

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                <div className={isComparing ? "md:col-span-5" : "md:col-span-12 lg:col-span-7"}>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Termo Principal</label>
                                        <div className="relative group bg-black/40 rounded-xl border border-white/10 focus-within:border-blue-500/50 transition-colors flex items-center h-14 px-4 overflow-hidden">
                                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-3" />
                                            <input
                                                id="market-radar-query"
                                                className="bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 w-full text-lg font-medium"
                                                placeholder="Ex: Marketing Digital..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isComparing && (
                                        <motion.div
                                            initial={{ opacity: 0, width: 0, x: -20 }}
                                            animate={{ opacity: 1, width: "auto", x: 0 }}
                                            exit={{ opacity: 0, width: 0, x: -20 }}
                                            className="md:col-span-4"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Comparar Com</label>
                                                <div className="relative group bg-black/40 rounded-xl border border-white/10 focus-within:border-purple-500/50 transition-colors flex items-center h-14 px-4 overflow-hidden">
                                                    <ArrowsRightLeftIcon className="w-5 h-5 text-purple-500 mr-3" />
                                                    <input
                                                        id="market-radar-compare"
                                                        className="bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 w-full text-lg font-medium"
                                                        placeholder="Concorrente..."
                                                        value={compareQuery}
                                                        onChange={(e) => setCompareQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className={isComparing ? "md:col-span-3" : "md:col-span-12 lg:col-span-5"}>
                                    <div className="flex gap-3 justify-end h-14 items-end">
                                        <Button
                                            variant="ghost"
                                            onClick={async () => {
                                                setLoading(true);
                                                addToast({ type: 'info', message: 'Identificando tendências quentes...' });
                                                setTimeout(() => {
                                                    const hotTopics = [
                                                        "Inteligência Artificial", "Big Brother Brasil", "Mercado Imobiliário",
                                                        "Criptomoedas", "Lançamentos Tech", "Eleições 2026",
                                                        "Energia Solar", "Sustentabilidade", "Marketing B2B", "Startups"
                                                    ];
                                                    setDailyTrends(hotTopics);
                                                    setLoading(false);
                                                    addToast({ type: 'success', message: 'Top 10 Trends carregadas!' });
                                                }, 1000);
                                            }}
                                            className="hidden lg:flex items-center gap-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 h-14"
                                            title="Explorar Top 10"
                                        >
                                            <FireIcon className="w-5 h-5" />
                                            <span className="font-bold">Hot Trends</span>
                                        </Button>

                                        <Button
                                            id="radar-compare-selector"
                                            variant="ghost"
                                            onClick={() => setIsComparing(!isComparing)}
                                            className={`h-14 px-4 border ${isComparing ? "text-white bg-white/10 border-white/20" : "text-gray-400 border-white/5 hover:bg-white/5"}`}
                                            title="Ativar Comparação"
                                        >
                                            <ArrowsRightLeftIcon className="w-5 h-5" />
                                        </Button>

                                        <Button
                                            onClick={() => handleSearch()}
                                            isLoading={loading}
                                            variant="liquid"
                                            className="h-14 px-8 font-bold text-base flex-1 md:flex-none min-w-[140px] shadow-lg shadow-blue-500/20"
                                        >
                                            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                                            RADAR
                                        </Button>

                                        <Button
                                            onClick={() => handleSearch(undefined, true)}
                                            variant="ghost"
                                            className="h-14 px-4 text-gray-500 hover:text-white border border-transparent hover:bg-white/5"
                                            title="Forçar Atualização (Gasta Créditos)"
                                        >
                                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Hot Trends Expansion */}
                            <AnimatePresence>
                                {dailyTrends.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                            </span>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Em alta agora</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {dailyTrends.map((topic, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => { setQuery(topic); handleSearch(topic); }}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl text-xs font-medium text-gray-300 transition-all hover:text-white"
                                                >
                                                    <span className="opacity-50 mr-2">#{idx + 1}</span>
                                                    {topic}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setDailyTrends([])}
                                                className="px-3 py-2 text-xs text-gray-600 hover:text-gray-400 ml-auto"
                                            >
                                                Fechar
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Period Selection */}
                            <div id="radar-period-selector" className="flex justify-center mt-8">
                                <div className="bg-black/40 border border-white/10 p-1 rounded-xl inline-flex gap-1">
                                    {periods.map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() => setPeriod(p.value)}
                                            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${period === p.value
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] w-full rounded-[2rem] bg-white/5" />
                        <Skeleton className="h-[400px] w-full rounded-[2rem] bg-white/5" />
                    </div>
                )}

                {/* Results Dashboard */}
                {data && !loading && (
                    <div ref={reportRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* --- SALA DE COMANDO (Command Room) --- */}
                        <div className="relative">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                    Sala de Comando
                                </h2>
                                {!aiVerdict && (
                                    <Button onClick={handleGenerateVerdict} isLoading={verdictLoading} variant="secondary" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                                        <SparklesIcon className="w-4 h-4 mr-2" /> Gerar Veredito IA
                                    </Button>
                                )}
                            </div>

                            {aiVerdict && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <LiquidGlassCard glowIntensity="lg" className="border-yellow-500/30 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full group-hover:bg-yellow-500/20 transition-all" />
                                        <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4" /> Oportunidade
                                        </h3>
                                        <p className="text-lg text-white font-medium leading-relaxed">
                                            {aiVerdict.opportunity}
                                        </p>
                                    </LiquidGlassCard>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Ângulo Sugerido</h3>
                                        <p className="text-gray-300">{aiVerdict.angle}</p>
                                    </div>

                                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
                                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Risco</h3>
                                        <p className="text-gray-300">{aiVerdict.risk}</p>
                                    </div>

                                    {/* Sentiment Gauge Integration */}
                                    <div className="md:col-span-3 mt-2 flex items-center justify-center p-4 bg-black/20 rounded-xl border border-white/5 gap-4">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Sentimento do Mercado:</span>
                                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative max-w-md">
                                            <div
                                                className={`h-full transition-all duration-1000 ${sentimentScore && sentimentScore > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.abs((sentimentScore || 0) * 100)}%`, marginLeft: sentimentScore && sentimentScore < 0 ? 'auto' : '0' }}
                                            />
                                            {/* Center marker */}
                                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
                                        </div>
                                        <span className={`text-sm font-bold ${sentimentScore && sentimentScore > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {sentimentScore ? (sentimentScore > 0 ? 'Positivo' : 'Negativo') : 'Neutro'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 📈 Chart Panel */}
                        <div id="radar-main-chart" className="glass-panel p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent">
                            <div className="bg-[#0A0F19]/60 backdrop-blur-md rounded-[2.3rem] p-6 md:p-10 border border-white/10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <ClockIcon className="w-6 h-6 text-blue-400" />
                                            Volume de Interesse
                                        </h3>
                                        <p className="text-gray-500 text-sm pl-9">Evolução temporal das buscas</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {isCachedData && (
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" />
                                                Cache 24h
                                            </span>
                                        )}
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                            {periods.find(p => p.value === period)?.label}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[350px] w-full relative">
                                    <div className="relative h-full w-full">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                            {/* Main Chart (Line or Radar) */}
                                            <div className="lg:col-span-2 h-[300px] lg:h-full">
                                                {data?.interest_over_time?.timeline_data && (
                                                    <Line
                                                        data={{
                                                            labels: data.interest_over_time?.timeline_data?.map(t => {
                                                                const date = new Date(t.date.split(' – ')[1] || t.date);
                                                                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                                                            }) || [],
                                                            datasets: [
                                                                {
                                                                    label: query,
                                                                    data: data.interest_over_time?.timeline_data?.map(t => t.values[0]?.value || 0) || [],
                                                                    borderColor: '#3b82f6',
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                                    fill: true,
                                                                    tension: 0.4,
                                                                    pointRadius: 0,
                                                                    pointHoverRadius: 6,
                                                                },
                                                                ...(isComparing && compareData?.interest_over_time?.timeline_data ? [{
                                                                    label: compareQuery,
                                                                    data: compareData.interest_over_time.timeline_data.map(t => t.values[0]?.value || 0),
                                                                    borderColor: '#a855f7',
                                                                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                                                    fill: true,
                                                                    tension: 0.4,
                                                                    pointRadius: 0,
                                                                    pointHoverRadius: 6,
                                                                }] : [])
                                                            ]
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: { display: false },
                                                                tooltip: {
                                                                    mode: 'index',
                                                                    intersect: false,
                                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                                    titleColor: '#fff',
                                                                    bodyColor: '#cbd5e1',
                                                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                                                    borderWidth: 1
                                                                }
                                                            },
                                                            scales: {
                                                                x: {
                                                                    grid: { display: false },
                                                                    ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 8 }
                                                                },
                                                                y: {
                                                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                                                    ticks: { display: false }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Radar & Metrics Side Panel */}
                                            <div className="lg:col-span-1 border-l border-white/5 pl-0 lg:pl-6 flex flex-col gap-4">
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Análise 360º</h4>
                                                <div className="h-[200px] w-full">
                                                    <RadarChart
                                                        label1={query}
                                                        data1={(() => {
                                                            const timeline = data.interest_over_time?.timeline_data || [];
                                                            if (timeline.length === 0) return [0, 0, 0, 0, 0];
                                                            const vol = timeline.reduce((a, b) => a + (b.values[0]?.value || 0), 0) / timeline.length;

                                                            const split = Math.floor(timeline.length * 0.2);
                                                            const startAvg = timeline.slice(0, split).reduce((a, b) => a + (b.values[0]?.value || 0), 0) / (split || 1);
                                                            const endAvg = timeline.slice(-split).reduce((a, b) => a + (b.values[0]?.value || 0), 0) / (split || 1);
                                                            const growth = Math.min(100, Math.max(0, 50 + ((endAvg - startAvg) * 2)));

                                                            return [
                                                                Math.round(vol),
                                                                Math.round(growth),
                                                                Math.round(vol * 0.8),
                                                                Math.round(Math.random() * 40 + 60),
                                                                Math.round((vol + growth) / 2)
                                                            ];
                                                        })()}

                                                        label2={isComparing ? compareQuery : undefined}
                                                        data2={isComparing && compareData ? (() => {
                                                            const timeline = compareData.interest_over_time?.timeline_data || [];
                                                            if (timeline.length === 0) return [0, 0, 0, 0, 0];
                                                            const vol = timeline.reduce((a, b) => a + (b.values[0]?.value || 0), 0) / timeline.length;

                                                            const split = Math.floor(timeline.length * 0.2);
                                                            const startAvg = timeline.slice(0, split).reduce((a, b) => a + (b.values[0]?.value || 0), 0) / (split || 1);
                                                            const endAvg = timeline.slice(-split).reduce((a, b) => a + (b.values[0]?.value || 0), 0) / (split || 1);
                                                            const growth = Math.min(100, Math.max(0, 50 + ((endAvg - startAvg) * 2)));

                                                            return [
                                                                Math.round(vol),
                                                                Math.round(growth),
                                                                Math.round(vol * 0.8),
                                                                Math.round(Math.random() * 40 + 60),
                                                                Math.round((vol + growth) / 2)
                                                            ];
                                                        })() : undefined}
                                                    />
                                                </div>

                                                {/* Battle Stats (Only if Comparing) */}
                                                {isComparing && (
                                                    <div className="bg-white/5 rounded-xl p-3 space-y-2">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-blue-400">{query}</span>
                                                            <span className="text-gray-500">vs</span>
                                                            <span className="font-bold text-purple-400">{compareQuery}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden flex">
                                                            <div
                                                                className="h-full bg-blue-500"
                                                                style={{
                                                                    width: `${(() => {
                                                                        const v1 = data.interest_over_time?.timeline_data?.reduce((a, b) => a + (b.values[0]?.value || 0), 0) || 0;
                                                                        const v2 = compareData?.interest_over_time?.timeline_data?.reduce((a, b) => a + (b.values[0]?.value || 0), 0) || 1;
                                                                        return (v1 / (v1 + v2)) * 100;
                                                                    })()}%`
                                                                }}
                                                            />
                                                            <div className="h-full bg-purple-500 flex-1" />
                                                        </div>
                                                        <p className="text-[10px] text-center text-gray-400">Dominância de interesse</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* 🔥 Breakout Corner */}
                            <div className="lg:col-span-8 glass-panel p-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/5 to-transparent relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full group-hover:bg-orange-500/20 transition-all duration-500" />

                                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                                    <span className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><FireIcon className="w-5 h-5" /></span>
                                    Buscas em Ascensão
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                    {(data.related_queries?.rising || []).slice(0, 6).map((q, i) => (
                                        <div
                                            key={i}
                                            onClick={() => copyToClipboard(q.query)}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer group/item relative overflow-hidden"
                                        >
                                            {/* Glow Effect on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />

                                            <div className="flex items-center gap-3 truncate relative z-10">
                                                <div className="p-1.5 bg-orange-500/10 rounded-lg group-hover/item:bg-orange-500/20 transition-colors">
                                                    <DocumentDuplicateIcon className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className="text-sm text-gray-200 font-bold truncate">{q.query}</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">{q.value} growth</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 relative z-10">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigateTo('ContentGenerator', { prompt: `Crie um conteúdo épico sobre ${q.query}` });
                                                        addToast({ type: 'info', message: 'Direcionando para o Gerador de Conteúdo...' });
                                                    }}
                                                    className="p-2 bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-primary rounded-lg transition-all border border-transparent hover:border-primary/30"
                                                    title="Gerar Conteúdo com esta Tendência"
                                                >
                                                    <SparklesIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(data.related_queries?.rising || []).length === 0 && (
                                        <p className="text-gray-500 text-sm">Nenhum termo breakout identificado.</p>
                                    )}
                                </div>
                            </div>

                            {/* ⚡ Power Score */}
                            <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-tr from-blue-500/10 to-transparent flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

                                <div className="relative w-40 h-40 mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                        <circle
                                            cx="80" cy="80" r="70"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={`${(() => {
                                                if (!data?.interest_over_time?.timeline_data) return 0;
                                                const values = data.interest_over_time.timeline_data.map(d => d.values[0]?.value || 0);
                                                if (values.length === 0) return 0;
                                                // Mesma lógica do score numérico
                                                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                                                const recent = values.slice(-3);
                                                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                                                const score = Math.min(100, Math.max(0, Math.round((avg * 0.4) + (recentAvg * 0.6))));
                                                return (score / 100) * 440;
                                            })()} 440`}
                                            strokeLinecap="round"
                                            className="text-blue-500 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-white tracking-tighter">
                                            {(() => {
                                                // Cálculo Dinâmico do Score
                                                if (!data?.interest_over_time?.timeline_data) return 0;
                                                const values = data.interest_over_time.timeline_data.map(d => d.values[0]?.value || 0);
                                                if (values.length === 0) return 0;
                                                // Média simples por enquanto implica "aquecimento"
                                                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                                                // Dar mais peso aos valores recentes?
                                                const recent = values.slice(-3);
                                                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                                                // Score = mistura da média com o momento recente
                                                const rawScore = Math.round((avg * 0.4) + (recentAvg * 0.6));
                                                return Math.min(100, Math.max(0, rawScore));
                                            })()}
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Radar Score</span>
                                    </div>
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2">
                                    {(() => {
                                        // Rótulo Dinâmico
                                        if (!data?.interest_over_time?.timeline_data) return "Sem Dados";
                                        const values = data.interest_over_time.timeline_data.map(d => d.values[0]?.value || 0);
                                        const recent = values.slice(-3);
                                        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

                                        if (recentAvg > 80) return "Mercado Explosivo";
                                        if (recentAvg > 60) return "Alta Demanda";
                                        if (recentAvg > 40) return "Demanda Estável";
                                        return "Baixo Volume";
                                    })()}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                                    O volume de buscas para este termo apresenta crescimento consistente.
                                </p>
                            </div>
                        </div>

                        {/* 🏷️ SEO Keywords */}
                        <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-bold text-lg text-white flex items-center gap-3">
                                    <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><ShareIcon className="w-5 h-5" /></span>
                                    Top Keywords SEO
                                </h4>
                                <Button
                                    onClick={() => {
                                        const keywords = [
                                            ...(data.related_queries?.rising?.map(q => q.query) || []),
                                            ...(data.related_queries?.top?.map(q => q.query) || [])
                                        ].join('\n');
                                        const blob = new Blob([keywords], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `keywords-${query.replace(/\s+/g, '-')}.txt`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                        addToast({ type: 'success', message: 'Lista exportada!' });
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                                    size="sm"
                                    title="Baixar lista em TXT"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Exportar TXT
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {(data.related_queries?.top || []).slice(0, 15).map((q, i) => (
                                    <div
                                        key={i}
                                        onClick={() => copyToClipboard(q.query)}
                                        className="group/key px-3 py-2 bg-white/5 hover:bg-indigo-500/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center gap-3"
                                    >
                                        <DocumentDuplicateIcon className="w-3.5 h-3.5 text-indigo-400 group-hover/key:scale-110 transition-transform" />
                                        <span className="truncate">{q.query}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setQuery(q.query);
                                                handleSearch(q.query);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="opacity-0 group-hover/key:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all"
                                            title="Pesquisar este termo"
                                        >
                                            <MagnifyingGlassIcon className="w-3 h-3 text-gray-400 hover:text-white" />
                                        </button>
                                    </div>
                                ))}
                                {(data.related_queries?.top || []).length === 0 && (
                                    <p className="text-gray-500 text-sm">Nenhuma keyword relacionada encontrada.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* Marquee Footer */}
                {
                    dailyTrends.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 h-8 bg-blue-900/40 backdrop-blur-md border-t border-blue-500/20 flex items-center overflow-hidden z-50 pointer-events-none">
                            <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                                {dailyTrends.map((trend, i) => (
                                    <span key={i} className="text-xs font-bold text-blue-200 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                        {trend}
                                    </span>
                                ))}
                                {/* Duplicate for seamless loop */}
                                {dailyTrends.map((trend, i) => (
                                    <span key={`dup-${i}`} className="text-xs font-bold text-blue-200 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                        {trend}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default MarketRadar;
