
export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok';

class SocialAuthService {
    private getStorageKey(network: SocialNetwork): string {
        return `vitrinex_social_connected_${network}`;
    }

    /**
     * Redireciona para o fluxo de autenticação da rede social.
     * Não solicita permissões de escrita/leitura, apenas identidade.
     */
    public connect(network: SocialNetwork): void {
        const redirectUri = encodeURIComponent(window.location.origin + '/?module=SocialNetworks&auth_return=' + network);
        let url = '';

        switch (network) {
            case 'facebook':
                const fbAppId = import.meta.env.VITE_FB_APP_ID || 'YOUR_FB_APP_ID';
                url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirectUri}&response_type=token&scope=public_profile`;
                break;
            case 'instagram':
                // Fluxo simplificado via Facebook Login (comum para IG Business/Identity)
                const igAppId = import.meta.env.VITE_FB_APP_ID || 'YOUR_FB_APP_ID';
                url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${igAppId}&redirect_uri=${redirectUri}&response_type=token&scope=instagram_basic`;
                break;
            case 'linkedin':
                // Mock redirect para LinkedIn (OAuth padrão requer Client Secret no backend, 
                // mas aqui simulamos o fluxo de ida e volta para vínculo local)
                alert('Redirecionando para LinkedIn OAuth...');
                window.location.href = window.location.origin + '/?module=SocialNetworks&auth_return=linkedin';
                return;
            default:
                // Caso genérico para outras redes
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('auth_return', network);
                window.location.href = currentUrl.toString();
                return;
        }

        if (url) {
            console.log(`[SocialAuthService] Redirecting to ${network} auth...`);
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

        // Checa também o hash (comum em fluxos Implicit/Token)
        const hash = window.location.hash;
        const hasToken = hash && hash.includes('access_token=');

        if (authReturn || hasToken) {
            // Se tiver token mas não tiver auth_return na query, assume facebook (padrão do app)
            const network = authReturn || 'facebook';

            console.log(`[SocialAuthService] Connection detected for ${network}. Saving local link.`);

            // Registra o vínculo no LocalStorage
            localStorage.setItem(this.getStorageKey(network), 'true');

            // Limpa os parâmetros de autenticação da URL sem recarregar
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('auth_return');
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
        console.log(`[SocialAuthService] ${network} disconnected locally.`);
    }

    /**
     * Retorna o status de conexão de uma rede.
     */
    public isConnected(network: SocialNetwork): boolean {
        return localStorage.getItem(this.getStorageKey(network)) === 'true';
    }

    /**
     * Retorna todas as conexões ativas.
     */
    public getActiveConnections(): SocialNetwork[] {
        const networks: SocialNetwork[] = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok'];
        return networks.filter(n => this.isConnected(n));
    }
}

export const socialAuthService = new SocialAuthService();
