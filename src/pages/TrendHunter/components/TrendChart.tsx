
import React, { useMemo } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { GoogleTrendsResult } from '../../../services/integrations/serpApi';

interface TrendChartProps {
    serpData: GoogleTrendsResult | null;
}

const TrendChart: React.FC<TrendChartProps> = ({ serpData }) => {
    const timeline = serpData?.interest_over_time?.timeline_data;

    // Memoize path calculations
    const { areaPath, linePath } = useMemo(() => {
        if (!timeline || timeline.length < 2) return { areaPath: '', linePath: '' };

        const width = 100;
        const height = 100;
        const maxVal = 100;

        const points = timeline.map((item: any, i: number) => {
            const x = (i / (timeline.length - 1)) * width;
            const val = item.values[0]?.value || 0;
            const y = height - ((val / maxVal) * height);
            return `${x},${y}`;
        }).join(' ');

        const startY = height - ((timeline[0].values[0]?.value || 0) / maxVal * height);

        return {
            areaPath: `M 0,${height} L 0,${startY} L ${points} L ${width},${height} Z`,
            linePath: `M ${points}`
        };
    }, [timeline]);

    if (!timeline || timeline.length < 2) return null;

    return (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/[0.02]">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 text-blue-400" /> Interesse ao Longo do Tempo
            </h4>
            <div className="h-[250px] w-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[102%] h-full ml-[-1%] overflow-visible filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    <defs>
                        <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#gradTrend)" />
                    <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default TrendChart;
