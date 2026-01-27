import { GoogleTrendsResult } from '../../services/integrations/serpApi';

export const generateMockData = (period: string = 'today 1-m', term: string = 'Mercado'): GoogleTrendsResult => {
    // If term is generic, use a special seed or set of related queries
    const isGeneral = term === 'Mercado' || term === 'Tendências Gerais' || term === '';
    const displayTerm = isGeneral ? 'Tendências de Mercado' : term;

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

    // Simple hash function for deterministic randomness based on term
    const hash = displayTerm.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const timelines = Array.from({ length: points }, (_, i) => {
        let dateLabel = '';
        if (labelFormat === 'hour') {
            dateLabel = `${String(i).padStart(2, '0')}:00`;
        } else {
            const d = new Date();
            d.setDate(d.getDate() - (points - 1 - i));
            dateLabel = d.toISOString().split('T')[0];
        }

        const baseValue = 40 + (hash % 30); // Higher base for general market
        const noise = pseudoRandom(hash + i) * 20;
        const trend = (i / points) * 15;

        return {
            date: dateLabel,
            values: [{ value: Math.floor(baseValue + noise + trend) }]
        };
    });

    // Diverse topics for general view vs specific ones for term
    const risingQueries = isGeneral ? [
        { query: "Inteligência Artificial", value: "Breakout" },
        { query: "Mercado Financeiro 2025", value: "+450%" },
        { query: "Marketing Digital", value: "+300%" },
        { query: "Criptomoedas hoje", value: "+200%" },
        { query: "E-commerce tendências", value: "+150%" }
    ] : [
        { query: `${term} tendencias 2025`, value: "Breakout" },
        { query: `como fazer ${term}`, value: "+350%" },
        { query: `melhor ${term} do mercado`, value: "+180%" },
        { query: `futuro do ${term}`, value: "+120%" },
        { query: `${term} vs concorrencia`, value: "+90%" }
    ];

    const topQueries = isGeneral ? [
        { query: "Google Trends", value: 100 },
        { query: "ChatGPT", value: 95 },
        { query: "Dólar hoje", value: 85 },
        { query: "Notícias Brasil", value: 80 },
        { query: "Empregos", value: 75 }
    ] : [
        { query: term, value: 100 },
        { query: `${term} brasil`, value: 85 },
        { query: `curso de ${term}`, value: 70 },
        { query: `o que é ${term}`, value: 65 },
        { query: `estratégia de ${term}`, value: 60 }
    ];

    return {
        interest_over_time: {
            timeline_data: timelines
        },
        related_queries: {
            rising: risingQueries,
            top: topQueries
        },
        related_topics: {
            rising: [
                { topic: { title: "Tecnologia", type: "Indústria" }, value: "+500%" },
                { topic: { title: "Economia", type: "Finanças" }, value: "+350%" },
                { topic: { title: "Inovação", type: "Negócios" }, value: "+200%" }
            ]
        }
    };
};

export const MOCK_DATA = generateMockData('today 1-m', 'Mercado');

export const generateMockVerdict = (term: string) => {
    // Deterministic random based on term
    const hash = term.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const score = 30 + (hash % 65); // Score between 30 and 95

    let decision: 'Explorar Agora' | 'Testar com Cautela' | 'Ignorar/Descartar';
    let justification: string;

    if (score >= 80) {
        decision = 'Explorar Agora';
        justification = 'Alta demanda detectada e baixa saturação de competidores qualificados.';
    } else if (score >= 50) {
        decision = 'Testar com Cautela';
        justification = 'O mercado mostra interesse, mas os custos de aquisição podem oscilar.';
    } else {
        decision = 'Ignorar/Descartar';
        justification = 'Volume de busca em declínio ou concorrência desproporcional ao retorno.';
    }

    return {
        opportunity: `Aproveitar o crescimento orgânico de "${term}" para capturar leads topo de funil.`,
        angle: `Posicionar como a solução premium e definitiva para ${term}.`,
        risk: `Possível entrada de grandes players nas próximas semanas.`,
        decision,
        score,
        justification,
        sentiment: score > 60 ? 0.8 : -0.2
    };
};
