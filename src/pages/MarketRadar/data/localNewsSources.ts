export interface NewsSource {
    name: string;
    url: string;
    type: 'newspaper' | 'portal' | 'blog' | 'aggregator';
}

export const LOCAL_NEWS_SOURCES: Record<string, NewsSource[]> = {
    'BR': [
        { name: 'Google Notícias (Brasil)', url: 'https://news.google.com/topstories?hl=pt-BR&gl=BR&ceid=BR:pt-419', type: 'aggregator' },
        { name: 'G1 Nacional', url: 'https://g1.globo.com', type: 'portal' },
        { name: 'UOL Notícias', url: 'https://noticias.uol.com.br', type: 'portal' },
        { name: 'Folha de S.Paulo', url: 'https://www1.folha.uol.com.br', type: 'newspaper' },
        { name: 'O Estado de S. Paulo', url: 'https://www.estadao.com.br', type: 'newspaper' },
        { name: 'CNN Brasil', url: 'https://www.cnnbrasil.com.br', type: 'portal' },
        { name: 'Poder360', url: 'https://www.poder360.com.br', type: 'portal' },
        { name: 'Metrópoles', url: 'https://www.metropoles.com', type: 'portal' },
        { name: 'BBC News Brasil', url: 'https://www.bbc.com/portuguese', type: 'portal' },
        { name: 'Jovem Pan News', url: 'https://jovempan.com.br/noticias', type: 'portal' },
        { name: 'R7', url: 'https://noticias.r7.com', type: 'portal' },
        { name: 'InfoMoney', url: 'https://www.infomoney.com.br', type: 'portal' },
        { name: 'Exame', url: 'https://exame.com', type: 'portal' },
        { name: 'Valor Econômico', url: 'https://valor.globo.com', type: 'newspaper' }
    ],
    // SP
    'BR-SP': [
        { name: 'Google Notícias (São Paulo)', url: 'https://news.google.com/search?q=S%C3%A3o%20Paulo&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Folha de S.Paulo', url: 'https://www1.folha.uol.com.br/cotidiano/sao-paulo/', type: 'newspaper' },
        { name: 'G1 São Paulo', url: 'https://g1.globo.com/sp/sao-paulo/', type: 'portal' },
        { name: 'Estadão São Paulo', url: 'https://www.estadao.com.br/sao-paulo/', type: 'newspaper' },
        { name: 'Veja SP', url: 'https://vejasp.abril.com.br', type: 'portal' },
        { name: 'Diário do Grande ABC', url: 'https://www.dgabc.com.br', type: 'newspaper' },
        { name: 'CBN São Paulo', url: 'https://cbn.globoradio.globo.com/sao-paulo', type: 'portal' }
    ],
    'Sao Paulo, SP': [
        { name: 'Google Notícias (Capital SP)', url: 'https://news.google.com/search?q=S%C3%A3o%20Paulo%20Capital&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Folha de S.Paulo', url: 'https://www1.folha.uol.com.br', type: 'newspaper' },
        { name: 'G1 São Paulo', url: 'https://g1.globo.com/sp/sao-paulo/', type: 'portal' },
        { name: 'Diário de S. Paulo', url: 'https://www.diariosp.com.br/', type: 'newspaper' },
        { name: 'Gazeta de S. Paulo', url: 'https://www.gazetasp.com.br', type: 'newspaper' }
    ],
    // RJ
    'BR-RJ': [
        { name: 'Google Notícias (Rio de Janeiro)', url: 'https://news.google.com/search?q=Rio%20de%20Janeiro&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'O Globo', url: 'https://oglobo.globo.com/rio/', type: 'newspaper' },
        { name: 'Extra', url: 'https://extra.globo.com', type: 'newspaper' },
        { name: 'G1 Rio de Janeiro', url: 'https://g1.globo.com/rj/rio-de-janeiro/', type: 'portal' },
        { name: 'O Dia', url: 'https://odia.ig.com.br', type: 'newspaper' },
        { name: 'Jornal do Brasil', url: 'https://www.jb.com.br', type: 'newspaper' },
        { name: 'Band Rio', url: 'https://www.band.uol.com.br/rio-de-janeiro', type: 'portal' }
    ],
    'Rio de Janeiro, RJ': [
        { name: 'Google Notícias (Rio Capital)', url: 'https://news.google.com/search?q=Rio%20de%20Janeiro%20Capital&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'O Globo Rio', url: 'https://oglobo.globo.com/rio/', type: 'newspaper' },
        { name: 'O Dia Rio', url: 'https://odia.ig.com.br/rio-de-janeiro/', type: 'newspaper' },
        { name: 'G1 Rio', url: 'https://g1.globo.com/rj/rio-de-janeiro/', type: 'portal' },
        { name: 'Sidney Rezende', url: 'https://srzd.com/', type: 'blog' }
    ],
    // MG
    'BR-MG': [
        { name: 'Google Notícias (Minas Gerais)', url: 'https://news.google.com/search?q=Minas%20Gerais&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Estado de Minas', url: 'https://www.em.com.br', type: 'newspaper' },
        { name: 'O Tempo', url: 'https://www.otempo.com.br', type: 'newspaper' },
        { name: 'G1 Minas', url: 'https://g1.globo.com/mg/minas-gerais/', type: 'portal' },
        { name: 'Itatiaia', url: 'https://www.itatiaia.com.br', type: 'portal' },
        { name: 'Hoje em Dia', url: 'https://www.hojeemdia.com.br', type: 'newspaper' }
    ],
    'Belo Horizonte, MG': [
        { name: 'Google Notícias (BH)', url: 'https://news.google.com/search?q=Belo%20Horizonte&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Estado de Minas', url: 'https://www.em.com.br', type: 'newspaper' },
        { name: 'BHAZ', url: 'https://bhaz.com.br', type: 'portal' },
        { name: 'DeFato Online', url: 'https://defatoonline.com.br', type: 'portal' }
    ],
    // AM (Norte)
    'BR-AM': [
        { name: 'Google Notícias (Amazonas)', url: 'https://news.google.com/search?q=Amazonas&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'A Crítica', url: 'https://www.acritica.com', type: 'newspaper' },
        { name: 'D24AM', url: 'https://d24am.com', type: 'portal' },
        { name: 'G1 Amazonas', url: 'https://g1.globo.com/am/amazonas/', type: 'portal' },
        { name: 'Portal do Holanda', url: 'https://www.portaldoholanda.com.br', type: 'portal' },
        { name: 'Amazonas Atual', url: 'https://amazonasatual.com.br', type: 'portal' }
    ],
    'Manaus, AM': [
        { name: 'Google Notícias (Manaus)', url: 'https://news.google.com/search?q=Manaus&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'A Crítica', url: 'https://www.acritica.com', type: 'newspaper' },
        { name: 'Manaus Alerta', url: 'https://portalmanausalerta.com.br', type: 'portal' },
        { name: 'CM7 Brasil', url: 'https://cm7brasil.com', type: 'portal' },
        { name: 'Radar Amazônico', url: 'https://radaramazonico.com.br', type: 'portal' }
    ],
    // RS (Sul)
    'BR-RS': [
        { name: 'Google Notícias (Rio Grande do Sul)', url: 'https://news.google.com/search?q=Rio%20Grande%20do%20Sul&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Zero Hora (GZH)', url: 'https://gauchazh.clicrbs.com.br', type: 'newspaper' },
        { name: 'Correio do Povo', url: 'https://www.correiodopovo.com.br', type: 'newspaper' },
        { name: 'G1 RS', url: 'https://g1.globo.com/rs/rio-grande-do-sul/', type: 'portal' },
        { name: 'Jornal do Comércio', url: 'https://www.jornaldocomercio.com', type: 'newspaper' },
        { name: 'GaúchaZH', url: 'https://gauchazh.clicrbs.com.br', type: 'portal' }
    ],
    'Porto Alegre, RS': [
        { name: 'Google Notícias (Porto Alegre)', url: 'https://news.google.com/search?q=Porto%20Alegre&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Zero Hora', url: 'https://gauchazh.clicrbs.com.br/porto-alegre/', type: 'newspaper' },
        { name: 'Sul21', url: 'https://sul21.com.br', type: 'portal' },
        { name: 'Matinal Jornalismo', url: 'https://www.matinaljornalismo.com.br', type: 'newspaper' }
    ],
    // NE (Nordeste - Ex: BA/PE)
    'BR-BA': [
        { name: 'Google Notícias (Bahia)', url: 'https://news.google.com/search?q=Bahia&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Correio 24h', url: 'https://www.correio24horas.com.br', type: 'newspaper' },
        { name: 'A Tarde', url: 'https://atarde.com.br', type: 'newspaper' },
        { name: 'G1 Bahia', url: 'https://g1.globo.com/ba/bahia/', type: 'portal' },
        { name: 'Bahia Notícias', url: 'https://www.bahianoticias.com.br', type: 'portal' }
    ],
    'Salvador, BA': [
        { name: 'Google Notícias (Salvador)', url: 'https://news.google.com/search?q=Salvador&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Correio', url: 'https://www.correio24horas.com.br', type: 'newspaper' },
        { name: 'BNews', url: 'https://www.bnews.com.br', type: 'portal' },
        { name: 'Aratu On', url: 'https://aratuon.com.br', type: 'portal' }
    ],
    'BR-PE': [
        { name: 'Google Notícias (Pernambuco)', url: 'https://news.google.com/search?q=Pernambuco&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Jornal do Commercio (JC)', url: 'https://jc.ne10.uol.com.br', type: 'newspaper' },
        { name: 'Diário de Pernambuco', url: 'https://www.diariodepernambuco.com.br', type: 'newspaper' },
        { name: 'Folha de Pernambuco', url: 'https://www.folhape.com.br', type: 'newspaper' },
        { name: 'G1 Pernambuco', url: 'https://g1.globo.com/pe/pernambuco/', type: 'portal' }
    ],
    'Recife, PE': [
        { name: 'Google Notícias (Recife)', url: 'https://news.google.com/search?q=Recife&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'JC Online', url: 'https://jc.ne10.uol.com.br', type: 'newspaper' },
        { name: 'LeiaJá', url: 'https://www.leiaja.com', type: 'portal' },
        { name: 'Marco Zero Conteúdo', url: 'https://marcozero.org', type: 'blog' }
    ],
    // CO (Centro-Oeste - Ex: DF/GO)
    'BR-DF': [
        { name: 'Google Notícias (DF)', url: 'https://news.google.com/search?q=Distrito%20Federal&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Correio Braziliense', url: 'https://www.correiobraziliense.com.br', type: 'newspaper' },
        { name: 'Metrópoles', url: 'https://www.metropoles.com', type: 'portal' },
        { name: 'G1 DF', url: 'https://g1.globo.com/df/distrito-federal/', type: 'portal' },
        { name: 'Jornal de Brasília', url: 'https://jornaldebrasilia.com.br', type: 'newspaper' }
    ],
    'Brasilia, DF': [
        { name: 'Google Notícias (Brasília)', url: 'https://news.google.com/search?q=Bras%C3%ADlia&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', type: 'aggregator' },
        { name: 'Correio Braziliense', url: 'https://www.correiobraziliense.com.br', type: 'newspaper' },
        { name: 'Metrópoles DF', url: 'https://www.metropoles.com/distrito-federal', type: 'portal' },
        { name: 'GPS Lifetime', url: 'https://gpslifetime.com.br', type: 'portal' }
    ]
};

export const getNewsSources = (locationId: string): NewsSource[] => {
    // If exact match not found, try to find a broader regional match (e.g., 'BR-SP' instead of specific city if city not found)
    // But for now, fallback to national.
    return LOCAL_NEWS_SOURCES[locationId] || LOCAL_NEWS_SOURCES['BR'];
};
