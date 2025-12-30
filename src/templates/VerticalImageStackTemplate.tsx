'use client';

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, type PanInfo } from "framer-motion"

const images = [
    {
        id: 1,
        src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2224&auto=format&fit=crop",
        alt: "Black sneaker with red sole",
    },
    {
        id: 2,
        src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop",
        alt: "White minimalist sneaker",
    },
    {
        id: 3,
        src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop",
        alt: "Navy blue running shoe",
    },
    {
        id: 4,
        src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop",
        alt: "Red athletic sneaker",
    },
    {
        id: 5,
        src: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974&auto=format&fit=crop",
        alt: "Green hiking boot",
    },
]

export function VerticalImageStackTemplate() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const lastNavigationTime = useRef(0)
    const navigationCooldown = 400 // ms between navigations

    const navigate = useCallback((newDirection: number) => {
        const now = Date.now()
        if (now - lastNavigationTime.current < navigationCooldown) return
        lastNavigationTime.current = now

        setCurrentIndex((prev) => {
            if (newDirection > 0) {
                return prev === images.length - 1 ? 0 : prev + 1
            }
            return prev === 0 ? images.length - 1 : prev - 1
        })
    }, [])

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50
        if (info.offset.y < -threshold) {
            navigate(1)
        } else if (info.offset.y > threshold) {
            navigate(-1)
        }
    }

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > 30) {
                if (e.deltaY > 0) {
                    navigate(1)
                } else {
                    navigate(-1)
                }
            }
        },
        [navigate],
    )

    useEffect(() => {
        window.addEventListener("wheel", handleWheel, { passive: true })
        return () => window.removeEventListener("wheel", handleWheel)
    }, [handleWheel])

    useEffect(() => {
        // Prevent default scrolling when inside this component
        const preventDefault = (e: Event) => e.preventDefault();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        }
    }, []);


    const getCardStyle = (index: number) => {
        const total = images.length
        let diff = index - currentIndex
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total

        if (diff === 0) {
            return { y: 0, scale: 1, opacity: 1, zIndex: 5, rotateX: 0 }
        } else if (diff === -1) {
            return { y: -160, scale: 0.82, opacity: 0.6, zIndex: 4, rotateX: 8 }
        } else if (diff === -2) {
            return { y: -280, scale: 0.7, opacity: 0.3, zIndex: 3, rotateX: 15 }
        } else if (diff === 1) {
            return { y: 160, scale: 0.82, opacity: 0.6, zIndex: 4, rotateX: -8 }
        } else if (diff === 2) {
            return { y: 280, scale: 0.7, opacity: 0.3, zIndex: 3, rotateX: -15 }
        } else {
            return { y: diff > 0 ? 400 : -400, scale: 0.6, opacity: 0, zIndex: 0, rotateX: diff > 0 ? -20 : 20 }
        }
    }

    const isVisible = (index: number) => {
        const total = images.length
        let diff = index - currentIndex
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total
        return Math.abs(diff) <= 2
    }

    return (
        <div className="relative flex h-[600px] w-full items-center justify-center overflow-hidden bg-black rounded-xl">
            {/* Subtle ambient glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02] blur-3xl" />
            </div>

            {/* Card Stack */}
            <div className="relative flex h-[500px] w-[320px] items-center justify-center" style={{ perspective: "1200px" }}>
                {images.map((image, index) => {
                    if (!isVisible(index)) return null
                    const style = getCardStyle(index)
                    const isCurrent = index === currentIndex

                    return (
                        <motion.div
                            key={image.id}
                            className="absolute cursor-grab active:cursor-grabbing"
                            animate={{
                                y: style.y,
                                scale: style.scale,
                                opacity: style.opacity,
                                rotateX: style.rotateX,
                                zIndex: style.zIndex,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 1,
                            }}
                            drag={isCurrent ? "y" : false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            style={{
                                transformStyle: "preserve-3d",
                                zIndex: style.zIndex,
                            }}
                        >
                            <div
                                className="relative h-[420px] w-[280px] overflow-hidden rounded-3xl bg-neutral-900 ring-1 ring-white/10"
                                style={{
                                    boxShadow: isCurrent
                                        ? "0 25px 50px -12px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                                        : "0 10px 30px -10px rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                {/* Card inner glow - uses foreground with low opacity */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 via-transparent to-transparent z-10 pointer-events-none" />

                                <img
                                    src={image.src || "/placeholder.svg"}
                                    alt={image.alt}
                                    className="object-cover w-full h-full"
                                    draggable={false}
                                />

                                {/* Bottom gradient overlay - uses background color */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Navigation dots */}
            <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (index !== currentIndex) {
                                setCurrentIndex(index)
                            }
                        }}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentIndex ? "h-6 bg-white" : "bg-white/30 hover:bg-white/50"
                            }`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>

            {/* Instruction hint */}
            <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
            >
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14M5 12l7-7 7 7" />
                        </svg>
                    </motion.div>
                    <span className="text-xs font-medium tracking-widest uppercase">Scroll or drag</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-light text-white tabular-nums">
                        {String(currentIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="my-2 h-px w-8 bg-white/20" />
                    <span className="text-sm text-neutral-400 tabular-nums">{String(images.length).padStart(2, "0")}</span>
                </div>
            </div>
        </div>
    )
}
