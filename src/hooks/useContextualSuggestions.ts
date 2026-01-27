import { useEffect, useRef } from 'react';
import { useNotificationCenter } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { ModuleName } from '../App';

const SUGGESTIONS: Partial<Record<ModuleName, string>> = {
    Dashboard: "comece o dia analisando os posts agendados para a semana!",
    ContentGenerator: "experimente usar a nova engine de tendências para criar posts virais hoje!",
    // SmartScheduler: "agendar seus posts nos horários de pico pode aumentar seu engajamento em até 3x!",
    Settings: "mantenha seu perfil atualizado para garantir a melhor experiência com a IA.",
    MarketRadar: "verifique as tendências do mercado para sair na frente da concorrência.",
    // CosmicStudio: "use o Cosmic Editor para criar visuais estonteantes para seus produtos.",
    // CosmicEditor: "use o Cosmic Editor para criar visuais estonteantes para seus produtos.",
    TrendHunter: "descubra o que está em alta agora e crie conteúdo relevante.",
    AdStudio: "crie anúncios que convertem usando nossas templates de alta performance.",
    CampaignBuilder: "organize suas ideias em campanhas estruturadas para maximizar o impacto.",
    // CalendarManager: "visualize seu planejamento mensal e mantenha a consistência.",
    ContentLibrary: "reaproveite seus melhores conteúdos salvos na biblioteca."
};

export const useContextualSuggestions = (activeModule: ModuleName) => {
    const { addNotification } = useNotificationCenter();
    const { user } = useAuth();
    const suggestedModules = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;

        // Verify if we already suggested for this module in this session
        if (suggestedModules.current.has(activeModule)) return;

        const messageTemplate = SUGGESTIONS[activeModule];

        if (messageTemplate) {
            const userName = user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name || 'Visitante';

            // Add a small delay so it doesn't pop up instantly upon navigation, feeling more organic
            const timer = setTimeout(() => {
                addNotification({
                    type: 'system',
                    title: 'Dica Inteligente',
                    message: `Olá ${userName}, ${messageTemplate}`,
                    actionUrl: activeModule
                });
                suggestedModules.current.add(activeModule);
            }, 2000); // 2 seconds delay

            return () => clearTimeout(timer);
        }

    }, [activeModule, user, addNotification]);
};
