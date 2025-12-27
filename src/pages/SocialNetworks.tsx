import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useTutorial, TutorialStep } from '../contexts/TutorialContext';

export default function SocialNetworks() {
    const { addToast } = useToast();
    const [fbConnected, setFbConnected] = useState(false);
    const [igConnected, setIgConnected] = useState(false);
    const { startTutorial, completedModules } = useTutorial();

    // -------------------------------------------------------------------------
    // 1. Simulação / Verificação Básica (Ao carregar)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const fbToken = localStorage.getItem('fb_access_token');
        const igToken = localStorage.getItem('ig_access_token');
        if (fbToken) setFbConnected(true);
        if (igToken) setIgConnected(true);
    }, []);

    // -------------------------------------------------------------------------
    // 2. Automação OAuth: Captura o Token quando volta do Facebook
    // -------------------------------------------------------------------------
    useEffect(() => {
        // O Facebook retorna algo como: http://localhost:8080/#access_token=...&data_access_expiration_time=...
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            try {
                // Extrair o token da URL de forma segura
                const params = new URLSearchParams(hash.replace('#', ''));
                const accessToken = params.get('access_token');

                if (accessToken) {
                    console.log("[SocialNetworks] Token detectado na URL! Salvando automagicamente...");

                    // Salvar Token
                    localStorage.setItem('fb_access_token', accessToken);
                    // Como a maioria das permissões são compartilhadas, ativamos o IG também
                    localStorage.setItem('ig_access_token', accessToken);

                    // Atualizar Estados
                    setFbConnected(true);
                    setIgConnected(true);

                    // Feedback Visual
                    addToast({ type: 'success', message: 'Conexão realizada com sucesso!' });

                    // Limpar a URL (coisa feia) sem recarregar a página
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error("Erro ao processar login social:", error);
                addToast({ type: 'error', message: 'Erro ao processar retorno do Facebook.' });
            }
        }
    }, [addToast]);


    const handleConnectFacebook = () => {
        const fbAppId = import.meta.env.VITE_FB_APP_ID;

        // Real OAuth
        const redirect = encodeURIComponent(import.meta.env.VITE_AUTH_REDIRECT_URI || window.location.origin);
        const scope = "pages_read_engagement,pages_show_list,pages_manage_posts,pages_read_user_content";
        const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirect}&scope=${scope}&response_type=token`;

        window.location.href = url;
    };

    const handleDisconnect = (network: 'facebook' | 'instagram') => {
        if (network === 'facebook') {
            localStorage.removeItem('fb_access_token');
            setFbConnected(false);
            addToast({ type: 'info', message: 'Facebook desconectado.' });
        } else {
            localStorage.removeItem('ig_access_token');
            setIgConnected(false);
            addToast({ type: 'info', message: 'Instagram desconectado.' });
        }
    };

    return (
        <div className="container mx-auto py-8">
            <header id="social-networks-header" className="mb-10">
                <h1 className="text-3xl font-bold text-title mb-2">Redes Sociais</h1>
                <p className="text-body">Gerencie suas conexões e integrações com plataformas externas.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Facebook Card */}
                <motion.div
                    id="facebook-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                    <div className="w-16 h-16 bg-[#1877F2]/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-title mb-1">Facebook Page</h3>
                    <p className="text-sm text-body mb-6">Conecte sua página para agendar posts e ver análises.</p>

                    {fbConnected ? (
                        <div className="w-full">
                            <div className="flex items-center justify-center gap-2 mb-4 text-green-500 font-medium bg-green-500/10 py-2 rounded-lg">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Conectado
                            </div>
                            <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => handleDisconnect('facebook')}>
                                Desconectar
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white" onClick={handleConnectFacebook}>
                            Conectar Facebook
                        </Button>
                    )}
                </motion.div>

                {/* Instagram Card */}
                <motion.div
                    id="instagram-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] rounded-full flex items-center justify-center mb-4 p-[2px]">
                        <div className="bg-surface w-full h-full rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-title mb-1">Instagram Business</h3>
                    <p className="text-sm text-body mb-6">Publique fotos, reels e monitore o engajamento.</p>

                    {igConnected ? (
                        <div className="w-full">
                            <div className="flex items-center justify-center gap-2 mb-4 text-green-500 font-medium bg-green-500/10 py-2 rounded-lg">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Conectado
                            </div>
                            <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => handleDisconnect('instagram')}>
                                Desconectar
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full bg-gradient-to-r from-[#833AB4] to-[#F77737] hover:opacity-90 text-white" disabled title="Login automático via Facebook">
                            Conectar via Facebook
                        </Button>
                    )}
                </motion.div>

            </div>


        </div>
    );
}
