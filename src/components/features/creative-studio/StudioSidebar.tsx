
import * as React from 'react';
import {
    SparklesIcon,
    AdjustmentsHorizontalIcon,
    PaintBrushIcon,
    Square3Stack3DIcon,
    PhotoIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { IMAGE_STYLES, IMAGE_ASPECT_RATIOS, IMAGE_SIZES } from '../../../constants';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import { ChevronDownIcon, CommandLineIcon, TrashIcon, BookOpenIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { saveLibraryItem } from '../../../services/core/db';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import BrandAssetsManager, { LogoSettings } from '../BrandAssetsManager';
import LibraryImportModal from '../LibraryImportModal';

interface StudioSidebarProps {
    prompt: string;
    setPrompt: (v: string) => void;
    selectedStyle: string;
    setSelectedStyle: (v: string) => void;
    aspectRatio: string;
    setAspectRatio: (v: string) => void;
    imageSize: string;
    setImageSize: (v: string) => void;
    loading: boolean;
    onGenerate: () => void;
    onReset: () => void;
    isFileUploaded: boolean;
    logoSettings: LogoSettings;
    setLogoSettings: (settings: LogoSettings) => void;
    negativePrompt: string;
    setNegativePrompt: (v: string) => void;
}

const StudioSidebar: React.FC<StudioSidebarProps> = ({
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle,
    aspectRatio,
    setAspectRatio,
    imageSize,
    setImageSize,
    loading,
    onGenerate,
    onReset,
    isFileUploaded,
    logoSettings,
    setLogoSettings,
    negativePrompt,
    setNegativePrompt
}) => {
    const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
    const [isNegativePromptOpen, setIsNegativePromptOpen] = React.useState(false);
    const { user } = useAuth();
    const { addToast } = useToast();

    const handleSavePrompt = async () => {
        if (!user || !prompt.trim()) return;
        try {
            await saveLibraryItem({
                id: crypto.randomUUID(),
                userId: user.id,
                name: `Prompt: ${prompt.substring(0, 20)}...`,
                type: 'text',
                file_url: prompt,
                tags: ['prompt', 'creative-studio'],
                createdAt: new Date().toISOString()
            });
            addToast({ type: 'success', message: 'Prompt salvo na biblioteca!' });
        } catch (error) {
            addToast({ type: 'error', message: 'Erro ao salvar prompt.' });
        }
    };
    return (
        <aside className="w-full lg:w-full flex flex-col gap-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-2 custom-scrollbar lg:sticky lg:top-24">

            {/* Prompt Area */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <CommandLineIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">
                        {isFileUploaded ? 'Edição Estratégica' : 'Direção Criativa'}
                    </h3>
                    {isFileUploaded && (
                        <button onClick={onReset} className="ml-auto text-[10px] uppercase tracking-widest text-[var(--text-premium-muted)] hover:text-red-400 transition-colors flex items-center gap-1.5 group" title="Descarta a imagem carregada e limpa o campo de instruções">
                            <TrashIcon className="w-3.5 h-3.5" />
                            Limpar
                        </button>
                    )}
                </div>

                {/* Prompt Actions Menu */}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                        title="Importar prompt da biblioteca"
                    >
                        <BookOpenIcon className="w-3.5 h-3.5" />
                        Biblioteca
                    </button>
                    <button
                        onClick={handleSavePrompt}
                        disabled={!prompt.trim()}
                        className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors disabled:opacity-50"
                        title="Salvar prompt atual na biblioteca"
                    >
                        <BookmarkIcon className="w-3.5 h-3.5" />
                        Salvar
                    </button>
                </div>

                <Textarea
                    id="studio-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={isFileUploaded ? "Descreva o que mudar na imagem..." : "O que você imagina hoje? Seja específico..."}
                    rows={5}
                    className="bg-black/20 border-white/5 focus:border-primary/50 text-white text-sm placeholder:text-white/20 transition-all rounded-xl"
                />

                <div className="flex gap-2">
                    <Button
                        onClick={onGenerate}
                        isLoading={loading}
                        className="flex-1 gradient-animated rounded-xl font-bold tracking-tight shadow-lg shadow-primary/20"
                        title={isFileUploaded ? "Analisa as instruções de edição e altera a imagem preservando o contexto" : "Transforma sua descrição em uma imagem de alta definição usando IA generativa"}
                    >
                        {loading ? 'Criando...' : isFileUploaded ? 'Aplicar Edição' : 'Invocação Criativa'}
                    </Button>
                </div>
            </div>

            {/* Configuration Area */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-8 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <PaintBrushIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">
                        {isFileUploaded ? 'Edição Estratégica' : 'Direção Criativa'}
                    </h3>
                </div>

                <div className="space-y-6">
                    {/* Style Selector */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest block">Estilo Predominante</label>
                        <div className="grid grid-cols-2 gap-2">
                            {IMAGE_STYLES.slice(0, 4).map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${selectedStyle === style.id
                                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]'
                                        : 'bg-white/5 border-white/5 text-[var(--text-premium-muted)] hover:bg-white/10 hover:text-[var(--text-premium-primary)]'
                                        }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                            <select
                                value={selectedStyle}
                                onChange={e => setSelectedStyle(e.target.value)}
                                className="col-span-2 py-3 px-4 rounded-xl text-xs bg-black/40 border border-white/10 text-[var(--text-premium-primary)] font-bold focus:border-primary/50 outline-none transition-all"
                            >
                                <option value="" disabled>Mais estilos...</option>
                                {IMAGE_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Ratio & Size */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest block">Proporção</label>
                            <select
                                value={aspectRatio}
                                onChange={e => setAspectRatio(e.target.value)}
                                className="w-full py-3 px-4 rounded-xl text-xs bg-black/40 border border-white/10 text-[var(--text-premium-primary)] font-bold focus:border-primary/50 outline-none transition-all"
                            >
                                {IMAGE_ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest block">Potência</label>
                            <select
                                value={imageSize}
                                onChange={e => setImageSize(e.target.value)}
                                className="w-full py-3 px-4 rounded-xl text-xs bg-black/40 border border-white/10 text-[var(--text-premium-primary)] font-bold focus:border-primary/50 outline-none transition-all"
                            >
                                {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Negative Prompt Toggler */}
                <div className="pt-2 border-t border-white/5">
                    <button
                        onClick={() => setIsNegativePromptOpen(!isNegativePromptOpen)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-premium-muted)] hover:text-red-400 transition-colors mb-3"
                    >
                        <span className={isNegativePromptOpen ? 'text-red-400' : ''}>O que NÃO incluir (Negativo)</span>
                        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isNegativePromptOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isNegativePromptOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                        >
                            <Textarea
                                id="negative-prompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="Ex: low quality, blurry, distorted text, ugly..."
                                rows={3}
                                className="bg-black/40 border-red-500/10 focus:border-red-500/30 text-xs text-red-200 placeholder:text-red-500/20"
                            />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Brand Logo Integration */}
            <BrandAssetsManager settings={logoSettings} onSettingsChange={setLogoSettings} />

            {/* Refinamento Master (Advanced — Collapsible) */}
            <div className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden bg-black/20">
                <button
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all outline-none"
                >
                    <div className="flex items-center gap-3 text-left">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Laboratório Pro</h3>
                            <p className="text-[9px] font-bold text-[var(--text-premium-muted)] uppercase tracking-widest mt-0.5">Ajustes de Renderização</p>
                        </div>
                    </div>
                    <ChevronDownIcon
                        className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isAdvancedOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 pt-2 space-y-6 border-t border-white/5"
                    >
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-premium-secondary)]">
                                <span className="flex items-center gap-2">
                                    <CommandLineIcon className="w-3 h-3 text-primary" />
                                    CONTRASTE DINÂMICO
                                </span>
                                <span className="text-primary">85%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-primary/60 w-[85%] shadow-[0_0_10px_rgba(var(--color-primary),0.3)]" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-premium-secondary)]">
                                <span className="flex items-center gap-2">
                                    <SparklesIcon className="w-3 h-3 text-purple-400" />
                                    NITIDEZ MASTER
                                </span>
                                <span className="text-purple-400 font-black">CRÍTICO</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-purple-500/60 w-full shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Prompt Library Modal */}
            <LibraryImportModal
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={(content) => setPrompt(content)}
                initialFilter="text"
            />
        </aside >
    );
};

export default StudioSidebar;
