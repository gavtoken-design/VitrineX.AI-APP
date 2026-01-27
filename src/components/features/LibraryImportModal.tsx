
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MagnifyingGlassIcon, ClipboardDocumentIcon, PhotoIcon, DocumentTextIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getLibraryItems } from '../../services/core/db';
import { SEASONAL_TEMPLATES } from '../../data/templates';
import { LibraryItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LibraryImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (content: string) => void; // Optional: if provided, returns content instead of copying
    initialFilter?: 'all' | 'text' | 'image' | 'video' | 'trends' | 'prompt';
}

const LibraryImportModal: React.FC<LibraryImportModalProps> = ({ isOpen, onClose, onSelect, initialFilter = 'all' }) => {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'trends' | 'prompt'>(initialFilter);
    const { user } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (user) fetchItems();
            setFilterType(initialFilter); // Reset filter when opened
        }
    }, [isOpen, user, initialFilter]);

    useEffect(() => {
        let result = items;

        if (filterType !== 'all') {
            if (filterType === 'trends') {
                result = result.filter(item => item.tags?.includes('trend') || item.tags?.includes('tendencia'));
            } else {
                result = result.filter(item =>
                    item.type === filterType ||
                    (filterType === 'text' && item.type === 'prompt') ||
                    (filterType === 'prompt' && item.type === 'text')
                );
            }
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(lowerTerm) ||
                item.tags?.some(tag => tag.toLowerCase().includes(lowerTerm))
            );
        }

        setFilteredItems(result);
    }, [items, searchTerm, filterType]);

    const fetchItems = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const fetchedItems = await getLibraryItems(user.id);

            // Integrate System Templates
            const systemTemplates: LibraryItem[] = SEASONAL_TEMPLATES.map(tmpl => ({
                id: tmpl.id,
                userId: 'system',
                name: `${tmpl.icon} ${tmpl.label}`,
                type: 'prompt',
                file_url: tmpl.basePrompt,
                tags: ['template', 'system', 'featured'],
                createdAt: new Date().toISOString()
            }));

            setItems([...systemTemplates, ...fetchedItems]);
        } catch (error) {
            console.error('Error fetching library:', error);
            addToast({ type: 'error', message: 'Erro ao carregar biblioteca' });
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = async (item: LibraryItem) => {
        let content = item.file_url;

        // Fetch content for text-based items if it's a URL
        if ((item.type === 'text' || item.type === 'prompt' || item.type === 'code') && (content.startsWith('http') || content.startsWith('data:'))) {
            try {
                const res = await fetch(content);
                content = await res.text();
            } catch (e) {
                console.warn("Failed to fetch text content", e);
                // Fallback to URL
            }
        }

        if (onSelect) {
            onSelect(content);
            // Don't toast if selecting, parent might handle it, or we toast "Imported"
            addToast({ type: 'success', message: 'Conteúdo importado com sucesso!' });
            onClose();
            return;
        }

        // Default behavior: Copy to clipboard
        try {
            await navigator.clipboard.writeText(content);
            addToast({ type: 'success', message: 'Copiado para a área de transferência!' });
            onClose();
        } catch (err) {
            addToast({ type: 'error', message: 'Falha ao copiar' });
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
                    />
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-4xl h-[80vh] bg-surface rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ClipboardDocumentIcon className="w-6 h-6 text-primary" />
                                        Importar da Biblioteca
                                    </h2>
                                    <p className="text-muted text-sm mt-1">Selecione um item para copiar seu conteúdo.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="p-4 border-b border-white/10 bg-black/10 space-y-4">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {(['all', 'text', 'image', 'video', 'trends', 'prompt'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterType === type
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {type === 'all' ? 'Todos' :
                                                type === 'trends' ? 'Tendências' :
                                                    type === 'prompt' ? 'Prompts' :
                                                        type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou tag..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="flex-1 overflow-y-auto p-6 bg-black/20">
                                {loading ? (
                                    <div className="h-full flex justify-center items-center">
                                        <LoadingSpinner />
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="text-center py-10 text-muted">
                                        Nenhum item encontrado.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredItems.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item)}
                                                className="group relative bg-surface border border-white/5 rounded-xl p-3 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer flex gap-3 items-start"
                                            >
                                                <div className="w-16 h-16 rounded-lg bg-black/40 flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                                                    {item.type === 'image' ? (
                                                        <img src={item.file_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : item.type === 'text' ? (
                                                        <DocumentTextIcon className="w-8 h-8 text-gray-500" />
                                                    ) : item.type === 'prompt' ? (
                                                        <SparklesIcon className="w-8 h-8 text-yellow-500" />
                                                    ) : (
                                                        <PhotoIcon className="w-8 h-8 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        {new Date(item.createdAt).toLocaleDateString()} • {item.type}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {item.tags?.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="p-1.5 bg-primary rounded-full shadow-lg">
                                                        <CheckIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default LibraryImportModal;
