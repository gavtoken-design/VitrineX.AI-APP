
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
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

const NotificationDropdown: React.FC = () => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll
    } = useNotifications();

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
                <div className="fixed top-[70px] left-4 right-4 md:absolute md:top-auto md:left-auto md:right-0 md:mt-4 md:w-96 liquid-modal rounded-2xl z-50 overflow-hidden liquid-emerge origin-top-right">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white liquid-text-glow">Notificações</h3>
                            {unreadCount > 0 && (
                                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} novas
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Ler todas
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-muted hover:text-red-400 transition-colors"
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
                            <ul className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`relative group transition-colors hover:bg-background/80 ${!notification.read ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div
                                            className="p-4 pr-10 cursor-pointer"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div className={`mt-1 p-1.5 rounded-full bg-background border border-border flex-shrink-0 ${!notification.read ? 'ring-2 ring-primary/20' : ''
                                                    }`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium mb-0.5 ${!notification.read ? 'text-title' : 'text-body'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted/80 mt-2 flex items-center gap-1">
                                                        {formatDate(notification.timestamp)}
                                                        {!notification.read && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearNotification(notification.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remover"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
