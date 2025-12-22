import React, { useEffect, useRef } from 'react';

const AnimatedBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let mouseX = width / 2;
        let mouseY = height / 2;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        handleResize();

        // Particles
        const particles: { x: number; y: number; size: number; speedY: number; opacity: number; color: string }[] = [];
        const particleCount = 60;

        const colors = [
            'hsla(210, 100%, 70%, ', // Blue
            'hsla(280, 100%, 70%, ', // Purple
            'hsla(180, 100%, 70%, '  // Cyan
        ];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.5,
                speedY: Math.random() * 0.5 + 0.2, // Move upwards
                opacity: Math.random(),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        let time = 0;

        const drawWave = (amplitude: number, frequency: number, phase: number, colorStart: string, colorEnd: string, yOffset: number) => {
            ctx.beginPath();
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, colorStart);
            gradient.addColorStop(1, colorEnd);
            ctx.fillStyle = gradient;

            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 20) {
                const y = height - yOffset + Math.sin(x * frequency + time * phase) * amplitude + Math.sin(x * frequency * 0.5 + time * phase * 1.5) * (amplitude / 2);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Background tint
            // ctx.fillStyle = 'rgba(10, 10, 20, 0.2)'; 
            // ctx.fillRect(0, 0, width, height);

            time += 0.005;

            // Draw Particles
            particles.forEach(p => {
                p.y -= p.speedY;
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                // Mouse interaction distance
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let size = p.size;
                if (dist < 150) {
                    size = p.size * (1 + (150 - dist) / 50);
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.opacity + ')';
                ctx.fill();
            });

            // Liquid Waves
            // Back wave
            drawWave(60, 0.003, 1, 'rgba(59, 130, 246, 0.1)', 'rgba(147, 51, 234, 0.1)', 150);
            // Middle wave
            drawWave(50, 0.005, 1.5, 'rgba(6, 182, 212, 0.15)', 'rgba(59, 130, 246, 0.15)', 100);
            // Front wave
            drawWave(40, 0.007, 2, 'rgba(139, 92, 246, 0.05)', 'rgba(236, 72, 153, 0.05)', 50);

            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default AnimatedBackground;
