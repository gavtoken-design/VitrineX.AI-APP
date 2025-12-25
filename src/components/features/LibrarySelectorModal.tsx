import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal'; // Using the standard Modal component
import { getLibraryItems } from '../../services/core/db';
import { LibraryItem } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LibrarySelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
    userId: string;
}

const LibrarySelectorModal: React.FC<LibrarySelectorModalProps> = ({ isOpen, onClose, onSelect, userId }) => {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getLibraryItems(userId)
                .then(data => setItems(data.filter(i => i.type === 'image' || i.type === 'post'))) // Only images suitable for posts
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, userId]);

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Selecionar da Biblioteca" size="lg">
            <div className="space-y-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar imagens..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:border-primary outline-none"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-10"><LoadingSpinner /></div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.file_url)}
                                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-primary transition-all group"
                            >
                                <img src={item.file_url} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <PhotoIcon className="w-6 h-6 text-white" />
                                </div>
                            </button>
                        ))}
                        {filteredItems.length === 0 && (
                            <p className="col-span-full text-center text-gray-500 text-sm py-4">Nenhuma imagem encontrada.</p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LibrarySelectorModal;
