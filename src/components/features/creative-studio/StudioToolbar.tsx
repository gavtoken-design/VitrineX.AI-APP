
import * as React from 'react';
import {
    ScissorsIcon,
    UserGroupIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    PlusCircleIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';
import SaveToLibraryButton from '../SaveToLibraryButton';
import MediaActionsToolbar from '../MediaActionsToolbar';

interface StudioToolbarProps {
    mediaUrl: string | null;
    textResult: string | null;
    saveName: string;
    setSaveName: (v: string) => void;
    loading: boolean;
    userId: string;
    onRemoveBackground: () => void;
    onSwapSubject: () => void;
    onGenerateVariation: () => void;
}

const StudioToolbar: React.FC<StudioToolbarProps> = ({
    mediaUrl,
    textResult,
    saveName,
    setSaveName,
    loading,
    userId,
    onRemoveBackground,
    onSwapSubject,
    onGenerateVariation
}) => {
    if (!mediaUrl && !textResult) return null;

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 flex flex-col md:flex-row items-center gap-4 bg-black/40 backdrop-blur-3xl border border-white/10 p-4 lg:p-6 rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
            {/* Mesh Background for the Toolbar */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

            {/* Save Input Area */}
            <div className="flex-1 w-full relative z-10">
                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block font-bold">Identidade da Criação</label>
                <div className="relative group">
                    <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="Dê um nome à sua obra..."
                        className="w-full bg-white/5 border border-white/5 focus:border-primary/50 text-white rounded-2xl px-5 py-3.5 text-sm transition-all outline-none pr-12 group-hover:bg-white/10"
                    />
                    <PlusCircleIcon className="w-5 h-5 text-white/20 absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-primary transition-colors" />
                </div>
            </div>

            {/* Action Buttons Area */}
            <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto mt-2 md:mt-0">

                {/* Main Save Action */}
                <SaveToLibraryButton
                    content={mediaUrl || textResult || ""}
                    type={textResult ? 'text' : 'image'}
                    userId={userId}
                    initialName={saveName}
                    tags={['creative-studio', 'premium']}
                    variant="primary"
                    className="rounded-2xl px-6 py-4 h-auto gradient-animated shadow-xl shadow-primary/20 text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                />

                {/* AI Enhancement Tools (Floating Secondary) */}
                {mediaUrl && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1.5 rounded-2xl backdrop-blur-md">
                        <button
                            onClick={onRemoveBackground}
                            disabled={loading}
                            className="p-3 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary rounded-xl transition-all disabled:opacity-30 group"
                            title="Remove o fundo da imagem atual usando IA de segmentação"
                        >
                            <ScissorsIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={onSwapSubject}
                            disabled={loading}
                            className="p-3 bg-white/5 hover:bg-secondary/20 text-white/60 hover:text-secondary rounded-xl transition-all disabled:opacity-30 group"
                            title="Troca o sujeito ou objeto principal da cena mantendo o estilo visual"
                        >
                            <UserGroupIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={onGenerateVariation}
                            disabled={loading}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all disabled:opacity-30 group"
                            title="Gera uma nova versão da mesma ideia com pequenas alterações criativas"
                        >
                            <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-all duration-700" />
                        </button>
                    </div>
                )}

                {/* Global Export/Download */}
                {mediaUrl && (
                    <MediaActionsToolbar
                        mediaUrl={mediaUrl}
                        fileName={`${saveName || 'criacao-premium'}.png`}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default StudioToolbar;
