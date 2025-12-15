import { AdminLog, UserProfile, AdminConfig } from '../../types';
import { remoteAdminService } from './backend';

// Mock Data Logs
let logs: AdminLog[] = [
    { id: '1', timestamp: new Date().toISOString(), level: 'INFO', module: 'System', message: 'Inicialização do sistema concluída.' },
    { id: '2', timestamp: new Date(Date.now() - 100000).toISOString(), level: 'WARN', module: 'GeminiAPI', message: 'Latência alta detectada na região us-central1.' },
    { id: '3', timestamp: new Date(Date.now() - 500000).toISOString(), level: 'INFO', module: 'Auth', message: 'Usuário mock-user-123 realizou login.' },
];

let globalConfig: AdminConfig = {
    modules: {
        'ContentGenerator': true,
        'AdStudio': true,
        'TrendHunter': true,
        'CreativeStudio': true,
        'Chatbot': true,
    },
    features: {
        // AI Generation - Core enabled by default
        imageGenerationEnabled: true,
        videoGenerationEnabled: false, // Premium - disabled by default
        audioGenerationEnabled: true,
        textGenerationEnabled: true,

        // Tools & Utilities - All enabled
        trendHunterEnabled: true,
        chatbotEnabled: true,
        creativeStudioEnabled: true,
        adStudioEnabled: true,
        smartSchedulerEnabled: true,

        // Advanced Features - Selectively enabled
        ragKnowledgeBaseEnabled: true,
        voiceInputEnabled: true,
        multimodalChatEnabled: true,
        brandLogoManagerEnabled: true,
    },
    system: {
        maintenanceMode: false,
        debugLevel: 'verbose',
        globalRateLimit: 1000,
    }
};

// Mock Data Users (Persistente em memória durante a sessão)
let mockUsers: UserProfile[] = [
    { id: 'mock-user-123', email: 'jean@vitrinex.ai', name: 'Jean Owner', plan: 'premium', status: 'active', businessProfile: { name: 'VitrineX', industry: 'Tech', targetAudience: 'B2B', visualStyle: 'Modern' } },
    { id: 'user-2', email: 'client@example.com', name: 'Client A', plan: 'free', status: 'active', businessProfile: { name: 'Loja A', industry: 'Retail', targetAudience: 'B2C', visualStyle: 'Classic' } },
    { id: 'user-3', email: 'spammer@bot.com', name: 'Spam Bot', plan: 'free', status: 'blocked', businessProfile: { name: 'Spam', industry: 'None', targetAudience: 'All', visualStyle: 'None' } },
];

const mockAdminService = {
    authenticate: async (pin: string): Promise<boolean> => {
        // Simula validação de PIN (Em prod, isso seria hash validated no backend)
        await new Promise(r => setTimeout(r, 800));
        return pin === '1984'; // PIN Mestre
    },

    getLogs: async (): Promise<AdminLog[]> => {
        return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getConfig: async (): Promise<AdminConfig> => {
        return { ...globalConfig };
    },

    updateConfig: async (newConfig: Partial<AdminConfig>): Promise<AdminConfig> => {
        globalConfig = { ...globalConfig, ...newConfig };
        logs.unshift({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            level: 'WARN',
            module: 'Admin',
            message: 'Configuração global alterada pelo Administrador.',
        });
        return globalConfig;
    },

    getUsers: async (): Promise<UserProfile[]> => {
        return [...mockUsers];
    },

    blockUser: async (userId: string): Promise<void> => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            // Toggle status or set to blocked
            const newStatus = mockUsers[userIndex].status === 'blocked' ? 'active' : 'blocked';
            mockUsers[userIndex] = { ...mockUsers[userIndex], status: newStatus as 'active' | 'blocked' };

            logs.unshift({
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                level: newStatus === 'blocked' ? 'CRITICAL' : 'INFO',
                module: 'UserMgmt',
                message: `Usuário ${mockUsers[userIndex].email} (${userId}) foi alterado para ${newStatus.toUpperCase()}.`,
            });
        }
    },

    disconnectUser: async (userId: string): Promise<void> => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            // Em um cenário real, isso revogaria o token no backend
            logs.unshift({
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                level: 'WARN',
                module: 'AuthSecurity',
                message: `Sessão do usuário ${user.email} encerrada forçadamente (Force Logout).`,
            });
        }
    },

    createBackup: async (): Promise<string> => {
        await new Promise(r => setTimeout(r, 1500));
        return `backup_v1_${Date.now()}.enc`;
    }
};

// Switch de Implementação
// Se uma URL de backend estiver configurada em backend.ts, usa o serviço remoto.
// Caso contrário, usa o mock local para desenvolvimento/testes.
export const adminService = remoteAdminService.isEnabled() ? remoteAdminService : mockAdminService;
