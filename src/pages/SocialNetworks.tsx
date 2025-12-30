import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { socialAuthService, SocialNetwork } from '../services/social/SocialAuthService';
import {
    CheckBadgeIcon,
    LinkIcon,
    ArrowPathIcon,
    XMarkIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function SocialNetworks() {
    const { addToast } = useToast();
    const [connections, setConnections] = useState<Record<string, boolean>>({
        facebook: false,
        instagram: false,
        linkedin: false,
        twitter: false,
        tiktok: false
    });

    const [loadingNetwork, setLoadingNetwork] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // 1. Atualizar Estado Local das Conexões
    // -------------------------------------------------------------------------
    const refreshConnections = useCallback(() => {
        setConnections({
            facebook: socialAuthService.isConnected('facebook'),
            instagram: socialAuthService.isConnected('instagram'),
            linkedin: socialAuthService.isConnected('linkedin'),
            twitter: socialAuthService.isConnected('twitter'),
            tiktok: socialAuthService.isConnected('tiktok')
        });
    }, []);

    // -------------------------------------------------------------------------
    // 2. Lifecycle: Detectar Retorno de Autenticação e Carregar Estados
    // -------------------------------------------------------------------------
    useEffect(() => {
        // Verifica se acabamos de voltar de um redirect
        const connectedNetwork = socialAuthService.handleRedirectCallback();

        if (connectedNetwork) {
            addToast({
                type: 'success',
                title: 'Conta Vinculada',
                message: `Sua conta do ${connectedNetwork} foi conectada com sucesso!`
            });
        }

        refreshConnections();
    }, [addToast, refreshConnections]);

    // -------------------------------------------------------------------------
    // 3. Handlers
    // -------------------------------------------------------------------------
    const handleConnect = (network: SocialNetwork) => {
        setLoadingNetwork(network);
        socialAuthService.connect(network);
    };

    const handleDisconnect = (network: SocialNetwork) => {
        socialAuthService.disconnect(network);
        refreshConnections();
        addToast({
            type: 'info',
            title: 'Desconectado',
            message: `O vínculo com ${network} foi removido localmente.`
        });
    };

    const SocialCard = ({
        id,
        name,
        network,
        icon,
        colorClass,
        description
    }: {
        id: string,
        name: string,
        network: SocialNetwork,
        icon: React.ReactNode,
        colorClass: string,
        description: string
    }) => {
        const isConnected = connections[network];

        return (
            <motion.div
                id={id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
                {/* Background Decorativo */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${colorClass}`} />

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-inner ${colorClass}/10`}>
                    {icon}
                </div>

                <h3 className="text-xl font-bold text-title mb-2">{name}</h3>
                <p className="text-xs text-body mb-8 leading-relaxed px-4">
                    {description}
                </p>

                <div className="w-full mt-auto">
                    <AnimatePresence mode="wait">
                        {isConnected ? (
                            <motion.div
                                key="connected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500/10 text-green-500 text-sm font-bold rounded-xl border border-green-500/20">
                                    <CheckBadgeIcon className="w-5 h-5" />
                                    CONECTADO
                                </div>
                                <button
                                    onClick={() => handleDisconnect(network)}
                                    className="w-full text-xs text-muted hover:text-red-500 transition-colors py-1 flex items-center justify-center gap-1"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                    Remover vínculo
                                </button>
                            </motion.div>
                        ) : (
                            <Button
                                key="connect"
                                onClick={() => handleConnect(network)}
                                isLoading={loadingNetwork === network}
                                className={`w-full font-bold shadow-lg ${colorClass} hover:opacity-90 text-white border-none py-3`}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Vincular Conta
                            </Button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="container mx-auto py-8 max-w-6xl px-4 pb-24">
            <header id="social-networks-header" className="mb-12 relative">
                <div className="flex items-center gap-3 mb-3">
                    <ShieldCheckIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-black text-title tracking-tight">Vínculo Social</h1>
                </div>
                <p className="text-body text-lg max-w-2xl">
                    Conecte suas contas para autenticação e verificação de identidade.
                    <span className="block mt-1 text-sm text-muted">A VitrineX AI não acessa seus dados privados nem realiza postagens sem permissão explícita em versões futuras.</span>
                </p>

                {/* Linha decorativa */}
                <div className="h-1 w-20 bg-primary mt-6 rounded-full" />
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                <SocialCard
                    id="facebook-card"
                    name="Facebook"
                    network="facebook"
                    colorClass="bg-[#1877F2]"
                    description="Conecte seu Perfil ou Página para integração de identidade."
                    icon={
                        <svg className="w-8 h-8 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    }
                />

                <SocialCard
                    id="instagram-card"
                    name="Instagram"
                    network="instagram"
                    colorClass="bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB]"
                    description="Vincule seu Instagram Business via Facebook Auth."
                    icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583 0.07-4.849 0.149-3.227 1.664-4.771 4.919-4.919 1.266-0.057 1.645-0.069 4.849-0.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0.014 3.668 0.072 4.948 0.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-0.014 4.948-0.072 4.354-0.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-0.014-3.667-0.072-4.947-0.196-4.354-2.617-6.78-6.979-6.98-1.281-0.059-1.69-0.073-4.949-0.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-0.796 0-1.441 0.645-1.441 1.44s0.645 1.44 1.441 1.44c0.795 0 1.439-0.645 1.439-1.44s-0.644-1.44-1.439-1.44z" />
                        </svg>
                    }
                />

                <SocialCard
                    id="linkedin-card"
                    name="LinkedIn"
                    network="linkedin"
                    colorClass="bg-[#0A66C2]"
                    description="Vínculo profissional para verificação de perfil executivo."
                    icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                    }
                />

                <SocialCard
                    id="tiktok-card"
                    name="TikTok"
                    network="tiktok"
                    colorClass="bg-[#000000]"
                    description="Conecte seu TikTok para registrar sua presença na rede."
                    icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.92-.23-2.74.35-.78.58-1.22 1.54-1.2 2.51.01 1.05.61 2.11 1.56 2.53.51.21 1.07.28 1.61.27.76-.01 1.51-.25 2.11-.75.66-.58.98-1.48.97-2.35-.02-5.33-.01-10.66-.02-16z" />
                        </svg>
                    }
                />

            </div>

            {/* Security Notice */}
            <footer className="mt-20 p-6 bg-surface border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <ShieldCheckIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-title">Segurança de Dados</h4>
                        <p className="text-xs text-body">Usamos OAuth 2.0 padrão da indústria. Seus dados nunca são armazenados em nossos servidores.</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-widest bg-muted/5 py-2 px-4 rounded-full border border-border/50">
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin-slow" />
                    Sincronização em tempo real
                </div>
            </footer>
        </div>
    );
}
