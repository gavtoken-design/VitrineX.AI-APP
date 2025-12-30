
import * as React from 'react';
import {
    CloudArrowUpIcon,
    CircleStackIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';

interface CarouselToolbarProps {
    hasImages: boolean;
    loading: boolean;
    onDownloadZip: () => void;
    onSaveToLibrary: () => void;
    onShare: () => void;
    onSchedule: () => void;
}

const CarouselToolbar: React.FC<CarouselToolbarProps> = ({
    hasImages,
    loading,
    onDownloadZip,
    onSaveToLibrary,
    onShare,
    onSchedule
}) => {
    return (
        <AnimatePresence>
            {hasImages && !loading && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-center bg-white/[0.03] p-6 rounded-[2rem] border border-white/10 backdrop-blur-md gap-6 shadow-2xl"
                >
                    <div className="flex gap-4 w-full flex-wrap justify-center lg:justify-start">
                        <Button
                            variant="ghost"
                            className="border border-white/10 text-[var(--text-premium-muted)] hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl px-6"
                            onClick={onDownloadZip}
                        >
                            <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Baixar ZIP</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="border border-white/10 text-[var(--text-premium-muted)] hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl px-6"
                            onClick={onSaveToLibrary}
                        >
                            <CircleStackIcon className="w-5 h-5 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Salvar na Biblioteca</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="border border-white/10 text-[var(--text-premium-muted)] hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl px-6"
                            onClick={onShare}
                        >
                            <ShareIcon className="w-5 h-5 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Compartilhar</span>
                        </Button>
                    </div>

                    <div className="w-full lg:w-auto">
                        <Button
                            onClick={onSchedule}
                            variant="liquid"
                            className="w-full lg:w-auto px-8 py-3 font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-500/20 rounded-xl"
                        >
                            Agendar Post
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CarouselToolbar;
