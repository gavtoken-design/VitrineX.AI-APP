
import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ChevronLeftIcon,
  HomeIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

// Services & Core
import { generateImage, editImage, analyzeImage, generateText } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

// Constants
import {
  IMAGEN_ULTRA_MODEL,
  GEMINI_FLASH_MODEL,
  IMAGE_STYLES,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_NEGATIVE_PROMPT,
  SEASONAL_TEMPLATES
} from '../constants';

// UI Components
import HowToUse from '../components/ui/HowToUse';
import BrandAssetsManager, { LogoSettings } from '../components/features/BrandAssetsManager';

// Modular Feature Components
import StudioSidebar from '../components/features/creative-studio/StudioSidebar';
import StudioCanvas from '../components/features/creative-studio/StudioCanvas';
import StudioToolbar from '../components/features/creative-studio/StudioToolbar';

const CreativeStudio: React.FC = () => {
  // --- States ---
  const [prompt, setPrompt] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [imageAspectRatio, setImageAspectRatio] = useState<string>(DEFAULT_ASPECT_RATIO);
  const [imageSize, setImageSize] = useState<string>(DEFAULT_IMAGE_SIZE);
  const [selectedStyle, setSelectedStyle] = useState<string>('photorealistic');
  const [savedItemName, setSavedItemName] = useState<string>('');

  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    file: null,
    previewUrl: null,
    position: 'bottom-right',
    opacity: 0.8,
    scale: 1.0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  // --- Handlers ---

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setGeneratedMediaUrl(null);
    setGeneratedAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    handleReset();
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setSavedItemName(selectedFile.name.split('.')[0]);
  }, []);

  const handleGenerateMedia = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Por favor, descreva sua visão primeiro.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedMediaUrl(null);
    setGeneratedAnalysis(null);

    try {
      addToast({ type: 'info', message: 'Otimizando seu prompt com IA...' });

      const styleData = IMAGE_STYLES.find(s => s.id === selectedStyle);
      const refinementPrompt = `Role: World-Class Prompt Engineer for High-End Advertising (Imagen 4 Ultra).
Task: Rewrite the User Input into a prompt that generates an AWARD-WINNING commercial image.
Guidelines:
1. FOCUS: Hyper-realism, perfect studio lighting, sharp focus, 8k resolution.
2. COMPOSITION: Clean, professional, balanced.
3. SUBJECT: If human, perfection in skin texture and eyes. If product, macro details.

User Selected Style: ${styleData?.label || 'None'}
User Input: "${prompt}"

Output JSON ONLY:
{
  "prompt": "Professional 8k photography of [subject]..., soft studio lighting, cinematic dept of field, ... [detailed attributes]",
  "negative_prompt": "blurry, low quality, distorted, ugly, pixelated, text, watermark, bad anatomy" 
}`;

      let finalPrompt = prompt;
      let negativePrompt = DEFAULT_NEGATIVE_PROMPT;

      try {
        const refinedJson = await generateText(refinementPrompt, {
          model: GEMINI_FLASH_MODEL,
          responseMimeType: 'application/json'
        });
        const parsed = JSON.parse(refinedJson.replace(/```json/g, '').replace(/```/g, '').trim());
        if (parsed.prompt) {
          finalPrompt = parsed.prompt;
          negativePrompt = `${DEFAULT_NEGATIVE_PROMPT}, ${parsed.negative_prompt || ""}`;
        }
      } catch (refineError) {
        console.warn("Auto-refinement failed, using fallback.", refineError);
        if (styleData?.prompt) finalPrompt = `${prompt}, ${styleData.prompt}`;
      }

      const response = await generateImage(finalPrompt, {
        model: IMAGEN_ULTRA_MODEL,
        aspectRatio: imageAspectRatio as any,
        negativePrompt: negativePrompt
      });

      if (response.type === 'error') throw new Error(response.message);
      if (response.type !== 'image') throw new Error('O modelo não retornou uma imagem válida.');

      let resUrl = response.imageUrl;

      // Auto-upload if local/base64
      if (resUrl.startsWith('data:') && user) {
        const res = await fetch(resUrl);
        const blob = await res.blob();
        const uploaded = await uploadFile(new File([blob], 'studio.png', { type: 'image/png' }), user.id, 'image');
        resUrl = uploaded.file_url;
      }

      setGeneratedMediaUrl(resUrl);
      setSavedItemName(`Obra - ${prompt.substring(0, 15)}...`);
      addToast({ type: 'success', title: 'Criação Concluída', message: 'Sua obra está pronta!' });
    } catch (err: any) {
      setError(err.message || 'Erro inesperado na geração.');
      addToast({ type: 'error', message: 'Falha ao materializar imagem.' });
    } finally {
      setLoading(false);
    }
  }, [prompt, selectedStyle, imageAspectRatio, user, addToast]);

  const handleEditMedia = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result !== 'string') return;
        const base64Data = reader.result.split(',')[1];

        addToast({ type: 'info', message: 'Fundindo novas instruções...' });
        const response = await editImage(prompt, base64Data, file.type, { model: IMAGEN_ULTRA_MODEL });

        if (response.type === 'image') setGeneratedMediaUrl(response.imageUrl);
        else if (response.type === 'error') throw new Error(response.message);

        addToast({ type: 'success', message: 'Edição aplicada com perfeição!' });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      addToast({ type: 'error', message: 'Erro na edição.' });
    } finally {
      setLoading(false);
    }
  }, [file, prompt, addToast]);

  const handleAnalyzeMedia = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result !== 'string') return;
        const base64Data = reader.result.split(',')[1];

        addToast({ type: 'info', message: 'Consultando inteligência visual...' });
        const response = await analyzeImage(base64Data, file.type, prompt);

        if (response.type === 'text') setGeneratedAnalysis(response.text);
        else if (response.type === 'error') throw new Error(response.message);

        addToast({ type: 'success', message: 'Análise concluída.' });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      addToast({ type: 'error', message: 'Erro na análise.' });
    } finally {
      setLoading(false);
    }
  }, [file, prompt, addToast]);

  const handleAction = useCallback(async (type: 'bg' | 'subject' | 'variation') => {
    if (!generatedMediaUrl) return;
    setLoading(true);
    try {
      let p = "";
      if (type === 'bg') p = "Keep the main subject exactly centered. Remove the background completely, replacing it with a clean solid white background. Do NOT change the subject's pose, scale, or position. High quality isolation.";
      else if (type === 'subject' && prompt) p = `Replace the main subject with: ${prompt}. Keep style and background identical.`;
      else if (type === 'variation') p = "Create a slight variation of this image, keeping the same subject and professional style.";

      if (type === 'subject' && !prompt) {
        addToast({ type: 'warning', message: 'Descreva o novo personagem no campo de texto.' });
        setLoading(false);
        return;
      }

      const response = await editImage(p, generatedMediaUrl, 'image/png', { model: IMAGEN_ULTRA_MODEL });
      if (response.type === 'image') setGeneratedMediaUrl(response.imageUrl);
      addToast({ type: 'success', message: 'Alquimia aplicada com sucesso!' });
    } catch (e) {
      addToast({ type: 'error', message: 'Falha na ferramenta avançada.' });
    } finally {
      setLoading(false);
    }
  }, [generatedMediaUrl, prompt, addToast]);

  return (
    <div className="relative min-h-screen bg-[var(--background-input)] text-[var(--text-primary)] selection:bg-primary/30 selection:text-primary-foreground">

      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[150px] rounded-full animate-pulse-slow italic" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl animate-fade-in">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-2xl border border-primary/30 shadow-glow shadow-primary/10">
                <PaintBrushIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[var(--text-primary)] drop-shadow-sm italic uppercase">
                Estúdio <span className="text-primary not-italic">Criativo</span>
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] font-medium tracking-wide max-w-md">
              Onde sua imaginação encontra a ultra-fidelidade do <span className="text-[var(--text-primary)]/60">Imagen 4.0</span>.
            </p>
          </div>

          {/* Quick Templates Row */}
          <div className="flex gap-2 p-1.5 bg-[var(--background-input)]/50 backdrop-blur-md rounded-2xl border border-[var(--border-default)] hover:border-primary/30 transition-colors overflow-x-auto no-scrollbar max-w-full lg:max-w-md">
            {SEASONAL_TEMPLATES.slice(0, 3).map(tpl => (
              <button
                key={tpl.id}
                onClick={() => { setPrompt(tpl.basePrompt); addToast({ type: 'info', message: `Modelo '${tpl.label}' carregado.` }); }}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[var(--background-input)] hover:bg-primary/20 hover:text-primary transition-all whitespace-nowrap text-[var(--text-secondary)]"
              >
                {tpl.icon} {tpl.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar Module */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <StudioSidebar
              prompt={prompt}
              setPrompt={setPrompt}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              aspectRatio={imageAspectRatio}
              setAspectRatio={setImageAspectRatio}
              imageSize={imageSize}
              setImageSize={setImageSize}
              loading={loading}
              onGenerate={file ? (prompt.length > 5 ? handleEditMedia : handleAnalyzeMedia) : handleGenerateMedia}
              onReset={handleReset}
              isFileUploaded={!!file}
              logoSettings={logoSettings}
              setLogoSettings={setLogoSettings}
            />
          </div>

          {/* Canvas Module */}
          <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col">
            <StudioCanvas
              loading={loading}
              generatedMediaUrl={generatedMediaUrl}
              generatedAnalysis={generatedAnalysis}
              previewUrl={previewUrl}
              onUploadClick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />

            {/* Shared Toolbar for results */}
            <StudioToolbar
              mediaUrl={generatedMediaUrl}
              textResult={generatedAnalysis}
              saveName={savedItemName}
              setSaveName={setSavedItemName}
              loading={loading}
              userId={userId}
              onRemoveBackground={() => handleAction('bg')}
              onSwapSubject={() => handleAction('subject')}
              onGenerateVariation={() => handleAction('variation')}
            />

            <div className="mt-8">
              <HowToUse
                compact
                title="Dicas de Mestre"
                steps={[
                  "Seja descritivo: mencione luz de estúdio e materiais.",
                  "Use Estilos: eles injetam prompts otimizados automaticamente.",
                  "Edição IA: carregue uma imagem e descreva o que quer mudar.",
                  "Análise: carregue uma foto e pergunte 'O que há nesta imagem?'."
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Blur Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-1" />
    </div>
  );
};

export default CreativeStudio;
