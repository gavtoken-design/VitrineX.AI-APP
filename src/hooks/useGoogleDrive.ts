import { useState, useEffect } from 'react';
import { connectGoogleDrive, isDriveConnected, getStoredToken } from '../services/integrations/googleDrive';
import { SecureStorage } from '../lib/secureStorage';

interface UserProfile {
    name: string;
    email: string;
    picture?: string;
}

export const useGoogleDrive = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verifica conexão ao montar
    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        setIsLoading(true);
        try {
            const connected = await isDriveConnected();
            setIsConnected(connected);

            if (connected) {
                // Busca perfil armazenado
                const storedProfile = await SecureStorage.getItem<string>('google_user_profile');
                if (storedProfile) {
                    setUserProfile(JSON.parse(storedProfile));
                }
            }
        } catch (error) {
            console.error('Erro ao verificar conexão Drive:', error);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const connect = async () => {
        setIsLoading(true);
        try {
            await connectGoogleDrive();

            // Após conectar, busca informações do usuário via Google People API
            const token = await getStoredToken();
            if (token) {
                try {
                    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const profile = await response.json();
                        const userData: UserProfile = {
                            name: profile.name,
                            email: profile.email,
                            picture: profile.picture
                        };
                        setUserProfile(userData);
                        await SecureStorage.setItem('google_user_profile', JSON.stringify(userData));
                    }
                } catch (err) {
                    console.warn('Falha ao buscar perfil do usuário:', err);
                }
            }

            await checkConnection();
        } catch (error) {
            console.error('Erro ao conectar Drive:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const disconnect = async () => {
        setIsLoading(true);
        try {
            // Remove token e perfil armazenados
            await SecureStorage.removeItem('google_drive_token');
            await SecureStorage.removeItem('google_user_profile');
            setIsConnected(false);
            setUserProfile(null);
        } catch (error) {
            console.error('Erro ao desconectar Drive:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isConnected,
        userProfile,
        isLoading,
        connect,
        disconnect,
        refresh: checkConnection
    };
};
