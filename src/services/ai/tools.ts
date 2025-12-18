import { getUserProfile } from '../core/db';

/**
 * Declaração das ferramentas disponíveis para o Gemini 3.
 */
export const vitrinexTools: any[] = [
    {
        functionDeclarations: [
            {
                name: 'get_user_business_profile',
                description: 'Retorna o perfil de negócio do usuário atual (nome, indústria, público-alvo, estilo visual). Use isso para personalizar suas respostas e estratégias de marketing.',
                parameters: {
                    type: 'OBJECT', // SchemaType.OBJECT
                    properties: {},
                },
            },
            {
                name: 'search_marketing_trends',
                description: 'Pesquisa tendências de marketing atuais no Google para um nicho específico.',
                parameters: {
                    type: 'OBJECT', // SchemaType.OBJECT
                    properties: {
                        query: {
                            type: 'STRING', // SchemaType.STRING
                            description: 'O nicho ou termo de pesquisa para tendências (ex: "moda sustentável", "IA no varejo").',
                        },
                    },
                    required: ['query'],
                },
            }
        ],
    },
];

/**
 * Roteador de funções: executa a lógica local baseada na chamada da IA.
 */
export const executeTool = async (name: string, args: any, context?: any): Promise<any> => {
    switch (name) {
        case 'get_user_business_profile':
            const userId = context?.userId;
            if (!userId) return { error: 'Usuário não autenticado.' };
            const profile = await getUserProfile(userId);
            return profile?.businessProfile || { error: 'Perfil não encontrado.' };

        case 'search_marketing_trends':
            // Podemos integrar com a função searchTrends já existente em text.ts
            // Mas para evitar dependência circular, podemos mover a lógica ou importar dinamicamente
            const { searchTrends } = await import('./text');
            const trends = await searchTrends(args.query);
            return trends;

        default:
            throw new Error(`Ferramenta ${name} não implementada.`);
    }
};
