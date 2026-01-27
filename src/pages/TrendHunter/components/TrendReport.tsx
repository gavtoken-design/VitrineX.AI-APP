
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPinIcon,
    RocketLaunchIcon,
    DocumentTextIcon,
    TagIcon,
    ClipboardDocumentIcon,
    PencilSquareIcon,
    SparklesIcon,
    CalendarDaysIcon,
    ShoppingBagIcon,
    BookmarkSquareIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import TrendChart from './TrendChart';
import { TrendResultStructured, OBJECTIVES } from '../types';
import { GoogleTrendsResult } from '../../../services/integrations/serpApi';
import {
    handleDownloadTxt,
    handleSaveToDrive,
    handleExportPDF,
    handleExportPPT,
    handleExportPNG
} from '../utils/exportUtils';
import { useToast } from '../../../contexts/ToastContext';

interface TrendReportProps {
    result: TrendResultStructured;
    query: string;
    city: string;
    objective: string;
    serpData: GoogleTrendsResult | null;
    onCreateContent: () => void;
    onSchedule: () => void;
    onGenerateHTML: () => Promise<void>;
    onSaveToLibrary: () => Promise<void>;
    onCreateCampaign: () => void;
}

const TrendReport: React.FC<TrendReportProps> = ({
    result,
    query,
    city,
    objective,
    serpData,
    onCreateContent,
    onSchedule,
    onGenerateHTML,
    onSaveToLibrary,
    onCreateCampaign
}) => {
    const { addToast } = useToast();
    const [exportLoading, setExportLoading] = useState(false);

    const handleCopySection = (text: string, sectionName: string) => {
        navigator.clipboard.writeText(text);
        addToast({ type: 'success', message: `${sectionName} copiado!` });
    };

    const wrapAsync = async (fn: () => Promise<void>, errorMsg: string) => {
        setExportLoading(true);
        try {
            await fn();
        } catch (err: any) {
            console.error(err);
            addToast({ type: 'error', message: err.message || errorMsg });
        } finally {
            setExportLoading(false);
        }
    };

    const renderScore = (score: number) => {
        let color = 'bg-blue-500';
        if (score >= 80) color = 'bg-green-500';
        else if (score >= 60) color = 'bg-yellow-500';
        else if (score < 40) color = 'bg-red-500';

        return (
            <div className="flex items-center gap-3">
                <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
                        <circle
                            cx="40" cy="40" r="35"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={`${(score / 100) * 220} 220`}
                            className={`${color.replace('bg-', 'text-')} `}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{score}</span>
                </div>
                <div>
                    <p className="text-sm text-muted">Score de Relevância</p>
                    <p className="text-lg font-semibold text-title">{score}/100</p>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 max-w-7xl mx-auto"
            id="trend-report-container"
        >

            {/* Result Header Card */}
            <div className="liquid-card p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <div className="bg-[#0A0F19]/80 backdrop-blur-2xl rounded-[2.3rem] p-8 md:p-12 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Análise Completa
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight">"{query}"</h3>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
                                <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><MapPinIcon className="w-4 h-4 text-gray-300" /> {city || 'Global'}</span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><RocketLaunchIcon className="w-4 h-4 text-gray-300" /> {OBJECTIVES.find(o => o.id === objective)?.label}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {renderScore(result.score)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <TrendChart serpData={serpData} />

            {/* Bento Grid Results */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Resumo Executivo (Large) */}
                <div className="lg:col-span-8 glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white-[0.07] transition-colors group">
                    <div className="flex justify-between items-start mb-6">
                        <h4 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><DocumentTextIcon className="w-5 h-5" /></span>
                            Resumo Executivo
                        </h4>
                        <button onClick={() => handleCopySection(result.resumo, 'Resumo')} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors" title="Copiar Resumo"> <ClipboardDocumentIcon className="w-5 h-5" /> </button>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-10 font-light whitespace-pre-line">{result.resumo}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5 relative group/item">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Motivadores</p>
                                <button onClick={() => handleCopySection(result.motivadores.join('\n'), 'Motivadores')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-600 hover:text-white transition-colors opacity-0 group-hover/item:opacity-100" title="Copiar Motivadores"> <ClipboardDocumentIcon className="w-4 h-4" /> </button>
                            </div>
                            <ul className="space-y-4">
                                {result.motivadores.map((m, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
                                        <span className="w-6 h-6 rounded-full bg-white/10 flex flex-shrink-0 items-center justify-center text-[10px] font-mono text-gray-400">{i + 1}</span>
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-6 rounded-2xl border border-yellow-500/10 relative group/item">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">Leitura de Cenário</p>
                                <button onClick={() => handleCopySection(result.leituraCenario, 'Leitura de Cenário')} className="p-1.5 hover:bg-white/10 rounded-lg text-yellow-500/50 hover:text-yellow-200 transition-colors opacity-0 group-hover/item:opacity-100" title="Copiar Cenário"> <ClipboardDocumentIcon className="w-4 h-4" /> </button>
                            </div>
                            <p className="text-yellow-100/80 text-sm leading-relaxed italic">"{result.leituraCenario}"</p>
                        </div>
                    </div>
                </div>

                {/* Termos em Alta (Side) */}
                <div className="lg:col-span-4 glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 flex flex-col justify-between group">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><TagIcon className="w-5 h-5" /></span>
                                Termos Correlatos
                            </h4>
                            <button onClick={() => handleCopySection(result.buscasSemelhantes.join(', '), 'Termos')} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Copiar Termos"> <ClipboardDocumentIcon className="w-4 h-4" /> </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {result.buscasSemelhantes.map((tag, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs font-bold border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 relative group/intent">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] font-mono text-gray-500 uppercase">Intenção do Usuário</p>
                            <button onClick={() => handleCopySection(result.interpretacaoBuscas, 'Intenção')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors opacity-0 group-hover/intent:opacity-100" title="Copiar Intenção"> <ClipboardDocumentIcon className="w-3.5 h-3.5" /> </button>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-light">"{result.interpretacaoBuscas}"</p>
                    </div>
                </div>

                {/* Ideia de Conteúdo */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500/5 to-transparent relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <SparklesIcon className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><PencilSquareIcon className="w-5 h-5" /></span>
                            Conteúdo
                        </h4>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleCopySection(result.sugestaoConteudo.oque, 'Ideia de Conteúdo')} className="p-1.5 hover:bg-white/10 rounded-lg text-pink-300/50 hover:text-pink-300 transition-colors" title="Copiar Ideia"> <ClipboardDocumentIcon className="w-4 h-4" /> </button>
                            <span className="hidden xl:inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-pink-500/20 text-pink-300 border border-pink-500/20 truncate max-w-[100px]">{result.sugestaoConteudo.formato}</span>
                        </div>
                    </div>
                    <p className="text-white mb-6 min-h-[60px] whitespace-pre-line relative z-10 text-sm font-light leading-relaxed line-clamp-4">"{result.sugestaoConteudo.oque}"</p>
                    <div className="flex flex-col gap-2 relative z-10 mt-auto">
                        <Button onClick={onCreateContent} variant="liquid" className="w-full font-bold shadow-lg shadow-pink-500/10 text-xs" title="Gerar post com IA">
                            <SparklesIcon className="w-3.5 h-3.5 mr-2" /> Criar
                        </Button>
                        <Button onClick={onSchedule} variant="outline" className="w-full border-white/10 hover:bg-white/5 text-gray-300 text-xs">
                            <CalendarDaysIcon className="w-3.5 h-3.5 mr-2" /> Agendar
                        </Button>
                    </div>
                </div>

                {/* Oportunidade de Produto */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden hover:bg-white/[0.02] transition-colors group">
                    <div className="mb-6 flex justify-between items-center">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><ShoppingBagIcon className="w-5 h-5" /></span>
                            Produto
                        </h4>
                        <button onClick={() => handleCopySection(`${result.sugestaoProduto.tipo}\nTemas: ${result.sugestaoProduto.temas.join(', ')}`, 'Sugestão de Produto')} className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400/50 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100" title="Copiar Produto"> <ClipboardDocumentIcon className="w-4 h-4" /> </button>
                    </div>
                    <div className="space-y-4 h-full flex flex-col">
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex-grow">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sugestão de Oferta</p>
                            <p className="text-white text-sm font-medium leading-relaxed">"{result.sugestaoProduto.tipo}"</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Tópicos Chave</p>
                            <div className="flex flex-wrap gap-2">
                                {result.sugestaoProduto.temas.map((tema, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase rounded-lg">
                                        {tema}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estratégia de Campanha */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/5 to-transparent relative overflow-hidden hover:bg-white/[0.02] transition-colors group">
                    <div className="mb-6 flex justify-between items-center">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><RocketLaunchIcon className="w-5 h-5" /></span>
                            Tráfego
                        </h4>
                        <button onClick={() => handleCopySection(`${result.sugestaoCampanha.estrategia}\nCTA: ${result.sugestaoCampanha.cta}`, 'Estratégia de Tráfego')} className="p-1.5 hover:bg-white/10 rounded-lg text-orange-400/50 hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100" title="Copiar Estratégia"> <ClipboardDocumentIcon className="w-4 h-4" /> </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed whitespace-pre-line font-light min-h-[60px] max-h-[100px] overflow-y-auto custom-scrollbar custom-scrollbar-light">{result.sugestaoCampanha.estrategia}</p>
                    <div className="mt-auto bg-black/30 rounded-xl p-4 border border-white/10 text-center mb-4">
                        <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Sugestão de CTA</p>
                        <p className="text-orange-100 font-bold text-sm">"{result.sugestaoCampanha.cta}"</p>
                    </div>
                    <Button onClick={onCreateCampaign} variant="outline" className="w-full border-orange-500/20 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 text-xs">
                        <RocketLaunchIcon className="w-3.5 h-3.5 mr-2" /> Criar Campanha
                    </Button>
                </div>

                {/* Veredito Final (Full Width) */}
                <div className="lg:col-span-12 relative overflow-hidden rounded-[2.5rem]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F19] to-black border border-white/10" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">⚡</span>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight">Veredito da IA</h4>
                                <button onClick={() => handleCopySection(`${result.conclusao.avaliacao}\n${result.conclusao.melhorEstrategia}`, 'Veredito')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Copiar Veredito"> <ClipboardDocumentIcon className="w-5 h-5" /> </button>
                            </div>
                            <p className="text-xl text-gray-300 font-light leading-relaxed mb-6">
                                {result.conclusao.avaliacao}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Ideal para:</span>
                                {result.conclusao.idealPara.map((tag, i) => (
                                    <span key={i} className="text-white bg-white/10 px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="md:w-1/3 bg-green-500/10 border border-green-500/20 p-6 rounded-2xl backdrop-blur-md">
                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3">Recomendação de Ação</p>
                            <p className="text-white font-bold text-lg leading-snug">
                                {result.conclusao.melhorEstrategia}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-end gap-3 mt-12 pt-8 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-500 uppercase tracking-widest mr-auto">Exportar Relatório {exportLoading && '(Processando...)'}</span>

                <Button onClick={() => handleDownloadTxt(result, query, city)} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                    TXT
                </Button>
                <Button onClick={() => wrapAsync(() => handleSaveToDrive(result, query, city), 'Erro ao salvar no Drive')} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                    Drive
                </Button>
                <Button onClick={() => wrapAsync(() => handleExportPDF('trend-report-container', query), 'Erro ao exportar PDF')} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                    PDF
                </Button>
                <Button onClick={() => handleExportPPT(result, query)} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                    PPT
                </Button>
                <Button onClick={() => wrapAsync(() => handleExportPNG('trend-report-container', query), 'Erro ao exportar PNG')} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                    PNG
                </Button>
                <Button onClick={() => wrapAsync(onGenerateHTML, 'Erro ao gerar Landing Page')} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                    Landing Page
                </Button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button onClick={() => wrapAsync(onSaveToLibrary, 'Erro ao salvar na Biblioteca')} variant="primary" size="sm" className="shadow-lg shadow-primary/20">
                    <BookmarkSquareIcon className="w-4 h-4 mr-2" /> Salvar na Biblioteca
                </Button>
            </div>

        </motion.div>
    );
};

export default TrendReport;
