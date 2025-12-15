// Configurações de animações sazonais para o chat
export interface ChatAnimation {
    id: string;
    name: string;
    description: string;
    type: 'video' | 'css';
    videoUrl?: string; // URL do vídeo (pode ser local ou CDN)
    cssClass?: string; // Classe CSS para animações customizadas
    season: 'christmas' | 'new-year' | 'carnival' | 'default';
    emoji: string;
}

export const CHAT_ANIMATIONS: ChatAnimation[] = [
    {
        id: 'default-stars',
        name: 'Estrelas Cadentes',
        description: 'Animação padrão com estrelas cadentes e fundo espacial',
        type: 'css',
        cssClass: 'space-background',
        season: 'default',
        emoji: '⭐',
    },
    {
        id: 'christmas-santa',
        name: 'Papai Noel e Renas',
        description: 'Papai Noel voando com renas ao fundo (Natal)',
        type: 'video',
        videoUrl: 'https://cdn.pixabay.com/video/2022/12/01/141134-776946614_large.mp4',
        season: 'christmas',
        emoji: '🎅',
    },
    {
        id: 'new-year-fireworks',
        name: 'Fogos de Artifício',
        description: 'Fogos de artifício coloridos (Ano Novo)',
        type: 'video',
        videoUrl: 'https://cdn.pixabay.com/video/2022/12/29/145358-783832832_large.mp4',
        season: 'new-year',
        emoji: '🎆',
    },
    {
        id: 'carnival-confetti',
        name: 'Confetes de Carnaval',
        description: 'Confetes coloridos caindo (Carnaval)',
        type: 'video',
        videoUrl: 'https://cdn.pixabay.com/video/2020/02/17/32525-393863135_large.mp4',
        season: 'carnival',
        emoji: '🎭',
    },
];

// Função para obter animação ativa
export const getActiveAnimation = (): ChatAnimation => {
    const stored = localStorage.getItem('vitrinex_active_chat_animation');
    if (stored) {
        const animation = CHAT_ANIMATIONS.find(a => a.id === stored);
        if (animation) return animation;
    }
    return CHAT_ANIMATIONS[0]; // Default: estrelas
};

// Função para definir animação ativa
export const setActiveAnimation = (animationId: string): void => {
    localStorage.setItem('vitrinex_active_chat_animation', animationId);
};
