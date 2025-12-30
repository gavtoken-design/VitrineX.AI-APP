import * as React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, ArrowsRightLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';

interface BattleHistoryProps {
    showHistory: boolean;
    battleHistory: any[];
    onApplyHistory: (item: any) => void;
    onClearHistory: () => void;
}

export const BattleHistory: React.FC<BattleHistoryProps> = ({
    showHistory,
    battleHistory,
    onApplyHistory,
    onClearHistory
}) => {
    if (!showHistory) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 w-80 h-full bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 z-[60] p-6 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-blue-400" /> Histórico
                </h3>
                <Button variant="ghost" size="sm" onClick={onClearHistory} className="text-[10px] text-gray-500 hover:text-red-400 uppercase font-bold tracking-widest">
                    Limpar
                </Button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[calc(100%-100px)] pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {battleHistory.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
                        onClick={() => onApplyHistory(item)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(item.id).toLocaleTimeString()}</span>
                            <ArrowsRightLeftIcon className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="font-bold text-white text-sm mb-1 truncate">{item.query}</div>
                        {item.compareQuery && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span className="text-blue-500">VS</span> {item.compareQuery}
                            </div>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.sentiment > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.sentiment > 0 ? 'Positivo' : 'Negativo'}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {battleHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <ArrowPathIcon className="w-10 h-10 mb-4 animate-spin-slow" />
                        <p className="text-sm font-bold uppercase tracking-widest">Vazio</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
