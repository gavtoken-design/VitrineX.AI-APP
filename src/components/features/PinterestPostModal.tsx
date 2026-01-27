import React, { useState } from 'react';
import { pinterestService } from '../../services/pinterest/PinterestService';
import { PinterestBoardSelector } from './PinterestBoardSelector';
import { useToast } from '../../contexts/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    initialTitle?: string;
    initialDescription?: string;
    initialLink?: string;
}

export const PinterestPostModal: React.FC<Props> = ({
    isOpen,
    onClose,
    imageUrl,
    initialTitle = '',
    initialDescription = '',
    initialLink = ''
}) => {
    const [selectedBoardId, setSelectedBoardId] = useState<string>('');
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [link, setLink] = useState(initialLink);
    const [isPosting, setIsPosting] = useState(false);
    const { addToast } = useToast();

    const handlePost = async () => {
        if (!selectedBoardId) {
            addToast({ type: 'warning', message: 'Selecione um board' });
            return;
        }

        if (!title.trim()) {
            addToast({ type: 'warning', message: 'Adicione um título' });
            return;
        }

        try {
            setIsPosting(true);

            await pinterestService.createPin({
                boardId: selectedBoardId,
                imageUrl,
                title: title.trim(),
                description: description.trim(),
                link: link.trim() || undefined,
                altText: title.trim()
            });

            addToast({
                type: 'success',
                title: 'Pin publicado!',
                message: 'Seu conteúdo foi publicado no Pinterest com sucesso!'
            });

            onClose();
        } catch (error: any) {
            addToast({
                type: 'error',
                title: 'Erro ao publicar',
                message: error.message
            });
        } finally {
            setIsPosting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl">📌</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Publicar no Pinterest</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isPosting}
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Preview da Imagem */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preview da Imagem
                        </label>
                        <div className="relative rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full max-h-80 object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EImagem não carregada%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Pinterest recomenda imagens verticais (2:3) com no mínimo 1000x1500px
                        </p>
                    </div>

                    {/* Seleção de Board */}
                    <PinterestBoardSelector
                        selectedBoardId={selectedBoardId}
                        onBoardSelect={setSelectedBoardId}
                    />

                    {/* Título do Pin */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título do Pin <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Design criativo para redes sociais"
                            maxLength={100}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={isPosting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                                {title.length}/100 caracteres
                            </div>
                            {title.length > 50 && (
                                <div className="text-xs text-green-600">
                                    ✓ Bom comprimento
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione uma descrição atraente e detalhada para seu pin..."
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            disabled={isPosting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                                {description.length}/500 caracteres
                            </div>
                            {description.length > 100 && (
                                <div className="text-xs text-green-600">
                                    ✓ Descrição detalhada
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Link (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link de Destino (opcional)
                        </label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://seusite.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={isPosting}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Quando alguém clicar no pin, será direcionado para este link
                        </div>
                    </div>

                    {/* Dicas */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para um Pin de sucesso:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Use títulos descritivos e atraentes</li>
                            <li>• Adicione hashtags relevantes na descrição</li>
                            <li>• Imagens verticais têm melhor performance</li>
                            <li>• Seja específico sobre o que o pin oferece</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={isPosting}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handlePost}
                        disabled={isPosting || !selectedBoardId || !title.trim()}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isPosting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Publicando...
                            </>
                        ) : (
                            <>
                                📌 Publicar no Pinterest
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
