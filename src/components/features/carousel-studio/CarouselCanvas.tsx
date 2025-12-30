
import * as React from 'react';
import {
    ViewColumnsIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { LogoSettings } from '../BrandAssetsManager';

interface CarouselSlide {
    id: number;
    imageUrl: string | null;
    text: string;
    prompt: string;
}

interface CarouselCanvasProps {
    slides: CarouselSlide[];
    setSlides: (slides: CarouselSlide[]) => void;
    selectedSlide: number;
    setSelectedSlide: (index: number) => void;
    loading: boolean;
    fontFamily: string;
    textColor: string;
    logoSettings: LogoSettings;
    handleClearSlide: (index: number) => void;
}

const CarouselCanvas: React.FC<CarouselCanvasProps> = ({
    slides,
    setSlides,
    selectedSlide,
    setSelectedSlide,
    loading,
    fontFamily,
    textColor,
    logoSettings,
    handleClearSlide
}) => {
    return (
        <div className="flex flex-col gap-8">
            {/* Canvas do Carrossel */}
            <div className="relative liquid-card rounded-[3rem] border border-white/10 overflow-hidden aspect-square bg-grid-dark flex items-center justify-center p-4 sm:p-8 lg:p-12 shadow-2xl bg-[#080808] group/canvas">
                {/* Canvas Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6 text-center z-10"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
                                <LoadingSpinner className="w-16 h-16 text-blue-500 relative" />
                            </div>
                            <p className="text-white font-bold uppercase tracking-[0.3em] animate-pulse text-xs">Esculpindo Realidade IV...</p>
                        </motion.div>
                    ) : slides[selectedSlide]?.imageUrl ? (
                        <motion.div
                            key={selectedSlide}
                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                            className="relative w-full h-full flex items-center justify-center z-10"
                        >
                            <div className="relative w-full h-full max-w-2xl aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group shadow-black/50">
                                <img
                                    src={slides[selectedSlide].imageUrl!}
                                    alt={`Slide ${selectedSlide + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    style={{ transitionDuration: '5000ms' }}
                                />

                                {/* Overlay de Texto Premium */}
                                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                                    <textarea
                                        value={slides[selectedSlide].text}
                                        onChange={(e) => {
                                            const newSlides = [...slides];
                                            newSlides[selectedSlide].text = e.target.value;
                                            setSlides(newSlides);
                                        }}
                                        className="w-full bg-transparent border-none text-center font-bold text-xl sm:text-3xl lg:text-4xl leading-tight resize-none outline-none focus:ring-0 rounded-xl p-2 transition-all placeholder:opacity-20 drop-shadow-lg selection:bg-blue-500/50"
                                        style={{ fontFamily, color: textColor }}
                                        spellCheck={false}
                                    />
                                </div>

                                {/* Marca D'água Dinâmica */}
                                {logoSettings.previewUrl && (
                                    <motion.div
                                        drag
                                        dragMomentum={false}
                                        className={`absolute cursor-move active:cursor-grabbing transition-opacity duration-300 ${logoSettings.position === 'top-left' ? 'top-8 left-8' :
                                            logoSettings.position === 'top-right' ? 'top-8 right-8' :
                                                logoSettings.position === 'bottom-left' ? 'bottom-8 left-8' :
                                                    'bottom-[30%] right-8'
                                            }`}
                                        style={{
                                            opacity: logoSettings.opacity,
                                            transform: `scale(${logoSettings.scale})`,
                                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                                        }}
                                    >
                                        <img src={logoSettings.previewUrl} className="max-w-[100px] md:max-w-[140px] pointer-events-none" alt="Branding" />
                                    </motion.div>
                                )}

                                {/* Badge do Modelo */}
                                <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 shadow-lg">
                                    IMAGEN_4.0_ULTRA
                                </div>

                                {/* Botão de Apagar (Overlay) */}
                                <button
                                    onClick={() => handleClearSlide(selectedSlide)}
                                    className="absolute top-6 right-6 p-2 rounded-xl bg-black/40 border border-white/10 text-white/50 hover:bg-red-500/80 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                                    title="Apagar imagem"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center text-center opacity-20 text-white z-10">
                            <ViewColumnsIcon className="w-32 h-32 mb-6 strok-[0.5]" />
                            <p className="text-sm font-bold uppercase tracking-[0.4em]">Aguardando Visual</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Dots de Navegação */}
                {!loading && slides[0].imageUrl && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${selectedSlide === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Seletor de Miniaturas */}
            {!loading && slides[0].imageUrl && (
                <div className="grid grid-cols-4 gap-4">
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => setSelectedSlide(idx)}
                            className={`relative aspect-square rounded-2xl overflow-hidden border transition-all duration-300 group ${selectedSlide === idx ? 'border-blue-500 ring-4 ring-blue-500/10 scale-105 z-10' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                        >
                            {slide.imageUrl ? (
                                <img src={slide.imageUrl} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <ViewColumnsIcon className="w-8 h-8 text-white/20" />
                                </div>
                            )}

                            <div className={`absolute inset-0 flex items-center justify-center font-black text-2xl ${selectedSlide === idx ? 'bg-blue-500/20 text-white' : 'bg-black/50 text-white/50'}`}>
                                {idx + 1}
                            </div>
                            {/* Remove Slide shortcut */}
                            <div
                                onClick={(e) => { e.stopPropagation(); handleClearSlide(idx); }}
                                className="absolute top-1 right-1 p-1 bg-black/50 rounded-md text-white/50 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <TrashIcon className="w-3 h-3" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CarouselCanvas;
