import React from 'react';
import { SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'; // Default imports if needed, but passed as props usually

interface ActivityCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    timestamp: string;
    gradientFrom: string;
    gradientTo: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
    icon: Icon,
    title,
    description,
    timestamp,
    gradientFrom,
    gradientTo
}) => (
    // Updated to use a glass-like look matching LiquidGlassCard's aesthetic if possible, or just a cleaner glass card
    <div className="group relative overflow-hidden p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 transition-all duration-300 backdrop-blur-sm cursor-default">

        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm md:text-base leading-tight">
                        {title}
                    </p>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5 max-w-[200px] md:max-w-md truncate">
                        {description}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-[10px] md:text-xs font-medium text-[var(--text-secondary)] opacity-70 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                    {timestamp}
                </span>
            </div>
        </div>
    </div>
);

export default ActivityCard;
