import { GoogleTrendsResult } from '../../services/integrations/serpApi';

export const generateMockData = (period: string = 'today 1-m'): GoogleTrendsResult => {
    let points = 30;
    let labelFormat = 'date'; // or 'hour'

    if (period === 'now 1-d') {
        points = 24; // Hourly
        labelFormat = 'hour';
    } else if (period === 'now 7-d') {
        points = 7;
        labelFormat = 'date';
    } else {
        points = 30;
    }

    const timelines = Array.from({ length: points }, (_, i) => {
        let dateLabel = '';
        if (labelFormat === 'hour') {
            dateLabel = `${String(i).padStart(2, '0')}:00`;
        } else {
            const d = new Date();
            d.setDate(d.getDate() - (points - 1 - i));
            dateLabel = d.toISOString().split('T')[0];
        }

        return {
            date: dateLabel,
            values: [{ value: Math.floor(Math.random() * 60) + 20 + (i % 5) * 5 }] // Simulated trend
        };
    });

    return {
        interest_over_time: {
            timeline_data: timelines
        },
        related_queries: {
            rising: [
                { query: "marketing digital para iniciantes", value: "Breakout" },
                { query: "inteligência artificial generativa", value: "+350%" },
                { query: "chatgpt vs gemini", value: "+180%" },
                { query: "automação de anúncios", value: "+120%" },
                { query: "estratégias de tráfego pago", value: "+90%" }
            ],
            top: [
                { query: "marketing digital", value: 100 },
                { query: "redes sociais", value: 85 },
                { query: "seo", value: 70 },
                { query: "copywriting", value: 65 },
                { query: "e-commerce", value: 60 }
            ]
        },
        related_topics: {
            rising: [
                { topic: { title: "Inteligência Artificial", type: "Tecnologia" }, value: "+500%" },
                { topic: { title: "Automação", type: "Negócios" }, value: "+200%" },
                { topic: { title: "Vendas Online", type: "Comércio" }, value: "+150%" }
            ]
        }
    };
};

export const MOCK_DATA = generateMockData('today 1-m'); // Backwards compatibility if needed
