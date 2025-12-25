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
        <div className="container mx-auto py-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="relative mb-8 text-center">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                    <GlobeAltIcon className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-xs font-medium text-blue-400">Inteligência Estratégica em Tempo Real</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight mb-4">
                    Radar de Mercado
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Descubra tendências, compare concorrentes e exporte insights.
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button onClick={handleExportImage} variant="outline" size="sm" className="hidden md:flex items-center gap-2" aria-label="Baixar Relatório em PNG">
                    <ArrowDownTrayIcon className="w-4 h-4" /> Baixar Relatório (PNG)
                </Button>
                <Button onClick={handleSaveToDriveAction} variant="outline" size="sm" className="hidden md:flex items-center gap-2" aria-label="Salvar Relatório no Drive">
                    <CloudArrowUpIcon className="w-4 h-4" /> Salvar no Drive
                </Button>
            </div>

            {/* Mode Indicator */}
            {isDemoMode && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg text-center text-sm font-bold mb-6 mx-auto max-w-md animate-pulse">
                    ⚠️ Modo Demonstração (Sem chave de API/Mock Data)
                </div>
            )}

            {/* Search Section */}
            <div className="bg-[var(--background-input)] border border-[var(--border-default)] p-6 rounded-3xl shadow-2xl mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className={isComparing ? "md:col-span-5" : "md:col-span-7"}>
                        <Input
                            id="market-radar-query"
                            label="Termo de Interesse"
                            placeholder="Ex: Marketing Digital..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <AnimatePresence>
                        {isComparing && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="md:col-span-4"
                            >
                                <Input
                                    id="market-radar-compare"
                                    label="Comparar com"
                                    placeholder="Concorrente..."
                                    value={compareQuery}
                                    onChange={(e) => setCompareQuery(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={isComparing ? "md:col-span-3" : "md:col-span-12 lg:col-span-5"}>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setLoading(true);
                                    addToast({ type: 'info', message: 'Buscando os assuntos mais quentes do momento...' });
                                    // Simulated logic for "Daily Trends" since we don't have a direct endpoint in the current simple wrapper
                                    // In a real app, this would hit /trends/daily
                                    setTimeout(() => {
                                        const hotTopics = [
                                            "Inteligência Artificial", "Big Brother Brasil", "Mercado Financeiro",
                                            "Futebol Brasileiro", "Lançamentos Netflix", "Eleições 2026",
                                            "Tecnologia 5G", "Sustentabilidade", "Marketing de Influência", "Carros Elétricos"
                                        ];
                                        // Pick a random one for "Lucky" feel or show a modal (keeping it simple: filling query)
                                        // Better UX: Show a list below query input? 
                                        // Let's autopopulate a list state!
                                        setDailyTrends(hotTopics);
                                        setLoading(false);
                                        addToast({ type: 'success', message: 'Top 10 Trends carregadas!' });
                                    }, 1500);
                                }}
                                className="hidden lg:flex items-center gap-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                title="Ver o que está em alta agora"
                            >
                                <FireIcon className="w-5 h-5" />
                                Top 10 Hoje
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsComparing(!isComparing)}
                                className={isComparing ? "text-primary bg-primary/10" : "text-gray-400"}
                                aria-label="Alternar modo de comparação"
                            >
                                <ArrowsRightLeftIcon className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={() => handleSearch()}
                                isLoading={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                                Scannear
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hot Trends Quick List */}
                <AnimatePresence>
                    {dailyTrends.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
                        >
                            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4" />
                                Em Alta Agora (Brasil)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {dailyTrends.map((topic, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setQuery(topic); handleSearch(topic); }}
                                        className="px-4 py-2 bg-orange-500/5 hover:bg-orange-500/20 border border-orange-500/10 rounded-full text-xs font-semibold text-gray-300 transition-all hover:scale-105 hover:text-white"
                                    >
                                        #{idx + 1} {topic}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setDailyTrends([])}
                                    className="px-3 py-2 text-xs text-gray-500 hover:text-gray-300"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Period Filters */}
            <div className="flex justify-center mb-8">
                <div className="bg-[var(--background-input)] border border-[var(--border-default)] p-1 rounded-xl inline-flex gap-1 shadow-lg">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${period === p.value
                                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                </div>
            ) : data ? (
                <div ref={reportRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 bg-transparent rounded-3xl">

                    {/* Interest Chart */}
                    <div className="bg-[var(--background-input)] border border-[var(--border-default)] p-4 md:p-8 rounded-3xl overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ClockIcon className="w-6 h-6 text-blue-400" />
                                Interesse ao Longo do Tempo
                            </h3>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                {periods.find(p => p.value === period)?.label}
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            {/* Custom SVG Area Chart to avoid Recharts build issues */}
                            <div className="relative h-full w-full">
                                {data?.interest_over_time?.timeline_data && (() => {
                                    const timeline = data.interest_over_time.timeline_data;
                                    // Fix 3.2: Division by zero risk
                                    if (!timeline || timeline.length < 2) {
                                        return <div className="h-full flex items-center justify-center text-gray-500">Dados insuficientes para gráfico</div>;
                                    }

                                    const width = 100;
                                    const height = 100;
                                    const maxVal = 100; // Trends is 0-100

                                    // Fix 3.3: key and color unused params removed
                                    const getPath = () => {
                                        if (!timeline.length) return '';

                                        const points = timeline.map((item: any, i: number) => {
                                            const x = (i / (timeline.length - 1)) * width;
                                            const val = item.values[0]?.value || 0;
                                            const y = height - ((val / maxVal) * height);
                                            return `${x},${y}`;
                                        }).join(' ');

                                        // Close the area for fill
                                        return `M 0,${height} L 0,${height - ((timeline[0].values[0]?.value || 0) / maxVal * height)} L ${points} L ${width},${height} Z`;
                                    };

                                    const linePath = () => {
                                        if (!timeline.length) return '';
                                        const points = timeline.map((item: any, i: number) => {
                                            const x = (i / (timeline.length - 1)) * width;
                                            const val = item.values[0]?.value || 0;
                                            const y = height - ((val / maxVal) * height); // Invert y for SVG
                                            return `${x},${y}`;
                                        }).join(' ');
                                        return `M ${points}`;
                                    }

                                    return (
                                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[102%] h-full ml-[-1%] overflow-visible">
                                            <defs>
                                                <linearGradient id="gradQuery" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                </linearGradient>
                                                <linearGradient id="gradCompare" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>

                                            {/* Query Chart */}
                                            <path d={getPath()} fill="url(#gradQuery)" />
                                            <path d={linePath()} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />

                                            {/* Compare Chart */}
                                            {isComparing && compareData?.interest_over_time?.timeline_data && (() => {
                                                const compTimeline = compareData.interest_over_time.timeline_data;
                                                // Fix 3.2 comparison check
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
                                                        <path d={compArea} fill="url(#gradCompare)" />
                                                        <path d={compLine} fill="none" stroke="#8b5cf6" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" />
                                                    </>
                                                )
                                            })()}
                                        </svg>
                                    );
                                })()}

                                {/* Grid Lines (HTML overlay for simplicity) */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    <div className="border-t border-gray-700/50 w-full h-px"></div>
                                    <div className="border-t border-gray-700/50 w-full h-px"></div>
                                    <div className="border-t border-gray-700/50 w-full h-px"></div>
                                    <div className="border-t border-gray-700/50 w-full h-px"></div>
                                    <div className="border-b border-gray-700/50 w-full h-px"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Breakout Corner */}
                        <div className="lg:col-span-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FireIcon className="w-6 h-6 text-orange-500" />
                                Alertas Breakout (Explosões de Busca)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(data.related_queries?.rising || []).slice(0, 6).map((q, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
                                        <span className="text-sm text-gray-200 font-medium truncate pr-4">{q.query}</span>
                                        <span className="text-xs font-bold text-orange-400 whitespace-nowrap bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20">
                                            {q.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Market Strength Score */}
                        <div className="lg:col-span-4 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                            <div className="relative w-32 h-32 mb-4">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${(85 / 100) * 364} 364`}
                                        className="text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-white">85</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Power Score</span>
                                </div>
                            </div>
                            <p className="text-white font-bold mb-1">Mercado Aquecido</p>
                            <p className="text-xs text-gray-400">O interesse no termo está em alta consistente.</p>
                        </div>
                    </div>

                    {/* SEO Keywords */}
                    <div className="bg-[var(--background-input)] border border-[var(--border-default)] p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                <ShareIcon className="w-5 h-5 text-indigo-400" />
                                SEO Keywords (Top Queries)
                            </h4>
                            <button onClick={() => {
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
                            }} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400" title="Exportar Lista TXT">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(data.related_queries?.top || []).slice(0, 15).map((q, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer">
                                    {q.query}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default MarketRadar;
