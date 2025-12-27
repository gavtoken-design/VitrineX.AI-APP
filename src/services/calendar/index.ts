
import { fetchDailyTrends } from '../integrations/serpApi';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'holiday' | 'trend' | 'event';
    description?: string;
}

// Major Holidays (Mock data for demonstration - in a real app, use a library like 'date-holidays')
const getHolidays = (year: number): CalendarEvent[] => {
    return [
        { id: `holiday-${year}-01-01`, title: 'Ano Novo', date: `${year}-01-01`, type: 'holiday', description: 'Celebração de ano novo' },
        { id: `holiday-${year}-02-12`, title: 'Carnaval', date: `${year}-02-12`, type: 'holiday', description: 'Festa popular brasileira' },
        { id: `holiday-${year}-04-21`, title: 'Tiradentes', date: `${year}-04-21`, type: 'holiday', description: 'Dia de Tiradentes' },
        { id: `holiday-${year}-05-01`, title: 'Dia do Trabalho', date: `${year}-05-01`, type: 'holiday', description: 'Dia internacional do trabalho' },
        { id: `holiday-${year}-09-07`, title: 'Independência', date: `${year}-09-07`, type: 'holiday', description: 'Independência do Brasil' },
        { id: `holiday-${year}-10-12`, title: 'Nossa Senhora Aparecida', date: `${year}-10-12`, type: 'holiday', description: 'Dia das crianças' },
        { id: `holiday-${year}-11-02`, title: 'Finados', date: `${year}-11-02`, type: 'holiday', description: 'Dia de Finados' },
        { id: `holiday-${year}-11-15`, title: 'Proclamação da República', date: `${year}-11-15`, type: 'holiday', description: 'Proclamação da República' },
        { id: `holiday-${year}-12-25`, title: 'Natal', date: `${year}-12-25`, type: 'holiday', description: 'Celebração de Natal' },
    ];
};


// Marketing & Social Media Holidays
const getMarketingEvents = (year: number): CalendarEvent[] => {
    return [
        { id: `mkt-${year}-03-08`, title: 'Dia da Mulher', date: `${year}-03-08`, type: 'event', description: 'Homenagens e campanhas femininas' },
        { id: `mkt-${year}-03-15`, title: 'Dia do Consumidor', date: `${year}-03-15`, type: 'event', description: 'Ofertas e promoções especiais' },
        { id: `mkt-${year}-06-12`, title: 'Dia dos Namorados', date: `${year}-06-12`, type: 'event', description: 'Campanhas de casais e presentes' },
        { id: `mkt-${year}-09-15`, title: 'Dia do Cliente', date: `${year}-09-15`, type: 'event', description: 'Foco em fidelização e agradecimento' },
        { id: `mkt-${year}-10-31`, title: 'Halloween', date: `${year}-10-31`, type: 'event', description: 'Posts temáticos divertidos' },
        { id: `mkt-${year}-11-29`, title: 'Black Friday', date: `${year}-11-29`, type: 'event', description: 'Maior data de vendas do ano' }, // Note: Changes yearly, fixed for demo
        { id: `mkt-${year}-12-02`, title: 'Cyber Monday', date: `${year}-12-02`, type: 'event', description: 'Ofertas digitais' },
    ];
};

export const getRealTimeCalendarEvents = async (year: number, month: number): Promise<CalendarEvent[]> => {
    const events: CalendarEvent[] = [];

    // 1. Add Holidays
    const holidays = getHolidays(year);
    events.push(...holidays);

    // 2. Add Marketing Events
    const marketing = getMarketingEvents(year);
    events.push(...marketing);

    // 3. Add Real-time Trends (as "Opportunities" for TODAY)
    try {
        // We only fetch trends for "today" effectively, as trends are real-time.
        const trends = await fetchDailyTrends('BR');
        const today = new Date().toISOString().split('T')[0];

        trends.forEach((trend, index) => {
            events.push({
                id: `trend-${today}-${index}`,
                title: `🔥 Tendência: ${trend.query}`,
                date: today,
                type: 'trend',
                description: `Volume: ${trend.traffic_volume} buscas. Artigos: ${trend.articles.length}`
            });
        });
    } catch (error) {
        console.warn('Failed to fetch real-time trends for calendar', error);
    }

    return events;
};
