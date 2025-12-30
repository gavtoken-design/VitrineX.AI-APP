
export type Language = 'pt-BR' | 'en-US';

type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [key in Language]: TranslationKeys;
};

export const translations: Translations = {
  'en-US': {
    // Sidebar
    'sidebar.overview': 'Overview',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.ai_assistant': 'AI Assistant',
    'sidebar.creation_suite': 'Creation Suite',
    'sidebar.content_gen': 'Content Gen',
    'sidebar.ad_creator': 'Ad Creator',
    'sidebar.media_studio': 'Media Studio',
    'sidebar.carousel_studio': 'Carousel Studio',
    'sidebar.cosmic_studio': 'Cosmic Studio',
    'sidebar.strategy': 'Strategy',
    'sidebar.campaigns': 'Campaigns',
    'sidebar.trends': 'Trends',
    'sidebar.market_radar': 'Market Radar',
    'sidebar.calendar': 'Calendar',
    'sidebar.communication': 'Communication',
    'sidebar.ai_chat': 'AI Chat',
    'sidebar.live_voice': 'Live Voice',
    'sidebar.system': 'System',
    'sidebar.library': 'Library',
    'sidebar.config': 'Configuration',
    'sidebar.tools': 'Tools',
    'sidebar.code_audit': 'Code Audit',
    'sidebar.audio_tools': 'Audio Tools',
    'sidebar.code_playground': 'Code Playground',
    'sidebar.live_conversation': 'Live Conversation',
    'sidebar.local_finder': 'Local Finder',
    'sidebar.calendar_manager': 'Calendar Manager',

    // Dashboard
    'dashboard.title': 'Executive Overview',
    'dashboard.subtitle': 'Welcome back. Here is your platform activity summary.',
    'dashboard.total_content': 'Total Content',
    'dashboard.total_content_desc': 'Generated across all channels',
    'dashboard.campaigns_card': 'Ad Campaigns',
    'dashboard.campaigns_desc': 'Active advertisements',
    'dashboard.scheduled': 'Scheduled Events',
    'dashboard.scheduled_desc': 'Pending publication',
    'dashboard.trends_card': 'Market Trends',
    'dashboard.trends_desc': 'Tracked opportunities',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.btn_generate': 'Generate Content',
    'dashboard.btn_ad': 'Create Advertisement',
    'dashboard.btn_strategy': 'Strategic Analysis',
    'dashboard.btn_market': 'Market Research',
    'dashboard.btn_media': 'Media Studio',
    'dashboard.btn_schedule': 'Manage Schedule',
    'dashboard.recent_activity': 'Recent Activity',
    'dashboard.view_all': 'View All',
    'dashboard.no_activity': 'No recent activity recorded.',
    'dashboard.start_creating': 'Start Creating',

    // Navbar
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',

    // General
    'gen.loading': 'Loading...',
    'gen.error': 'Error',
    'gen.save': 'Save',
    'gen.cancel': 'Cancel',
    'gen.active': 'Active',
  },
  'pt-BR': {
    // Sidebar
    'sidebar.overview': 'Visão Geral',
    'sidebar.dashboard': 'Painel de Controle',
    'sidebar.ai_assistant': 'Assistente IA',
    'sidebar.creation_suite': 'Suíte Criativa',
    'sidebar.content_gen': 'Gerador de Conteúdo',
    'sidebar.ad_creator': 'Criador de Anúncios',
    'sidebar.media_studio': 'Estúdio de Mídia',
    'sidebar.carousel_studio': 'Estúdio de Carrossel',
    'sidebar.cosmic_studio': 'Cosmic Studio',
    'sidebar.cosmic_editor': 'Cosmic Editor',
    'sidebar.cosmic_carousel': 'Cosmic Carrossel',
    'sidebar.strategy': 'Estratégia',
    'sidebar.campaigns': 'Campanhas',
    'sidebar.trends': 'Tendências',
    'sidebar.market_radar': 'Radar de Mercado',
    'sidebar.calendar': 'Calendário',
    'sidebar.communication': 'Comunicação',
    'sidebar.ai_chat': 'Chat IA',
    'sidebar.live_voice': 'Voz em Tempo Real',
    'sidebar.system': 'Sistema',
    'sidebar.library': 'Biblioteca',
    'sidebar.config': 'Configurações',
    'sidebar.tools': 'Ferramentas',
    'sidebar.code_audit': 'Auditoria de Código',
    'sidebar.audio_tools': 'Ferramentas de Áudio',
    'sidebar.code_playground': 'Criador de Páginas Web',
    'sidebar.live_conversation': 'Conversa ao Vivo',
    'sidebar.local_finder': 'Buscador Local',
    'sidebar.calendar_manager': 'Gerenciador de Calendário',

    // Dashboard
    'dashboard.title': 'Visão Executiva',
    'dashboard.subtitle': 'Bem-vindo de volta. Aqui está o resumo da atividade da plataforma.',
    'dashboard.total_content': 'Conteúdo Total',
    'dashboard.total_content_desc': 'Gerado em todos os canais',
    'dashboard.campaigns_card': 'Campanhas de Anúncios',
    'dashboard.campaigns_desc': 'Anúncios ativos',
    'dashboard.scheduled': 'Eventos Agendados',
    'dashboard.scheduled_desc': 'Publicação pendente',
    'dashboard.trends_card': 'Tendências de Mercado',
    'dashboard.trends_desc': 'Oportunidades rastreadas',
    'dashboard.quick_actions': 'Ações Rápidas',
    'dashboard.btn_generate': 'Gerar Conteúdo',
    'dashboard.btn_ad': 'Criar Anúncio',
    'dashboard.btn_strategy': 'Análise Estratégica',
    'dashboard.btn_market': 'Pesquisa de Mercado',
    'dashboard.btn_media': 'Estúdio de Mídia',
    'dashboard.btn_schedule': 'Gerenciar Agenda',
    'dashboard.recent_activity': 'Atividades Recentes',
    'dashboard.view_all': 'Ver Todas',
    'dashboard.no_activity': 'Nenhuma atividade recente registrada.',
    'dashboard.start_creating': 'Começar a Criar',

    // Navbar
    'nav.profile': 'Perfil',
    'nav.logout': 'Sair',

    // General
    'gen.loading': 'Carregando...',
    'gen.error': 'Erro',
    'gen.save': 'Salvar',
    'gen.cancel': 'Cancelar',
    'gen.active': 'Ativo',
  }
};
