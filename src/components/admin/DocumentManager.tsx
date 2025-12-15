import * as React from 'react';
import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin';
import Button from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
    DocumentTextIcon,
    ArrowUpTrayIcon,
    TrashIcon,
    BellIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Document {
    id: string;
    name: string;
    description: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    notifyUsers: boolean;
}

const DocumentManager: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploading, setUploading] = useState(false);
    const [newDocName, setNewDocName] = useState('');
    const [newDocDescription, setNewDocDescription] = useState('');
    const [notifyUsers, setNotifyUsers] = useState(true);

    const { addToast } = useToast();
    const { addNotification } = useNotifications();

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = () => {
        const stored = localStorage.getItem('vitrinex_admin_documents');
        if (stored) {
            setDocuments(JSON.parse(stored));
        }
    };

    const saveDocuments = (docs: Document[]) => {
        localStorage.setItem('vitrinex_admin_documents', JSON.stringify(docs));
        setDocuments(docs);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!newDocName.trim()) {
            addToast({ type: 'warning', message: 'Digite um nome para o documento.' });
            return;
        }

        setUploading(true);

        try {
            // Converter arquivo para base64 para armazenamento
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;

                const newDoc: Document = {
                    id: `doc-${Date.now()}`,
                    name: newDocName,
                    description: newDocDescription,
                    fileUrl: base64,
                    fileSize: file.size,
                    uploadedAt: new Date().toISOString(),
                    notifyUsers: notifyUsers,
                };

                const updated = [newDoc, ...documents];
                saveDocuments(updated);

                // Se notifyUsers estiver ativo, criar notificação
                if (notifyUsers) {
                    addNotification({
                        type: 'system',
                        title: '📄 Novo Documento Disponível',
                        message: `${newDocName} - ${newDocDescription || 'Clique para baixar'}`,
                        actionUrl: `/download-doc/${newDoc.id}`,
                        metadata: {
                            documentId: newDoc.id,
                            fileName: newDocName,
                            fileUrl: base64,
                        },
                    });
                }

                addToast({
                    type: 'success',
                    message: notifyUsers
                        ? 'Documento enviado e notificação criada!'
                        : 'Documento enviado com sucesso!'
                });

                // Reset form
                setNewDocName('');
                setNewDocDescription('');
                setNotifyUsers(true);
                e.target.value = '';
            };

            reader.readAsDataURL(file);
        } catch (error) {
            addToast({ type: 'error', message: 'Erro ao enviar documento.' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            const updated = documents.filter(d => d.id !== id);
            saveDocuments(updated);
            addToast({ type: 'info', message: 'Documento excluído.' });
        }
    };

    const handleDownload = (doc: Document) => {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.name;
        link.click();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <DocumentTextIcon className="w-6 h-6" /> Gerenciador de Documentos
                    </h3>
                    <p className="text-xs text-gray-500">Envie manuais, tutoriais e documentos para os clientes</p>
                </div>
                <div className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded text-xs border border-blue-900">
                    {documents.length} {documents.length === 1 ? 'Documento' : 'Documentos'}
                </div>
            </div>

            {/* Upload Form */}
            <div className="bg-black p-4 rounded border border-gray-700 mb-6">
                <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Enviar Novo Documento</h4>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Nome do documento (ex: Manual de Utilização)"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                    />

                    <textarea
                        placeholder="Descrição (opcional)"
                        value={newDocDescription}
                        onChange={(e) => setNewDocDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="notifyUsers"
                            checked={notifyUsers}
                            onChange={(e) => setNotifyUsers(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="notifyUsers" className="text-sm text-gray-300 flex items-center gap-1">
                            <BellIcon className="w-4 h-4" /> Notificar todos os usuários
                        </label>
                    </div>

                    <label className="block">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt,.md"
                            className="hidden"
                            id="doc-upload"
                            disabled={uploading}
                        />
                        <div className="cursor-pointer w-full flex items-center justify-center gap-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-900 py-2 rounded text-xs uppercase tracking-wider transition-colors font-bold">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            {uploading ? 'Enviando...' : 'Selecionar e Enviar Arquivo'}
                        </div>
                    </label>
                </div>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
                {documents.length === 0 ? (
                    <div className="bg-black p-8 rounded border border-gray-800 text-center">
                        <DocumentTextIcon className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Nenhum documento enviado ainda.</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between group hover:border-gray-600 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-200">{doc.name}</p>
                                    {doc.description && (
                                        <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] text-gray-600">
                                            {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                        {doc.notifyUsers && (
                                            <span className="text-[9px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                                                <BellIcon className="w-3 h-3 inline mr-1" />
                                                Notificado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="px-3 py-1.5 bg-blue-900/30 text-xs text-blue-400 border border-blue-900 rounded hover:bg-blue-900/50 transition-colors"
                                    title="Baixar documento"
                                >
                                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="px-3 py-1.5 bg-red-900/30 text-xs text-red-400 border border-red-900 rounded hover:bg-red-900/50 transition-colors"
                                    title="Excluir documento"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DocumentManager;
