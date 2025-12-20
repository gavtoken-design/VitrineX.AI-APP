// src/components/CanvaConnect.tsx
// Component for Canva OAuth connection and publishing

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { canvaService, CanvaUser, CanvaDesign } from '../services/canva';
import {
    LinkIcon,
    ArrowRightOnRectangleIcon,
    CloudArrowUpIcon,
    PhotoIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface CanvaConnectProps {
    onPublishComplete?: (urls: string[]) => void;
}

export default function CanvaConnect({ onPublishComplete }: CanvaConnectProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<CanvaUser | null>(null);
    const [designs, setDesigns] = useState<CanvaDesign[]>([]);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
        handleOAuthCallback();
    }, []);

    const checkAuthStatus = async () => {
        if (canvaService.isAuthenticated()) {
            setIsAuthenticated(true);
            const userData = await canvaService.getCurrentUser();
            if (userData) {
                setUser(userData);
                loadDesigns();
            }
        }
    };

    const handleOAuthCallback = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code) {
            setLoading(true);
            const clientId = import.meta.env.VITE_CANVA_CLIENT_ID;
            const clientSecret = import.meta.env.VITE_CANVA_CLIENT_SECRET;
            const redirectUri = window.location.origin + window.location.pathname;

            const success = await canvaService.exchangeCodeForToken(
                code,
                clientId,
                clientSecret,
                redirectUri
            );

            if (success) {
                setIsAuthenticated(true);
                const userData = await canvaService.getCurrentUser();
                setUser(userData);
                loadDesigns();

                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
            } else {
                setError('Falha ao conectar com o Canva');
            }
            setLoading(false);
        }
    };

    const handleConnect = () => {
        const clientId = import.meta.env.VITE_CANVA_CLIENT_ID;
        const redirectUri = window.location.origin + window.location.pathname;

        if (!clientId) {
            setError('VITE_CANVA_CLIENT_ID não configurado. Adicione ao arquivo .env');
            return;
        }

        const authUrl = canvaService.getAuthorizationUrl(clientId, redirectUri);
        window.location.href = authUrl;
    };

    const handleDisconnect = () => {
        canvaService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setDesigns([]);
        setSuccess('Desconectado do Canva');
    };

    const loadDesigns = async () => {
        setLoading(true);
        const result = await canvaService.listDesigns(20);
        setDesigns(result.designs);
        setLoading(false);
    };

    const handlePublish = async (designId: string) => {
        setPublishing(true);
        setError(null);

        const result = await canvaService.publishDesign(designId, 'png');

        if (result.success && result.export_urls) {
            setSuccess(`Design exportado com sucesso! ${result.export_urls.length} arquivo(s) disponível(is).`);
            onPublishComplete?.(result.export_urls);
        } else {
            setError(result.error || 'Falha ao publicar design');
        }

        setPublishing(false);
    };

    return (
        <div className="bg-surface rounded-2xl p-6 border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-title">Canva Connect</h3>
                        <p className="text-sm text-muted">Publique seus designs diretamente</p>
                    </div>
                </div>

                {isAuthenticated && user && (
                    <div className="flex items-center gap-2">
                        {user.profile_picture_url && (
                            <img
                                src={user.profile_picture_url}
                                alt={user.display_name}
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <span className="text-sm text-body">{user.display_name}</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                    >
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-500">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-400"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2"
                    >
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-500">{success}</span>
                        <button
                            onClick={() => setSuccess(null)}
                            className="ml-auto text-green-500 hover:text-green-400"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            {!isAuthenticated ? (
                <div className="text-center py-8">
                    <p className="text-muted mb-4">
                        Conecte sua conta do Canva para importar e publicar designs
                    </p>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                            <LinkIcon className="w-5 h-5" />
                        )}
                        Conectar com Canva
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadDesigns}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>
                        <button
                            onClick={handleDisconnect}
                            className="flex items-center gap-2 px-4 py-2 text-muted hover:text-error transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Desconectar
                        </button>
                    </div>

                    {/* Designs Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {designs.map((design) => (
                            <motion.div
                                key={design.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative bg-background rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-square bg-muted/10">
                                    {design.thumbnail?.url ? (
                                        <img
                                            src={design.thumbnail.url}
                                            alt={design.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PhotoIcon className="w-12 h-12 text-muted/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handlePublish(design.id)}
                                        disabled={publishing}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        {publishing ? (
                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CloudArrowUpIcon className="w-4 h-4" />
                                        )}
                                        Publicar
                                    </button>
                                </div>

                                {/* Title */}
                                <div className="p-3">
                                    <p className="text-sm text-body truncate">{design.title}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {designs.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted">
                            <PhotoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum design encontrado</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
