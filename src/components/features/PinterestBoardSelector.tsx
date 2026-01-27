import React, { useState, useEffect } from 'react';
import { pinterestService, PinterestBoard } from '../../services/pinterest/PinterestService';
import { useToast } from '../../contexts/ToastContext';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Props {
    selectedBoardId?: string;
    onBoardSelect: (boardId: string) => void;
}

export const PinterestBoardSelector: React.FC<Props> = ({
    selectedBoardId,
    onBoardSelect
}) => {
    const [boards, setBoards] = useState<PinterestBoard[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [creating, setCreating] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        loadBoards();
    }, []);

    const loadBoards = async () => {
        try {
            setLoading(true);
            const userBoards = await pinterestService.getBoards();
            setBoards(userBoards.items);

            // Auto-selecionar primeiro board se não tiver seleção
            if (!selectedBoardId && userBoards.items.length > 0) {
                onBoardSelect(userBoards.items[0].id);
            }
        } catch (error: any) {
            addToast({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) {
            addToast({ type: 'warning', message: 'Digite um nome para o board' });
            return;
        }

        try {
            setCreating(true);
            const newBoard = await pinterestService.createBoard(newBoardName);
            setBoards([newBoard, ...boards]);
            onBoardSelect(newBoard.id);
            setNewBoardName('');
            setShowCreateBoard(false);
            addToast({ type: 'success', message: 'Board criado com sucesso!' });
        } catch (error: any) {
            addToast({ type: 'error', message: error.message });
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Carregando boards...</span>
            </div>
        );
    }

    if (boards.length === 0 && !showCreateBoard) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Você ainda não tem boards no Pinterest</p>
                <button
                    onClick={() => setShowCreateBoard(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Criar Primeiro Board
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                Selecione o Board
            </label>

            {/* Lista de Boards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {boards.map((board) => (
                    <button
                        key={board.id}
                        onClick={() => onBoardSelect(board.id)}
                        className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${selectedBoardId === board.id
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-red-300'
                            }
                        `}
                    >
                        <div className="font-medium text-gray-900">{board.name}</div>
                        {board.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {board.description}
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`
                                text-xs px-2 py-1 rounded
                                ${board.privacy === 'PUBLIC'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }
                            `}>
                                {board.privacy === 'PUBLIC' ? '🌍 Público' : '🔒 Privado'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Criar Novo Board */}
            {!showCreateBoard ? (
                <button
                    onClick={() => setShowCreateBoard(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                >
                    <PlusIcon className="w-5 h-5" />
                    Criar Novo Board
                </button>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <input
                        type="text"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        placeholder="Nome do novo board"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        autoFocus
                        disabled={creating}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateBoard}
                            disabled={creating || !newBoardName.trim()}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? 'Criando...' : 'Criar Board'}
                        </button>
                        <button
                            onClick={() => {
                                setShowCreateBoard(false);
                                setNewBoardName('');
                            }}
                            disabled={creating}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
