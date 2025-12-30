import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNotificationCenter, Notification } from '../../contexts/NotificationContext';
import { useNavigate } from '../../hooks/useNavigate';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    XMarkIcon,
    CalendarIcon,
    InformationCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    TrashIcon
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
    } = useNotificationCenter();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { navigateTo } = useNavigate(); // Hook de navegação interna

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
            // Verifica se é link externo
            if (notification.actionUrl.startsWith('http')) {
                window.open(notification.actionUrl, '_blank', 'noopener,noreferrer');
            } else {
                // Tenta extrair modulo e params da URL interna
                try {
                    // Simula URL completa para parsing se for relativa
                    const urlObj = new URL(notification.actionUrl, window.location.origin);
                    const module = urlObj.searchParams.get('module');

                    if (module) {
                        navigateTo(module as any);
                    } else {
                        // Fallback para navegação direta se não houver query param padrão
                        // Ex: "/dashboard" -> não suportado diretamente pelo useNavigate atual sem mapeamento, 
                        // mas se actionUrl for apenas o nome do módulo "CreativeStudio"
                        navigateTo(notification.actionUrl as any);
                    }
                } catch (e) {
                    console.warn("Falha ao navegar:", e);
                    // Fallback seguro simples
                    navigateTo(notification.actionUrl as any);
                }
            }
            setIsOpen(false);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'scheduled_post':
                return <ClockIcon className="w-5 h-5 text-cyan-400" />;
            case 'commemorative_date':
                return <CalendarIcon className="w-5 h-5 text-purple-400" />;
            case 'reminder':
                return <InformationCircleIcon className="w-5 h-5 text-yellow-400" />;
            case 'system':
            default:
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data inválida';

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.round(diffMs / 60000);
            const diffHours = Math.round(diffMs / 3600000);
            const diffDays = Math.round(diffMs / 86400000);

            if (diffMins < 1) return 'Agora';
            if (diffMins < 60) return `${diffMins}m`;
            if (diffHours < 24) return `${diffHours}h`;
            if (diffDays === 1) return 'Ontem';
            if (diffDays < 7) return `${diffDays}d`;

            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } catch {
            return 'Data desconhecida';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-2xl text-muted hover:text-white transition-all relative liquid-glass-heavy border border-white/5 hover:border-primary/30 hover:scale-105 active:scale-95 duration-300 group shadow-lg"
                title="Notificações"
            >
                {unreadCount > 0 ? (
                    <BellIconSolid className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" />
                ) : (
                    <BellIcon className="w-6 h-6 transition-colors" />
                )}

                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-[0_0_12px_rgba(var(--color-primary),0.6)] border-2 border-surface"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md md:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="
                                fixed left-4 right-4 top-16 z-50 
                                md:absolute md:top-full md:right-0 md:left-auto md:w-[420px] md:mt-4 
                                liquid-glass-heavy rounded-[32px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-white/10 
                                origin-top-right backdrop-blur-3xl bg-surface/80
                            "
                        >
                            {/* Header Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

                            <div className="relative p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black text-title uppercase tracking-tight italic">Centro de <span className="text-primary not-italic">Alertas</span></h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                                            {unreadCount > 0 ? `${unreadCount} Pendentes` : 'Tudo em dia'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {notifications.length > 0 && (
                                        <>
                                            <button
                                                onClick={markAllAsRead}
                                                className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                                            >
                                                Lido
                                            </button>
                                            <button
                                                onClick={clearAll}
                                                className="p-2 rounded-xl bg-white/5 text-muted hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5"
                                                title="Limpar tudo"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="relative max-h-[60vh] overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                            <div className="relative bg-white/5 p-6 rounded-[24px] border border-white/10 shadow-xl">
                                                <BellIcon className="w-12 h-12 text-white/20" />
                                            </div>
                                        </div>
                                        <h4 className="text-title font-black uppercase tracking-tight italic">Silêncio Absoluto</h4>
                                        <p className="text-xs text-muted mt-2 max-w-[200px] leading-relaxed">
                                            Sua jornada estratégica está tranquila. Nenhuma notificação por enquanto.
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`
                                                group relative p-4 rounded-[24px] cursor-pointer transition-all duration-300
                                                border border-transparent hover:border-white/10 hover:bg-white/5 hover:scale-[1.01]
                                                ${!notification.read ? 'bg-primary/5 border-primary/10 shadow-[0_8px_24px_rgba(var(--color-primary),0.05)]' : 'bg-transparent'}
                                            `}
                                        >
                                            <div className="flex gap-4">
                                                {/* Icon Side */}
                                                <div className="flex-shrink-0">
                                                    <div className={`
                                                        p-3 rounded-2xl bg-black/40 border border-white/5 shadow-inner transition-transform group-hover:scale-110
                                                        ${!notification.read ? 'ring-1 ring-primary/40' : ''}
                                                    `}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                </div>

                                                {/* Text Side */}
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className={`text-sm font-black uppercase tracking-tight italic ${!notification.read ? 'text-title' : 'text-title/60'}`}>
                                                            {notification.title}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">
                                                            {formatDate(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs leading-relaxed line-clamp-2 ${!notification.read ? 'text-body' : 'text-body/60'}`}>
                                                        {notification.message}
                                                    </p>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearNotification(notification.id);
                                                    }}
                                                    className="absolute top-3 right-3 p-1.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Excluir notificação"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Gradient Accent */}
                            <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
