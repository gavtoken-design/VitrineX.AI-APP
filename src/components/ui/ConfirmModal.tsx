import React from 'react';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'info',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            border: 'border-red-900',
            bg: 'bg-red-900/10',
            btn: 'bg-red-600 hover:bg-red-700 text-white',
            icon: 'text-red-500'
        },
        warning: {
            border: 'border-yellow-900',
            bg: 'bg-yellow-900/10',
            btn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
            icon: 'text-yellow-500'
        },
        info: {
            border: 'border-blue-900',
            bg: 'bg-blue-900/10',
            btn: 'bg-blue-600 hover:bg-blue-700 text-white',
            icon: 'text-blue-500'
        }
    };

    const style = colors[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md bg-gray-900 border ${style.border} rounded-lg shadow-2xl overflow-hidden scale-100 animate-scale-in`}>
                <div className={`p-6 ${style.bg} border-b ${style.border}`}>
                    <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        {type === 'danger' && 'ExampleIcon' /* Use heroicon if needed */}
                        {title}
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="p-4 bg-black/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-lg">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white"
                    >
                        {cancelText}
                    </Button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded text-sm font-bold transition-all transform active:scale-95 ${style.btn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
