import axios from 'axios';
import { logger } from '../../lib/logger';
import { z, ZodError } from 'zod';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

// ============================================================================
// VALIDAÇÃO (ZOD SCHEMAS)
// ============================================================================

export const CreatePinSchema = z.object({
    boardId: z.string().min(1, 'ID do board é obrigatório'),
    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
    description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
    link: z.string().url('Link inválido').optional(),
    altText: z.string().max(500, 'Texto alternativo muito longo').optional(),
    imageUrl: z.string().url('URL da imagem inválida').optional(),
    imageBase64: z.string().optional(),
}).refine(data => data.imageUrl || data.imageBase64, {
    message: "É necessário fornecer uma imagem (URL ou Base64)",
    path: ["imageUrl"]
});

export type CreatePinInput = z.infer<typeof CreatePinSchema>;

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface PinterestBoard {
    id: string;
    name: string;
    description?: string;
    privacy: 'PUBLIC' | 'PROTECTED' | 'SECRET';
    owner?: { username: string };
    pin_count?: number;
    follower_count?: number;
}

export interface PinterestPin {
    id: string;
    title?: string;
    description?: string;
    link?: string;
    media_source: {
        source_type: 'image_url' | 'image_base64';
        url?: string;
        data?: string;
    };
    board_id: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    bookmark?: string | null;
}

// ============================================================================
// CLASSE DE ERRO PERSONALIZADA
// ============================================================================

export class PinterestError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'PinterestError';
    }
}

// ============================================================================
// PINTEREST SERVICE
// ============================================================================

class PinterestService {
    private getAccessToken(): string | null {
        return localStorage.getItem('vitrinex_social_token_pinterest');
    }

    private getHeaders() {
        const token = this.getAccessToken();
        if (!token) {
            throw new PinterestError('Pinterest não está conectado. Conecte sua conta primeiro.', 401);
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    private handleError(error: any, context: string): never {
        let message = `Falha ao ${context}`;
        let statusCode = error.response?.status;
        let details = error.response?.data;

        if (axios.isAxiosError(error)) {
            if (statusCode === 401) {
                message = 'Token do Pinterest expirado ou inválido. Reconecte sua conta.';
            } else if (statusCode === 403) {
                message = 'Sem permissão para realizar esta ação no Pinterest.';
            } else if (statusCode === 429) {
                message = 'Limite de requisições ao Pinterest excedido. Tente novamente mais tarde.';
            } else if (details?.message) {
                message = `Erro do Pinterest: ${details.message}`;
            }
        } else if (error instanceof ZodError) {
            message = 'Dados inválidos: ' + (error as any).errors.map((e: any) => e.message).join(', ');
            statusCode = 400;
        }

        logger.error(`PinterestService: ${message}`, { originalError: error, details });
        throw new PinterestError(message, statusCode, details);
    }

    /**
     * Verifica se está conectado ao Pinterest
     */
    isConnected(): boolean {
        return !!this.getAccessToken();
    }

    /**
     * Lista todos os boards do usuário com paginação
     */
    async getBoards(pageSize = 25, bookmark?: string): Promise<PaginatedResponse<PinterestBoard>> {
        try {
            logger.info('Buscando boards do Pinterest', { pageSize, bookmark });

            const response = await axios.get(`${PINTEREST_API_BASE}/boards`, {
                headers: this.getHeaders(),
                params: {
                    page_size: pageSize,
                    bookmark: bookmark || undefined
                }
            });

            return {
                items: response.data.items || [],
                bookmark: response.data.bookmark || null
            };
        } catch (error) {
            this.handleError(error, 'buscar boards');
        }
    }

    /**
     * Busca pins de um board ou gerais com paginação
     */
    async getPins(boardId?: string, pageSize = 25, bookmark?: string): Promise<PaginatedResponse<PinterestPin>> {
        try {
            const endpoint = boardId
                ? `${PINTEREST_API_BASE}/boards/${boardId}/pins`
                : `${PINTEREST_API_BASE}/pins`;

            const response = await axios.get(endpoint, {
                headers: this.getHeaders(),
                params: {
                    page_size: pageSize,
                    bookmark: bookmark || undefined
                }
            });

            return {
                items: response.data.items || [],
                bookmark: response.data.bookmark || null
            };
        } catch (error) {
            this.handleError(error, 'buscar pins');
        }
    }

    /**
     * Cria um novo board
     */
    async createBoard(name: string, description?: string, privacy: 'PUBLIC' | 'SECRET' = 'PUBLIC'): Promise<PinterestBoard> {
        try {
            if (!name) throw new Error("Nome do board é obrigatório");

            const response = await axios.post(
                `${PINTEREST_API_BASE}/boards`,
                { name, description, privacy },
                { headers: this.getHeaders() }
            );

            logger.info('Board criado com sucesso', { boardId: response.data.id });
            return response.data;
        } catch (error) {
            this.handleError(error, 'criar board');
        }
    }

    /**
     * Cria um pin no Pinterest com validação Zod
     */
    async createPin(input: CreatePinInput): Promise<PinterestPin> {
        try {
            // 1. Validar input com Zod
            const validatedInput = CreatePinSchema.parse(input);

            logger.info('Criando pin no Pinterest', { title: validatedInput.title });

            // 2. Montar payload
            const payload: any = {
                board_id: validatedInput.boardId,
                title: validatedInput.title,
                description: validatedInput.description,
                link: validatedInput.link,
                alt_text: validatedInput.altText,
            };

            if (validatedInput.imageUrl) {
                payload.media_source = { source_type: 'image_url', url: validatedInput.imageUrl };
            } else if (validatedInput.imageBase64) {
                payload.media_source = { source_type: 'image_base64', data: validatedInput.imageBase64 };
            }

            // 3. Enviar request
            const response = await axios.post(
                `${PINTEREST_API_BASE}/pins`,
                payload,
                { headers: this.getHeaders() }
            );

            logger.info('Pin criado com sucesso', { pinId: response.data.id });
            return response.data;
        } catch (error) {
            this.handleError(error, 'criar pin');
        }
    }

    /**
     * Deleta um pin
     */
    async deletePin(pinId: string): Promise<void> {
        try {
            await axios.delete(
                `${PINTEREST_API_BASE}/pins/${pinId}`,
                { headers: this.getHeaders() }
            );
            logger.info('Pin deletado com sucesso', { pinId });
        } catch (error) {
            this.handleError(error, 'deletar pin');
        }
    }
}

export const pinterestService = new PinterestService();
