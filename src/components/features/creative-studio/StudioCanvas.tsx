
import * as React from 'react';
import {
    PhotoIcon,
    EyeIcon,
    CloudArrowUpIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface StudioCanvasProps {
    loading: boolean;
    generatedMediaUrl: string | null;
    generatedAnalysis: string | null;
    previewUrl: string | null;
    onUploadClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StudioCanvas: React.FC<StudioCanvasProps> = ({
    loading,
    generatedMediaUrl,
    generatedAnalysis,
    previewUrl,
    onUploadClick,
    fileInputRef,
    onFileChange
}) => {
    return (
        <div className="flex-1 flex flex-col min-h-[300px] md:min-h-[500px] h-full">
            <div className="relative flex-1 glass-panel rounded-3xl border border-white/10 shadow-inner-glow overflow-hidden bg-grid-dark flex items-center justify-center group">

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    accept="image/*"
                />

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-center z-10"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                                <LoadingSpinner className="w-16 h-16 text-primary relative" />
                            </div>
                            <p className="text-[var(--text-premium-primary)] font-black italic uppercase tracking-[0.4em] animate-pulse text-[10px]">Materializando Visão IV...</p>
                        </motion.div>
                    ) : generatedMediaUrl ? (
                        <motion.div
                            key="result-image"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full h-full flex items-center justify-center p-4"
                        >
                            <img
                                src={generatedMediaUrl}
                                alt="Resultado da IA"
                                style={{ filter: 'contrast(100%) brightness(100%)' }} // Placeholder for future dynamic filters
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-premium transition-transform duration-700 hover:scale-[1.02]"
                            />
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                                <SparklesIcon className="w-3 h-3 text-primary shadow-glow shadow-primary/20" />
                                <span className="text-[8px] font-black text-[var(--text-premium-primary)] uppercase tracking-[0.2em]">Imagen 4.0 Ultra</span>
                            </div>
                        </motion.div>
                    ) : generatedAnalysis ? (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full h-full p-8 overflow-y-auto custom-scrollbar"
                        >
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-primary/20 rounded-xl border border-primary/50">
                                        <EyeIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Percepção Visual da IA</h3>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                                    <pre className="whitespace-pre-wrap text-white/80 font-inter leading-relaxed text-sm lg:text-base">
                                        {generatedAnalysis}
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    ) : previewUrl ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full h-full flex items-center justify-center p-4 group"
                        >
                            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl opacity-100 transition-opacity duration-500 shadow-xl" />

                            {/* Overlay for Action - Explicit interaction */}
                            <div
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer rounded-3xl"
                                onClick={onUploadClick}
                            >
                                <CloudArrowUpIcon className="w-12 h-12 text-white mb-2 scale-90 group-hover:scale-100 transition-transform" />
                                <p className="text-white font-bold text-sm tracking-widest uppercase">Trocar Imagem</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center text-center p-12 cursor-pointer"
                            onClick={onUploadClick}
                        >
                            <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] relative backdrop-blur-md shadow-2xl space-background">
                                    <PhotoIcon className="w-24 h-24 text-white/5 group-hover:text-primary transition-colors duration-700" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-[var(--text-premium-primary)] mb-3 tracking-tighter uppercase italic">O Canvas de Possibilidades</h4>
                            <p className="text-[var(--text-premium-muted)] text-[10px] font-bold uppercase tracking-widest max-w-xs leading-loose">
                                Cole uma imagem ou descreva sua visão para materializar o impossível.
                            </p>
                            <div className="mt-10 flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black text-[var(--text-premium-secondary)] hover:bg-white/10 hover:text-[var(--text-premium-primary)] transition-all uppercase tracking-widest">
                                <CloudArrowUpIcon className="w-5 h-5 text-primary" />
                                Iniciar Upload de Assets
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ambient Light Effects */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
            </div>
        </div>
    );
};

export default StudioCanvas;
