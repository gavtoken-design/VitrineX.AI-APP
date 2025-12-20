
import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SaveToLibraryButton from '../components/features/SaveToLibraryButton';
import MediaActionsToolbar from '../components/features/MediaActionsToolbar';
import { generateImage, editImage, analyzeImage } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import { useAuth } from '../contexts/AuthContext';
import { downloadImage } from '../utils/mediaUtils';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilSquareIcon,
  PaintBrushIcon,
  DocumentArrowDownIcon,
  ScissorsIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import BrandAssetsManager, { LogoSettings } from '../components/features/BrandAssetsManager';
import { applyWatermark } from '../utils/imageProcessing';
import {
  IMAGEN_ULTRA_MODEL,
  IMAGEN_STANDARD_MODEL,
  GEMINI_IMAGE_MODEL,
  VEO_GENERATE_MODEL,
  PLACEHOLDER_IMAGE_BASE64,
  IMAGE_ASPECT_RATIOS,
  IMAGE_SIZES,
  VIDEO_ASPECT_RATIOS,
  VIDEO_RESOLUTIONS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_VIDEO_RESOLUTION,
  SEASONAL_TEMPLATES // Importado
} from '../constants';
import { useToast } from '../contexts/ToastContext';
import HowToUse from '../components/ui/HowToUse';

// Video functionality removed as per new requirements

const CreativeStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Custom File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageAspectRatio, setImageAspectRatio] = useState<string>(DEFAULT_ASPECT_RATIO);
  const [imageSize, setImageSize] = useState<string>(DEFAULT_IMAGE_SIZE);

  const [savedItemName, setSavedItemName] = useState<string>('');
  const [savedItemTags, setSavedItemTags] = useState<string>('');

  // Branding State
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    file: null,
    previewUrl: null,
    position: 'bottom-right',
    opacity: 0.8,
    scale: 1.0
  });


  const { addToast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  // --- Handlers ---

  const applyTemplate = (template: typeof SEASONAL_TEMPLATES[0]) => {
    setPrompt(template.basePrompt);
    setFile(null); // Templates são para geração do zero
    setPreviewUrl(null);
    addToast({
      type: 'info',
      title: 'Modelo Aplicado',
      message: 'Personalize o nome do produto no prompt.'
    });
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    // Reset states
    setFile(null);
    setPreviewUrl(null);
    setGeneratedMediaUrl(null);
    setGeneratedAnalysis(null);
    setError(null);
    setSavedItemName('');

    // Validation
    const MAX_SIZE_MB = 20;
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast({ type: 'error', title: 'Arquivo muito grande', message: `Máximo permitido: ${MAX_SIZE_MB}MB.` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);

    try {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } catch (e) {
      console.error("Error creating object URL", e);
      addToast({ type: 'error', message: 'Erro ao visualizar arquivo.' });
      return;
    }

    setSavedItemName(selectedFile.name.split('.').slice(0, -1).join('.'));
  }, [addToast]);

  const getFriendlyErrorMessage = (err: any, context: string) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('API key')) return 'Chave de API inválida ou ausente.';
    if (msg.includes('quota') || msg.includes('429')) return 'Limite de uso da API excedido.';
    if (msg.includes('safety') || msg.includes('block')) return 'Bloqueado pelos filtros de segurança.';
    return `Falha em ${context}: ${msg}`;
  };

  const handleGenerateMedia = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Insira um prompt para gerar.' });
      setError('A descrição (Prompt) é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedMediaUrl(null);
    setGeneratedAnalysis(null);

    try {
      const response = await generateImage(prompt, {
        model: IMAGEN_ULTRA_MODEL,
        aspectRatio: imageAspectRatio as any,
        numberOfImages: 1,
      });

      if (response.type === 'error') throw new Error(response.message);
      if (response.type === 'text') {
        setGeneratedAnalysis(response.text);
        return;
      }

      if (response.type !== 'image' || !response.imageUrl) throw new Error('A API não retornou imagem.');
      let finalImageUrl = response.imageUrl;

      // Upload to Storage if Base64 and User is logged in
      if (response.imageUrl && response.imageUrl.startsWith('data:') && user) {
        try {
          const res = await fetch(response.imageUrl);
          const blob = await res.blob();
          const file = new File([blob], `creative-gen-${Date.now()}.png`, { type: 'image/png' });
          const uploadedItem = await uploadFile(file, user.id, 'image');
          finalImageUrl = uploadedItem.file_url;
        } catch (uploadErr) {
          console.error("Failed to upload generated image to storage:", uploadErr);
        }
      }

      setGeneratedMediaUrl(finalImageUrl);

      // AUTO-SAVE: Salvar imagem na biblioteca
      if (user && finalImageUrl && !finalImageUrl.startsWith('data:')) {
        try {
          await saveLibraryItem({
            id: `lib-${Date.now()}`,
            userId: user.id,
            name: `Gerado - ${prompt.substring(0, 30)}`,
            file_url: finalImageUrl,
            type: 'image',
            tags: ['creative-studio', 'image', 'generated'],
            createdAt: new Date().toISOString()
          });
        } catch (saveError) {
          console.warn('Failed to auto-save to library:', saveError);
        }
      }
      setSavedItemName(`Gerado - ${prompt.substring(0, 20)}...`);
      addToast({ type: 'success', title: 'Sucesso', message: 'Imagem gerada com sucesso.' });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'geração'));
      addToast({ type: 'error', message: 'Erro na geração.' });
    } finally {
      setLoading(false);
    }
  }, [prompt, imageAspectRatio, imageSize, addToast, user]);

  const handleEditMedia = useCallback(async () => {
    if (!file || !previewUrl) {
      addToast({ type: 'warning', message: 'Carregue um arquivo para editar.' });
      return;
    }
    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Descreva a edição desejada.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedMediaUrl(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;

      const base64Data = reader.result.split(',')[1];
      const mimeType = file.type;

      try {
        // PASSO 1: Analisar a imagem carregada
        addToast({ type: 'info', message: 'Analisando imagem...' });
        const analysisPrompt = `Analise esta imagem em detalhes: elementos visuais, cores, composição, estilo, objetos presentes.`;
        const analysisResponse = await analyzeImage(base64Data, mimeType, analysisPrompt);

        let imageAnalysis = '';
        if (analysisResponse.type === 'text') {
          imageAnalysis = analysisResponse.text;
        } else if (analysisResponse.type === 'error') {
          throw new Error(analysisResponse.message);
        }

        // PASSO 2: Criar prompt enriquecido com análise + instrução do usuário
        const enrichedPrompt = `Baseado nesta análise da imagem original:
${imageAnalysis}

Instrução do usuário: ${prompt}

Crie uma nova imagem que atenda à instrução do usuário, mantendo coerência com os elementos identificados na análise.`;

        // PASSO 3: Gerar nova imagem
        addToast({ type: 'info', message: 'Gerando nova imagem...' });
        const response = await generateImage(enrichedPrompt, {
          model: IMAGEN_ULTRA_MODEL,
          aspectRatio: imageAspectRatio as any,
          numberOfImages: 1,
        });

        if (response.type === 'error') throw new Error(response.message);
        if (response.type !== 'image' || !response.imageUrl) throw new Error('Falha na geração da imagem.');

        let finalEditedUrl = response.imageUrl;

        // Upload if Base64
        if (response.imageUrl.startsWith('data:') && user) {
          try {
            const res = await fetch(response.imageUrl);
            const blob = await res.blob();
            const file = new File([blob], `creative-edit-${Date.now()}.png`, { type: 'image/png' });
            const uploadedItem = await uploadFile(file, user.id, 'image');
            finalEditedUrl = uploadedItem.file_url;
          } catch (err) {
            console.error("Failed to upload edited image:", err);
          }
        }

        setGeneratedMediaUrl(finalEditedUrl);

        // AUTO-SAVE: Salvar automaticamente na biblioteca
        if (user && finalEditedUrl && !finalEditedUrl.startsWith('data:')) {
          try {
            await saveLibraryItem({
              id: `lib-${Date.now()}`,
              userId: user.id,
              name: `Editado - ${prompt.substring(0, 30)}`,
              file_url: finalEditedUrl,
              type: 'image',
              tags: ['creative-studio', 'image', 'edited'],
              createdAt: new Date().toISOString()
            });
          } catch (saveError) {
            console.warn('Failed to auto-save to library:', saveError);
          }
        }
        setSavedItemName(`Editado - ${prompt.substring(0, 20)}`);
        addToast({ type: 'success', message: 'Nova imagem criada com sucesso!' });
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'edição'));
        addToast({ type: 'error', message: 'Erro na edição.' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [file, previewUrl, prompt, imageAspectRatio, imageSize, addToast, user]);

  const handleAnalyzeMedia = useCallback(async () => {
    if (!file) {
      addToast({ type: 'warning', message: 'Carregue um arquivo para analisar.' });
      return;
    }

    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Descreva o que você quer saber sobre a imagem.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;
      const base64Data = reader.result.split(',')[1];
      // Use o prompt do usuário diretamente (baseado na imagem)
      const analysisPrompt = prompt.trim();

      try {
        const mimeTypeToUse = file.type;
        const response = await analyzeImage(base64Data, mimeTypeToUse, analysisPrompt);
        if (response.type === 'error') throw new Error(response.message);
        if (response.type === 'text') {
          setGeneratedAnalysis(response.text);
        } else if (response.type === 'image') {
          setGeneratedMediaUrl(response.imageUrl);
        }
        addToast({ type: 'success', message: 'Análise concluída.' });
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'análise'));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [file, prompt, addToast]);

  const handleRemoveBackground = useCallback(async () => {
    if (!generatedMediaUrl) return;
    setLoading(true);
    try {
      const response = await editImage("Remove the background completely, leaving only the main subject on a transparent-looking or solid white background.", generatedMediaUrl, 'image/png', { model: IMAGEN_ULTRA_MODEL });
      if (response.type === 'image') setGeneratedMediaUrl(response.imageUrl);
      else if (response.type === 'error') throw new Error(response.message);
      addToast({ type: 'success', message: 'Fundo removido!' });
    } catch (e) {
      addToast({ type: 'error', message: 'Erro ao remover fundo.' });
    } finally {
      setLoading(false);
    }
  }, [generatedMediaUrl, addToast]);

  const handleSwapSubject = useCallback(async () => {
    if (!generatedMediaUrl || !prompt) {
      addToast({ type: 'warning', message: 'Descreva o novo personagem no prompt.' });
      return;
    }
    setLoading(true);
    try {
      const editPrompt = `Replace the main subject with: ${prompt}. Keep the same style, lighting and background.`;
      const response = await editImage(editPrompt, generatedMediaUrl, 'image/png', { model: IMAGEN_ULTRA_MODEL });
      if (response.type === 'image') setGeneratedMediaUrl(response.imageUrl);
      else if (response.type === 'error') throw new Error(response.message);
      addToast({ type: 'success', message: 'Personagem trocado!' });
    } catch (e) {
      addToast({ type: 'error', message: 'Erro ao trocar personagem.' });
    } finally {
      setLoading(false);
    }
  }, [generatedMediaUrl, prompt, addToast]);

  const handleGenerateVariation = useCallback(async () => {
    if (!generatedMediaUrl) return;
    setLoading(true);
    try {
      const response = await editImage("Create a variation of this image with slightly different composition but same style and subject.", generatedMediaUrl, 'image/png', { model: IMAGEN_ULTRA_MODEL });
      if (response.type === 'image') setGeneratedMediaUrl(response.imageUrl);
      else if (response.type === 'error') throw new Error(response.message);
      addToast({ type: 'success', message: 'Variação gerada!' });
    } catch (e) {
      addToast({ type: 'error', message: 'Erro ao gerar variação.' });
    } finally {
      setLoading(false);
    }
  }, [generatedMediaUrl, addToast]);

  const exportPromptsAsTXT = useCallback(() => {
    if (!prompt) return;
    const element = document.createElement("a");
    const file = new Blob([prompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "prompt-criativo.txt";
    document.body.appendChild(element);
    element.click();
    addToast({ type: 'success', message: 'Prompt baixado como TXT' });
  }, [prompt, addToast]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  return (
    <div className="container mx-auto py-6 pb-40 lg:pb-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-title flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            Estúdio Criativo
          </h2>
          <p className="text-muted mt-1">Crie, Edite e Analise mídias com o poder do Gemini 2.5 e Veo.</p>
        </div>
      </div>

      <HowToUse
        title="Como Usar o Estúdio Criativo"
        steps={[
          "Para gerar do zero: Digite uma descrição e clique 'Gerar Imagem'",
          "Para editar: Faça upload de uma foto e use os botões de edição",
          "Para analisar: Faça upload e descreva o que quer saber",
          "Configure proporção e tamanho conforme necessário",
          "Aguarde a geração (pode levar alguns segundos)",
          "Use modelos sazonais para inspiração rápida",
          "Use ferramentas avançadas (Remover Fundo, Trocar Personagem) após gerar"
        ]}
        tips={[
          "Imagens com análise: A IA analisa primeiro e cria baseado nisso",
          "Todos os arquivos são salvos automaticamente na biblioteca",
          "Use 'Aplicar Identidade' para adicionar sua logo",
          "Modelos sazonais já vêm com prompts otimizados"
        ]}
      />

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span className="font-bold">Erro:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">


          {/* Seasonal Templates Section - NEW */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Modelos de Fim de Ano 🎄</h3>
            <div className="grid grid-cols-2 gap-2">
              {SEASONAL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="relative group overflow-hidden rounded-xl border-2 border-border hover:border-primary liquid-transition hover-lift hover:scale-105 text-left h-28 shadow-lg hover:shadow-xl hover:shadow-primary/20"
                >
                  {/* Background Image with Higher Opacity */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-90 transition-all duration-700"
                    style={{ backgroundImage: `url(${tpl.referenceImage})` }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <div className="relative p-4 z-10 flex flex-col justify-end h-full">
                    <div className="text-2xl mb-1 filter drop-shadow-lg icon-fluid-breathe animate-bounce-slow">{tpl.icon}</div>
                    <div className="text-sm font-bold text-white leading-tight drop-shadow-md">{tpl.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection - Simplified to Image only or Actions */}
          <div className="bg-surface p-1 rounded-xl border border-border flex shadow-sm">
            <div className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-primary text-white shadow-md">
              <PhotoIcon className="w-4 h-4" /> Modo Imagem
            </div>
          </div>

          {/* Upload Area - Custom Button */}
          <div
            onClick={handleUploadClick}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden
              ${previewUrl
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-primary hover:bg-background'
              }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-40 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded shadow-lg" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                  <p className="text-white font-medium text-sm flex items-center gap-1"><ArrowDownTrayIcon className="w-4 h-4" /> Trocar Arquivo</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-background rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-title">Clique para carregar uma Imagem</p>
                <p className="text-xs text-muted mt-1">ou arraste e solte aqui</p>
              </>
            )}
          </div>

          {/* Configuration */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
            <h3 className="text-sm font-bold text-title mb-4 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4" /> Configurações
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted font-medium mb-1 block">Proporção</label>
                  <select value={imageAspectRatio} onChange={e => setImageAspectRatio(e.target.value)} className="w-full text-sm bg-background border border-border rounded-lg px-2 py-2 text-body focus:ring-1 focus:ring-primary outline-none">
                    {IMAGE_ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1 block">Tamanho</label>
                  <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full text-sm bg-background border border-border rounded-lg px-2 py-2 text-body focus:ring-1 focus:ring-primary outline-none">
                    {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
            <Textarea
              id="creativePrompt"
              label={file ? "Instruções de Edição / Análise" : "Descrição para Geração"}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={file ? "Ex: 'O que há nesta imagem?', 'Identifique os elementos principais', 'Sugira melhorias'" : "Ex: 'Um robô futurista em uma cidade cyberpunk'"}
              className="text-sm"
            />

            <div className="grid grid-cols-2 gap-2 mt-4">
              {file ? (
                <>
                  <Button onClick={handleEditMedia} isLoading={loading} variant="primary" disabled={loading}>
                    <PencilSquareIcon className="w-4 h-4 mr-2" /> Editar IA
                  </Button>
                  <Button onClick={handleAnalyzeMedia} isLoading={loading} variant="outline" disabled={loading}>
                    <EyeIcon className="w-4 h-4 mr-2" /> Analisar
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleGenerateMedia} isLoading={loading} variant="primary" className="col-span-2 gradient-animated glow-effect bounce-on-click liquid-transition">
                    <SparklesIcon className="w-4 h-4 mr-2 icon-fluid-breathe" /> Gerar Imagem
                  </Button>
                  <Button onClick={exportPromptsAsTXT} variant="outline" className="col-span-2 mt-2">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" /> Baixar Prompt (.txt)
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Brand Assets Manager */}
          <BrandAssetsManager settings={logoSettings} onSettingsChange={setLogoSettings} />

        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-6">

          {/* Main Viewer */}
          <div className="flex-1 bg-surface rounded-2xl border border-border shadow-card overflow-hidden relative flex items-center justify-center min-h-[400px] bg-grid-pattern">
            {loading && !generatedMediaUrl && !generatedAnalysis ? (
              <div className="text-center">
                <LoadingSpinner className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-muted animate-pulse">Processando com IA...</p>
              </div>
            ) : generatedMediaUrl ? (
              <img src={generatedMediaUrl} alt="Resultado" className="max-w-full max-h-full object-contain shadow-2xl" />
            ) : generatedAnalysis ? (
              <div className="p-8 max-w-2xl w-full h-full overflow-y-auto">
                <h3 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                  <EyeIcon className="w-6 h-6 text-primary" /> Análise Visual
                </h3>
                <div className="prose prose-invert max-w-none text-body bg-background/50 p-6 rounded-xl border border-border">
                  {generatedAnalysis}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted opacity-50">
                <PhotoIcon className="w-20 h-20 mx-auto mb-2" />
                <p>O resultado aparecerá aqui</p>
              </div>
            )}
          </div>

          {/* Results Toolbar */}
          {(generatedMediaUrl || generatedAnalysis) && (
            <div className="bg-surface rounded-xl border border-border p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-in-from-bottom">
              <div className="flex-1 w-full">
                <Input
                  id="saveName"
                  placeholder="Nome para salvar..."
                  value={savedItemName}
                  onChange={e => setSavedItemName(e.target.value)}
                  className="mb-0"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <SaveToLibraryButton
                  content={generatedMediaUrl || generatedAnalysis || ""}
                  type={generatedAnalysis ? 'text' : 'image'}
                  userId={userId}
                  initialName={savedItemName}
                  tags={['creative-studio', 'image']}
                  variant="secondary"
                  className="w-full md:w-auto"
                />

                {generatedMediaUrl && (
                  <>
                    <Button onClick={handleRemoveBackground} variant="outline" size="sm" isLoading={loading} title="Remover Fundo">
                      <ScissorsIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSwapSubject} variant="outline" size="sm" isLoading={loading} title="Mudar Personagem">
                      <UserGroupIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleGenerateVariation} variant="outline" size="sm" isLoading={loading} title="Gerar Variação">
                      <ArrowPathIcon className="w-4 h-4" />
                    </Button>
                    <MediaActionsToolbar mediaUrl={generatedMediaUrl} fileName="creative.png" />
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div >
  );
};

export default CreativeStudio;
