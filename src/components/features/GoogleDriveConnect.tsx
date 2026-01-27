import React from 'react';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { openDriveFolder } from '../../services/integrations/googleDrive';
import {
    CloudIcon,
    CheckCircleIcon,
    ArrowRightOnRectangleIcon,
    ArrowTopRightOnSquareIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

export const GoogleDriveConnect: React.FC = () => {
    const { isConnected, userProfile, isLoading, connect, disconnect } = useGoogleDrive();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Header Visual */}
            <div className={`h-2 w-full ${isConnected ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isConnected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                            <CloudIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Google Drive</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isConnected ? 'Sincronização ativa e segura.' : 'Armazene seus projetos na nuvem.'}
                            </p>
                        </div>
                    </div>

                    {isConnected && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            <CheckCircleIcon className="w-3 h-3" /> Conectado
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : !isConnected ? (
                    <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-sm mx-auto">
                            Conecte sua conta para habilitar backups automáticos, exportação de PDFs e salvar imagens da biblioteca.
                        </p>
                        <button
                            onClick={connect}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                            Conectar com Google Drive
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 space-y-6">
                        {/* User Profile Card */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                {userProfile?.picture ? (
                                    <img src={userProfile.picture} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {userProfile?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{userProfile?.name || 'Usuário Google'}</p>
                                    <p className="text-xs text-slate-500">{userProfile?.email || 'email oculto'}</p>
                                </div>
                            </div>
                            <button
                                onClick={disconnect}
                                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                            >
                                <ArrowRightOnRectangleIcon className="w-3 h-3" /> Desconectar
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => openDriveFolder()}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                            >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Abrir Pasta no Drive
                            </button>
                            <button
                                onClick={connect}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                            >
                                <ArrowPathIcon className="w-4 h-4" /> Testar / Reconectar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
