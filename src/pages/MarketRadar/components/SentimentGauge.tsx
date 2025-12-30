import * as React from 'react';
import { motion } from 'framer-motion';

interface SentimentGaugeProps {
    sentimentScore: number | null;
    sentimentReasons: string[];
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ sentimentScore, sentimentReasons }) => {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-center p-4 bg-black/20 rounded-xl border border-white/5 gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sentimento do Mercado:</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden relative max-w-md border border-white/5">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30 z-10" />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${Math.abs((sentimentScore || 0) * 50)}%`,
                            left: (sentimentScore || 0) >= 0 ? '50%' : 'auto',
                            right: (sentimentScore || 0) < 0 ? '50%' : 'auto'
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`absolute h-full ${sentimentScore && sentimentScore > 0 ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-l from-red-600 to-red-400'}`}
                    />
                </div>
                <div className="flex flex-col items-center min-w-[80px]">
                    <span className={`text-sm font-black ${(sentimentScore || 0) > 0 ? 'text-green-400' : (sentimentScore || 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {(sentimentScore || 0) > 0 ? 'POSITIVO' : (sentimentScore || 0) < 0 ? 'NEGATIVO' : 'NEUTRO'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold tracking-tighter">
                        {Math.round(Math.abs((sentimentScore || 0) * 100))}% INTENSIDADE
                    </span>
                </div>
            </div>

            {sentimentReasons.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                    {sentimentReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <div className={`w-1.5 h-1.5 rounded-full ${(sentimentScore || 0) > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{reason}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
