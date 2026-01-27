import React, { useState } from 'react';
import { CloudArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { uploadUrlToDrive } from '../../services/integrations/googleDrive';
import { useToast } from '../../contexts/ToastContext';

interface SaveToDriveButtonProps {
    fileUrl: string;
    fileName: string;
    className?: string;
    variant?: 'icon' | 'full';
}

export const SaveToDriveButton: React.FC<SaveToDriveButtonProps> = ({
    fileUrl,
    fileName,
    className = '',
    variant = 'icon'
}) => {
    const { isConnected } = useGoogleDrive();
    const { addToast } = useToast();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    if (!isConnected) return null;

    const handleSaveToDrive = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent card clicks

        if (status === 'loading' || status === 'success') return;

        setStatus('loading');
        try {
            await uploadUrlToDrive(fileUrl, fileName);
            setStatus('success');
            addToast({ type: 'success', message: 'Salvo no Google Drive com sucesso!' });

            // Reset status after a few seconds
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error('Drive upload error:', error);
            setStatus('error');
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar no Drive.' });
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleSaveToDrive}
                disabled={status === 'loading'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'}
                    ${className}`}
            >
                {status === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : status === 'success' ? (
                    <CheckCircleIcon className="w-5 h-5" />
                ) : status === 'error' ? (
                    <XCircleIcon className="w-5 h-5" />
                ) : (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Drive" />
                )}

                {status === 'success' ? 'Salvo no Drive' :
                    status === 'error' ? 'Erro' :
                        status === 'loading' ? 'Salvando...' :
                            'Salvar no Drive'}
            </button>
        );
    }

    // Icon variant (default)
    return (
        <button
            onClick={handleSaveToDrive}
            disabled={status === 'loading'}
            title="Salvar no Google Drive"
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300
                ${status === 'success' ? 'bg-green-500 text-white' :
                    status === 'error' ? 'bg-red-500 text-white' :
                        'bg-white/90 text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow-lg'} 
                ${className}`}
        >
            {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : status === 'success' ? (
                <CheckCircleIcon className="w-5 h-5" />
            ) : status === 'error' ? (
                <XCircleIcon className="w-5 h-5" />
            ) : (
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Drive" />
            )}
        </button>
    );
};
