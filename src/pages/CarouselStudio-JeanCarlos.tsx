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
        <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white selection:bg-blue-500/30 font-sans pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen opacity-20 animate-pulse-gentle" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-20" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 max-w-7xl animate-fade-in">

                {/* Cabeçalho */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md"
                        >
                            <SparklesIcon className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Imagen 4.0 Ultra</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-indigo-100 to-white drop-shadow-xl">
                            Carousel <span className="text-blue-500">Studio</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-light">
                            Crie narrativas visuais sequenciais de alta conversão para suas redes sociais com inteligência artificial avançada.
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowLibrary(!showLibrary)}
                        variant="ghost"
                        className="h-14 px-6 border-white/10 hover:bg-white/5 text-gray-300 hover:text-white group"
                        title="Acessar Biblioteca"
                    >
                        <CircleStackIcon className="w-5 h-5 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Minha Biblioteca</span>
                    </Button>
                </header>

                {/* Painel de Tendências da Biblioteca */}
                <AnimatePresence>
                    {showLibrary && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="mb-12"
                        >
                            <div className="liquid-card p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent">
                                <div className="bg-[#0A0F19]/90 backdrop-blur-xl rounded-[2.3rem] p-8 border border-white/5">
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                        <CircleStackIcon className="w-4 h-4" />
                                        Selecionar Tendência Identificada
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {libraryTrends.length > 0 ? libraryTrends.map(trend => (
                                            <div
                                                key={trend.id}
                                                onClick={() => handleApplyTrend(trend.file_url)}
                                                className="p-5 bg-black/40 border border-white/5 rounded-2xl cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
                                            >
                                                <p className="text-sm font-bold text-gray-200 group-hover:text-blue-400 mb-2 line-clamp-1 transition-colors">{trend.name}</p>
                                                <p className="text-[10px] text-gray-500 line-clamp-2 font-mono">{trend.file_url}</p>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-8 text-center text-gray-500 italic text-sm border border-dashed border-white/10 rounded-2xl">
                                                Nenhuma tendência encontrada. Use o Trend Hunter para popular sua biblioteca.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Coluna de Controles (Esquerda) */}
                    <aside className="lg:col-span-4 space-y-8">

                        {/* BLOCO 1 — Direção Estratégica */}
                        <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <CommandLineIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Direção Estratégica</h3>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">O que vamos criar?</label>
                                <textarea
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="Ex: Como a IA vai transformar o varejo em 2025. Inclua dicas práticas e cases de sucesso..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none h-40 transition-all resize-none font-medium leading-relaxed"
                                />
                            </div>

                            <Button
                                onClick={handleGenerateCarousel}
                                isLoading={loading}
                                variant="liquid"
                                className="w-full mt-6 py-4 font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-500/20"
                            >
                                Gerar Carrossel
                            </Button>
                        </section>

                        {/* BLOCO 2 — Identidade Visual */}
                        <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <PaintBrushIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Identidade Visual</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Tipografia</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Inter', 'Montserrat', 'Playfair Display', 'Space Grotesk'].map(font => (
                                            <button
                                                key={font}
                                                onClick={() => setFontFamily(font)}
                                                className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all border ${fontFamily === font ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
                                            >
                                                {font}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Cor do Texto</label>
                                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/10">
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={e => setTextColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <div className="flex-1 text-xs font-mono font-bold text-gray-300 uppercase">
                                            {textColor}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block pl-1">Branding</label>
                                    <BrandAssetsManager settings={logoSettings} onSettingsChange={setLogoSettings} />
                                </div>
                            </div>
                        </section>

                        {/* BLOCO 3 — Parâmetros Técnicos */}
                        <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Parâmetros</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase pl-1">Proporção</label>
                                    <select
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-gray-300 focus:border-blue-500/50 outline-none transition-all"
                                    >
                                        <option value="1:1">1:1 (Post)</option>
                                        <option value="3:4">3:4 (Portrait)</option>
                                        <option value="16:9">16:9 (Wide)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase pl-1">Qualidade</label>
                                    <select
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-gray-300 focus:border-blue-500/50 outline-none transition-all"
                                    >
                                        <option value="1K">High Def</option>
                                        <option value="2K">Ultra HD</option>
                                        <option value="4K">Master</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* BLOCO 4 — Refinamento Master */}
                        <section className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden bg-black/20">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <BeakerIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Refinamento</h3>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Ajustes Finos de IA</p>
                                    </div>
                                </div>
                                <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-6 pt-0 space-y-6 border-t border-white/5"
                                    >
                                        <div className="space-y-4 pt-4">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block pl-1">Estilo de Iluminação</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['natural', 'cinematic', 'neon', 'studio'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setLightingStyle(mode)}
                                                        className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${lightingStyle === mode ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block pl-1">Nitidez</label>
                                            <select
                                                value={sharpness}
                                                onChange={(e) => setSharpness(e.target.value)}
                                                className="w-full px-3 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs font-bold text-gray-300 focus:border-amber-500/50 outline-none transition-all"
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
                    <main className="lg:col-span-8 flex flex-col gap-8">

                        {/* Canvas do Carrossel */}
                        <div className="relative liquid-card rounded-[3rem] border border-white/10 overflow-hidden aspect-square bg-grid-dark flex items-center justify-center p-4 sm:p-8 lg:p-12 shadow-2xl bg-[#080808] group/canvas">
                            {/* Canvas Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-6 text-center z-10"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
                                            <LoadingSpinner className="w-16 h-16 text-blue-500 relative" />
                                        </div>
                                        <p className="text-white font-bold uppercase tracking-[0.3em] animate-pulse text-xs">Gerando Visuais...</p>
                                    </motion.div>
                                ) : slides[selectedSlide].imageUrl ? (
                                    <motion.div
                                        key={selectedSlide}
                                        initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                        className="relative w-full h-full flex items-center justify-center z-10"
                                    >
                                        <div className="relative w-full h-full max-w-2xl aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group shadow-black/50">
                                            <img
                                                src={slides[selectedSlide].imageUrl!}
                                                alt={`Slide ${selectedSlide + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-105"
                                            />

                                            {/* Overlay de Texto Premium */}
                                            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                                                <textarea
                                                    value={slides[selectedSlide].text}
                                                    onChange={(e) => {
                                                        const newSlides = [...slides];
                                                        newSlides[selectedSlide].text = e.target.value;
                                                        setSlides(newSlides);
                                                    }}
                                                    className="w-full bg-transparent border-none text-center font-bold text-xl sm:text-3xl lg:text-4xl leading-tight resize-none outline-none focus:ring-0 rounded-xl p-2 transition-all placeholder:opacity-20 drop-shadow-lg selection:bg-blue-500/50"
                                                    style={{ fontFamily, color: textColor }}
                                                    spellCheck={false}
                                                />
                                            </div>

                                            {/* Marca D'água Dinâmica */}
                                            {logoSettings.previewUrl && (
                                                <div
                                                    className={`absolute transition-all duration-700 ease-out ${logoSettings.position === 'top-left' ? 'top-8 left-8' :
                                                        logoSettings.position === 'top-right' ? 'top-8 right-8' :
                                                            logoSettings.position === 'bottom-left' ? 'bottom-8 left-8' :
                                                                'bottom-[30%] right-8'
                                                        }`}
                                                    style={{
                                                        opacity: logoSettings.opacity,
                                                        transform: `scale(${logoSettings.scale})`,
                                                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                                                    }}
                                                >
                                                    <img src={logoSettings.previewUrl} className="max-w-[100px] md:max-w-[140px]" alt="Branding" />
                                                </div>
                                            )}

                                            {/* Badge do Modelo */}
                                            <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 shadow-lg">
                                                IMAGEN_4.0_ULTRA
                                            </div>

                                            {/* Botão de Apagar (Overlay) */}
                                            <button
                                                onClick={() => handleClearSlide(selectedSlide)}
                                                className="absolute top-6 right-6 p-2 rounded-xl bg-black/40 border border-white/10 text-white/50 hover:bg-red-500/80 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                                                title="Apagar imagem"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center text-center opacity-20 text-white z-10">
                                        <ViewColumnsIcon className="w-32 h-32 mb-6 strok-[0.5]" />
                                        <p className="text-sm font-bold uppercase tracking-[0.4em]">Aguardando Prompt</p>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Dots de Navegação */}
                            {!loading && slides[0].imageUrl && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedSlide(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${selectedSlide === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Seletor de Miniaturas */}
                        {!loading && slides[0].imageUrl && (
                            <div className="grid grid-cols-4 gap-4">
                                {slides.map((slide, idx) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setSelectedSlide(idx)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border transition-all duration-300 group ${selectedSlide === idx ? 'border-blue-500 ring-4 ring-blue-500/10 scale-105 z-10' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={slide.imageUrl!} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                        <div className={`absolute inset-0 flex items-center justify-center font-black text-2xl ${selectedSlide === idx ? 'bg-blue-500/20 text-white' : 'bg-black/50 text-white/50'}`}>
                                            {idx + 1}
                                        </div>
                                        {/* Remove Slide shortcut */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); handleClearSlide(idx); }}
                                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-md text-white/50 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Ações de Fluxo */}
                        <AnimatePresence>
                            {slides.some(s => s.imageUrl) && !loading && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="flex flex-col lg:flex-row justify-between items-center bg-white/[0.03] p-6 rounded-[2rem] border border-white/10 backdrop-blur-md gap-6"
                                >
                                    <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                                        <Button variant="ghost" className="border border-white/10 text-gray-400 hover:text-white" onClick={handleDownloadZip}>
                                            <CloudArrowUpIcon className="w-4 h-4 mr-2" /> ZIP
                                        </Button>
                                        <Button variant="ghost" className="border border-white/10 text-gray-400 hover:text-white" onClick={handleSaveToLibrary}>
                                            <CircleStackIcon className="w-4 h-4 mr-2" /> Salvar
                                        </Button>
                                        <Button variant="ghost" className="border border-white/10 text-gray-400 hover:text-white" onClick={handleShare}>
                                            <ShareIcon className="w-4 h-4 mr-2" /> Enviar
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleSchedule}
                                        className="w-full lg:w-auto px-10 h-14 rounded-2xl font-bold uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform shadow-lg shadow-blue-600/20"
                                    >
                                        Agendar <ArrowRightIcon className="w-5 h-5 ml-3" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </main>

                </div>
            </div>
        </div>
    );
};

export default CarouselStudio;
