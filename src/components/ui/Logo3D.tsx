
'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface Logo3DProps {
    collapsed?: boolean;
    onClick?: () => void;
    className?: string;
}

const Logo3D: React.FC<Logo3DProps> = ({ collapsed, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`relative group flex items-center justify-center outline-none ${className}`}
            aria-label="Ir para Dashboard"
        >
            <div className="relative w-10 h-10 perspective-500">
                <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    whileHover={{
                        rotateY: 180,
                        scale: 1.1,
                        transition: { duration: 0.6, ease: "easeInOut" }
                    }}
                    animate={{
                        rotateY: 0,
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face (Logo V) */}
                    <div className="absolute inset-0 bg-primary rounded-xl flex items-center justify-center backface-hidden shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary-hover">
                        <span className="text-white font-bold text-xl tracking-tighter">V</span>
                    </div>

                    {/* Back Face (Dashboard Icon) */}
                    <div
                        className="absolute inset-0 bg-surface-active rounded-xl flex items-center justify-center backface-hidden shadow-lg border border-primary/20"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <div className="grid grid-cols-2 gap-0.5 p-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-[1px]"></div>
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-[1px]"></div>
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-[1px]"></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-[1px]"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>

            {/* Text Label (Hidden when collapsed) */}
            <motion.div
                animate={{
                    width: collapsed ? 0 : 'auto',
                    opacity: collapsed ? 0 : 1,
                    marginLeft: collapsed ? 0 : 12,
                }}
                className="overflow-hidden whitespace-nowrap"
            >
                <div className="flex flex-col items-start">
                    <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-title to-body dark:from-white dark:to-gray-400">
                        VitrineX
                    </span>
                    <span className="text-[10px] text-primary font-medium tracking-widest uppercase">
                        AI Studio
                    </span>
                </div>
            </motion.div>
        </button>
    );
};

export default Logo3D;
