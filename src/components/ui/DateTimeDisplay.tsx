import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const DateTimeDisplay: React.FC = () => {
    const { language } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(language, {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered(!isHovered)}
        >
            {/* Liquid Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt ${isHovered ? 'opacity-75' : ''}`}></div>

            {/* Main Widget */}
            <div className="relative px-4 py-2 bg-black ring-1 ring-gray-900/5 rounded-xl leading-none flex items-center gap-3 liquid-glass liquid-float">
                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                    <CalendarDaysIcon className={`w-5 h-5 text-blue-400 transition-transform duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`} />
                    <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                        {formatDate(currentTime)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <ClockIcon className={`w-5 h-5 text-purple-400 transition-transform duration-500 ${isHovered ? '-rotate-12 scale-110' : ''}`} />
                    <span className="text-sm font-bold text-white font-mono min-w-[3rem]">
                        {formatTime(currentTime)}
                    </span>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />
                </div>
            </div>
        </div>
    );
};

export default DateTimeDisplay;
