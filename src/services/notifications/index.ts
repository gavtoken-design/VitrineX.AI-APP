import { ScheduleEntry } from '../../types';
import { getUpcomingCommemorateDates } from '../../constants/commemorative-dates';

export interface NotificationPayload {
    type: 'scheduled_post' | 'system' | 'reminder' | 'commemorative_date';
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: any;
}

// Verificar posts próximos (dentro de 1 hora)
export const checkUpcomingPosts = (scheduledItems: ScheduleEntry[]): NotificationPayload[] => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const upcomingPosts = scheduledItems.filter(entry => {
        if (entry.status !== 'scheduled') return false;
        const postTime = new Date(entry.datetime);
        return postTime > now && postTime <= oneHourFromNow;
    });

    return upcomingPosts.map(post => ({
        type: 'scheduled_post' as const,
        title: '📅 Post Agendado Próximo',
        message: `Seu post para ${post.platform} será publicado em breve (${new Date(post.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`,
        actionUrl: '/smart-scheduler',
        metadata: {
            scheduleId: post.id,
            platform: post.platform,
        },
    }));
};

// Verificar datas comemorativas próximas (próximos 7 dias)
export const checkUpcomingCommemorateDates = (): NotificationPayload[] => {
    const upcomingDates = getUpcomingCommemorateDates(3); // Próximas 3 datas
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return upcomingDates
        .filter(date => {
            const dateObj = new Date(date.date);
            return dateObj <= sevenDaysFromNow;
        })
        .map(date => ({
            type: 'commemorative_date' as const,
            title: `${date.emoji} ${date.name} se aproxima!`,
            message: date.marketingTip || `Prepare conteúdo para ${date.name}`,
            actionUrl: '/creative-studio',
            metadata: {
                dateInfo: date.date,
                category: date.category,
            },
        }));
};

// Serviço de verificação periódica (deve ser chamado via setInterval)
export const notificationCheckService = {
    checkInterval: 15 * 60 * 1000, // 15 minutos

    check: (scheduledItems: ScheduleEntry[]): NotificationPayload[] => {
        const postNotifications = checkUpcomingPosts(scheduledItems);
        const dateNotifications = checkUpcomingCommemorateDates();

        return [...postNotifications, ...dateNotifications];
    },
};
