// Datas Comemorativas Brasileiras 2024-2025
// Para uso no SmartScheduler e outras funcionalidades de marketing

export interface CommemorativeDate {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    emoji: string;
    category: 'commercial' | 'cultural' | 'seasonal' | 'religious';
    marketingTip?: string;
    color?: string; // Cor de destaque no calendário
}

export const COMMEMORATIVE_DATES_2024_2025: CommemorativeDate[] = [
    // Dezembro 2024
    {
        id: 'christmas-2024',
        name: 'Natal',
        date: '2024-12-25',
        emoji: '🎄',
        category: 'religious',
        marketingTip: 'Promoções de fim de ano, presentes, decoração',
        color: '#DC2626'
    },
    {
        id: 'new-year-eve-2024',
        name: 'Réveillon',
        date: '2024-12-31',
        emoji: '🥂',
        category: 'cultural',
        marketingTip: 'Festas, looks, metas para o ano novo',
        color: '#F59E0B'
    },

    // Janeiro 2025
    {
        id: 'new-year-2025',
        name: 'Ano Novo',
        date: '2025-01-01',
        emoji: '🎆',
        category: 'cultural',
        marketingTip: 'Resoluções, novos começos, renovação',
        color: '#F59E0B'
    },

    // Fevereiro 2025
    {
        id: 'valentines-2025',
        name: 'Dia dos Namorados (Internacional)',
        date: '2025-02-14',
        emoji: '💝',
        category: 'commercial',
        marketingTip: 'Presentes românticos, jantares, experiências',
        color: '#EC4899'
    },
    {
        id: 'carnival-2025',
        name: 'Carnaval',
        date: '2025-03-04',
        emoji: '🎭',
        category: 'cultural',
        marketingTip: 'Fantasias, festas, viagens, blocos',
        color: '#8B5CF6'
    },

    // Março 2025
    {
        id: 'womens-day-2025',
        name: 'Dia Internacional da Mulher',
        date: '2025-03-08',
        emoji: '👩',
        category: 'cultural',
        marketingTip: 'Empoderamento feminino, presentes, homenagens',
        color: '#EC4899'
    },

    // Abril 2025
    {
        id: 'easter-2025',
        name: 'Páscoa',
        date: '2025-04-20',
        emoji: '🐰',
        category: 'religious',
        marketingTip: 'Chocolates, ovos de páscoa, decoração',
        color: '#A855F7'
    },

    // Maio 2025
    {
        id: 'mothers-day-2025',
        name: 'Dia das Mães',
        date: '2025-05-11',
        emoji: '💐',
        category: 'commercial',
        marketingTip: 'Presentes, flores, experiências, homenagens',
        color: '#EC4899'
    },

    // Junho 2025
    {
        id: 'valentines-br-2025',
        name: 'Dia dos Namorados (Brasil)',
        date: '2025-06-12',
        emoji: '❤️',
        category: 'commercial',
        marketingTip: 'Presentes para casais, jantares românticos',
        color: '#DC2626'
    },
    {
        id: 'sao-joao-2025',
        name: 'São João',
        date: '2025-06-24',
        emoji: '🌽',
        category: 'cultural',
        marketingTip: 'Festas juninas, comidas típicas, decoração',
        color: '#F59E0B'
    },

    // Agosto 2025
    {
        id: 'fathers-day-2025',
        name: 'Dia dos Pais',
        date: '2025-08-10',
        emoji: '👔',
        category: 'commercial',
        marketingTip: 'Presentes masculinos, ferramentas, tecnologia',
        color: '#3B82F6'
    },

    // Setembro 2025
    {
        id: 'independence-day-2025',
        name: 'Independência do Brasil',
        date: '2025-09-07',
        emoji: '🇧🇷',
        category: 'cultural',
        marketingTip: 'Patriotismo, promoções nacionais',
        color: '#10B981'
    },

    // Outubro 2025
    {
        id: 'childrens-day-2025',
        name: 'Dia das Crianças',
        date: '2025-10-12',
        emoji: '🎈',
        category: 'commercial',
        marketingTip: 'Brinquedos, roupas infantis, experiências',
        color: '#F59E0B'
    },
    {
        id: 'halloween-2025',
        name: 'Halloween',
        date: '2025-10-31',
        emoji: '🎃',
        category: 'cultural',
        marketingTip: 'Fantasias, decoração, festas temáticas',
        color: '#F97316'
    },

    // Novembro 2025
    {
        id: 'black-friday-2025',
        name: 'Black Friday',
        date: '2025-11-28',
        emoji: '🛍️',
        category: 'commercial',
        marketingTip: 'Descontos massivos, promoções relâmpago',
        color: '#000000'
    },

    // Dezembro 2025
    {
        id: 'christmas-2025',
        name: 'Natal',
        date: '2025-12-25',
        emoji: '🎄',
        category: 'religious',
        marketingTip: 'Promoções de fim de ano, presentes, decoração',
        color: '#DC2626'
    },
    {
        id: 'new-year-eve-2025',
        name: 'Réveillon',
        date: '2025-12-31',
        emoji: '🥂',
        category: 'cultural',
        marketingTip: 'Festas, looks, metas para o ano novo',
        color: '#F59E0B'
    }
];

// Função auxiliar para obter datas de um mês específico
export const getCommemorateDatesForMonth = (year: number, month: number): CommemorativeDate[] => {
    const monthStr = month.toString().padStart(2, '0');
    const yearMonthPrefix = `${year}-${monthStr}`;

    return COMMEMORATIVE_DATES_2024_2025.filter(date =>
        date.date.startsWith(yearMonthPrefix)
    );
};

// Função para obter próximas datas comemorativas
export const getUpcomingCommemorateDates = (limit: number = 5): CommemorativeDate[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return COMMEMORATIVE_DATES_2024_2025
        .filter(date => new Date(date.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);
};
