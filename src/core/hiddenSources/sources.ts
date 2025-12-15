// src/core/hiddenSources/sources.ts
// Fontes ocultas para acelerar geração de conteúdo e pesquisa

export const HIDDEN_SOURCES = {
    trends: [
        "https://trends.google.com/trends/trendingsearches/daily",
        "https://explodingtopics.com/"
    ],

    socialIdeas: [
        "https://www.reddit.com/r/marketing/",
        "https://www.reddit.com/r/smallbusiness/",
        "https://www.reddit.com/r/socialmedia/"
    ],

    visualInspiration: [
        "https://www.pexels.com/search/marketing/",
        "https://unsplash.com/s/photos/marketing",
        "https://dribbble.com/tags/social_media"
    ],

    copywriting: [
        "https://medium.com/tag/marketing",
        "https://copyhackers.com/blog/"
    ],

    seasonal: [
        "https://www.calendarr.com/brasil/",
        "https://www.ecommercebrasil.com.br/datas-comemorativas"
    ]
} as const;

// Tipos para uso
export type SourceCategory = keyof typeof HIDDEN_SOURCES;

// Helper para obter links por categoria
export const getSourcesByCategory = (category: SourceCategory): readonly string[] => {
    return HIDDEN_SOURCES[category];
};

// Helper para obter todos os links
export const getAllSources = (): string[] => {
    return Object.values(HIDDEN_SOURCES).flat();
};

// Mapeamento de categorias para labels
export const SOURCE_LABELS: Record<SourceCategory, { label: string; emoji: string; description: string }> = {
    trends: {
        label: 'Tendências',
        emoji: '📈',
        description: 'Google Trends e tópicos em alta'
    },
    socialIdeas: {
        label: 'Ideias Sociais',
        emoji: '💡',
        description: 'Comunidades de marketing e negócios'
    },
    visualInspiration: {
        label: 'Inspiração Visual',
        emoji: '🎨',
        description: 'Bancos de imagens e design'
    },
    copywriting: {
        label: 'Copywriting',
        emoji: '✍️',
        description: 'Artigos e técnicas de escrita'
    },
    seasonal: {
        label: 'Datas Sazonais',
        emoji: '📅',
        description: 'Calendário de datas comemorativas'
    }
};
