import React from 'react';
import { motion } from 'framer-motion';

interface FilterTabProps {
    id: string;
    label: string;
    icon: React.ElementType;
    activeId: string;
    onClick: (id: string) => void;
}

const FilterTab: React.FC<FilterTabProps> = ({ id, label, icon: Icon, activeId, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`relative px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all flex-shrink-0 ${activeId === id
                ? 'text-[var(--text-primary)] bg-[var(--background-input)]/20 ring-1 ring-[var(--border-default)] shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-input)]/50'
            }`}
    >
        <Icon className="w-4 h-4 relative z-10" />
        <span className="relative z-10">{label}</span>
        {activeId === id && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-white/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
    </button>
);

export default FilterTab;
