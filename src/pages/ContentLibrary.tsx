
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
import { TrashIcon, ArrowDownTrayIcon, ShareIcon, DocumentTextIcon, MusicalNoteIcon, CircleStackIcon, CloudArrowUpIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '../hooks/useNavigate';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const ContentLibrary: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [uploading, setUploading] = useState<boolean>(false);

  const [kbLoading, setKbLoading] = useState<boolean>(false);
  const [kbStoreName, setKbStoreName] = useState<string | null>(localStorage.getItem('vitrinex_kb_name'));

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { handleDownload, handleShare, isProcessing } = useMediaActions();
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
    navigateTo('CalendarManager');
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
          <p className="ml-2 text-textlight">Carregando biblioteca...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 text-center text-textlight">
          Nenhum item encontrado na biblioteca.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-lightbg rounded-lg shadow-sm border border-gray-800 overflow-hidden group">
              <div className="relative h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                {item.type === 'image' || item.type === 'video' ? (
                  <img
                    src={item.thumbnail_url || item.file_url || 'https://picsum.photos/200/150'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'audio' ? (
                  <div className="text-gray-500 text-center p-4">
                    <MusicalNoteIcon className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-textlight">Arquivo de Áudio</p>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-textlight">Arquivo de Texto</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
                  <Button
                    onClick={() => handleDownload(item.file_url, item.name)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-primary/20"
                    title="Baixar"
                    disabled={isProcessing}
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-accent" />
                  </Button>
                  <Button
                    onClick={() => handleShareItem(item)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-primary/20"
                    title="Compartilhar"
                    disabled={isProcessing}
                  >
                    <ShareIcon className="w-5 h-5 text-accent" />
                  </Button>
                  <Button
                    onClick={() => navigateTo('CalendarManager')}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-primary/20"
                    title="Usar no Calendário"
                  >
                    <CalendarDaysIcon className="w-5 h-5 text-accent" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteItem(item.id)}
                    variant="danger"
                    size="sm"
                    className="text-white hover:bg-red-700"
                    title="Excluir"
                  >
                    <TrashIcon className="w-5 h-5 text-red-400" />
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-textdark truncate flex-1">{item.name}</h4>
                  {item.tags.includes('indexed') && <CloudArrowUpIcon className="w-4 h-4 text-accent" title="Indexado na IA" />}
                </div>
                <p className="text-sm text-textmuted mt-1">Tipo: {item.type}</p>
                {item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="bg-darkbg text-textlight text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
