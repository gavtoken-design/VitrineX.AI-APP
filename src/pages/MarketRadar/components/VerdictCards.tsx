import * as React from 'react';
import { motion } from 'framer-motion';
import { FireIcon, GlobeAltIcon, ClockIcon } from '@heroicons/react/24/outline';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';

import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface VerdictCardsProps {
    aiVerdict: {
        opportunity: string;
        angle: string;
        risk: string;
    } | null;
    onCopy: (text: string) => void;
}

export const VerdictCards: React.FC<VerdictCardsProps> = ({ aiVerdict, onCopy }) => {
    if (!aiVerdict) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <LiquidGlassCard className="h-full border border-orange-500/20 bg-orange-500/5">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                                    <FireIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Oportunidade</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Aproveite agora</p>
                                </div>
                            </div>
                            <button onClick={() => onCopy(aiVerdict.opportunity)} className="p-1 hover:bg-white/10 rounded-lg text-orange-400/70 hover:text-orange-400 transition-colors">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {aiVerdict.opportunity}
                        </p>
                    </div>
                </LiquidGlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <LiquidGlassCard className="h-full border border-blue-500/20 bg-blue-500/5">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                    <GlobeAltIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Ângulo de Venda</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Foque no desejo</p>
                                </div>
                            </div>
                            <button onClick={() => onCopy(aiVerdict.angle)} className="p-1 hover:bg-white/10 rounded-lg text-blue-400/70 hover:text-blue-400 transition-colors">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {aiVerdict.angle}
                        </p>
                    </div>
                </LiquidGlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <LiquidGlassCard className="h-full border border-red-500/20 bg-red-500/5">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                    <ClockIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Risco</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Evite falhas</p>
                                </div>
                            </div>
                            <button onClick={() => onCopy(aiVerdict.risk)} className="p-1 hover:bg-white/10 rounded-lg text-red-400/70 hover:text-red-400 transition-colors">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {aiVerdict.risk}
                        </p>
                    </div>
                </LiquidGlassCard>
            </motion.div>
        </div>
    );
};
