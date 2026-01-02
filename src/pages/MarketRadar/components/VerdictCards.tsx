import * as React from 'react';
import { motion } from 'framer-motion';
import {
    FireIcon,
    GlobeAltIcon,
    ClockIcon,
    ShieldExclamationIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';

interface VerdictCardsProps {
    aiVerdict: {
        opportunity: string;
        angle: string;
        risk: string;
        iveScore?: number;
        iveAction?: string;
        classification?: string;
        timing?: string;
        riskMap?: { saturation: string; drop: string; platform: string; hype: string };
    } | null;
    onCopy: (text: string) => void;
}

export const VerdictCards: React.FC<VerdictCardsProps> = ({ aiVerdict, onCopy }) => {
    if (!aiVerdict) return null;

    const getScoreColor = (score?: number) => {
        if (score === undefined) return 'text-gray-400';
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getActionColor = (action?: string) => {
        switch (action?.toLowerCase()) {
            case 'apostar': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'testar': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'descartar': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-6 mb-12">

            {/* 1. IVE & Classification Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* IVE Score Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-4"
                >
                    <LiquidGlassCard className="h-full border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Índice de Viabilidade (IVE)</h3>

                            <div className={`text-6xl font-black mb-2 ${getScoreColor(aiVerdict.iveScore)} drop-shadow-lg`}>
                                {aiVerdict.iveScore}
                            </div>

                            <div className={`px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-wider ${getActionColor(aiVerdict.iveAction)}`}>
                                {aiVerdict.iveAction}
                            </div>
                        </div>
                    </LiquidGlassCard>
                </motion.div>

                {/* Classification & Timing */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <LiquidGlassCard className="h-full p-6 flex flex-col justify-between border-l-4 border-l-purple-500">
                            <div className="flex items-center gap-3 mb-4">
                                <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
                                <h4 className="font-bold text-white">Classificação</h4>
                            </div>
                            <div className="flex-1 flex items-center">
                                <span className="text-2xl font-light text-purple-100">{aiVerdict.classification}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Baseado no ciclo de vida do mercado</p>
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <LiquidGlassCard className="h-full p-6 flex flex-col justify-between border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3 mb-4">
                                <ClockIcon className="w-6 h-6 text-blue-400" />
                                <h4 className="font-bold text-white">Janela de Entrada</h4>
                            </div>
                            <div className="flex-1 flex items-center">
                                <span className="text-2xl font-light text-blue-100">{aiVerdict.timing}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Timing para lançamento de produtos</p>
                        </LiquidGlassCard>
                    </motion.div>
                </div>
            </div>

            {/* 2. Risk Map Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/20 rounded-2xl p-6 border border-white/5"
            >
                <div className="flex items-center gap-2 mb-6">
                    <ShieldExclamationIcon className="w-5 h-5 text-red-400" />
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Mapa de Risco Estratégico</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Saturação', val: aiVerdict.riskMap?.saturation, delay: 0.1 },
                        { label: 'Queda Rápida', val: aiVerdict.riskMap?.drop, delay: 0.2 },
                        { label: 'Dependência', val: aiVerdict.riskMap?.platform, delay: 0.3 },
                        { label: 'Hype Artificial', val: aiVerdict.riskMap?.hype, delay: 0.4 }
                    ].map((risk, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-red-500/30 transition-colors">
                            <h5 className="text-xs text-gray-400 mb-2 font-bold">{risk.label}</h5>
                            <p className="text-sm text-gray-200 leading-snug">{risk.val || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* 3. Original Content (Opportunity, Angle, Main Risk) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Oportunidade', text: aiVerdict.opportunity, icon: FireIcon, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/20' },
                    { title: 'Ângulo de Venda', text: aiVerdict.angle, icon: GlobeAltIcon, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
                    { title: 'Risco Principal', text: aiVerdict.risk, icon: ExclamationTriangleIcon, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                    >
                        <LiquidGlassCard className={`h-full border ${item.border} bg-opacity-5`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-white font-bold">{item.title}</h4>
                                    </div>
                                    <button onClick={() => onCopy(item.text)} className={`p-1 hover:bg-white/10 rounded-lg opacity-50 hover:opacity-100 transition-opacity ${item.color}`}>
                                        <DocumentDuplicateIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                    {item.text}
                                </p>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
