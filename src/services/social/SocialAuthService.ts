import { exchangePinterestCodeForToken } from '../social';
import { logger } from '../../lib/logger';

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'pinterest';

class SocialAuthService {
    private getStorageKey(network: SocialNetwork): string {
        return `vitrinex_social_connected_${network}`;
    }

    /**
     * Redireciona para o fluxo de autenticação da rede social.
     * Não solicita permissões de escrita/leitura, apenas identidade.
     */
    public connect(network: SocialNetwork): void {
        const legacyRedirectUri = encodeURIComponent(window.location.origin + '/?module=SocialNetworks&auth_return=' + network);
        const cleanRedirectUri = encodeURIComponent(window.location.origin + '/');
        let url = '';

        switch (network) {
            case 'facebook':
                const fbAppId = import.meta.env.VITE_FB_APP_ID || 'YOUR_FB_APP_ID';
                url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${legacyRedirectUri}&response_type=token&scope=public_profile`;
                break;
            case 'instagram':
                // Fluxo simplificado via Facebook Login (comum para IG Business/Identity)
                const igAppId = import.meta.env.VITE_FB_APP_ID || 'YOUR_FB_APP_ID';
                url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${igAppId}&redirect_uri=${legacyRedirectUri}&response_type=token&scope=instagram_basic`;
                break;
            case 'linkedin':
                // Mock redirect para LinkedIn (OAuth padrão requer Client Secret no backend, 
                // mas aqui simulamos o fluxo de ida e volta para vínculo local)
                alert('Redirecionando para LinkedIn OAuth...');
                window.location.href = window.location.origin + '/?module=SocialNetworks&auth_return=linkedin';
                return;
            case 'pinterest':
                const pinterestAppId = import.meta.env.VITE_PINTEREST_APP_ID || '1541794';
                // Scopes v5 com permissões de leitura e escrita
                const pinterestScopes = [
                    'user_accounts:read',
                    'pins:read',
                    'pins:write',      // Permissão para criar pins
                    'boards:read',     // Permissão para listar boards
                    'boards:write'     // Permissão para criar boards
                ].join(',');

                // Nota: O redirect_uri deve ser EXATO ao configurado no portal
                url = `https://www.pinterest.com/oauth/?client_id=${pinterestAppId}&redirect_uri=${cleanRedirectUri}&response_type=code&scope=${pinterestScopes}&state=${network}`;
                break;
            default:
                // Caso genérico para outras redes
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('auth_return', network);
                window.location.href = currentUrl.toString();
                return;
        }

        if (url) {
            logger.debug('Redirecting to social auth', { network });
            window.location.href = url;
        }
    }

    /**
     * Processa o retorno do redirecionamento.
     * Detecta parâmetros na URL ou hash e ativa o vínculo local.
     */
    public handleRedirectCallback(): SocialNetwork | null {
        const searchParams = new URLSearchParams(window.location.search);
        const authReturn = searchParams.get('auth_return') as SocialNetwork | null;

        // Verifica parameters de 'state' (padrão OAuth) tanto na query quanto no hash
        const stateQuery = searchParams.get('state') as SocialNetwork | null;

        // Checa também o hash (comum em fluxos Implicit/Token)
        const hash = window.location.hash;
        const hasToken = hash && hash.includes('access_token=');

        // Parse hash params safely
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        const stateHash = hashParams.get('state') as SocialNetwork | null;

        // Verifica se há um 'code' (Authorization Code Flow - Pinterest v5)
        const hasCode = searchParams.has('code');

        const detectedNetwork = authReturn || stateQuery || stateHash;

        if (detectedNetwork || hasToken || hasCode) {
            // Se tiver token mas não tiver rede identificada, assume facebook (legacy fallback)
            const network = detectedNetwork || 'facebook';

            logger.info('Social connection detected', { network });

            // Registra o vínculo no LocalStorage
            localStorage.setItem(this.getStorageKey(network), 'true');

            // Se encontramos um access_token no hash, salvamos também
            if (hasToken) {
                const token = hashParams.get('access_token');
                if (token) {
                    localStorage.setItem(`vitrinex_social_token_${network}`, token);
                    logger.info('Social token saved', { network });
                }
            }

            // Se encontramos um 'code' (Pinterest v5), salvamos temporariamente
            if (hasCode) {
                const code = searchParams.get('code');
                if (code) {
                    localStorage.setItem(`vitrinex_social_code_${network}`, code);
                    logger.info('Auth code saved', { network });
                }
            }

            // Limpa os parâmetros de autenticação da URL sem recarregar
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('auth_return');
            newUrl.searchParams.delete('code');
            newUrl.searchParams.delete('state');
            newUrl.hash = '';
            window.history.replaceState({}, document.title, newUrl.toString());

            return network;
        }

        return null;
    }

    /**
     * Remove o vínculo local da rede social.
     */
    public disconnect(network: SocialNetwork): void {
        localStorage.removeItem(this.getStorageKey(network));
        logger.info('Social account disconnected', { network });
    }

    /**
     * Retorna o status de conexão de uma rede.
     */
    public isConnected(network: SocialNetwork): boolean {
        return localStorage.getItem(this.getStorageKey(network)) === 'true';
    }


    /**
     * Tenta completar o fluxo de troca de token do Pinterest se houver um código pendente.
     */
    public async completePinterestHandshake(): Promise<boolean> {
        const code = localStorage.getItem('vitrinex_social_code_pinterest');
        const token = localStorage.getItem('vitrinex_social_token_pinterest');

        if (token) return true; // Já tem token

        if (code) {
            logger.info('Exchanging Pinterest code for token');
            const clientId = import.meta.env.VITE_PINTEREST_APP_ID;
            // ATENÇÃO: Em dev local estamos lendo direto do .env. Em prod isso deve ser seguro.
            const clientSecret = import.meta.env.VITE_PINTEREST_APP_SECRET;

            // Redirect URI deve ser exata à usada no login
            const redirectUri = encodeURIComponent(window.location.origin + '/');

            if (!clientId || !clientSecret) {
                logger.error('Missing Pinterest credentials');
                return false;
            }

            try {
                const data = await exchangePinterestCodeForToken(code, clientId, clientSecret, redirectUri);
                if (data.access_token) {
                    localStorage.setItem('vitrinex_social_token_pinterest', data.access_token);
                    localStorage.removeItem('vitrinex_social_code_pinterest'); // Limpa o code usado
                    logger.info('Pinterest token acquired successfully');
                    return true;
                }
            } catch (error) {
                logger.error('Pinterest token exchange failed', { error });
                // Se falhar (código expirado), limpa para tentar de novo
                localStorage.removeItem('vitrinex_social_code_pinterest');
                return false;
            }
        }
        return false;
    }

    /**
     * Retorna todas as conexões ativas.
     */
    public getActiveConnections(): SocialNetwork[] {
        const networks: SocialNetwork[] = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'pinterest'];
        return networks.filter(n => this.isConnected(n));
    }
}

export const socialAuthService = new SocialAuthService();
