import * as React from 'react';
import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  barColor?: string;
  className?: string;
  mode?: 'frequency' | 'waveform';
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isPlaying,
  barColor = 'rgb(59, 130, 246)', // Primary Blue default
  className = '',
  mode = 'frequency'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    if (!analyser) {
      // Draw idle state
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'; // gray-400 opacity
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (mode === 'frequency') {
        analyser.getByteFrequencyData(dataArray);
      } else {
        analyser.getByteTimeDomainData(dataArray);
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      if (mode === 'frequency') {
        const barWidth = (rect.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * rect.height;

          ctx.fillStyle = barColor;
          // Draw bars from bottom
          if (barHeight > 0) {
            ctx.fillRect(x, rect.height - barHeight, barWidth, barHeight);
          }

          x += barWidth + 1;
        }
      } else {
        // Waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = barColor;
        ctx.beginPath();

        const sliceWidth = rect.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * rect.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, rect.height / 2);
        ctx.stroke();
      }
    };

    if (isPlaying) {
      draw();
    } else {
      // Draw flat line if not playing but analyser exists
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.strokeStyle = barColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, barColor, mode]);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};

export default AudioVisualizer;