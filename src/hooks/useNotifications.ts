import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from './useQueries';
import { useToast } from '../contexts/ToastContext';
import { notificationCheckService } from '../services/notifications';

export const useNotifications = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const userId = user?.id || 'anonymous';
    const clientName = user?.user_metadata?.name || 'Cliente';
    const { data } = useDashboardData(userId);

    // Use a ref to prevent notification spam within the same session
    const lastNotifiedIds = useRef<Set<string>>(new Set());

    const checkNotifications = useCallback(() => {
        if (!data?.schedule) return;

        const notifications = notificationCheckService.check(
            data.schedule,
            clientName,
            userId
        );

        notifications.forEach(notification => {
            // Generate a unique key for the notification to avoid duplicates
            const notificationId = `${notification.type}-${notification.metadata?.scheduleId || notification.metadata?.date || notification.title}`;

            if (!lastNotifiedIds.current.has(notificationId)) {
                addToast({
                    type: notification.type === 'commemorative_date' ? 'info' : 'warning',
                    title: notification.title,
                    message: notification.message,
                    duration: 8000
                });
                lastNotifiedIds.current.add(notificationId);
            }
        });
    }, [data, clientName, userId, addToast]);

    useEffect(() => {
        // Initial check
        checkNotifications();

        // Setup interval
        const interval = setInterval(
            checkNotifications,
            notificationCheckService.checkInterval
        );

        return () => clearInterval(interval);
    }, [checkNotifications]);
};
