import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { LibraryItem } from '../types';
import { getLibraryItems, deleteLibraryItem, saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import { createFileSearchStore, uploadFileToSearchStore } from '../services/ai';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import FilterTab from '../components/ui/FilterTab'; // Extracted Component
import { useMediaActions } from '../hooks/useMediaActions';
import {
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  EyeIcon,
  PhotoIcon,
  VideoCameraIcon,
  Square2StackIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CubeTransparentIcon,
  UserCircleIcon,
  ViewColumnsIcon,
  FilmIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from '../hooks/useNavigate';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial, TutorialStep } from '../contexts/TutorialContext';
import JSZip from 'jszip';
import { CODE_TEMPLATES, ANIMATION_PROMPTS } from '../constants';
import { VISUAL_TEMPLATES } from '../templates';
import Modal from '../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveToDriveButton } from '../components/features/SaveToDriveButton';

const ContentLibrary: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [uploading, setUploading] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<LibraryItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');

  const [kbLoading, setKbLoading] = useState<boolean>(false);
  const [kbStoreName, setKbStoreName] = useState<string | null>(localStorage.getItem('vitrinex_kb_name'));

  const { addToast } = useToast();
  const { handleDownload } = useMediaActions();
  const { user } = useAuth();
  const { startTutorial, completedModules } = useTutorial();

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

  useEffect(() => {
    if (!completedModules['content_library']) {
      const tutorialSteps: TutorialStep[] = [
        {
          targetId: 'library-header',
          title: 'Sua Biblioteca',
          content: 'Centralize todos os seus ativos digitais, imagens e textos aqui.',
          position: 'bottom',
        },
        {
          targetId: 'upload-button',
          title: 'Upload Rápido',
          content: 'Carregue arquivos para usar em seus projetos ou treinar a IA.',
          position: 'bottom',
        },
        {
          targetId: 'filter-tabs',
          title: 'Organização Inteligente',
          content: 'Filtre por tipo de mídia para encontrar o que precisa em segundos.',
          position: 'bottom',
        }
      ];
      startTutorial('content_library', tutorialSteps);
    }
  }, [completedModules, startTutorial]);

  useEffect(() => {
    if (viewItem && (viewItem.type === 'text' || viewItem.type === 'code' || viewItem.type === 'prompt' || viewItem.type === 'html')) {
      const url = viewItem.file_url;
      if (url.startsWith('http')) {
        fetch(url)
          .then(res => res.text())
          .then(text => setPreviewContent(text))
          .catch(err => setPreviewContent('Erro ao carregar conteúdo: ' + err.message));
      } else if (url.startsWith('data:')) {
        fetch(url).then(res => res.text()).then(t => setPreviewContent(t));
      } else {
        setPreviewContent(url);
      }
    } else {
      setPreviewContent('');
    }
  }, [viewItem]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        let type: LibraryItem['type'];
        if (file.type.startsWith('image')) type = 'image';
        else if (file.type.startsWith('video')) type = 'video';
        else if (file.type.startsWith('audio')) type = 'audio';
        else if (file.name.endsWith('.prompt')) type = 'prompt';
        else type = 'text';

        const newItem = await uploadFile(file, userId, type);

        if (kbStoreName && (type === 'text' || file.type === 'application/pdf')) {
          try {
            await uploadFileToSearchStore(file, {});
            newItem.tags.push('indexed');
          } catch (e) { console.warn(e) }
        }

        await saveLibraryItem(newItem);
        setLibraryItems((prev) => [newItem, ...prev]);
        addToast({ type: 'success', message: 'Arquivo enviado com sucesso!' });
      } catch (err) {
        addToast({ type: 'error', title: 'Erro no Upload', message: String(err) });
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
    if (libraryItems.length === 0) return;
    setLoading(true);
    addToast({ type: 'info', message: 'Gerando ZIP...' });
    try {
      const zip = new JSZip();
      const folder = zip.folder("biblioteca-vitrinex");

      const promises = libraryItems.map(async (item) => {
        try {
          if (item.file_url) {
            const response = await fetch(item.file_url);
            const blob = await response.blob();
            folder?.file(item.name, blob);
          }
        } catch (e) { }
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vitrinex-export-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      addToast({ type: 'error', message: 'Erro no ZIP' });
    } finally {
      setLoading(false);
    }
  }, [libraryItems, addToast]);

  // -- Filtering Logic --
  // -- Filtering Logic with Performance Optimization --
  const filteredItems = React.useMemo(() => {
    return libraryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all'
        ? true
        : activeTab === 'trends'
          ? item.tags?.includes('trend') || item.tags?.includes('tendencia')
          : activeTab === 'templates'
            ? item.tags?.includes('template')
            : activeTab === 'avatar'
              ? item.tags?.includes('avatar')
              : item.type === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [libraryItems, searchTerm, activeTab]);

  const displayItems = React.useMemo(() => {
    return activeTab === 'code_templates'
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
      : activeTab === 'visual_templates'
        ? VISUAL_TEMPLATES.map(t => ({
          id: t.id,
          name: t.name,
          type: 'visual_template' as any,
          file_url: 'component://' + t.id,
          userId: 'system',
          tags: ['template', 'visual', 'react'],
          thumbnail_url: '',
          createdAt: new Date().toISOString()
        } as unknown as LibraryItem)).filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))

        : activeTab === 'anim_prompts'
          ? ANIMATION_PROMPTS.map(t => ({
            id: t.id,
            name: t.name,
            type: 'prompt' as const,
            file_url: t.prompt,
            userId: 'system',
            tags: ['prompt', 'animation'],
            thumbnail_url: '',
            createdAt: new Date().toISOString()
          } as unknown as LibraryItem)).filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
          : filteredItems;
  }, [activeTab, searchTerm, filteredItems]);

  return (
    <div className="container mx-auto py-8 px-4 pb-24 animate-fade-in">
      {/* Header & Stats - REDESIGNED */}
      <div id="library-header" className="flex flex-col mb-6 gap-2">
        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Biblioteca <span className="text-primary not-italic">Digital</span></h2>
        <p className="text-[var(--text-secondary)] text-sm font-medium tracking-wide">Gerencie seus ativos, mídias e templates com máxima performance.</p>
      </div>

      {/* Unified Toolbar (Search + Filters + Upload) */}
      <div className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-2xl py-4 mb-8 -mx-4 px-4 border-b border-white/5 shadow-2xl">
        <div className="flex flex-col gap-4">

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:max-w-md group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar em toda a biblioteca..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-600 shadow-inner"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full md:w-auto">
              <label id="upload-button" className="cursor-pointer bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 duration-200">
                {uploading ? <LoadingSpinner className="w-4 h-4 text-white" /> : <CloudArrowUpIcon className="w-5 h-5" />}
                <span className="hidden sm:inline">Upload</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              {libraryItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleDownloadAll} className="border-white/10 hover:bg-white/5 hover:text-white px-4">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Scrollable Filters */}
          <div id="filter-tabs" className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 custom-scrollbar hide-scrollbar snap-x pt-2">
            <FilterTab id="all" label="Todos" icon={Square2StackIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="image" label="Imagens" icon={PhotoIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="video" label="Vídeos" icon={VideoCameraIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="audio" label="Áudios" icon={MusicalNoteIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="text" label="Textos" icon={DocumentTextIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="prompt" label="Prompts" icon={SparklesIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="anim_prompts" label="Prompts Animação" icon={FilmIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="trends" label="Trends" icon={RocketLaunchIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="code" label="Meus Projetos" icon={CodeBracketIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="code_templates" label="Templates Dev" icon={CommandLineIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="visual_templates" label="Templates UI" icon={ViewColumnsIcon} activeId={activeTab} onClick={setActiveTab} />
            <FilterTab id="avatar" label="Avatares" icon={UserCircleIcon} activeId={activeTab} onClick={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <LoadingSpinner className="w-10 h-10 mb-4 text-primary" />
          <p className="text-gray-500 font-medium animate-pulse">Carregando seus ativos...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="p-6 bg-white/5 rounded-full mb-4 ring-1 ring-white/10">
            <CubeTransparentIcon className="w-12 h-12 text-gray-700" />
          </div>
          <p className="font-bold text-lg text-gray-400">Nenhum item encontrado</p>
          <p className="text-sm text-gray-600 mt-1">Faça upload ou gere conteúdo novo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                key={item.id}
                className="group relative bg-[#0A0A0A] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="aspect-[4/5] bg-gray-900 overflow-hidden relative">
                  {item.type === 'image' || item.type === 'video' ? (
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 gap-4 p-4 text-center">
                      {item.type === 'audio' && <MusicalNoteIcon className="w-16 h-16 text-gray-700 group-hover:text-purple-500 transition-colors" />}
                      {item.type === 'text' && !item.tags?.includes('avatar') && <DocumentTextIcon className="w-16 h-16 text-gray-700 group-hover:text-blue-500 transition-colors" />}
                      {item.tags?.includes('avatar') && <UserCircleIcon className="w-16 h-16 text-gray-700 group-hover:text-indigo-500 transition-colors" />}
                      {item.type === 'prompt' && item.tags?.includes('animation') && <FilmIcon className="w-16 h-16 text-gray-700 group-hover:text-amber-500 transition-colors" />}
                      {item.type === 'prompt' && !item.tags?.includes('animation') && <SparklesIcon className="w-16 h-16 text-gray-700 group-hover:text-amber-500 transition-colors" />}
                      {item.type === 'code' && <CodeBracketIcon className="w-16 h-16 text-gray-700 group-hover:text-emerald-500 transition-colors" />}
                      {(item.type as any) === 'visual_template' && <ViewColumnsIcon className="w-16 h-16 text-gray-700 group-hover:text-pink-500 transition-colors" />}
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 group-hover:text-white transition-colors">{item.tags?.includes('avatar') ? 'Avatar' : item.tags?.includes('animation') ? 'Animação' : (item.type as any) === 'visual_template' ? 'Modelo Visual' : item.type}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                      onClick={() => setViewItem(item)}
                      className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                      Visualizar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item.file_url, item.name);
                      }}
                      className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-50"
                      title="Baixar Arquivo"
                    >
                      Baixar
                    </button>
                    {(item.type === 'image') && (
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                        <SaveToDriveButton
                          fileUrl={item.file_url}
                          fileName={item.name}
                        />
                      </div>
                    )}
                    {activeTab !== 'code_templates' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                  <h3 className="font-bold text-gray-200 text-xs truncate mb-1" title={item.name}>{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.tags?.includes('indexed') && (
                      <CloudArrowUpIcon className="w-3 h-3 text-primary" title="Indexado" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Preview - Simplified for brevity but functional */}
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={viewItem?.name} size="lg">
        {viewItem && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 flex justify-center max-h-[60vh]">
              {viewItem.type === 'image' ? (
                <img src={viewItem.file_url} className="h-full object-contain" />
              ) : (viewItem.type as any) === 'visual_template' ? (
                <div className="w-full h-full overflow-auto bg-black p-4">
                  {(() => {
                    const Template = VISUAL_TEMPLATES.find(t => t.id === viewItem.id)?.component;
                    const defaultProps = VISUAL_TEMPLATES.find(t => t.id === viewItem.id)?.defaultProps;
                    return Template ? <div className="transform scale-[0.6] origin-top py-10"><Template {...defaultProps} /></div> : <p>Template not found</p>;
                  })()}
                </div>
              ) : (
                <div className="p-4 w-full overflow-auto"><pre className="text-xs text-green-400 font-mono">{previewContent}</pre></div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              {viewItem.type === 'image' && (
                <SaveToDriveButton
                  fileUrl={viewItem.file_url}
                  fileName={viewItem.name}
                  variant="full"
                />
              )}
              <Button onClick={() => handleDownload(viewItem.file_url, viewItem.name)} variant="primary" size="sm">Download</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContentLibrary;
