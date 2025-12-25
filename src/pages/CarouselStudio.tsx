
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon,
    PhotoIcon,
    ViewColumnsIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    ArrowRightIcon,
    PlusIcon,
    CloudArrowUpIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    CircleStackIcon,
    ChevronDownIcon,
    AdjustmentsHorizontalIcon,
    CommandLineIcon,
    BeakerIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

// Services
import { generateImage, generateText } from '../services/ai';
import { getLibraryItems } from '../services/core/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { GEMINI_FLASH_MODEL, IMAGEN_ULTRA_MODEL } from '../constants';

// Components
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BrandAssetsManager, { LogoSettings } from '../components/features/BrandAssetsManager';

interface CarouselSlide {
    id: number;
    imageUrl: string | null;
    text: string;
    prompt: string;
}

const CarouselStudio: React.FC = () => {
    // Basic States
    const [theme, setTheme] = useState('');
    const [loading, setLoading] = useState(false);
    const [slides, setSlides] = useState<CarouselSlide[]>([
        { id: 1, imageUrl: null, text: 'Título do Slide 1', prompt: '' },
        { id: 2, imageUrl: null, text: 'Título do Slide 2', prompt: '' },
        { id: 3, imageUrl: null, text: 'Título do Slide 3', prompt: '' },
        { id: 4, imageUrl: null, text: 'Título do Slide 4', prompt: '' },
    ]);
    const [selectedSlide, setSelectedSlide] = useState(0);

    // Identidade Visual
    const [fontFamily, setFontFamily] = useState('Inter');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [logoSettings, setLogoSettings] = useState<LogoSettings>({
        file: null,
        previewUrl: null,
        position: 'bottom-right',
        opacity: 0.8,
        scale: 1.0
    });

    // Parâmetros Técnicos
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [resolution, setResolution] = useState('1K');

    // Refinamento Master (Advanced)
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [lightingStyle, setLightingStyle] = useState('natural');
    const [sharpness, setSharpness] = useState('standard');

    const { user } = useAuth();
    const { addToast } = useToast();

    // Logic to handle Trend from Library
    const [libraryTrends, setLibraryTrends] = useState<any[]>([]);
    const [showLibrary, setShowLibrary] = useState(false);

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!user) return;
            try {
                const items = await getLibraryItems(user.id);
                setLibraryTrends(items.filter(item =>
                    item.type === 'text' ||
                    item.tags?.some((tag: string) => ['tendencia', 'trend', 'insight'].includes(tag.toLowerCase()))
                ));
            } catch (e) {
                console.error("Erro ao carregar tendências da biblioteca", e);
            }
        };
        fetchLibrary();
    }, [user]);

    const handleApplyTrend = (trendData: string) => {
        setTheme(trendData);
        setShowLibrary(false);
        addToast({ type: 'success', message: 'Tendência aplicada! Pronto para gerar.' });
    };

    const handleGenerateCarousel = async () => {
        if (!theme.trim()) {
            addToast({ type: 'warning', message: 'Descreva um tema ou escolha algo da biblioteca.' });
            return;
        }

        setLoading(true);
        try {
            addToast({ type: 'info', message: 'Criando narrativa e definindo visuais...' });

            const planPrompt = `Você é um diretor de arte. Crie um roteiro de carrossel de 4 slides sobre o tema: "${theme}".
      Para cada slide, forneça:
      1. Uma frase curta e impactante (máx 60 caracteres).
      2. Um prompt visual em INGLÊS detalhado para o Imagen 4.0.
      
      Retorne APENAS um JSON válido seguindo este formato:
      [
        {"text": "Frase 1", "prompt": "Visual Prompt 1"},
        {"text": "Frase 2", "prompt": "Visual Prompt 2"},
        {"text": "Frase 3", "prompt": "Visual Prompt 3"},
        {"text": "Frase 4", "prompt": "Visual Prompt 4"}
      ]`;

            const planJson = await generateText(planPrompt, {
                model: GEMINI_FLASH_MODEL,
                responseMimeType: 'application/json'
            });

            const plan = JSON.parse(planJson.replace(/```json/g, '').replace(/```/g, '').trim());

            addToast({ type: 'info', message: 'Gerando imagens com Imagen 4.0 Ultra...' });

            const newSlides = [...slides];
            for (let i = 0; i < 4; i++) {
                // Injetar modificadores avançados no prompt
                let enhancedPrompt = plan[i].prompt;
                if (lightingStyle !== 'natural') enhancedPrompt += `, ${lightingStyle} lighting`;
                if (sharpness === 'critical') enhancedPrompt += `, extremely sharp, high resolution 8k details`;

                const response = await generateImage(enhancedPrompt, {
                    model: IMAGEN_ULTRA_MODEL,
                    aspectRatio: aspectRatio as any
                });

                if (response.type === 'image') {
                    newSlides[i] = {
                        ...newSlides[i],
                        imageUrl: response.imageUrl,
                        text: plan[i].text,
                        prompt: plan[i].prompt
                    };
                }
            }

            setSlides(newSlides);
            addToast({ type: 'success', title: 'Sucesso', message: 'Carrossel de 4 slides gerado com maestria!' });
        } catch (err) {
            console.error(err);
            addToast({ type: 'error', message: 'Falha ao materializar o carrossel.' });
        } finally {
            setLoading(false);
        }
    };

    const handleClearSlide = (index: number) => {
        const newSlides = [...slides];
        newSlides[index].imageUrl = null;
        setSlides(newSlides);
        addToast({ type: 'info', message: `Imagem do Slide ${index + 1} removida.` });
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-[var(--text-premium-primary)]">
            {/* Luzes Ambientais */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl animate-fade-in">

                {/* Cabeçalho */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.1)]">
                            <SparklesIcon className="w-3 h-3" />
                            Imagen 4.0 Ultra
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-[var(--text-premium-primary)]">
                            Carousel <span className="text-primary not-italic">Studio</span>
                        </h1>
                        <p className="text-[var(--text-premium-muted)] text-[10px] font-bold uppercase tracking-widest max-w-sm">
                            Gere narrativas visuais sequenciais para suas redes sociais com IA de ponta.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowLibrary(!showLibrary)}
                        className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-primary/20 hover:border-primary/50 transition-all border-glow text-[var(--text-premium-primary)]"
                        title="Acessa suas tendências salvas para servir de briefing para o carrossel"
                    >
                        <CircleStackIcon className="w-5 h-5 text-primary" />
                        Minha Biblioteca
                    </button>
                </header>

                {/* Painel de Tendências da Biblioteca */}
                <AnimatePresence>
                    {showLibrary && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="mb-12 overflow-hidden"
                        >
                            <div className="glass-panel p-8 rounded-[2.5rem] border border-primary/30 shadow-glow bg-primary/5">
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-[var(--text-premium-secondary)]">
                                    Selecionar Tendência Identificada
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {libraryTrends.length > 0 ? libraryTrends.map(trend => (
                                        <div
                                            key={trend.id}
                                            onClick={() => handleApplyTrend(trend.file_url)}
                                            className="p-6 bg-black/40 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group"
                                        >
                                            <p className="text-sm font-bold text-[var(--text-premium-primary)] mb-2 line-clamp-1">{trend.name}</p>
                                            <p className="text-[10px] text-[var(--text-premium-muted)] line-clamp-2 italic font-serif">{trend.file_url}</p>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-[var(--text-premium-muted)] italic col-span-full">Nenhuma tendência encontrada. Use o Trend Hunter para carregar sua biblioteca.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Coluna de Controles (Esquerda) */}
                    <aside className="lg:col-span-4 space-y-10">

                        {/* BLOCO 1 — Direção Estratégica */}
                        <section className="glass-panel p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-2xl bg-white/[0.02]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <CommandLineIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Direção Estratégica</h3>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-[0.1em] block">O que vamos conjurar?</label>
                                <textarea
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="Ex: Como a IA vai mudar o marketing para varejo em 2025..."
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm text-[var(--text-premium-primary)] placeholder:text-white/10 focus:border-primary/50 outline-none h-40 transition-all resize-none font-medium leading-relaxed"
                                />
                            </div>

                            <Button
                                onClick={handleGenerateCarousel}
                                isLoading={loading}
                                variant="liquid"
                                className="w-full py-6 font-black uppercase tracking-[0.3em] text-sm overflow-hidden group/btn gradient-animated shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                                title="Gera um roteiro estratégico de 4 slides e cria as imagens correspondentes via IA"
                            >
                                Gerar Carrossel Automático
                            </Button>
                        </section>

                        {/* BLOCO 2 — Identidade Visual */}
                        <section className="glass-panel p-8 rounded-[2rem] border border-white/10 space-y-8 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                    <PaintBrushIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Identidade Visual</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest block">Tipografia de Legendas</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Inter', 'Montserrat', 'Playfair Display', 'Space Grotesk'].map(font => (
                                            <button
                                                key={font}
                                                onClick={() => setFontFamily(font)}
                                                className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${fontFamily === font ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]' : 'bg-white/5 border-white/5 text-[var(--text-premium-muted)] hover:bg-white/10'}`}
                                            >
                                                {font}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest block">Paleta de Texto</label>
                                    <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={e => setTextColor(e.target.value)}
                                            className="w-12 h-12 bg-transparent border-none rounded-xl cursor-pointer overflow-hidden p-0"
                                        />
                                        <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/5 text-xs font-mono font-bold tracking-widest text-[var(--text-premium-primary)] uppercase">
                                            {textColor}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest mb-4 block">Watermark & Branding</label>
                                    <BrandAssetsManager settings={logoSettings} onSettingsChange={setLogoSettings} />
                                </div>
                            </div>
                        </section>

                        {/* BLOCO 3 — Parâmetros Técnicos */}
                        <section className="glass-panel p-8 rounded-[2rem] border border-white/10 space-y-6 bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Parâmetros Técnicos</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase block">Proporção</label>
                                    <select
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold focus:border-primary/50 outline-none transition-all"
                                    >
                                        <option value="1:1">Quadrado (1:1)</option>
                                        <option value="4:5">Vertical (4:5)</option>
                                        <option value="16:9">Widescreen (16:9)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase block">Resolução</label>
                                    <select
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold focus:border-primary/50 outline-none transition-all"
                                    >
                                        <option value="1K">1K HD</option>
                                        <option value="2K">2K Ultra</option>
                                        <option value="4K">4K Master (Pro)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* BLOCO 4 — Refinamento Master (Collapsible) */}
                        <section className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden bg-black/20">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                                        <BeakerIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Ajustes Avançados</h3>
                                        <p className="text-[9px] font-bold text-[var(--text-premium-muted)] uppercase tracking-widest mt-0.5">Opcional • Modificadores de IA</p>
                                    </div>
                                </div>
                                <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                                    <ChevronDownIcon className="w-5 h-5 text-[var(--text-premium-muted)]" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-8 pb-8 pt-2 space-y-6 border-t border-white/5"
                                    >
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase block">Estilo de Iluminação</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['natural', 'cinematic', 'neon', 'studio'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setLightingStyle(mode)}
                                                        className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${lightingStyle === mode ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-white/5 border-transparent text-[var(--text-premium-muted)]'}`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase block">Nitidez & Detalhe</label>
                                            <select
                                                value={sharpness}
                                                onChange={(e) => setSharpness(e.target.value)}
                                                className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-xs font-bold focus:border-amber-500/50 outline-none transition-all"
                                            >
                                                <option value="standard">Padrão</option>
                                                <option value="critical">Hiper-realista (Crítico)</option>
                                                <option value="raw">Raw Photography</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>

                    </aside>

                    {/* Área Principal - Visualizador (Direita) */}
                    <main className="lg:col-span-8 flex flex-col gap-10">

                        {/* Canvas do Carrossel */}
                        <div className="relative glass-panel rounded-[3.5rem] border border-white/10 overflow-hidden aspect-square bg-grid-dark flex items-center justify-center p-4 sm:p-8 lg:p-14 shadow-inner-glow group/canvas">

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-6 text-center"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                                            <LoadingSpinner className="w-20 h-20 text-primary relative" />
                                        </div>
                                        <p className="text-[var(--text-premium-primary)] font-black italic uppercase tracking-[0.5em] animate-pulse text-xs">Esculpindo Realidade IV...</p>
                                    </motion.div>
                                ) : slides[selectedSlide].imageUrl ? (
                                    <motion.div
                                        key={selectedSlide}
                                        initial={{ opacity: 0, scale: 0.98, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, x: -20 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                        className="relative w-full h-full flex items-center justify-center"
                                    >
                                        <div className="relative w-full h-full max-w-2xl aspect-square rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.7)] border border-white/10 group shadow-glow">
                                            <img
                                                src={slides[selectedSlide].imageUrl!}
                                                alt={`Slide ${selectedSlide + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                                            />

                                            {/* Overlay de Texto Premium */}
                                            <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                                                <textarea
                                                    value={slides[selectedSlide].text}
                                                    onChange={(e) => {
                                                        const newSlides = [...slides];
                                                        newSlides[selectedSlide].text = e.target.value;
                                                        setSlides(newSlides);
                                                    }}
                                                    className="w-full bg-transparent border-none text-center font-bold text-xl sm:text-3xl lg:text-4xl leading-tight resize-none outline-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-2 sm:p-4 transition-all placeholder:opacity-20 drop-shadow-2xl"
                                                    style={{ fontFamily, color: textColor }}
                                                />
                                            </div>

                                            {/* Marca D'água Dinâmica */}
                                            {logoSettings.previewUrl && (
                                                <div
                                                    className={`absolute transition-all duration-700 ease-out ${logoSettings.position === 'top-left' ? 'top-10 left-10' :
                                                        logoSettings.position === 'top-right' ? 'top-10 right-10' :
                                                            logoSettings.position === 'bottom-left' ? 'bottom-10 left-10' :
                                                                'bottom-40 right-10' // Offset from bottom center if needed
                                                        }`}
                                                    style={{
                                                        opacity: logoSettings.opacity,
                                                        transform: `scale(${logoSettings.scale})`,
                                                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
                                                    }}
                                                >
                                                    <img src={logoSettings.previewUrl} className="max-w-[140px]" alt="Branding" title="Representação visual da sua marca aplicada nas artes" />
                                                </div>
                                            )}

                                            {/* Badge do Modelo */}
                                            <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-premium-secondary)] shadow-lg">
                                                IMAGEN_4.0_ULTRA_PRO
                                            </div>

                                            {/* Botão de Apagar (Overlay) */}
                                            <button
                                                onClick={() => handleClearSlide(selectedSlide)}
                                                className="absolute top-8 right-8 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all backdrop-blur-md group-hover:opacity-100 opacity-0"
                                                title="Apaga a imagem deste slide para permitir uma nova geração"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center text-center opacity-10 group-hover/canvas:opacity-20 transition-opacity">
                                        <ViewColumnsIcon className="w-40 h-40 mb-6" />
                                        <p className="text-xl font-black uppercase tracking-[0.6em]">Aguardando Comando</p>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Dots de Navegação Estilizados */}
                            {!loading && slides[0].imageUrl && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 bg-black/60 px-6 py-3 rounded-full border border-white/10 backdrop-blur-2xl shadow-2xl z-20">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedSlide(idx)}
                                            className={`h-2 rounded-full transition-all duration-500 ease-out ${selectedSlide === idx ? 'w-12 bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Seletor de Miniaturas com Feedback Visual */}
                        {!loading && slides[0].imageUrl && (
                            <div className="grid grid-cols-4 gap-3 sm:gap-6">
                                {slides.map((slide, idx) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setSelectedSlide(idx)}
                                        className={`relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-500 group shadow-lg ${selectedSlide === idx ? 'border-primary ring-[12px] ring-primary/10 scale-105 z-10 shadow-glow' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={slide.imageUrl!} className="w-full h-full object-cover" alt={`Preview Slide ${idx + 1}`} />
                                        <div className={`absolute inset-0 flex items-center justify-center font-black text-3xl italic tracking-tighter ${selectedSlide === idx ? 'bg-primary/20 text-white' : 'bg-black/60 text-[var(--text-premium-muted)]'}`}>
                                            {slide.imageUrl ? idx + 1 : <PlusIcon className="w-8 h-8 opacity-20" />}
                                        </div>

                                        {/* Mini Trash Button on Thumbnail */}
                                        {slide.imageUrl && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClearSlide(idx);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-20"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Ações de Fluxo Consoliadas */}
                        {slides[0].imageUrl && !loading && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl gap-6"
                            >
                                <div className="flex gap-4">
                                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--text-premium-secondary)]" title="Baixa todas as imagens do carrossel organizadas em um arquivo ZIP">
                                        Expotar em ZIP
                                    </button>
                                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--text-premium-secondary)]" title="Salva estas artes finais na sua biblioteca multimídia para uso posterior">
                                        Salvar no Acervo
                                    </button>
                                </div>
                                <Button variant="primary" className="px-12 py-5 h-auto rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-4 gradient-animated shadow-2xl shadow-primary/30" title="Define data e hora para publicação automática deste carrossel nas suas redes">
                                    Agendar Carrossel
                                    <ArrowRightIcon className="w-6 h-6" />
                                </Button>
                            </motion.div>
                        )}

                    </main>

                </div>
            </div>
        </div>
    );
};

export default CarouselStudio;
