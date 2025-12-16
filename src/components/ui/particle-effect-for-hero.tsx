import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface Particle {
    x: number;
    y: number;
    r: number;
    dx: number;
    dy: number;
    opacity: number;
}

interface ParticleEffectProps {
    className?: string;
    particleCount?: number;
    speed?: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
    className = "",
    particleCount = 50,
    speed = 0.5
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({ width: clientWidth, height: clientHeight });
            }
        };

        window.addEventListener("resize", updateDimensions);
        updateDimensions();

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const particles: Particle[] = [];
        const isDark = theme === 'dark';
        const color = isDark ? "255, 255, 255" : "59, 130, 246"; // White in dark, Blue in light

        // Init Particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1,
                dx: (Math.random() - 0.5) * speed,
                dy: (Math.random() - 0.5) * speed,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
                ctx.fill();

                // Update position
                p.x += p.dx;
                p.y += p.dy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            });

            // Draw connections
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach((b) => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${color}, ${0.15 - dist / 1000})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions, theme, particleCount, speed]);

    return (
        <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default ParticleEffect;
