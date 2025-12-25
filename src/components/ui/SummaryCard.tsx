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

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, description, icon: Icon, isLoading, growth, isPositive = true }) => (
    <LiquidGlassCard
        // Mobile Fix: Only scale on desktop (md:hover:scale-105) to prevent overflow
        className="p-6 transition-all duration-300 md:hover:scale-105"
        blurIntensity="lg"
        shadowIntensity="md"
        glowIntensity="sm"
        borderRadius="24px"
    >
        <div className="flex justify-between items-start mb-4 relative z-40">
            <div className="glass-icon-bg p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Icon className="w-5 h-5 text-cyan-300" />
            </div>
            <span className={`growth-badge px-2 py-1 rounded-full text-xs font-bold border ${growth && growth.includes('+') ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-white/10 text-gray-300 border-white/20'}`}>
                {growth || '+0%'}
            </span>
        </div>
        <div className="relative z-40">
            {isLoading ? (
                <>
                    <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
                    <Skeleton className="h-9 w-16 bg-white/10" />
                </>
            ) : (
                <>
                    <p className="text-sm text-[var(--text-secondary)] mb-1 font-medium tracking-wide opacity-80">{title}</p>
                    <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight drop-shadow-sm">{value}</p>
                </>
            )}
        </div>
    </LiquidGlassCard>
);

export default SummaryCard;
