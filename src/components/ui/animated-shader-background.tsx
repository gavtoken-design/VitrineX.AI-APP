import React, { useEffect, useRef } from 'react';

const AnoAI: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resizeObserver = new ResizeObserver(() => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });

        resizeObserver.observe(canvas);
        canvas.width = width;
        canvas.height = height;

        let time = 0;
        const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: `hsla(${Math.random() * 60 + 200}, 70%, 50%, 0.5)` // Blue/Purple hues
            });
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Slate-900 with trail
            ctx.fillRect(0, 0, width, height);

            time += 0.01;

            // Draw waves
            ctx.beginPath();
            for (let x = 0; x <= width; x += 10) {
                const y = height / 2 +
                    Math.sin(x * 0.005 + time) * 50 +
                    Math.sin(x * 0.01 + time * 2) * 30;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'; // Blue-500 low opacity
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            for (let x = 0; x <= width; x += 10) {
                const y = height / 2 +
                    Math.sin(x * 0.005 + time + 2) * 60 +
                    Math.sin(x * 0.02 + time * 1.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)'; // Purple-600 low opacity
            ctx.lineWidth = 2;
            ctx.stroke();

            // Animate particles (Nodes)
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Connections
                particles.forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 - dist / 1000})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default AnoAI;
