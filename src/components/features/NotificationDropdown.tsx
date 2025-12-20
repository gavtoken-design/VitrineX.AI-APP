
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNotificationCenter, Notification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    BellIcon,
    XMarkIcon,
    CalendarIcon,
    InformationCircleIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

const NotificationDropdown: React.FC = () => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll
    } = useNotificationCenter();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
            setIsOpen(false);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'scheduled_post':
                return <ClockIcon className="w-5 h-5 text-blue-500" />;
            case 'commemorative_date':
                return <CalendarIcon className="w-5 h-5 text-purple-500" />;
            case 'reminder':
                return <InformationCircleIcon className="w-5 h-5 text-yellow-500" />;
            case 'system':
            default:
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        return `${diffDays}d atrás`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-muted hover:text-white transition-all relative liquid-glass hover:scale-110 active:scale-95 duration-300 group"
                aria-label="Notificações"
            >
                {unreadCount > 0 ? (
                    <BellIconSolid className="w-6 h-6 text-primary animate-pulse" />
                ) : (
                    <BellIcon className="w-6 h-6 hover:text-primary transition-colors" />
                )}

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Overlay for mobile to handle outside clicks better and dim background if needed */}
                    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />

                    <div className="
                        fixed left-4 right-4 top-20 z-50 
                        md:absolute md:top-full md:right-0 md:left-auto md:w-96 md:mt-2 
                        liquid-modal rounded-2xl overflow-hidden shadow-2xl border border-white/10 
                        origin-top-right animate-in fade-in zoom-in-95 duration-200
                    ">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white liquid-text-glow">Notificações</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-primary/20 text-primary-400 text-xs px-2 py-0.5 rounded-full font-medium border border-primary/20">
                                        {unreadCount} novas
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary-400 hover:text-primary hover:underline font-medium transition-colors"
                                    >
                                        Ler todas
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-muted hover:text-red-400 transition-colors p-1 hover:bg-white/5 rounded"
                                        title="Limpar tudo"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="bg-white/5 p-4 rounded-full mb-3 liquid-float">
                                        <BellIcon className="w-8 h-8 text-white/50" />
                                    </div>
                                    <p className="text-body font-medium">Tudo limpo por aqui!</p>
                                    <p className="text-sm text-muted mt-1">Você não tem novas notificações.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 p-2">
                                    {notifications.map((notification) => (
                                        <LiquidGlassCard
                                            key={notification.id}
                                            className="group relative overflow-hidden transition-all hover:scale-[1.02]"
                                            blurIntensity="md"
                                            glowIntensity="xs"
                                            shadowIntensity="sm"
                                            borderRadius="16px"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className={`relative flex items-center p-3 z-10 ${!notification.read ? 'bg-primary/5' : ''}`}>
                                                {/* Icon Container */}
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className={`p-2 rounded-xl bg-background/50 border border-white/10 ${!notification.read ? 'ring-1 ring-primary/30' : ''}`}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-grow pr-3 min-w-0">
                                                    <div className={`text-sm font-semibold ${!notification.read ? 'text-white' : 'text-white/80'}`}>
                                                        {notification.title}
                                                    </div>
                                                    <div className="text-xs text-white/60 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </div>
                                                </div>

                                                {/* Time & Actions */}
                                                <div className="flex-shrink-0 flex flex-col items-end justify-between self-stretch py-0.5">
                                                    <div className="text-[10px] text-white/40 font-medium">
                                                        {formatDate(notification.timestamp)}
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            clearNotification(notification.id);
                                                        }}
                                                        className="p-1.5 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Remover"
                                                    >
                                                        <XMarkIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {!notification.read && (
                                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-8 bg-primary/50 rounded-l-full blur-[2px]" />
                                                )}
                                            </div>
                                        </LiquidGlassCard>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
