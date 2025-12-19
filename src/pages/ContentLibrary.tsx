
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
import { TrashIcon, ArrowDownTrayIcon, ShareIcon, DocumentTextIcon, MusicalNoteIcon, CircleStackIcon, CloudArrowUpIcon, CalendarDaysIcon, CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '../hooks/useNavigate';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import JSZip from 'jszip';
import { CODE_TEMPLATES } from '../constants'; // Import Code Templates
import Modal from '../components/ui/Modal'; // Added Modal import

const ContentLibrary: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [uploading, setUploading] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<LibraryItem | null>(null); // Added state for viewing item

  const [kbLoading, setKbLoading] = useState<boolean>(false);
  const [kbStoreName, setKbStoreName] = useState<string | null>(localStorage.getItem('vitrinex_kb_name'));

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { handleDownload, handleShare, isProcessing } = useMediaActions();
  const { user } = useAuth();

  const handleCopyTemplate = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast({ type: 'success', message: 'Código do template copiado!' });
  };

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

  const handleDownloadAll = useCallback(async () => {
    if (libraryItems.length === 0) {
      addToast({ type: 'warning', message: 'Biblioteca vazia.' });
      return;
    }

    setLoading(true);
    addToast({ type: 'info', message: 'Preparando download... isso pode demorar um pouco.' });

    try {
      const zip = new JSZip();
      const folder = zip.folder("biblioteca-vitrinex");

      if (!folder) return;

      const promises = libraryItems.map(async (item) => {
        const safeName = item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (item.type === 'text') {
          // Text files
          folder.file(`${safeName}.txt`, item.file_url);
        } else if ((item.type === 'image' || item.type === 'audio' || item.type === 'video') && item.file_url) {
          // Media files - try to fetch blob
          try {
            if (item.file_url.startsWith('data:')) {
              const base64Data = item.file_url.split(',')[1];
              folder.file(`${safeName}.${item.type === 'image' ? 'png' : item.type === 'audio' ? 'mp3' : 'mp4'}`, base64Data, { base64: true });
            } else {
              const response = await fetch(item.file_url);
              const blob = await response.blob();
              folder.file(`${safeName}.${blob.type.split('/')[1] || 'bin'}`, blob);
            }
          } catch (e) {
            console.warn(`Could not download ${item.name}`, e);
            folder.file(`${safeName}_error.txt`, `Erro ao baixar: ${item.file_url}`);
          }
        }
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biblioteca-vitrinex-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({ type: 'success', message: 'Download concluído!' });

    } catch (e) {
      console.error(e);
      addToast({ type: 'error', message: 'Erro ao gerar arquivo ZIP.' });
    } finally {
      setLoading(false);
    }
  }, [libraryItems, addToast]);

  useEffect(() => {
    fetchLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao criar base de conhecimento. Verifique sua chave API.' });
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
          if (window.confirm(`Deseja indexar "${file.name}" na sua Base de Conhecimento para pesquisa?`)) {
            try {
              await uploadFileToSearchStore(file, {});
              addToast({ type: 'success', title: 'Indexado', message: 'Arquivo indexado na IA com sucesso!' });
              newItem.tags.push('indexed');
            } catch (idxErr) {
              console.error('Indexing failed', idxErr);
              addToast({ type: 'warning', title: 'Parcial', message: 'Upload concluído, mas falha ao indexar na IA.' });
            }
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
        console.error('Error deleting item:', err);
        addToast({ type: 'error', message: 'Falha ao excluir item.' });
      }
    }
  }, [addToast]);

  const handleShareItem = useCallback((item: LibraryItem) => {
    if (item.type !== 'image' && item.type !== 'video') {
      addToast({ type: 'warning', message: 'Apenas imagens e vídeos podem ser compartilhados.' });
      return;
    }
    handleShare(item.file_url, item.name, `Confira este arquivo da minha biblioteca: ${item.name}`);
  }, [addToast, handleShare]);

  const handleUseInCalendar = useCallback((item: LibraryItem) => {
    navigateTo('SmartScheduler');
    addToast({ type: 'info', message: `Item "${item.name}" pronto para agendar.` });
  }, [navigateTo, addToast]);

  const allTags = Array.from(new Set(libraryItems.flatMap(item => item.tags)));
  const filteredItems = libraryItems
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => selectedTag === 'all' || item.tags.includes(selectedTag));

  const hasActiveFilters = searchTerm.trim() !== '' || selectedTag !== 'all';

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTag('all');
    fetchLibrary();
  }, [fetchLibrary]);

  const groupedItems = React.useMemo(() => {
    const filtered = libraryItems
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => selectedTag === 'all' || item.tags.includes(selectedTag));

    return {
      audio: filtered.filter(i => i.type === 'audio'),
      image: filtered.filter(i => i.type === 'image'),
      text: filtered.filter(i => i.type === 'text' && !i.file_url.includes('<!DOCTYPE html>')),
      html: filtered.filter(i => i.type === 'text' && i.file_url.includes('<!DOCTYPE html>')),
      video: filtered.filter(i => i.type === 'video'),
      other: filtered.filter(i => !['audio', 'image', 'text', 'video'].includes(i.type))
    };
  }, [libraryItems, searchTerm, selectedTag]);

  const Column = ({ title, items, icon: Icon }: { title: string; items: LibraryItem[]; icon: any }) => (
    <div className="flex-none w-[85vw] sm:w-[350px] bg-background/40 rounded-xl border border-border/50 flex flex-col h-[70vh]">
      <div className="p-4 flex items-center justify-between border-b border-border/50 bg-surface/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h4 className="font-bold text-title uppercase tracking-wider text-xs">{title} ({items.length})</h4>
        </div>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
            <Icon className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-xs">Vazio</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-surface rounded-lg border border-border overflow-hidden group hover:border-primary/50 transition-all p-3 shadow-sm hover:shadow-md">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center overflow-hidden rounded mb-2">
                {item.type === 'image' || item.type === 'video' ? (
                  <img
                    src={item.thumbnail_url || item.file_url || 'https://picsum.photos/200/150'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'audio' ? (
                  <MusicalNoteIcon className="w-10 h-10 text-primary/50" />
                ) : (
                  <DocumentTextIcon className="w-10 h-10 text-primary/50" />
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                  <button
                    onClick={() => setViewItem(item)}
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-primary hover:text-white transition-colors backdrop-blur-sm"
                    title="Visualizar"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-red-500 hover:text-white transition-colors backdrop-blur-sm"
                    title="Excluir"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-title truncate" title={item.name}>{item.name}</h5>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.tags.includes('indexed') && <CloudArrowUpIcon className="w-3 h-3 text-accent" title="Indexado na IA" />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Biblioteca de Conteúdo</h2>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg shadow-md border border-gray-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <CircleStackIcon className="w-6 h-6 text-accent" /> Base de Conhecimento (IA)
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {kbStoreName ?
              `Conectado a: ${kbStoreName}. Arquivos enviados podem ser pesquisados pelo Chatbot.` :
              "Crie um repositório para indexar seus arquivos e permitir que a IA responda com base neles."
            }
          </p>
        </div>
        <div>
          {!kbStoreName ? (
            <Button onClick={handleCreateKnowledgeBase} isLoading={kbLoading} variant="secondary">
              Criar Base de Conhecimento
            </Button>
          ) : (
            <span className="text-xs font-mono bg-black/30 px-3 py-1 rounded text-accent border border-accent/20">
              Status: Ativo
            </span>
          )}
        </div>
      </div>

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Gerenciar Conteúdo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            id="searchContent"
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-1 md:col-span-2"
          />
          <div>
            <label htmlFor="tagFilter" className="sr-only">Filtrar por Tag</label>
            <select
              id="tagFilter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-neonGreen focus:ring-offset-2 focus:ring-offset-lightbg sm:text-sm"
            >
              <option value="all">Todas as Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label
            htmlFor="file-upload-input"
            className={`cursor-pointer inline-flex items-center justify-center px-5 py-2 text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out w-full sm:w-auto
              ${uploading ? 'opacity-60 cursor-not-allowed bg-accent text-darkbg' : 'bg-accent text-darkbg shadow-lg shadow-accent/50 hover:bg-neonGreen/80 focus:ring-neonGreen focus:ring-offset-lightbg'}`}
          >
            {uploading ? <LoadingSpinner /> : 'Enviar Arquivo'}
            <input
              id="file-upload-input"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {hasActiveFilters && (
            <Button variant="primary" onClick={handleClearFilters} className="w-full sm:w-auto">
              Limpar Filtros
            </Button>
          )}
          <Button onClick={handleDownloadAll} variant="outline" className="w-full sm:w-auto flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" /> Baixar Tudo (ZIP)
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
          <p className="ml-2 text-textlight">Carregando biblioteca...</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
          <Column title="Imagens" items={groupedItems.image} icon={CircleStackIcon} />
          <Column title="Áudios" items={groupedItems.audio} icon={MusicalNoteIcon} />
          <Column title="Páginas HTML" items={groupedItems.html} icon={CodeBracketIcon} />

          {/* Static Templates Column */}
          <div className="flex-none w-[85vw] sm:w-[350px] bg-background/40 rounded-xl border border-border/50 flex flex-col h-[70vh]">
            <div className="p-4 flex items-center justify-between border-b border-border/50 bg-surface/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="w-5 h-5 text-accent" />
                <h4 className="font-bold text-title uppercase tracking-wider text-xs">Modelos Prontos ({CODE_TEMPLATES.length})</h4>
              </div>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
              {CODE_TEMPLATES.map((tmpl, idx) => (
                <div key={tmpl.id} className="bg-surface rounded-lg border border-border overflow-hidden p-3 shadow-sm hover:border-accent/50 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                      <CodeBracketIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-title">{tmpl.name}</h5>
                      <p className="text-[10px] text-muted">{tmpl.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleCopyTemplate(tmpl.code)}
                      className="flex-1 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-darkbg rounded text-[10px] font-bold transition-colors"
                      title="Copiar Código HTML"
                    >
                      Copiar HTML
                    </button>
                    <button
                      onClick={() => setViewItem({
                        id: tmpl.id,
                        name: tmpl.name,
                        type: 'text', // Treat as text/code for preview
                        file_url: tmpl.code,
                        userId: 'system',
                        tags: ['template'],
                        createdAt: new Date().toISOString()
                      } as LibraryItem)}
                      className="p-1.5 bg-surface border border-border rounded text-muted hover:text-white hover:border-white transition-colors"
                      title="Visualizar Preview"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Column title="Textos / Cópias" items={groupedItems.text} icon={DocumentTextIcon} />
          <Column title="Outros" items={groupedItems.other} icon={CircleStackIcon} />
        </div>
      )}
      <Modal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.name}
        size="lg"
      >
        {viewItem && (
          <div className="space-y-6">
            {/* Visual Content */}
            <div className="w-full bg-black/5 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] border border-border relative">
              {viewItem.type === 'image' ? (
                <img src={viewItem.file_url} alt={viewItem.name} className="max-w-full max-h-[70vh] object-contain" />
              ) : viewItem.type === 'video' ? (
                <video src={viewItem.file_url} controls className="max-w-full max-h-[70vh]" />
              ) : viewItem.type === 'audio' ? (
                <div className="p-10 w-full"><audio src={viewItem.file_url} controls className="w-full" /></div>
              ) : (viewItem.type === 'text' || viewItem.type === 'html') ? (
                <div className="w-full p-4 max-h-[60vh] overflow-auto bg-gray-900 text-gray-100 font-mono text-xs rounded">
                  <pre className="whitespace-pre-wrap">{viewItem.file_url}</pre>
                </div>
              ) : (
                <div className="text-muted p-10 flex flex-col items-center">
                  <DocumentTextIcon className="w-16 h-16 mb-2 opacity-50" />
                  <p>Pré-visualização não disponível</p>
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded-lg border border-border">
                <h4 className="text-sm font-bold text-title mb-2">Detalhes</h4>
                <div className="space-y-1 text-sm text-body">
                  <p><span className="text-muted">Tipo:</span> <span className="uppercase">{viewItem.type}</span></p>
                  <p><span className="text-muted">Criado em:</span> {new Date(viewItem.createdAt).toLocaleString()}</p>
                  <p><span className="text-muted">Tags:</span> {viewItem.tags?.join(', ') || '-'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <button
                  onClick={() => handleDownload(viewItem.file_url, viewItem.name)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Baixar Arquivo
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContentLibrary;
