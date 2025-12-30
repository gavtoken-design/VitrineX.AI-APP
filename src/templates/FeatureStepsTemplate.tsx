
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utilitário local para garantir que o template funcione independente da estrutura de lib
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface Feature {
    step: string
    title?: string
    content: string
    image: string
}

export interface FeatureStepsProps {
    features?: Feature[]
    className?: string
    title?: string
    autoPlayInterval?: number
    imageHeight?: string
}

const DEMO_FEATURES: Feature[] = [
    {
        step: "Step 1",
        title: "Gather Inspiration",
        content: "Explore our vast library of templates and assets to kickstart your creative process.",
        image: "https://images.unsplash.com/photo-1558655146-d09347e0c7a8?q=80&w=1000&auto=format&fit=crop"
    },
    {
        step: "Step 2",
        title: "Customize & Edit",
        content: "Use our intuitive tools to tweak colors, fonts, and layouts to match your brand.",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000&auto=format&fit=crop"
    },
    {
        step: "Step 3",
        title: "Publish & Share",
        content: "Export your designs in high quality and share them directly to your socials.",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop"
    }
];

export function FeatureSteps({
    features = DEMO_FEATURES,
    className,
    title = "How to get Started",
    autoPlayInterval = 3000,
    imageHeight = "h-[400px]",
}: FeatureStepsProps) {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress < 100) {
                setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
            } else {
                setCurrentFeature((prev) => (prev + 1) % features.length)
                setProgress(0)
            }
        }, 100)

        return () => clearInterval(timer)
    }, [progress, features.length, autoPlayInterval])

    return (
        <div className={cn("p-8 md:p-12 w-full", className)}>
            <div className="max-w-7xl mx-auto w-full">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center text-foreground">
                    {title}
                </h2>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10">
                    <div className="order-2 md:order-1 space-y-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-6 md:gap-8 cursor-pointer"
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                                transition={{ duration: 0.5 }}
                                onClick={() => {
                                    setCurrentFeature(index);
                                    setProgress(0);
                                }}
                            >
                                <motion.div
                                    className={cn(
                                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 shrink-0",
                                        index === currentFeature
                                            ? "bg-primary border-primary text-primary-foreground scale-110"
                                            : "bg-muted border-muted-foreground text-muted-foreground",
                                    )}
                                >
                                    {index <= currentFeature ? (
                                        <span className="text-lg font-bold">✓</span>
                                    ) : (
                                        <span className="text-lg font-semibold">{index + 1}</span>
                                    )}
                                </motion.div>

                                <div className="flex-1">
                                    <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                                        {feature.title || feature.step}
                                    </h3>
                                    <p className="text-sm md:text-lg text-muted-foreground">
                                        {feature.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div
                        className={cn(
                            "order-1 md:order-2 relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden rounded-lg bg-muted"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {features.map(
                                (feature, index) =>
                                    index === currentFeature && (
                                        <motion.div
                                            key={index}
                                            className="absolute inset-0 rounded-lg overflow-hidden"
                                            initial={{ y: 100, opacity: 0, rotateX: -20 }}
                                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                            exit={{ y: -100, opacity: 0, rotateX: 20 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.step}
                                                className="w-full h-full object-cover transition-transform transform"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/50 to-transparent" />
                                        </motion.div>
                                    ),
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
