import { ScheduleEntry } from '../../types';
import { getUpcomingCommemorateDates } from '../../constants/commemorative-dates';

export interface NotificationPayload {
    type: 'scheduled_post' | 'system' | 'reminder' | 'commemorative_date';
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
    clientId: string;
}

// Verificar posts próximos (dentro de 1 hora)
export const checkUpcomingPosts = (
    scheduledItems: ScheduleEntry[],
    clientName: string,
    clientId: string
): NotificationPayload[] => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    return scheduledItems
        .filter(item => {
            if (item.status !== 'scheduled') return false;
            const postTime = new Date(item.datetime);
            return postTime > now && postTime <= oneHourFromNow;
        })
        .map(item => ({
            type: 'scheduled_post',
            title: '📅 Post agendado',
            message: `${clientName}, seu post para ${item.platform} será publicado às ${new Date(
                item.datetime
            ).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            })}.`,
            actionUrl: '/smart-scheduler',
            clientId,
            metadata: {
                scheduleId: item.id,
                platform: item.platform,
            },
        }));
};

// Verificar datas comemorativas próximas (próximos 7 dias)
export const checkUpcomingCommemorateDates = (
    clientName: string,
    clientId: string
): NotificationPayload[] => {
    const DAYS_RANGE = 7;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + DAYS_RANGE);

    const upcomingDates = getUpcomingCommemorateDates(DAYS_RANGE);

    return upcomingDates
        .filter(item => {
            const dateObj = new Date(item.date);
            return dateObj >= now && dateObj <= endDate;
        })
        .map(item => ({
            type: 'commemorative_date',
            title: `${item.emoji} ${item.name}`,
            message:
                item.marketingTip ??
                `${clientName}, essa data é uma ótima oportunidade para criar conteúdo estratégico.`,
            actionUrl: '/creative-studio',
            clientId,
            metadata: {
                date: item.date,
                category: item.category,
            },
        }));
};

// Serviço central em tempo real
export const notificationCheckService = {
    checkInterval: 15 * 60 * 1000,

    check: (
        scheduledItems: ScheduleEntry[],
        clientName: string,
        clientId: string
    ): NotificationPayload[] => {
        return [
            ...checkUpcomingPosts(scheduledItems, clientName, clientId),
            ...checkUpcomingCommemorateDates(clientName, clientId),
        ];
    },
};
