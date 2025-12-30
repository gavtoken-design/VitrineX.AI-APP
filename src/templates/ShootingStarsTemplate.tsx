'use client';
import React, { useEffect, useState, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for class merging (inline to keep template self-contained)
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ShootingStar {
    id: number;
    x: number;
    y: number;
    angle: number;
    scale: number;
    speed: number;
    distance: number;
}

interface ShootingStarsProps {
    minSpeed?: number;
    maxSpeed?: number;
    minDelay?: number;
    maxDelay?: number;
    starColor?: string;
    trailColor?: string;
    starWidth?: number;
    starHeight?: number;
    className?: string;
}

const getRandomStartPoint = () => {
    const side = Math.floor(Math.random() * 4);
    const offset = Math.random() * window.innerWidth;

    switch (side) {
        case 0:
            return { x: offset, y: 0, angle: 45 };
        case 1:
            return { x: window.innerWidth, y: offset, angle: 135 };
        case 2:
            return { x: offset, y: window.innerHeight, angle: 225 };
        case 3:
            return { x: 0, y: offset, angle: 315 };
        default:
            return { x: 0, y: 0, angle: 45 };
    }
};

export const ShootingStarsTemplate: React.FC<ShootingStarsProps> = ({
    minSpeed = 10,
    maxSpeed = 30,
    minDelay = 1200,
    maxDelay = 4200,
    starColor = "#9E00FF",
    trailColor = "#2EB9DF",
    starWidth = 10,
    starHeight = 1,
    className,
}) => {
    const [star, setStar] = useState<ShootingStar | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const createStar = () => {
            const { x, y, angle } = getRandomStartPoint();
            const newStar: ShootingStar = {
                id: Date.now(),
                x,
                y,
                angle,
                scale: 1,
                speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
                distance: 0,
            };
            setStar(newStar);

            const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
            setTimeout(createStar, randomDelay);
        };

        createStar();

        return () => { };
    }, [minSpeed, maxSpeed, minDelay, maxDelay]);

    useEffect(() => {
        const moveStar = () => {
            if (star) {
                setStar((prevStar) => {
                    if (!prevStar) return null;
                    const newX =
                        prevStar.x +
                        prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
                    const newY =
                        prevStar.y +
                        prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
                    const newDistance = prevStar.distance + prevStar.speed;
                    const newScale = 1 + newDistance / 100;
                    if (
                        newX < -20 ||
                        newX > window.innerWidth + 20 ||
                        newY < -20 ||
                        newY > window.innerHeight + 20
                    ) {
                        return null;
                    }
                    return {
                        ...prevStar,
                        x: newX,
                        y: newY,
                        distance: newDistance,
                        scale: newScale,
                    };
                });
            }
        };

        const animationFrame = requestAnimationFrame(moveStar);
        return () => cancelAnimationFrame(animationFrame);
    }, [star]);

    return (
        <div className="relative w-full h-[400px] md:h-[600px] bg-slate-900 overflow-hidden rounded-xl border border-slate-800 flex items-center justify-center">
            <h2 className="z-10 text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 pointer-events-none">
                Shooting Stars
            </h2>
            <svg
                ref={svgRef}
                className={cn("w-full h-full absolute inset-0 pointer-events-none", className)}
            >
                {star && (
                    <rect
                        key={star.id}
                        x={star.x}
                        y={star.y}
                        width={starWidth * star.scale}
                        height={starHeight}
                        fill="url(#gradient)"
                        transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2
                            }, ${star.y + starHeight / 2})`}
                    />
                )}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
                        <stop
                            offset="100%"
                            style={{ stopColor: starColor, stopOpacity: 1 }}
                        />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};
