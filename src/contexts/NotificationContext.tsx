import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Notification {
    id: string;
    type: 'scheduled_post' | 'system' | 'reminder' | 'commemorative_date';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    metadata?: {
        scheduleId?: string;
        platform?: string;
        dateInfo?: string;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'vitrinex_notifications';
const MAX_NOTIFICATIONS = 50; // Limitar para não sobrecarregar

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'mock-1',
        type: 'system',
        title: 'Bem-vindo ao VitrineX!',
        message: 'Explore nossas novas ferramentas de IA para impulsionar suas vendas.',
        timestamp: new Date().toISOString(),
        read: false
    },
    {
        id: 'mock-2',
        type: 'reminder',
        title: 'Dica do Dia',
        message: 'Você pode agendar posts diretamente da tela de geração de conteúdo.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
        read: false
    },
    {
        id: 'mock-3',
        type: 'commemorative_date',
        title: 'Dia do Cliente chegando',
        message: 'Que tal criar uma campanha especial para o dia 15?',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
        read: true
    }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Carregar notificações do localStorage ou usar Mock
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.length > 0) {
                    setNotifications(parsed);
                } else {
                    setNotifications(MOCK_NOTIFICATIONS);
                }
            } catch (e) {
                console.error('Failed to parse notifications:', e);
                setNotifications(MOCK_NOTIFICATIONS);
            }
        } else {
            setNotifications(MOCK_NOTIFICATIONS);
        }
    }, []);

    // Salvar notificações no localStorage
    useEffect(() => {
        if (notifications.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        }
    }, [notifications]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            // Manter apenas as últimas MAX_NOTIFICATIONS
            return updated.slice(0, MAX_NOTIFICATIONS);
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationCenter = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
