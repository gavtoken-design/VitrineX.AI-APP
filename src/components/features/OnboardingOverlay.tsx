
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../../contexts/TutorialContext';
import Button from '../ui/Button';
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

const OnboardingOverlay: React.FC = () => {
    const {
        isActive,
        isWelcomeOpen,
        currentStepIndex,
        steps,
        nextStep,
        prevStep,
        skipTutorial,
        closeWelcome,
        isGuidesEnabled
    } = useTutorial();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Update target position
    useEffect(() => {
        if (isActive && steps[currentStepIndex]) {
            const updatePosition = () => {
                const element = document.getElementById(steps[currentStepIndex].targetId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    setTargetRect(rect);
                }
            };

            // Scroll ONLY when the step changes
            const element = document.getElementById(steps[currentStepIndex].targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            // Small delay to ensure layout is ready after step transition
            const timeout = setTimeout(updatePosition, 300);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
                clearTimeout(timeout);
            };
        }
    }, [isActive, currentStepIndex, steps]);

    // Don't render anything if disabled
    if (!isGuidesEnabled && !isWelcomeOpen) return null;

    return (
        <AnimatePresence>
            {/* --- Welcome Modal --- */}
            {isWelcomeOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#0A0F19] border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative"
                    >
                        {/* Gradient Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3">Bem-vindo ao VitrineX OS</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Você acaba de acessar a plataforma de Inteligência Artificial mais avançada para marketing.
                                Gostaria de um tour rápido pelas funcionalidades principais?
                            </p>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={closeWelcome}
                                    className="w-full justify-center py-4 text-base bg-white !text-black hover:bg-gray-200 border-none font-bold shadow-xl shadow-white/10"
                                >
                                    Iniciar Startup
                                </Button>
                                <button
                                    onClick={closeWelcome} // Just close, no tutorial active
                                    className="text-gray-500 text-sm hover:text-white transition-colors py-2"
                                >
                                    Pular e explorar sozinho
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* --- Step Guide Overlay --- */}
            {isActive && targetRect && (
                <>
                    {/* Dark Backdrop with "hole" effect via clip-path style could be complex, 
                        using simple semi-transparent bg for now + highlight box */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[2px]"
                    />

                    {/* Highlight Box */}
                    <motion.div
                        layoutId="highlight-box"
                        className="fixed z-[9995] rounded-xl ring-2 ring-primary ring-offset-4 ring-offset-black/50 shadow-[0_0_30px_rgba(59,130,246,0.5)] pointer-events-none"
                        style={{
                            top: targetRect.top,
                            left: targetRect.left,
                            width: targetRect.width,
                            height: targetRect.height,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    {/* Tooltip Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={currentStepIndex}
                        className="fixed z-[10000] w-[calc(100vw-32px)] sm:w-80"
                        style={{
                            top: (targetRect.top > window.innerHeight - 280)
                                ? Math.max(80, targetRect.top - 220)
                                : Math.min(window.innerHeight - 200, targetRect.bottom + 20),
                            left: window.innerWidth < 640
                                ? '16px'
                                : Math.max(16, Math.min(window.innerWidth - 340, targetRect.left + (targetRect.width / 2) - 160)),
                        }}
                    >
                        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                            {/* Decorative Blur */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />

                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                                    Passo {currentStepIndex + 1} de {steps?.length || 0}
                                </span>
                                <button onClick={skipTutorial} className="text-gray-500 hover:text-white">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">
                                {steps[currentStepIndex].title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                {steps[currentStepIndex].content}
                            </p>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStepIndex === 0}
                                    className={`text-sm flex items-center gap-1 ${currentStepIndex === 0 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <ChevronLeftIcon className="w-3 h-3" />
                                    Anterior
                                </button>

                                <Button size="sm" onClick={nextStep} className="px-6 rounded-lg">
                                    {currentStepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}
                                    {currentStepIndex !== steps.length - 1 && <ChevronRightIcon className="w-3 h-3 ml-1" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OnboardingOverlay;
