export interface NewsSource {
    name: string;
    url: string;
    type: 'newspaper' | 'portal' | 'blog';
}

export const LOCAL_NEWS_SOURCES: Record<string, NewsSource[]> = {
    'BR': [
        { name: 'G1 Nacional', url: 'https://g1.globo.com', type: 'portal' },
        { name: 'Folha de S.Paulo', url: 'https://www1.folha.uol.com.br', type: 'newspaper' },
        { name: 'Estadão', url: 'https://www.estadao.com.br', type: 'newspaper' },
        { name: 'UOL', url: 'https://www.uol.com.br', type: 'portal' },
        { name: 'CNN Brasil', url: 'https://www.cnnbrasil.com.br', type: 'portal' }
    ],
    // SP
    'BR-SP': [
        { name: 'Folha de S.Paulo', url: 'https://www1.folha.uol.com.br', type: 'newspaper' },
        { name: 'G1 São Paulo', url: 'https://g1.globo.com/sp/sao-paulo/', type: 'portal' },
        { name: 'Veja SP', url: 'https://vejasp.abril.com.br', type: 'portal' }
    ],
    'Sao Paulo, SP': [
        { name: 'Folha de S.Paulo', url: 'https://www1.folha.uol.com.br', type: 'newspaper' },
        { name: 'G1 São Paulo', url: 'https://g1.globo.com/sp/sao-paulo/', type: 'portal' },
        { name: 'Diário de SP', url: 'https://www.diariosp.com.br/', type: 'newspaper' }
    ],
    // RJ
    'BR-RJ': [
        { name: 'O Globo', url: 'https://oglobo.globo.com', type: 'newspaper' },
        { name: 'Extra', url: 'https://extra.globo.com', type: 'newspaper' },
        { name: 'G1 Rio', url: 'https://g1.globo.com/rj/rio-de-janeiro/', type: 'portal' }
    ],
    'Rio de Janeiro, RJ': [
        { name: 'O Globo', url: 'https://oglobo.globo.com', type: 'newspaper' },
        { name: 'O Dia', url: 'https://odia.ig.com.br', type: 'newspaper' },
        { name: 'G1 Rio', url: 'https://g1.globo.com/rj/rio-de-janeiro/', type: 'portal' }
    ],
    // MG
    'BR-MG': [
        { name: 'Estado de Minas', url: 'https://www.em.com.br', type: 'newspaper' },
        { name: 'O Tempo', url: 'https://www.otempo.com.br', type: 'newspaper' },
        { name: 'G1 Minas', url: 'https://g1.globo.com/mg/minas-gerais/', type: 'portal' }
    ],
    'Belo Horizonte, MG': [
        { name: 'Estado de Minas', url: 'https://www.em.com.br', type: 'newspaper' },
        { name: 'Hoje em Dia', url: 'https://www.hojeemdia.com.br', type: 'newspaper' },
        { name: 'BHAZ', url: 'https://bhaz.com.br', type: 'portal' }
    ],
    // AM (Norte)
    'BR-AM': [
        { name: 'A Crítica', url: 'https://www.acritica.com', type: 'newspaper' },
        { name: 'D24AM', url: 'https://d24am.com', type: 'portal' },
        { name: 'G1 Amazonas', url: 'https://g1.globo.com/am/amazonas/', type: 'portal' }
    ],
    'Manaus, AM': [
        { name: 'A Crítica', url: 'https://www.acritica.com', type: 'newspaper' },
        { name: 'Manaus Alerta', url: 'https://portalmanausalerta.com.br', type: 'portal' },
        { name: 'CM7', url: 'https://cm7brasil.com', type: 'portal' }
    ],
    // RS (Sul)
    'BR-RS': [
        { name: 'Zero Hora (GZH)', url: 'https://gauchazh.clicrbs.com.br', type: 'newspaper' },
        { name: 'Correio do Povo', url: 'https://www.correiodopovo.com.br', type: 'newspaper' },
        { name: 'G1 RS', url: 'https://g1.globo.com/rs/rio-grande-do-sul/', type: 'portal' }
    ],
    'Porto Alegre, RS': [
        { name: 'Zero Hora (GZH)', url: 'https://gauchazh.clicrbs.com.br', type: 'newspaper' },
        { name: 'Jornal do Comércio', url: 'https://www.jornaldocomercio.com', type: 'newspaper' },
        { name: 'Sul21', url: 'https://sul21.com.br', type: 'portal' }
    ],
    // Default fallback generator logic will be used if ID miss match
};

export const getNewsSources = (locationId: string): NewsSource[] => {
    return LOCAL_NEWS_SOURCES[locationId] || LOCAL_NEWS_SOURCES['BR'];
};
