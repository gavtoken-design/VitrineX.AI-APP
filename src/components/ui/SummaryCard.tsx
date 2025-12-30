import React from 'react';
import Skeleton from './Skeleton';
import { LiquidGlassCard } from './LiquidGlassCard';

interface SummaryCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    isLoading?: boolean;
    growth?: string;
    isPositive?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, description, icon: Icon, isLoading, growth }) => (
    <LiquidGlassCard
        className="relative p-6 transition-all duration-500 group overflow-hidden"
        blurIntensity="xl"
        shadowIntensity="lg"
        glowIntensity="md"
        borderRadius="32px"
    >
        {/* Animated Accent Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-700 rounded-full" />

        <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-2xl border border-cyan-500/20 backdrop-blur-2xl group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${growth && (growth.includes('+') || !growth.includes('-')) ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                {growth || '+0%'}
            </div>
        </div>

        <div className="relative z-10 space-y-1">
            {isLoading ? (
                <>
                    <Skeleton className="h-4 w-24 mb-3 bg-white/5" />
                    <Skeleton className="h-10 w-16 bg-white/5" />
                </>
            ) : (
                <>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/60 transition-colors group-hover:text-cyan-400">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-xl">{value}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{description}</p>
                </>
            )}
        </div>
    </LiquidGlassCard>
);


export default SummaryCard;
