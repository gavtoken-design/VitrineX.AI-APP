
import { SecureStorage } from '../../utils/secureStorage';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

/**
 * Carrega os scripts do Google Identity Services e da GAPI.
 * Isso é necessário para autenticação e chamadas de API.
 */
export const initGoogleDrive = async (): Promise<void> => {
    return new Promise((resolve) => {
        if (gapiInited && gisInited) {
            resolve();
            return;
        }

        const script1 = document.createElement('script');
        script1.src = 'https://apis.google.com/js/api.js';
        script1.async = true;
        script1.defer = true;
        script1.onload = () => {
            (window as any).gapi.load('client', async () => {
                await (window as any).gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                if (gisInited) resolve();
            });
        };
        document.body.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://accounts.google.com/gsi/client';
        script2.async = true;
        script2.defer = true;
        script2.onload = () => {
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: async (resp: any) => {
                    if (resp.error !== undefined) {
                        throw (resp);
                    }
                    await storeToken(resp);
                },
            });
            gisInited = true;
            if (gapiInited) resolve();
        };
        document.body.appendChild(script2);
    });
};

const storeToken = async (tokenResponse: any) => {
    // Armazena o token de acesso de forma segura (expira em 1h normalmente)
    const token = {
        value: tokenResponse.access_token,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
    };
    await SecureStorage.setItem('google_drive_token', JSON.stringify(token));
};

export const getStoredToken = async (): Promise<string | null> => {
    const stored = await SecureStorage.getItem<string>('google_drive_token');
    if (!stored) return null;
    try {
        const token = JSON.parse(stored);
        if (Date.now() > token.expiresAt) {
            console.log('Google Drive token expired.');
            return null;
        }
        return token.value;
    } catch (e) {
        console.warn('Failed to parse stored Google Drive token.', e);
        return null;
    }
};

/**
 * Inicia o fluxo de login/autorização do Google Drive.
 */
export const connectGoogleDrive = async (): Promise<void> => {
    await initGoogleDrive();

    // Check if we already have a valid token
    const existingToken = await getStoredToken();
    if (existingToken) {
        // Just verify capabilities or set client token
        (window as any).gapi.client.setToken({ access_token: existingToken });
        return;
    }

    // Request new token
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        throw new Error('Google Drive Client not initialized.');
    }
};

/**
 * Faz upload de um arquivo para o Google Drive.
 * @param file O arquivo (Blob/File) a ser enviado.
 * @param name Nome do arquivo no Drive.
 * @param mimeType Tipo MIME do arquivo.
 */
export const uploadFileToDrive = async (file: Blob, name: string, mimeType: string): Promise<any> => {
    await initGoogleDrive();
    let accessToken = await getStoredToken();

    if (!accessToken) {
        // Se não tiver token, tenta conectar (pode falhar se precisar de clique do usuário, 
        // mas idealmente o usuário já conectou nas configurações)
        throw new Error('Não conectado ao Google Drive. Vá em Configurações > Canais Digitais.');
    }

    // Usando a API REST diretamente com o token para evitar complexidade excessiva da GAPI client
    const metadata = {
        name: name,
        mimeType: mimeType,
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google Drive Upload Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
};

export const isDriveConnected = async (): Promise<boolean> => {
    const token = await getStoredToken();
    return !!token;
};
