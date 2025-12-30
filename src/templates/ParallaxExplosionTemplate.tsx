
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---
export interface ShowcaseItem {
    id: string;
    title: string;
    description: string;
    image?: string;
    color: string;
}

interface ParallaxExplosionTemplateProps {
    items: ShowcaseItem[];
    title?: string;
    subtitle?: string;
    onItemClick?: (item: ShowcaseItem) => void;
}

// --- Component Parts ---

const ParallaxSection = ({ item, index, onClick }: { item: ShowcaseItem; index: number; onClick?: (item: ShowcaseItem) => void }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <motion.section
            ref={ref}
            className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-3xl mb-8 snap-center perspective-1000"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3, margin: "0px" }}
        >
            {/* Dynamic Background Layer */}
            <motion.div
                className={cn("absolute inset-0 bg-gradient-to-br opacity-20", item.color)}
                variants={{
                    hidden: { scale: 1.2, rotate: -2 },
                    visible: {
                        scale: 1,
                        rotate: 0,
                        transition: { duration: 1.5, ease: "easeOut" }
                    }
                }}
            />

            {/* Explosive Elements */}
            <motion.div
                className={cn("absolute w-96 h-96 rounded-full blur-[100px] opacity-40 mix-blend-screen", item.color)}
                style={{ top: '20%', left: '10%' }}
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -50, 50, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror' }}
            />
            <motion.div
                className={cn("absolute w-64 h-64 rounded-full blur-[80px] opacity-30 mix-blend-overlay", item.color)}
                style={{ bottom: '20%', right: '10%' }}
                animate={{
                    x: [0, -30, 30, 0],
                    y: [0, 40, -40, 0],
                    scale: [0.8, 1.1, 1, 0.8],
                }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
            />

            {/* Content Layer */}
            <div className="relative z-10 text-center px-4 max-w-4xl">
                <motion.h2
                    className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl"
                    variants={{
                        hidden: { opacity: 0, y: 100, scale: 0.5, letterSpacing: "-0.1em" },
                        visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            letterSpacing: "0em",
                            transition: {
                                type: "spring",
                                damping: 12,
                                stiffness: 100,
                                duration: 0.8
                            }
                        }
                    }}
                >
                    {item.title}
                </motion.h2>

                <motion.p
                    className="text-xl md:text-2xl text-white/90 font-light tracking-wide max-w-2xl mx-auto backdrop-blur-sm bg-black/10 p-4 rounded-xl border border-white/10"
                    variants={{
                        hidden: { opacity: 0, y: 50 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { delay: 0.2, duration: 0.8 }
                        }
                    }}
                >
                    {item.description}
                </motion.p>

                {/* Interactive Element */}
                <motion.button
                    className={cn(
                        "mt-12 px-8 py-4 bg-white text-black font-bold rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]",
                        "hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transition-shadow"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    variants={{
                        hidden: { opacity: 0, scale: 0 },
                        visible: {
                            opacity: 1,
                            scale: 1,
                            transition: { delay: 0.4, type: "spring", stiffness: 200 }
                        }
                    }}
                    onClick={() => onClick?.(item)}
                >
                    Discover More
                </motion.button>
            </div>

            {/* Foreground Gradient */}
            <motion.div
                className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-20"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 1 } }
                }}
            />
        </motion.section>
    );
};

// --- Main Template Component ---

export const ParallaxExplosionTemplate: React.FC<ParallaxExplosionTemplateProps> = ({
    items,
    title = "Visual Experience",
    subtitle = "Templates that adapt. Stories that explode.",
    onItemClick
}) => {
    return (
        <div className="min-h-screen text-foreground p-4 md:p-8 space-y-24 pb-48">
            {/* Header Section */}
            <header className="py-20 text-center relative z-10">
                <motion.h1
                    className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6"
                    initial={{ opacity: 0, filter: "blur(20px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1 }}
                >
                    {title}
                </motion.h1>
                <motion.p
                    className="text-xl text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {subtitle}
                </motion.p>
            </header>

            {/* Render Dynamic Sections */}
            <div className="space-y-12">
                {items.map((item, index) => (
                    <ParallaxSection
                        key={item.id}
                        item={item}
                        index={index}
                        onClick={onItemClick}
                    />
                ))}
            </div>

            {/* Footer / Call to Action */}
            <motion.div
                className="relative h-[50vh] rounded-3xl overflow-hidden flex items-center justify-center border border-white/10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-100px" }}
            >
                <div className="absolute inset-0 bg-black z-0" />
                <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-black opacity-50"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />

                <div className="relative z-10 text-center">
                    <motion.h3
                        className="text-4xl md:text-6xl font-bold text-white mb-8"
                        whileInView={{
                            textShadow: "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)",
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Ready to Launch?
                    </motion.h3>
                    <motion.button
                        className="px-12 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-full font-bold text-xl shadow-lg ring-2 ring-white/20"
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236, 72, 153, 0.6)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Creating
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
