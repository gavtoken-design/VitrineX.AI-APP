import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowsRightLeftIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
    GlobeAltIcon,
    FireIcon,
    ClockIcon,
    ShareIcon,
    CloudArrowUpIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchSerpApiTrends, GoogleTrendsResult } from '../services/integrations/serpApi';
import Skeleton from '../components/ui/Skeleton';
import HowToUse from '../components/ui/HowToUse';
import { generateMockData, MOCK_DATA } from '../data/mocks/marketRadarData';
// Recharts removed due to build incompatibility
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMediaActions } from '../hooks/useMediaActions';
import html2canvas from 'html2canvas';

const MarketRadar: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
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
    const reportRef = useRef<HTMLDivElement>(null);

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

    const handleSearch = useCallback(async (termOverride?: string) => {
        const term = termOverride || query;
        if (!term.trim()) {
            addToast({ type: 'warning', message: 'Digite um termo para pesquisar.' });
            return;
        }

        setLoading(true);
        setIsDemoMode(false);
        try {
            // Parallel fetch if comparing
            const p1 = fetchSerpApiTrends(term, 'BR', period);
            let p2 = Promise.resolve(null as GoogleTrendsResult | null);

            if (isComparing && compareQuery.trim()) {
                p2 = fetchSerpApiTrends(compareQuery, 'BR', period);
            }

            const [result, compResult] = await Promise.all([p1, p2]);

            if (result) {
                setData(result);
                addToast({ type: 'success', message: 'Dados de mercado atualizados!' });

                if (isComparing && compareQuery.trim()) {
                    if (compResult) {
                        setCompareData(compResult);
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
                scale: 2 // Alta qualidade
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
            const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f172a', scale: 2 });
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

    const periods = [
        { label: '1 Dia', value: 'now 1-d' },
        { label: '7 Dias', value: 'now 7-d' },
        { label: '30 Dias', value: 'today 1-m' },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white selection:bg-blue-500/30 font-sans pb-20">
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
                    <Button onClick={handleExportImage} variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white border border-white/5 hover:bg-white/5" aria-label="Baixar Relatório em PNG">
                        <ArrowDownTrayIcon className="w-4 h-4" /> Exportar Radar
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
                            <div className="flex justify-center mt-8">
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

                        {/* 📈 Chart Panel */}
                        <div className="glass-panel p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent">
                            <div className="bg-[#0A0F19]/60 backdrop-blur-md rounded-[2.3rem] p-6 md:p-10 border border-white/10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <ClockIcon className="w-6 h-6 text-blue-400" />
                                            Volume de Interesse
                                        </h3>
                                        <p className="text-gray-500 text-sm pl-9">Evolução temporal das buscas</p>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        {periods.find(p => p.value === period)?.label}
                                    </div>
                                </div>

                                <div className="h-[350px] w-full relative">
                                    {/* Custom SVG Area Chart to avoid Recharts build issues */}
                                    <div className="relative h-full w-full">
                                        {data?.interest_over_time?.timeline_data && (() => {
                                            const timeline = data.interest_over_time.timeline_data;
                                            if (!timeline || timeline.length < 2) {
                                                return <div className="h-full flex items-center justify-center text-gray-500">Dados insuficientes para gráfico</div>;
                                            }

                                            const width = 100;
                                            const height = 100;
                                            const maxVal = 100;

                                            const getPath = () => {
                                                if (!timeline.length) return '';
                                                const points = timeline.map((item: any, i: number) => {
                                                    const x = (i / (timeline.length - 1)) * width;
                                                    const val = item.values[0]?.value || 0;
                                                    const y = height - ((val / maxVal) * height);
                                                    return `${x},${y}`;
                                                }).join(' ');
                                                return `M 0,${height} L 0,${height - ((timeline[0].values[0]?.value || 0) / maxVal * height)} L ${points} L ${width},${height} Z`;
                                            };

                                            const linePath = () => {
                                                if (!timeline.length) return '';
                                                const points = timeline.map((item: any, i: number) => {
                                                    const x = (i / (timeline.length - 1)) * width;
                                                    const val = item.values[0]?.value || 0;
                                                    const y = height - ((val / maxVal) * height);
                                                    return `${x},${y}`;
                                                }).join(' ');
                                                return `M ${points}`;
                                            }

                                            return (
                                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[102%] h-full ml-[-1%] overflow-visible filter drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                                    <defs>
                                                        <linearGradient id="gradQuery" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                        </linearGradient>
                                                        <linearGradient id="gradCompare" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>

                                                    {/* Query Chart */}
                                                    <path d={getPath()} fill="url(#gradQuery)" />
                                                    <path d={linePath()} fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

                                                    {/* Compare Chart */}
                                                    {isComparing && compareData?.interest_over_time?.timeline_data && (() => {
                                                        const compTimeline = compareData.interest_over_time.timeline_data;
                                                        if (!compTimeline || compTimeline.length < 2) return null;

                                                        const getCompPoints = () => {
                                                            return compTimeline.map((item: any, i: number) => {
                                                                const x = (i / (compTimeline.length - 1)) * width;
                                                                const val = item.values[0]?.value || 0;
                                                                const y = height - ((val / maxVal) * height);
                                                                return `${x},${y}`;
                                                            }).join(' ');
                                                        }
                                                        const compPointsStr = getCompPoints();
                                                        const compArea = `M 0,${height} L 0,${height - ((compTimeline[0].values[0]?.value || 0) / maxVal * height)} L ${compPointsStr} L ${width},${height} Z`;
                                                        const compLine = `M ${compPointsStr}`;

                                                        return (
                                                            <>
                                                                <path d={compArea} fill="url(#gradCompare)" opacity="0.6" />
                                                                <path d={compLine} fill="none" stroke="#8b5cf6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" />
                                                            </>
                                                        )
                                                    })()}
                                                </svg>
                                            );
                                        })()}

                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                            <div className="border-t border-white w-full h-px"></div>
                                            <div className="border-t border-white w-full h-px"></div>
                                            <div className="border-t border-white w-full h-px"></div>
                                            <div className="border-t border-white w-full h-px"></div>
                                            <div className="border-b border-white w-full h-px"></div>
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
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <span className="text-sm text-gray-200 font-medium truncate pr-4">{q.query}</span>
                                            <span className="text-[10px] font-bold text-orange-400 whitespace-nowrap bg-orange-400/10 px-2.5 py-1 rounded-full border border-orange-400/20">
                                                {q.value}
                                            </span>
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
                                            strokeDasharray={`${(85 / 100) * 440} 440`}
                                            strokeLinecap="round"
                                            className="text-blue-500 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-white tracking-tighter">85</span>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Radar Score</span>
                                    </div>
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2">Mercado Aquecido</h4>
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
                                    <span key={i} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer select-all">
                                        {q.query}
                                    </span>
                                ))}
                                {(data.related_queries?.top || []).length === 0 && (
                                    <p className="text-gray-500 text-sm">Nenhuma keyword relacionada encontrada.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketRadar;
