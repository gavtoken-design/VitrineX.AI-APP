
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduledPost {
    id: string;
    title: string;
    platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'all';
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'published' | 'failed';
}

interface LiquidCalendarProps {
    posts: ScheduledPost[];
    onDateSelect: (date: string) => void;
    onPostSelect: (post: ScheduledPost) => void;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const platformColors = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
    all: 'bg-gradient-to-r from-blue-500 to-purple-500'
};

const LiquidCalendar: React.FC<LiquidCalendarProps> = ({ posts, onDateSelect, onPostSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date().toISOString().split('T')[0];

    const renderDays = () => {
        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-white/5 border border-white/5 rounded-xl opacity-30"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const dayPosts = posts.filter(p => p.scheduledDate === dateStr);

            days.push(
                <motion.div
                    key={dateStr}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onDateSelect(dateStr)}
                    className={`relative h-24 sm:h-32 border border-white/10 rounded-xl p-2 cursor-pointer transition-all overflow-hidden group
                        ${isToday ? 'bg-primary/20 ring-1 ring-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-surface hover:bg-white/5'}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-400'}`}>{day}</span>
                        {dayPosts.length > 0 && (
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 hidden sm:inline-block">
                                {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-24px)] scrollbar-hide">
                        {dayPosts.map(post => (
                            <div
                                key={post.id}
                                onClick={(e) => { e.stopPropagation(); onPostSelect(post); }}
                                className={`text-[10px] sm:text-xs truncate px-2 py-1 rounded shadow-sm text-white font-medium ${platformColors[post.platform]} hover:opacity-90 transform hover:scale-105 transition-all`}
                                title={post.title}
                            >
                                {post.title || 'Sem título'}
                            </div>
                        ))}
                    </div>

                    {/* Add Button on Hover */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                            <span className="text-lg leading-none mb-0.5">+</span>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return days;
    };

    return (
        <div className="bg-surface/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-6 max-w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-white/10 shadow-inner">
                        <CalendarDaysIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {MONTHS[currentDate.getMonth()]}
                        </h2>
                        <p className="text-muted text-sm font-mono tracking-widest">{currentDate.getFullYear()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 mb-4">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="text-center font-medium text-sm text-muted uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {renderDays()}
            </div>
        </div>
    );
};

export default LiquidCalendar;
