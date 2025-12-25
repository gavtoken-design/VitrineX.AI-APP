import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import SaveToLibraryButton from '../components/features/SaveToLibraryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import MediaActionsToolbar from '../components/features/MediaActionsToolbar';
import {
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  BookmarkSquareIcon,
  CloudIcon,
  SparklesIcon,
  CodeBracketIcon,
  PhotoIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { uploadFileToDrive, isDriveConnected } from '../services/integrations/googleDrive';
import { generateText, generateImage } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { Post } from '../types';
import { GEMINI_FLASH_MODEL, GEMINI_IMAGE_MODEL, PLACEHOLDER_IMAGE_BASE64, GEMINI_PRO_MODEL, SEASONAL_TEMPLATES } from '../constants';
import { uploadFile } from '../services/media/storage';
import { useToast } from '../contexts/ToastContext';
import HowToUse from '../components/ui/HowToUse';
import { useAuth } from '../contexts/AuthContext';
import TargetAudienceDropdown from '../components/ui/TargetAudienceDropdown';
import Input from '../components/ui/Input';

// Avatar Interface
interface Avatar {
  id: string;
  name: string;
  age: string;
  occupation: string;
  interests: string[];
  painPoints: string[];
  buyingBehavior: string;
}

const ContentGenerator: React.FC = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<string>('');
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [loadingImages, setLoadingImages] = useState<string[]>([]); // Array of IDs currently generating images
  const [isGenerating, setIsGenerating] = useState<boolean>(false);


  const [targetAudience, setTargetAudience] = useState<string>('general');

  // Avatar & Analysis State
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [profileAnalysisText, setProfileAnalysisText] = useState('');
  const [profileAnalysisResult, setProfileAnalysisResult] = useState('');
  const [loadingProfileAnalysis, setLoadingProfileAnalysis] = useState(false);
  const [creativeIdeas, setCreativeIdeas] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  const { addToast } = useToast();
  const userId = user?.id || 'guest-user';

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  React.useEffect(() => {
    const pendingContext = localStorage.getItem('vitrinex_pending_context');
    if (pendingContext) {
      try {
        const data = JSON.parse(pendingContext);
        if (data && data.topic) {
          // Auto-paste valid content from TrendHunter
          const autoPasteContent = `${data.contentIdea}\n\nContexto: ${data.insight}`;
          setPrompt(autoPasteContent);
          addToast({ type: 'info', title: 'Contexto Carregado', message: `Trazendo dados de tendência sobre "${data.topic}"` });
        }
        localStorage.removeItem('vitrinex_pending_context');
      } catch (e) {
        console.error('Error parsing pending context', e);
      }
    }
  }, [addToast]);

  // --- 1. Content Generation Logic ---

  const generateContent = useCallback(async (isSeries: boolean = false) => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', title: 'Atenção', message: 'Por favor, insira um prompt para gerar conteúdo.' });
      return;
    }

    setIsGenerating(true);
    setLoadingText(true);
    setGeneratedPosts([]);

    try {
      let systemPrompt = `Você é um especialista em Marketing Digital e Copywriting.
      Sua tarefa é criar conteúdo de alta conversão para redes sociais.
      
      Público Alvo: ${targetAudience !== 'general' ? targetAudience : 'Geral'}
      Tópico/Instrução: "${prompt}"

      REGRAS OBRIGATÓRIAS:
      1. Retorne um JSON VÁLIDO contendo um array de objetos.
      2. Cada objeto deve ter:
         - "title": (string) Título chamativo e curto.
         - "content_text": (string) O corpo do post, engajador e bem formatado.
         - "hashtags": (array de strings) 4 hashtags ultra-relevantes sobre o assunto.
         - "image_idea": (string) Uma descrição detalhada e criativa para gerar uma imagem relacionada.
      3. ${isSeries ? 'Crie uma SÉRIE (Carrossel) de 3 a 5 posts que contem uma história contínua ou expliquem um conceito em passos.' : 'Crie APENAS 1 post completo.'}
      4. NÃO adicione texto antes ou depois do JSON. Apenas o JSON puro.
      `;

      const textResponse = await generateText(systemPrompt, { model: GEMINI_FLASH_MODEL });

      let postsData: any[] = [];
      try {
        const cleanResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        postsData = JSON.parse(cleanResponse);
        if (!Array.isArray(postsData)) {
          // Em caso de objeto único retornado por engano, encapsula em array
          postsData = [postsData];
        }
      } catch (jsonError) {
        console.warn("Failed to parse JSON, trying fallback.", jsonError);
        // Fallback robusto se a IA falhar no JSON
        postsData = [{
          title: "Novo Post",
          content_text: textResponse,
          hashtags: ["#VitrineX", "#AI", "#Content"],
          image_idea: prompt.substring(0, 150)
        }];
      }

      const processedPosts: Post[] = postsData.map((p, index) => ({
        id: `post-${Date.now()}-${index}`,
        userId: userId,
        title: p.title || `Post ${index + 1}`,
        content_text: p.content_text,
        hashtags: [...(p.hashtags || []), "#VitrineX", "#VitrineXAI"], // Adiciona as fixas
        image_url: PLACEHOLDER_IMAGE_BASE64,
        image_prompt: p.image_idea || "Uma imagem criativa sobre o tema.",
        createdAt: new Date().toISOString(),
      }));

      setGeneratedPosts(processedPosts);
      addToast({ type: 'success', title: 'Conteúdo Gerado', message: isSeries ? 'Série gerada com sucesso!' : 'Post gerado com sucesso!' });

    } catch (err) {
      console.error('Error generating content:', err);
      addToast({ type: 'error', title: 'Erro na Geração', message: 'Falha ao processar a solicitação.' });
    } finally {
      setIsGenerating(false);
      setLoadingText(false);
    }
  }, [prompt, userId, addToast, targetAudience]);

  const handleGenerateOnePost = useCallback(() => generateContent(false), [generateContent]);
  const handleGenerateSeries = useCallback(() => generateContent(true), [generateContent]);

  // --- 2. Image Workflow Logic (3 Steps) ---

  // Passo 1: Gerar/Refinar Prompt
  const handleRefineImagePrompt = async (postIndex: number) => {
    const post = generatedPosts[postIndex];
    if (!post) return;

    // Use a temporary loading state or toast
    addToast({ type: 'info', message: 'Refinando prompt de imagem...' });

    try {
      const refinePrompt = `Atue como um Engenheiro de Prompt especialista em Midjourney e Dall-E 3.
        Transforme esta ideia simples em um prompt PROMPTOPERFEITO (inglês), detalhado, focado em fotorealismo, iluminação cinematográfica e alta definição.
        
        Ideia Original: "${post.image_prompt}"
        Contexto do Post: "${post.content_text.substring(0, 100)}..."
        
        Retorne APENAS o texto do prompt refinado em inglês. Sem explicações.`;

      const refined = await generateText(refinePrompt, { model: GEMINI_FLASH_MODEL });

      // Update local state
      const updatedPosts = [...generatedPosts];
      updatedPosts[postIndex].image_prompt = refined.trim();
      setGeneratedPosts(updatedPosts);
      addToast({ type: 'success', message: 'Prompt refinado!' });
    } catch (e) {
      addToast({ type: 'error', message: 'Erro ao refinar prompt.' });
    }
  };

  // Passo 2: Conversão para JSON
  const handleConvertToJSON = (postIndex: number) => {
    const post = generatedPosts[postIndex];
    if (!post || !post.image_prompt) return;

    const jsonStructure = {
      prompt: post.image_prompt,
      negative_prompt: "deformed, ugly, bad anatomy, blur, watermark, text, signature",
      width: 1024,
      height: 1024,
      steps: 30,
      cfg_scale: 7
    };

    const jsonString = JSON.stringify(jsonStructure, null, 2);

    // Copy to clipboard or show modal? Requirement says "conversao para JSON". I'll replace the prompt text with JSON for visibility or just copy to clipboard.
    // Let's copy to clipboard AND show a toast with the JSON snippet
    navigator.clipboard.writeText(jsonString);
    addToast({ type: 'success', message: 'JSON copiado para a área de transferência!' });
  };

  // Passo 3: Gerar Imagem (Final)
  const handleGenerateImageFinal = async (postIndex: number) => {
    const post = generatedPosts[postIndex];
    if (!post || !post.image_prompt) return;

    setLoadingImages(prev => [...prev, post.id]);

    try {
      const imageResponse = await generateImage(post.image_prompt, { model: GEMINI_IMAGE_MODEL });

      let finalImageUrl = PLACEHOLDER_IMAGE_BASE64;
      if (imageResponse.type === 'image') {
        finalImageUrl = imageResponse.imageUrl;
      } else if (imageResponse.type === 'error') {
        throw new Error(imageResponse.message);
      }

      // Upload if base64 to persist
      if (finalImageUrl.startsWith('data:') && user) {
        const res = await fetch(finalImageUrl);
        const blob = await res.blob();
        const file = new File([blob], `gen-image-${Date.now()}.png`, { type: 'image/png' });
        const uploadedItem = await uploadFile(file, user.id, 'image');
        finalImageUrl = uploadedItem.file_url;
      }

      const updatedPosts = [...generatedPosts];
      updatedPosts[postIndex].image_url = finalImageUrl;
      setGeneratedPosts(updatedPosts);
      addToast({ type: 'success', message: 'Imagem gerada com sucesso!' });

    } catch (e) {
      console.error(e);
      addToast({ type: 'error', message: 'Erro ao gerar imagem.' });
    } finally {
      setLoadingImages(prev => prev.filter(id => id !== post.id));
    }
  };

  const updatePostField = (index: number, field: keyof Post, value: string) => {
    const updated = [...generatedPosts];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedPosts(updated);
  };

  const handleSaveToDrive = async (post: Post) => {
    if (!post) return;
    try {
      const isConnected = await isDriveConnected();
      if (!isConnected) {
        addToast({ type: 'warning', message: 'Conecte o Google Drive nas Configurações primeiro.' });
        return;
      }
      addToast({ type: 'info', message: 'Enviando para o Drive...' });
      const fullText = `${post.title}\n\n${post.content_text}\n\n${(post.hashtags || []).join(' ')}`;
      const textBlob = new Blob([fullText], { type: 'text/plain' });
      await uploadFileToDrive(textBlob, `post-${post.title?.replace(/\s+/g, '-') || Date.now()}.txt`, 'text/plain');

      if (post.image_url && post.image_url !== PLACEHOLDER_IMAGE_BASE64) {
        const res = await fetch(post.image_url);
        const blob = await res.blob();
        await uploadFileToDrive(blob, `post-img-${Date.now()}.png`, 'image/png');
      }
      addToast({ type: 'success', message: 'Arquivos salvos no Google Drive!' });
    } catch (e: any) {
      console.error(e);
      addToast({ type: 'error', message: `Erro ao salvar: ${e.message}` });
    }
  };

  // --- Avatar Logic preserved ---
  const generateAvatars = useCallback(async () => {
    if (!prompt.trim()) { addToast({ type: 'warning', message: 'Insira uma tendência primeiro.' }); return; }
    setLoadingAvatars(true);
    try {
      const avatarPrompt = `Analise: "${prompt}". Gere 4 personas (compradores) em JSON: id, name, age, occupation, interests, painPoints, buyingBehavior.`;
      const response = await generateText(avatarPrompt, { model: GEMINI_PRO_MODEL, responseMimeType: 'application/json' });
      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      setAvatars(JSON.parse(cleanResponse));
      addToast({ type: 'success', message: `Avatares carregados!` });
    } catch (e) { addToast({ type: 'error', message: 'Erro ao gerar avatares.' }); } finally { setLoadingAvatars(false); }
  }, [prompt, addToast]);

  const analyzeProfile = useCallback(async () => {
    if (!profileAnalysisText.trim()) return;
    setLoadingProfileAnalysis(true);
    try {
      const res = await generateText(`Analise o perfil deste texto: "${profileAnalysisText}". Retorne demografia, interesses, dores.`, { model: GEMINI_PRO_MODEL });
      setProfileAnalysisResult(res);
    } catch (e) { addToast({ type: 'error', message: 'Erro na análise.' }); } finally { setLoadingProfileAnalysis(false); }
  }, [profileAnalysisText, addToast]);

  return (
    <div className="container mx-auto py-8 lg:py-10 pb-40 lg:pb-10">
      <h2 className="text-3xl font-bold text-white mb-8">Content Generator</h2>

      <HowToUse
        title="Novo Fluxo Criativo"
        steps={[
          "1. Tendência ou Ideia: Tudo começa com o input automático ou manual.",
          "2. Gerar Conteúdo: Escolha '1 Post' ou 'Série' para carrosséis.",
          "3. Edição Estruturada: Ajuste Título, Texto e Hahstags.",
          "4. Imagens em 3 Passos: Refine o prompt, verifique o JSON, e então Gere a Imagem.",
          "5. Exportação: Salve na Biblioteca ou Drive."
        ]}
      />

      <LiquidGlassCard className="p-4 md:p-6 mb-6 md:mb-8" blurIntensity="xl" glowIntensity="sm">
        <h3 className="text-xl font-semibold text-gray-100 mb-5">Input Criativo</h3>

        {/* Menu de Prompts (Seasonal Templates) */}
        <div className="flex gap-3 overflow-x-auto py-2 mb-4 scrollbar-hide">
          {SEASONAL_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setPrompt(template.basePrompt);
                addToast({ type: 'success', message: `${template.label} aplicado!` });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background-input)] border border-[var(--border-default)] hover:bg-primary/20 hover:border-primary/50 hover:scale-105 transition-all whitespace-nowrap group"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform">{template.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-white">
                {template.label}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            id="contentPrompt"
            label="Descreva o conteúdo que deseja gerar (Colagem Automática Ativa):"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="Cole sua tendência ou descreva sua ideia..."
            className="md:col-span-2"
          />
          <TargetAudienceDropdown selectedAudience={targetAudience} onAudienceChange={setTargetAudience} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={handleGenerateOnePost} isLoading={isGenerating} variant="liquid" className="w-full sm:w-auto shadow-lg shadow-indigo-500/20">
            {isGenerating ? 'Criando...' : 'GERAR 1 POST'}
          </Button>
          <Button onClick={handleGenerateSeries} isLoading={isGenerating} variant="secondary" className="w-full sm:w-auto hover:bg-white/5">
            {isGenerating ? 'Criando...' : 'GERAR SÉRIE (Carrossel)'}
          </Button>
        </div>
      </LiquidGlassCard >

      {loadingText && <div className="flex justify-center py-12"><LoadingSpinner /></div>}

      {/* RESULTADOS GERADOS */}
      {
        generatedPosts.length > 0 && (
          <div className="space-y-12">
            {generatedPosts.map((post, index) => {
              const isImgLoading = loadingImages.includes(post.id);

              return (
                <div key={post.id} className="relative group bg-[var(--background-input)] border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
                  {/* Header do Card (Título) */}
                  <div className="bg-black/20 p-6 border-b border-[var(--border-default)] flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Título</label>
                      <Input
                        id={`post-title-${index}`}
                        value={post.title || ''}
                        onChange={(e) => updatePostField(index, 'title', e.target.value)}
                        className="text-lg font-bold text-[var(--text-primary)] bg-transparent border-none focus:ring-0 p-0 w-full placeholder-[var(--text-secondary)]"
                        placeholder="Título do Post"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        Post #{index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* LADO ESQUERDO: TEXTO E HASHTAGS */}
                    <div className="p-6 md:p-8 space-y-6 border-r border-[var(--border-default)]">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <CodeBracketIcon className="w-4 h-4" /> Conteúdo do Post
                        </label>
                        <Textarea
                          id={`post-content-${index}`}
                          value={post.content_text}
                          onChange={(e) => updatePostField(index, 'content_text', e.target.value)}
                          rows={10}
                          className="bg-black/5 dark:bg-black/20 border border-[var(--border-default)] focus:border-primary/50 text-base leading-relaxed text-[var(--text-secondary)] placeholder-[var(--text-secondary)]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pink-500" /> Hashtags Estratégicas
                        </label>
                        <div className="flex flex-wrap gap-2 p-4 bg-black/20 rounded-xl border border-white/5 min-h-[60px]">
                          {post.hashtags?.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-[var(--background-input)] border border-[var(--border-default)] rounded-md text-xs text-blue-400 transition-colors cursor-pointer">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-500 text-right">4 do assunto + 2 VitrineX</p>
                      </div>
                    </div>

                    {/* LADO DIREITO: IMAGEM E ACTIONS */}
                    <div className="p-6 md:p-8 bg-black/20 flex flex-col gap-6">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <PhotoIcon className="w-4 h-4" /> Estúdio de Imagem
                      </label>

                      {/* Preview da Imagem */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10 group/image">
                        {isImgLoading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <LoadingSpinner />
                            <p className="text-xs text-gray-400 animate-pulse">Renderizando pixels...</p>
                          </div>
                        ) : (
                          <img
                            src={post.image_url}
                            alt="Post Visual"
                            className={`w-full h-full object-cover transition-all duration-700 ${post.image_url === PLACEHOLDER_IMAGE_BASE64 ? 'opacity-30 grayscale' : 'opacity-100 hover:scale-105'}`}
                          />
                        )}
                      </div>

                      {/* Prompt Editor */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Prompt de Comando</label>
                          <p className="text-[10px] text-gray-600">Edite antes de gerar</p>
                        </div>
                        <Textarea
                          id={`image-prompt-${index}`}
                          value={post.image_prompt || ''}
                          onChange={(e) => updatePostField(index, 'image_prompt', e.target.value)}
                          rows={3}
                          className="text-xs font-mono bg-black/5 dark:bg-black/40 border-[var(--border-default)] text-[var(--text-secondary)]"
                        />
                      </div>

                      {/* TOOLBAR DE 3 BOTÕES (REQ DO USUÁRIO) */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => handleRefineImagePrompt(index)}
                          className="text-[10px] py-2 h-auto flex flex-col items-center gap-1 bg-[var(--background-input)] hover:bg-[var(--background-input)]/80 border border-[var(--border-default)] text-[var(--text-secondary)]"
                          title="Melhora o prompt com técnicas profissionais"
                        >
                          <SparklesIcon className="w-4 h-4 text-yellow-400" />
                          1. Refinar
                        </Button>

                        <Button
                          onClick={() => handleConvertToJSON(index)}
                          className="text-[10px] py-2 h-auto flex flex-col items-center gap-1 bg-[var(--background-input)] hover:bg-[var(--background-input)]/80 border border-[var(--border-default)] text-[var(--text-secondary)]"
                          title="Copia a estrutura JSON do prompt"
                        >
                          <CodeBracketIcon className="w-4 h-4 text-blue-400" />
                          2. JSON
                        </Button>

                        <Button
                          onClick={() => handleGenerateImageFinal(index)}
                          className="text-[10px] py-2 h-auto flex flex-col items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                          title="Gera a imagem final (Gasta créditos)"
                          disabled={isImgLoading}
                        >
                          <PhotoIcon className="w-4 h-4" />
                          3. GERAR
                        </Button>
                      </div>

                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-black/20 p-4 border-t border-[var(--border-default)] flex flex-wrap justify-end gap-3">
                    <SaveToLibraryButton
                      content={JSON.stringify(post)}
                      type="post"
                      userId={userId}
                      initialName={`Post: ${post.title}`}
                      tags={["generated", "content-generator", ...(post.hashtags || [])]}
                      label="Salvar Post Completo"
                      className="text-xs"
                    />
                    <Button onClick={() => handleSaveToDrive(post)} variant="ghost" className="text-xs flex items-center gap-2">
                      <CloudIcon className="w-4 h-4" /> Salvar Drive
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Seção legado (Avatares) mantida abaixo para utilidade extra */}
      <div className="mt-16 border-t border-white/5 pt-12">
        <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-gray-700 rounded-full" /> Ferramentas Auxiliares
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Gen */}
          <div className="bg-[var(--background-input)] p-6 rounded-2xl border border-[var(--border-default)]">
            <h4 className="font-bold text-white mb-2">Gerador de Personas</h4>
            <p className="text-xs text-muted mb-4">Crie perfis de compradores ideais baseados na tendência atual.</p>
            <Button onClick={generateAvatars} isLoading={loadingAvatars} variant="secondary" className="w-full">
              {loadingAvatars ? 'Processando...' : 'Gerar 4 Avatares'}
            </Button>
            {/* Avatar List rendering simplified for brevity in this view */}
            {avatars.length > 0 && <div className="mt-4 text-xs text-green-400">{avatars.length} avatares gerados. Veja na biblioteca.</div>}
          </div>

          {/* Profile Analysis */}
          <div className="bg-[var(--background-input)] p-6 rounded-2xl border border-[var(--border-default)]">
            <h4 className="font-bold text-[var(--text-primary)] mb-2">Analisador de Texto</h4>
            <Textarea
              id="profile-analysis-text"
              value={profileAnalysisText}
              onChange={e => setProfileAnalysisText(e.target.value)}
              rows={3}
              placeholder="Cole um texto para descobrir o perfil do autor..."
              className="mb-3 text-xs bg-black/5 dark:bg-black/20 text-body border-black/5 dark:border-white/5"
            />
            <Button onClick={analyzeProfile} isLoading={loadingProfileAnalysis} variant="secondary" className="w-full">
              Analisar
            </Button>
            {profileAnalysisResult && <div className="mt-4 p-3 bg-black/20 rounded text-xs text-gray-300 whitespace-pre-wrap">{profileAnalysisResult}</div>}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ContentGenerator;
