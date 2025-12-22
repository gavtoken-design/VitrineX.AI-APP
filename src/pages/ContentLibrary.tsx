
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { LibraryItem } from '../types';
import { getLibraryItems, deleteLibraryItem, saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import { createFileSearchStore, uploadFileToSearchStore } from '../services/ai';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useMediaActions } from '../hooks/useMediaActions';
import { TrashIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, DocumentTextIcon, MusicalNoteIcon, CloudArrowUpIcon, CodeBracketIcon, EyeIcon, PhotoIcon, VideoCameraIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '../hooks/useNavigate';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import JSZip from 'jszip';
import { CODE_TEMPLATES } from '../constants';
import Modal from '../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const ContentLibrary: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'text' | 'audio' | 'templates'>('all');
  const [uploading, setUploading] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<LibraryItem | null>(null);

  const [kbLoading, setKbLoading] = useState<boolean>(false);
  const [kbStoreName, setKbStoreName] = useState<string | null>(localStorage.getItem('vitrinex_kb_name'));

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { handleDownload, handleShare } = useMediaActions(); // removed isProcessing if unused
  const { user } = useAuth();

  const userId = user?.id || 'guest-user';

  const fetchLibrary = useCallback(async (tags?: string[]) => {
    setLoading(true);
    try {
      const items = await getLibraryItems(userId, tags);
      setLibraryItems(items);
    } catch (err) {
      console.error('Failed to fetch library items:', err);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar biblioteca.' });
    } finally {
      setLoading(false);
    }
  }, [userId, addToast]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleCreateKnowledgeBase = async () => {
    setKbLoading(true);
    try {
      const store = await createFileSearchStore(`VitrineX KB - ${new Date().toLocaleDateString()}`);
      if (store && store.storeName) {
        localStorage.setItem('vitrinex_kb_name', store.storeName);
        setKbStoreName(store.storeName);
        addToast({ type: 'success', title: 'Base Criada', message: 'Base de Conhecimento criada! Você já pode indexar arquivos.' });
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao criar base de conhecimento.' });
    } finally {
      setKbLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        let type: LibraryItem['type'];
        if (file.type.startsWith('image')) type = 'image';
        else if (file.type.startsWith('video')) type = 'video';
        else if (file.type.startsWith('audio')) type = 'audio';
        else type = 'text';

        const newItem = await uploadFile(file, userId, type);

        if (kbStoreName && (type === 'text' || file.type === 'application/pdf' || file.type.startsWith('application/vnd.openxmlformats'))) {
          // Auto-index or ask? For now silently skip index prompt to streamline UX or keep it simple
          try {
            await uploadFileToSearchStore(file, {});
            newItem.tags.push('indexed');
          } catch (e) {
            console.warn('Auto-index failed', e);
          }
        }

        await saveLibraryItem(newItem);
        setLibraryItems((prev) => [newItem, ...prev]);
        addToast({ type: 'success', message: 'Arquivo enviado com sucesso!' });

      } catch (err) {
        const errorMessage = `Falha: ${err instanceof Error ? err.message : String(err)}`;
        addToast({ type: 'error', title: 'Erro no Upload', message: errorMessage });
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    }
  }, [userId, kbStoreName, addToast]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteLibraryItem(itemId);
        setLibraryItems((prev) => prev.filter((item) => item.id !== itemId));
        addToast({ type: 'success', message: 'Item excluído.' });
      } catch (err) {
        addToast({ type: 'error', message: 'Falha ao excluir item.' });
      }
    }
  }, [addToast]);

  const handleDownloadAll = useCallback(async () => {
    if (libraryItems.length === 0) {
      addToast({ type: 'warning', message: 'Biblioteca vazia.' });
      return;
    }
    setLoading(true);
    addToast({ type: 'info', message: 'Gerando ZIP...' });

    try {
      const zip = new JSZip();
      const folder = zip.folder("biblioteca-vitrinex");
      if (!folder) return;

      const promises = libraryItems.map(async (item) => {
        const safeName = item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        try {
          if (item.type === 'text') {
            folder.file(`${safeName}.txt`, item.file_url);
          } else if (item.file_url) {
            const response = await fetch(item.file_url);
            const blob = await response.blob();
            const ext = blob.type.split('/')[1] || 'bin';
            folder.file(`${safeName}.${ext}`, blob);
          }
        } catch (e) { console.warn('Zip error', e); }
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vitrinex-export-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: 'Download iniciado!' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao gerar ZIP.' });
    } finally {
      setLoading(false);
    }
  }, [libraryItems, addToast]);

  // -- Filtering Logic --
  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all'
      ? true
      : activeTab === 'templates'
        ? item.tags?.includes('template')
        : item.type === activeTab;

    // Exclude templates from 'all' mixed view to keep it clean, or include? Let's include.
    // Actually templates are usually separate constants. Let's merge them for display if 'templates' tab.
    return matchesSearch && matchesTab;
  });

  const displayItems = activeTab === 'templates'
    ? CODE_TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      type: 'code' as const,
      file_url: t.code,
      userId: 'system',
      tags: ['template'],
      thumbnail_url: '',
      createdAt: new Date().toISOString()
    } as unknown as LibraryItem)).filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredItems;


  // -- UI Components --

  const FilterTab = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${activeTab === id
          ? 'text-white bg-white/10 ring-1 ring-white/20 shadow-lg'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {activeTab === id && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-full bg-white/5"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );

  return (
    <div className="container mx-auto py-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Biblioteca</h2>
          <p className="text-gray-400 text-sm mt-1">Gerencie seus ativos, mídias e templates.</p>
        </div>

        <div className="flex gap-3">
          <label className="cursor-pointer bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
            {uploading ? <LoadingSpinner className="w-4 h-4 text-white" /> : <CloudArrowUpIcon className="w-4 h-4" />}
            Upload
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          {libraryItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll} className="border-border">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md py-4 mb-6 -mx-4 px-4 border-b border-border/50">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar hide-scrollbar">
            <FilterTab id="all" label="Todos" icon={Square2StackIcon} />
            <FilterTab id="image" label="Imagens" icon={PhotoIcon} />
            <FilterTab id="video" label="Vídeos" icon={VideoCameraIcon} />
            <FilterTab id="audio" label="Áudios" icon={MusicalNoteIcon} />
            <FilterTab id="text" label="Textos" icon={DocumentTextIcon} />
            <FilterTab id="templates" label="Templates" icon={CodeBracketIcon} />
          </div>
        </div>
      </div>

      {/* AI Indicator */}
      {kbStoreName && (
        <div className="mb-6 flex items-center gap-2 text-xs text-accent bg-accent/5 px-3 py-1.5 rounded-full w-fit border border-accent/10">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Base de Conhecimento Ativa: {kbStoreName}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <LoadingSpinner className="w-8 h-8 mb-4 text-primary" />
          <p>Carregando sua biblioteca...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-2xl">
          <Square2StackIcon className="w-12 h-12 mb-3 opacity-20" />
          <p>Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                className="group relative bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Thumbnail Area */}
                <div className="aspect-square bg-gray-900 overflow-hidden relative">
                  {item.type === 'image' || item.type === 'video' ? (
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      {item.type === 'audio' && <MusicalNoteIcon className="w-12 h-12 text-gray-600 group-hover:text-purple-400 transition-colors" />}
                      {item.type === 'text' && <DocumentTextIcon className="w-12 h-12 text-gray-600 group-hover:text-blue-400 transition-colors" />}
                      {item.type === 'code' && <CodeBracketIcon className="w-12 h-12 text-gray-600 group-hover:text-green-400 transition-colors" />}
                    </div>
                  )}

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={() => setViewItem(item)}
                      className="p-2 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-xl"
                      title="Visualizar"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {activeTab !== 'templates' && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-full bg-red-500 text-white hover:scale-110 transition-transform shadow-xl"
                        title="Excluir"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-200 text-sm truncate" title={item.name}>{item.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{item.type}</span>
                    {item.tags?.includes('indexed') && (
                      <CloudArrowUpIcon className="w-3 h-3 text-accent" title="Indexado na IA" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Preview */}
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={viewItem?.name} size="lg">
        {viewItem && (
          <div className="space-y-6">
            <div className="bg-black/50 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[300px] max-h-[70vh]">
              {viewItem.type === 'image' ? (
                <img src={viewItem.file_url} className="max-w-full max-h-[60vh] object-contain" />
              ) : viewItem.type === 'video' ? (
                <video src={viewItem.file_url} controls className="max-w-full max-h-[60vh]" />
              ) : viewItem.type === 'audio' ? (
                <audio src={viewItem.file_url} controls className="w-full px-10" />
              ) : (
                <pre className="p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-auto max-h-[60vh] w-full">
                  {viewItem.file_url}
                </pre>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {activeTab === 'templates' ? (
                <Button onClick={() => {
                  navigator.clipboard.writeText(viewItem.file_url);
                  addToast({ type: 'success', message: 'Código copiado!' });
                }}>Copiar Código</Button>
              ) : (
                <Button onClick={() => handleDownload(viewItem.file_url, viewItem.name)}>
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Baixar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContentLibrary;
