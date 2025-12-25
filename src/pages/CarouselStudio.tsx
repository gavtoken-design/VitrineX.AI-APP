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
    TrashIcon,
    ShareIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

// Services
import { generateImage, generateText } from '../services/ai';
import { getLibraryItems, saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import { useNavigate } from '../hooks/useNavigate';
import JSZip from 'jszip';
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
            addToast({ type: 'info', message: 'Criando narrativa publicitária e definindo visuais...' });

            const planPrompt = `Você é um Diretor de Criação de uma agência de publicidade de elite. 
      Crie um roteiro de carrossel de 4 slides para uma campanha de alta performance sobre: "${theme}".
      
      Diretrizes de Qualidade:
      - Estilo Visual: Fotografia Comercial de Alto Nível, 8k, Iluminação de Estúdio.
      - Consistência: Mantenha o mesmo personagem, paleta de cores e atmosfera em todos os slides.
      - Texto: Frases curtas, persuasivas (copywriting), máx 50 caracteres.
      
      Para cada slide, forneça:
      1. "text": A frase de impacto (copy).
      2. "prompt": Um prompt visual em INGLÊS extremamente detalhado para o Imagen 4.0. Comece sempre com "Professional advertising photography, 8k, highly detailed...".
      
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

            // Improved JSON parsing cleanup
            const cleanJson = planJson.replace(/```json/gi, '').replace(/```/g, '').trim();
            const plan = JSON.parse(cleanJson);

            addToast({ type: 'info', message: 'Produzindo imagens de estúdio com Imagen 4.0 Ultra...' });

            const newSlides = [...slides];
            for (let i = 0; i < 4; i++) {
                // Injetar modificadores avançados no prompt
                let enhancedPrompt = plan[i].prompt;
                if (lightingStyle !== 'natural') enhancedPrompt += `, ${lightingStyle} lighting`;
                if (sharpness === 'critical') enhancedPrompt += `, sharp focus, masterpiece, best quality, ultra detailed`;

                // Add negative prompt injection implicitly via the model or here if supported
                // For now we rely on the strong positive prompt

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
            addToast({ type: 'success', title: 'Sucesso', message: 'Campanha Visual gerada com sucesso!' });
        } catch (err) {
            console.error(err);
            addToast({ type: 'error', message: 'Falha ao materializar a campanha. Tente novamente.' });
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

    const { navigateTo } = useNavigate();

    // --- Helper to fetch Blob from URL or Base64 ---
    const getBlobFromSlide = async (url: string): Promise<Blob> => {
        const res = await fetch(url);
        return await res.blob();
    };

    // --- COMPOSITION ENGINE: Fuses Image + Text + Gradient ---
    const compositeSlideImage = async (slide: CarouselSlide): Promise<Blob> => {
        if (!slide.imageUrl) throw new Error("No image");

        return new Promise(async (resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Canvas context failed");

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = slide.imageUrl;

                img.onload = () => {
                    // Set high res canvas
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // 1. Draw Base Image
                    ctx.drawImage(img, 0, 0);

                    // 2. Draw Gradient Overlay (Bottom)
                    const gradientHeight = canvas.height * 0.5; // Bottom 50%
                    const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
                    gradient.addColorStop(0, "rgba(0,0,0,0)");
                    gradient.addColorStop(0.6, "rgba(0,0,0,0.6)");
                    gradient.addColorStop(1, "rgba(0,0,0,0.9)");

                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);

                    // 3. Draw Text
                    const fontSize = Math.floor(canvas.width * 0.06); // Responsive font size
                    ctx.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
                    ctx.fillStyle = textColor;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "bottom";

                    // Simple word wrap
                    const words = slide.text.split(' ');
                    let line = '';
                    const lines = [];
                    const maxWidth = canvas.width * 0.9;
                    const lineHeight = fontSize * 1.2;

                    for (let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const metrics = ctx.measureText(testLine);
                        const testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            lines.push(line);
                            line = words[n] + ' ';
                        } else {
                            line = testLine;
                        }
                    }
                    lines.push(line);

                    // Render lines from bottom up
                    const bottomMargin = canvas.height * 0.1;
                    lines.reverse().forEach((l, i) => {
                        ctx.fillText(l.trim(), canvas.width / 2, canvas.height - bottomMargin - (i * lineHeight));
                    });

                    // 4. Draw Logo (if available) - Simplified for this demo
                    // (Requires loading logo image async, skipping for robustness unless needed)

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Blob creation failed"));
                    }, 'image/png', 1.0);
                };

                img.onerror = () => reject(new Error("Failed to load image for composition"));

            } catch (e) {
                reject(e);
            }
        });
    };

    const handleDownloadZip = async () => {
        if (!slides.some(s => s.imageUrl)) {
            addToast({ type: 'warning', message: 'Não há imagens para baixar.' });
            return;
        }

        setLoading(true);
        addToast({ type: 'info', message: 'Renderizando anúncios finais (com texto)...' });

        try {
            const zip = new JSZip();
            const folderName = `VitrineX-Campaign-${theme.substring(0, 15).replace(/[^a-z0-9]/gi, '')}`;
            const folder = zip.folder(folderName);

            // Add images and a text file
            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                if (slide.imageUrl) {
                    try {
                        // Use the Compositor!
                        const blob = await compositeSlideImage(slide);
                        folder?.file(`slide-${i + 1}-ad.png`, blob);
                    } catch (err) {
                        console.error(`Error processing slide ${i + 1}`, err);
                        // Fallback to raw image if canvas fails
                        if (slide.imageUrl) {
                            const rawBlob = await getBlobFromSlide(slide.imageUrl);
                            folder?.file(`slide-${i + 1}-raw.png`, rawBlob);
                        }
                    }
                }
            }

            const contentText = slides.map(s => `Slide ${s.id}: ${s.text}\nPrompt: ${s.prompt}`).join('\n\n');
            folder?.file('briefing.txt', contentText);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${folderName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            addToast({ type: 'success', message: 'Download concluído! Suas artes estão prontas.' });
        } catch (e) {
            console.error(e);
            addToast({ type: 'error', message: 'Erro ao gerar ZIP.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToLibrary = async () => {
        if (!slides.some(s => s.imageUrl) && !user) return;
        if (!user) {
            addToast({ type: 'error', message: 'Você precisa estar logado.' });
            return;
        }

        setLoading(true);
        addToast({ type: 'info', message: 'Renderizando e salvando na nuvem...' });

        try {
            let savedCount = 0;
            // Limit concurrency
            const savePromises = slides.map(async (slide) => {
                if (!slide.imageUrl) return;

                // 1. Composite Image (Burn Text)
                const blob = await compositeSlideImage(slide);
                const file = new File([blob], `ad-${user.id.substring(0, 4)}-${Date.now()}.png`, { type: 'image/png' });

                // 2. Upload
                // uploadFile uploads to Supabase (or fallback) AND returns the LibraryItem strict
                const uploadedItem = await uploadFile(file, user.id, 'image');

                // 3. Save to DB 
                const finalItem = {
                    ...uploadedItem,
                    name: `AD: ${theme.substring(0, 20)} (${slide.id})`,
                    tags: ['carousel', 'studio', 'ad', 'generated']
                };

                await saveLibraryItem(finalItem);
                savedCount++;
            });

            await Promise.all(savePromises);

            addToast({ type: 'success', message: `${savedCount} anúncios salvos na Biblioteca!` });
        } catch (e) {
            console.error('Erro no salvamento:', e);
            addToast({ type: 'error', message: 'Erro ao salvar. Verifique conexão.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async () => {
        if (!slides.some(s => s.imageUrl)) return;

        // For Scheduler, we usually pass URLs. 
        // Ideally we should upload the composited images first, but for now we'll pass the raw generation
        // AND maybe a note. Or we can trigger a quick background upload.
        // For this demo, let's keep it simple and send the Raw images, 
        // BUT user expects text. 
        // IMPROVEMENT: Let's stick to raw images for Scheduler for now as it reconstructs the post.

        const schedulerData = {
            title: `Campanha: ${theme.substring(0, 30)}...`,
            content: slides.map(s => `[Slide ${s.id}] ${s.text}`).join('\n\n'),
            images: slides.filter(s => s.imageUrl).map(s => s.imageUrl!),
            format: 'carousel',
            date: new Date().toISOString()
        };

        localStorage.setItem('vitrinex_scheduler_draft', JSON.stringify(schedulerData));
        navigateTo('SmartScheduler');
        addToast({ type: 'success', message: 'Rascunho enviado para o Agendador!' });
    };

    // New Share Handler with Clipboard
    const handleShare = async () => {
        if (!slides.some(s => s.imageUrl)) return;

        const currentSlideImg = slides[selectedSlide].imageUrl;
        const currentSlideText = slides[selectedSlide].text;

        // Try native share first
        if (navigator.canShare && navigator.canShare({ text: theme })) {
            try {
                // Convert current image to file for sharing if possible
                let filesArray: File[] = [];
                if (currentSlideImg) {
                    const blob = await getBlobFromSlide(currentSlideImg);
                    const file = new File([blob], 'slide.png', { type: blob.type });
                    if (navigator.canShare({ files: [file] })) {
                        filesArray = [file];
                    }
                }

                await navigator.share({
                    title: 'VitrineX Carousel Slide',
                    text: `Slide: ${currentSlideText}`,
                    files: filesArray.length > 0 ? filesArray : undefined
                });
                addToast({ type: 'success', message: 'Compartilhado com sucesso!' });
                return;
            } catch (e) {
                // Fallback or cancelled
            }
        }

        // Fallback: Copy Image to Clipboard (Desktop friendly)
        try {
            if (currentSlideImg) {
                const blob = await getBlobFromSlide(currentSlideImg);
                // Navigator Clipboard API needs secure context (HTTPS/Localhost)
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                addToast({ type: 'success', message: 'Imagem copiada para a área de transferência!' });
            } else {
                await navigator.clipboard.writeText(currentSlideText);
                addToast({ type: 'success', message: 'Texto copiado!' });
            }
        } catch (e) {
            console.error('Clipboard failed', e);
            // Fallback 2: Copy Text only
            try {
                await navigator.clipboard.writeText(currentSlideText);
                addToast({ type: 'success', message: 'Texto do slide copiado!' });
            } catch (err) {
                addToast({ type: 'warning', message: 'Não foi possível compartilhar.' });
            }
        }
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
                                        <option value="3:4">Vertical (3:4)</option>
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

                        {/* Ações de Fluxo Consolidadas */}
                        {slides.some(s => s.imageUrl) && !loading && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl gap-6"
                            >
                                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                                    <button
                                        onClick={handleDownloadZip}
                                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--text-premium-secondary)] flex items-center gap-2"
                                        title="Baixa todas as imagens do carrossel organizadas em um arquivo ZIP"
                                    >
                                        <CloudArrowUpIcon className="w-4 h-4" />
                                        ZIP
                                    </button>
                                    <button
                                        onClick={handleSaveToLibrary}
                                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--text-premium-secondary)] flex items-center gap-2"
                                        title="Salva estas artes finais na sua biblioteca multimídia para uso posterior"
                                    >
                                        <CircleStackIcon className="w-4 h-4" />
                                        Salvar
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--text-premium-secondary)] flex items-center gap-2"
                                        title="Compartilhar ou copiar imagem"
                                    >
                                        <ShareIcon className="w-4 h-4" />
                                        Enviar
                                    </button>
                                </div>
                                <Button
                                    onClick={handleSchedule}
                                    variant="primary"
                                    className="px-12 py-5 h-auto rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-4 gradient-animated shadow-2xl shadow-primary/30"
                                    title="Define data e hora para publicação automática deste carrossel nas suas redes"
                                >
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
