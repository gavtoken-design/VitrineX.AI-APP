
export interface TrendResultStructured {
  score: number;
  resumo: string;
  motivadores: string[];
  leituraCenario: string;
  buscasSemelhantes: string[];
  interpretacaoBuscas: string;
  sugestaoConteudo: {
    oque: string;
    formato: string;
  };
  sugestaoProduto: {
    tipo: string;
    temas: string[];
  };
  sugestaoCampanha: {
    estrategia: string;
    cta: string;
  };
  conclusao: {
    avaliacao: string;
    idealPara: string[];
    melhorEstrategia: string;
  };
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
  twitter?: string;
  tiktok?: string;
  contact?: string;
  email?: string;
  website?: string;
}

export const OBJECTIVES = [
  { id: 'content', label: 'Criar conteúdo', icon: '📝' },
  { id: 'product', label: 'Oferecer produto digital', icon: '📘' },
  { id: 'campaign', label: 'Fazer campanha de marketing', icon: '🚀' },
  { id: 'all', label: 'Todos os objetivos', icon: '🎯' },
];
