import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, TrashIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';

interface StrategicHistoryProps {
    showHistory: boolean;
    onClose: () => void;
    history: any[];
    onRestore: (item: any) => void;
    onClear: () => void;
}

export const StrategicHistory: React.FC<StrategicHistoryProps> = ({
    showHistory,
    onClose,
    history,
    onRestore,
    onClear
}) => {
    return (
        <AnimatePresence>
            {showHistory && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0F172A] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-3">
                                <ClockIcon className="w-6 h-6 text-blue-400" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">Memória Estratégica</h2>
                                    <p className="text-xs text-gray-500">Seus últimos vereditos</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                    <ClockIcon className="w-16 h-16 mb-4 stroke-1" />
                                    <p>Nenhum histórico encontrado.</p>
                                </div>
                            ) : (
                                history.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 cursor-pointer transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
                                        onClick={() => onRestore(item)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{item.term}</h4>
                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                    {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className={`
                                                px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border
                                                ${item.verdict?.decision === 'Explorar Agora' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                                ${item.verdict?.decision === 'Testar com Cautela' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                                                ${item.verdict?.decision === 'Ignorar/Descartar' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                                            `}>
                                                {item.verdict?.score}/100
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm font-medium text-gray-300">
                                                {item.verdict?.decision}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 line-clamp-2 italic">
                                            "{item.verdict?.justification}"
                                        </p>

                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowPathIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/20">
                            <Button
                                variant="ghost"
                                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={onClear}
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Limpar Histórico
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
