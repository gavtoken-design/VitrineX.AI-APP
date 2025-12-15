import * as React from 'react';
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CHAT_ANIMATIONS, getActiveAnimation, setActiveAnimation, ChatAnimation } from '../../constants/chat-animations';
import {
    SparklesIcon,
    CheckCircleIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const ChatAnimationManager: React.FC = () => {
    const [activeAnimation, setActiveAnimationState] = useState<ChatAnimation>(getActiveAnimation());
    const [customAnimations, setCustomAnimations] = useState<ChatAnimation[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [uploading, setUploading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setActiveAnimationState(getActiveAnimation());
        loadCustomAnimations();
    }, []);

    const loadCustomAnimations = () => {
        const stored = localStorage.getItem('vitrinex_custom_animations');
        if (stored) {
            try {
                setCustomAnimations(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load custom animations:', e);
            }
        }
    };

    const saveCustomAnimations = (animations: ChatAnimation[]) => {
        localStorage.setItem('vitrinex_custom_animations', JSON.stringify(animations));
        setCustomAnimations(animations);
    };

    const handleActivate = (animation: ChatAnimation) => {
        setActiveAnimation(animation.id);
        setActiveAnimationState(animation);
        addToast({
            type: 'success',
            message: `Animação "${animation.name}" ativada! Recarregue o chat para ver.`
        });
    };

    const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            addToast({ type: 'error', message: 'Por favor, selecione um arquivo de vídeo.' });
            return;
        }

        setUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Video = reader.result as string;

                const newAnimation: ChatAnimation = {
                    id: `custom-${Date.now()}`,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    description: 'Animação personalizada',
                    type: 'video',
                    videoUrl: base64Video,
                    season: 'default',
                    emoji: '🎬',
                };

                const updated = [...customAnimations, newAnimation];
                saveCustomAnimations(updated);
                addToast({ type: 'success', message: 'Vídeo importado com sucesso!' });
                e.target.value = '';
            };

            reader.readAsDataURL(file);
        } catch (error) {
            addToast({ type: 'error', message: 'Erro ao importar vídeo.' });
        } finally {
            setUploading(false);
        }
    };

    const handleEditName = (animation: ChatAnimation) => {
        setEditingId(animation.id);
        setEditName(animation.name);
    };

    const handleSaveName = (animation: ChatAnimation) => {
        if (!editName.trim()) {
            addToast({ type: 'warning', message: 'Nome não pode estar vazio.' });
            return;
        }

        const updated = customAnimations.map(a =>
            a.id === animation.id ? { ...a, name: editName.trim() } : a
        );
        saveCustomAnimations(updated);
        setEditingId(null);
        addToast({ type: 'success', message: 'Nome atualizado!' });
    };

    const handleDelete = (animation: ChatAnimation) => {
        if (confirm(`Excluir animação "${animation.name}"?`)) {
            const updated = customAnimations.filter(a => a.id !== animation.id);
            saveCustomAnimations(updated);

            if (activeAnimation.id === animation.id) {
                handleActivate(CHAT_ANIMATIONS[0]);
            }

            addToast({ type: 'info', message: 'Animação excluída.' });
        }
    };

    const allAnimations = [...CHAT_ANIMATIONS, ...customAnimations];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6" /> Animações do Chat IA
                    </h3>
                    <p className="text-xs text-gray-500">Escolha a animação de fundo do chat</p>
                </div>
                <div className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded text-xs border border-blue-900">
                    Ativa: {activeAnimation.emoji} {activeAnimation.name}
                </div>
            </div>

            {/* Upload Section */}
            <div className="mb-6 p-4 bg-black rounded border border-gray-700">
                <label className="cursor-pointer flex items-center justify-center gap-2 w-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-3 rounded border border-blue-900 text-sm font-bold uppercase tracking-wider transition-colors">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleUploadVideo}
                        className="hidden"
                        disabled={uploading}
                    />
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    {uploading ? 'Importando...' : 'Importar Nova Animação (Vídeo)'}
                </label>
                <p className="text-[10px] text-gray-600 mt-2 text-center">
                    Formatos: MP4, WebM, MOV • Tamanho recomendado: até 10MB
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAnimations.map((animation) => {
                    const isActive = activeAnimation.id === animation.id;
                    const isCustom = customAnimations.some(a => a.id === animation.id);
                    const isEditing = editingId === animation.id;

                    return (
                        <div
                            key={animation.id}
                            className={`relative bg-black p-4 rounded-lg border-2 transition-all ${isActive
                                    ? 'border-green-500 shadow-lg shadow-green-500/20'
                                    : 'border-gray-800 hover:border-gray-600'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                </div>
                            )}

                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-3xl">{animation.emoji}</div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={() => handleSaveName(animation)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSaveName(animation)}
                                            className="w-full bg-gray-900 border border-blue-500 text-white px-2 py-1 text-sm rounded focus:outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                                            {animation.name}
                                            {isCustom && (
                                                <button
                                                    onClick={() => handleEditName(animation)}
                                                    className="text-gray-500 hover:text-blue-400"
                                                    title="Editar nome"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </h4>
                                    )}
                                    <p className="text-xs text-gray-500">{animation.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-gray-600 mb-3">
                                <span className="bg-gray-800 px-2 py-1 rounded">
                                    {animation.type === 'video' ? '🎬 Vídeo' : '✨ CSS'}
                                </span>
                                {isCustom && (
                                    <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded border border-purple-900">
                                        Personalizada
                                    </span>
                                )}
                            </div>

                            {animation.type === 'video' && animation.videoUrl && (
                                <div className="mb-3 rounded overflow-hidden border border-gray-700">
                                    <video
                                        src={animation.videoUrl}
                                        className="w-full h-24 object-cover"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                    />
                                </div>
                            )}

                            {animation.type === 'css' && (
                                <div className="mb-3 h-24 rounded overflow-hidden border border-gray-700 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20 flex items-center justify-center">
                                    <div className="text-4xl animate-pulse">⭐</div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleActivate(animation)}
                                    disabled={isActive}
                                    className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${isActive
                                            ? 'bg-green-900/30 text-green-400 border border-green-900 cursor-not-allowed'
                                            : 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-900'
                                        }`}
                                >
                                    {isActive ? 'Ativa Agora' : 'Ativar'}
                                </button>
                                {isCustom && (
                                    <button
                                        onClick={() => handleDelete(animation)}
                                        className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900 rounded text-xs"
                                        title="Excluir animação"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-900 rounded text-xs text-yellow-400">
                <strong>💡 Dica:</strong> Após ativar uma animação, recarregue a página do Chat IA para visualizar a mudança.
            </div>
        </div>
    );
};

export default ChatAnimationManager;
