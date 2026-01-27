import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { publishFacebookPost, createInstagramMedia, publishInstagramMedia, shareToPinterest, getPinterestBoards, createPinterestPin } from '../services/social';
import { generatePinterestRSS } from '../services/features/pinterestRss';
import { socialAuthService } from '../services/social/SocialAuthService';
import { uploadFileToDrive, isDriveConnected } from '../services/integrations/googleDrive';
import { generateText, generateImage } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { Post, LibraryItem } from '../types';
import { GEMINI_FLASH_MODEL, GEMINI_IMAGE_MODEL, PLACEHOLDER_IMAGE_BASE64, GEMINI_PRO_MODEL, IMAGEN_ULTRA_MODEL, SYSTEM_INSTRUCTION_ENHANCE_PROMPT } from '../constants';
import { SEASONAL_TEMPLATES } from '../data/templates';
import { uploadFile } from '../services/media/storage';
import { useToast } from '../contexts/ToastContext';
import HowToUse from '../components/ui/HowToUse';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial, TutorialStep } from '../contexts/TutorialContext';
import TargetAudienceDropdown from '../components/ui/TargetAudienceDropdown';
import Input from '../components/ui/Input';
import LibraryImportModal from '../components/features/LibraryImportModal';
import GeneratedPostCard from '../components/features/GeneratedPostCard';

import { translateError } from '../lib/errorTranslator';
import { FlashDesigner } from '../components/features/FlashUI/FlashUIComponent';
import { BoltIcon, SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';


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
  const { startTutorial, completedModules } = useTutorial();


  const [targetAudience, setTargetAudience] = useState<string>('general');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');

  // Avatar & Analysis State
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const [profileAnalysisText, setProfileAnalysisText] = useState('');
  const [profileAnalysisResult, setProfileAnalysisResult] = useState('');
  const [loadingProfileAnalysis, setLoadingProfileAnalysis] = useState(false);
  const [creativeIdeas, setCreativeIdeas] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  const [avatarTheme, setAvatarTheme] = useState<string>('Profissional');

  const [viewMode, setViewMode] = useState<'standard' | 'flash'>('standard');


  // Social Publish State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishImage, setPublishImage] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const fbPageId = import.meta.env.VITE_FB_PAGE_ID;
  const igUserId = import.meta.env.VITE_IG_USER_ID;

  // Pinterest State
  const [showPinterestModal, setShowPinterestModal] = useState(false);
  const [pinterestBoards, setPinterestBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [pinterestLoading, setPinterestLoading] = useState(false);

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

  React.useEffect(() => {
    if (!completedModules['content_generator']) {
      const tutorialSteps: TutorialStep[] = [
        {
          targetId: 'content-prompt-area',
          title: 'Descreva sua Ideia',
          content: 'Digite o tema, cole uma tendência ou descreva o que você quer criar.',
          position: 'bottom',
        },
        {
          targetId: 'target-audience-selector',
          title: 'Defina o Público',
          content: 'Escolha quem você quer atingir para ajustar o tom da comunicação.',
          position: 'top',
        },
        {
          targetId: 'generator-action-buttons',
          title: 'Gere Conteúdo',
          content: 'Crie posts únicos ou carrosséis completos com um clique.',
          position: 'top',
        }
      ];
      startTutorial('content_generator', tutorialSteps);
    }
  }, [completedModules, startTutorial]);

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
      // ETAPA 1: ESTRATÉGIA (Apenas para Séries/Carrosséis)
      let strategyContext = "";

      if (isSeries) {
        setLoadingText(true); // Ensure loading state
        addToast({ type: 'info', title: '🧠 IA Estrategista', message: 'Desenhando a arquitetura do conteúdo...' });

        const strategyPrompt = `Atue como um Diretor de Estratégia de Conteúdo Sênior.
        Analise o pedido do usuário: "${prompt}"
        Público: "${targetAudience}"
        
        Defina a direção estratégica em JSON:
        {
          "target_insight": "Uma dor ou desejo profundo e não óbvio deste público",
          "core_message": "A mensagem única que este carrossel deve passar",
          "hook_approach": "Como vamos prender a atenção no primeiro slide (ex: Curiosidade, Medo, Benefício)",
          "visual_mood": "A atmosfera visual sugerida"
        }`;

        try {
          const strategyResponse = await generateText(strategyPrompt, { model: GEMINI_FLASH_MODEL, responseMimeType: 'application/json' });
          strategyContext = `\n\nDIRETRIZES ESTRATÉGICAS DEFINIDAS (SIGA ESTRITAMENTE):\n${strategyResponse}`;
          addToast({ type: 'success', title: 'Estratégia Definida', message: 'Criando posts com base no plano estratégico...' });
        } catch (e) {
          console.warn("Falha na etapa de estratégia, seguindo geração padrão.");
        }
      }

      const systemPrompt = `Você é um especialista em Marketing Digital e Copywriting de Elite.
      Sua tarefa é criar conteúdo de alta conversão para redes sociais.${strategyContext}
      
      Público Alvo: ${targetAudience !== 'general' ? targetAudience : 'Geral'}
      Tópico/Instrução: "${prompt}"

      REGRAS OBRIGATÓRIAS:
      1. Retorne um JSON VÁLIDO contendo um array de objetos.
      2. Cada objeto deve ter:
         - "title": (string) Título chamativo e curto (Use gatilhos mentais).
         - "content_text": (string) O corpo do post, engajador, scannable (quebras de linha) e bem formatado.
         - "hashtags": (array de strings) 4 hashtags ultra-relevantes.
         - "image_idea": (string) Descrição visual Rica e Detalhada para IA geradora de imagem.
      3. ${isSeries ? 'Crie uma SÉRIE (Carrossel) de 3 a 5 slides. O conteéudo deve ser progressivo (História ou Passo a Passo).' : 'Crie APENAS 1 post completo e denso.'}
      4. IMPORTANTE: O "content_text" será a legenda da rede social. Seja persuasivo.
      5. NÃO adicione texto antes ou depois do JSON.
      `;

      const textResponse = await generateText(systemPrompt, { model: GEMINI_FLASH_MODEL, responseMimeType: 'application/json' });

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
      addToast({ type: 'error', title: 'Erro na Geração', message: translateError(err) });
    } finally {
      setIsGenerating(false);
      setLoadingText(false);
    }
  }, [prompt, userId, addToast, targetAudience]);

  const handleGenerateOnePost = useCallback(() => generateContent(false), [generateContent]);
  const handleGenerateSeries = useCallback(() => generateContent(true), [generateContent]);

  // --- 2. Image Workflow Logic (3 Steps) ---

  // Passo 1: Gerar/Refinar Prompt (Expansion Engine)
  const handleRefineImagePrompt = async (postIndex: number) => {
    const post = generatedPosts[postIndex];
    if (!post) return;

    addToast({ type: 'info', message: 'Ativando Engine de Expansão...' });

    try {
      const refinePrompt = `${SYSTEM_INSTRUCTION_ENHANCE_PROMPT}
      
      Input Concept: "${post.image_prompt}"
      Context (Background Story): "${post.content_text.substring(0, 150)}..."`;

      const refined = await generateText(refinePrompt, { model: GEMINI_FLASH_MODEL });

      // Update local state
      const updatedPosts = [...generatedPosts];
      updatedPosts[postIndex].image_prompt = refined.trim();
      setGeneratedPosts(updatedPosts);
      addToast({ type: 'success', message: 'Prompt expandido para nível Pro!' });
    } catch (e) {
      addToast({ type: 'error', message: translateError(e) });
    }
  };



  // Passo 3: Gerar Imagem (Final)
  const handleGenerateImageFinal = async (postIndex: number) => {
    const post = generatedPosts[postIndex];
    if (!post || !post.image_prompt) return;

    setLoadingImages(prev => [...prev, post.id]);

    try {
      const imageResponse = await generateImage(post.image_prompt, { model: GEMINI_IMAGE_MODEL, aspectRatio: aspectRatio as any });

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
      addToast({ type: 'error', message: translateError(e) });
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
      addToast({ type: 'error', message: `Erro ao salvar: ${translateError(e)}` });
    }
  };

  const handleSavePrompt = async (postIndex: number) => {
    const post = generatedPosts[postIndex];
    if (!post || !post.image_prompt) return;

    try {
      const item: LibraryItem = {
        id: `prompt-${Date.now()}`,
        userId,
        type: 'prompt',
        name: `Prompt: ${post.title}`,
        file_url: post.image_prompt,
        tags: ['prompt', 'ai-image', ...(post.hashtags || [])],
        createdAt: new Date().toISOString()
      };

      await saveLibraryItem(item);
      addToast({ type: 'success', message: 'Prompt salvo na Biblioteca!' });
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: translateError(error) });
    }
  };

  // --- Avatar Logic preserved ---
  const generateAvatars = useCallback(async () => {
    if (!prompt.trim()) { addToast({ type: 'warning', message: 'Insira uma tendência primeiro.' }); return; }
    setLoadingAvatars(true);
    try {
      const avatarPrompt = `Analise a tendência: "${prompt}". 
      Gere 4 personas (compradores ideais) no tema "${avatarTheme}".
      Retorne em JSON um array de objetos com: id, name, age, occupation, interests, painPoints, buyingBehavior.`;

      const response = await generateText(avatarPrompt, { model: GEMINI_PRO_MODEL, responseMimeType: 'application/json' });
      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedAvatars: Avatar[] = JSON.parse(cleanResponse);

      setAvatars(generatedAvatars);

      // Save to Library automatically
      const savePromises = generatedAvatars.map(async (av) => {
        const item: LibraryItem = {
          id: `avatar-${Date.now()}-${av.id}`,
          userId,
          type: 'text',
          name: `Avatar: ${av.name} (${av.occupation})`,
          file_url: JSON.stringify(av, null, 2),
          tags: ['avatar', avatarTheme.toLowerCase(), 'persona'],
          createdAt: new Date().toISOString()
        };
        return saveLibraryItem(item);
      });

      await Promise.all(savePromises);
      addToast({ type: 'success', message: `4 Avatares salvos na biblioteca com o tema ${avatarTheme}!` });
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', message: translateError(e) });
    } finally {
      setLoadingAvatars(false);
    }
  }, [prompt, avatarTheme, userId, addToast]);

  const analyzeProfile = useCallback(async () => {
    if (!profileAnalysisText.trim()) return;
    setLoadingProfileAnalysis(true);
    try {
      const res = await generateText(`Analise o perfil deste texto: "${profileAnalysisText}". Retorne demografia, interesses, dores.`, { model: GEMINI_PRO_MODEL });
      setProfileAnalysisResult(res);
    } catch (e) { addToast({ type: 'error', message: translateError(e) }); } finally { setLoadingProfileAnalysis(false); }
  }, [profileAnalysisText, addToast]);

  const handleDownloadAvatarsTxt = useCallback(() => {
    if (avatars.length === 0) return;

    let text = "=== PERSONAS GERADAS POR VITRINEX.AI ===\n\n";
    avatars.forEach((av, index) => {
      text += `PERSONA #${index + 1}\n`;
      text += `Nome: ${av.name}\n`;
      text += `Idade: ${av.age}\n`;
      text += `Ocupação: ${av.occupation}\n`;
      text += `Interesses: ${av.interests.join(", ")}\n`;
      text += `Dores/Necessidades: ${av.painPoints.join(", ")}\n`;
      text += `Comportamento de Compra: ${av.buyingBehavior}\n`;
      text += `\n-----------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personas-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Download das personas concluído!' });
  }, [avatars, addToast]);

  // --- Helpers for Actions ---
  const handleDownloadImage = async (url: string, title: string) => {
    try {
      if (!url || url === PLACEHOLDER_IMAGE_BASE64) {
        addToast({ type: 'warning', message: 'Nenhuma imagem para baixar.' });
        return;
      }
      addToast({ type: 'info', message: 'Iniciando download...' });

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-image.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      addToast({ type: 'success', message: 'Download concluído!' });
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', message: translateError(e) });
    }
  };

  const handlePinterestShare = async (post: Post) => {
    if (!post.image_url || post.image_url === PLACEHOLDER_IMAGE_BASE64) {
      addToast({ type: 'warning', message: 'Gere uma imagem antes de compartilhar no Pinterest.' });
      return;
    }

    if (post.image_url.startsWith('data:')) {
      addToast({ type: 'warning', message: 'Imagens locais (base64) precisam ser salvas na nuvem antes de enviar via API.' });
      // Fallback manual ainda útil
    }

    // 1. Verificar conexão
    if (!socialAuthService.isConnected('pinterest')) {
      addToast({ type: 'info', message: 'Conectando ao Pinterest... (Vá em Redes Sociais se falhar)' });
      socialAuthService.connect('pinterest');
      return;
    }

    // 2. Tentar completar handshake se necessário (troca de token pendente)
    const handshakeSuccess = await socialAuthService.completePinterestHandshake();
    if (!handshakeSuccess && !localStorage.getItem('vitrinex_social_token_pinterest')) {
      addToast({ type: 'error', message: 'Erro na autenticação. Tente reconectar nas configurações.' });
      return;
    }

    // 3. Preparar Modal
    setPublishMessage(`${post.title}\n\n${post.content_text}`);
    setPublishImage(post.image_url);
    setShowPinterestModal(true);
    fetchPinterestBoards();
  };

  const fetchPinterestBoards = async () => {
    setPinterestLoading(true);
    try {
      const token = localStorage.getItem('vitrinex_social_token_pinterest');
      if (!token) throw new Error("Sem token");
      const boards = await getPinterestBoards(token);
      setPinterestBoards(boards);
      if (boards.length > 0) setSelectedBoardId(boards[0].id);
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', message: 'Falha ao buscar pastas do Pinterest.' });
    } finally {
      setPinterestLoading(false);
    }
  };

  const handlePinterestPublish = async () => {
    if (!selectedBoardId) {
      addToast({ type: 'warning', message: 'Selecione uma pasta (Board).' });
      return;
    }

    setPinterestLoading(true);
    try {
      const token = localStorage.getItem('vitrinex_social_token_pinterest') || "";

      await createPinterestPin(
        token,
        selectedBoardId,
        publishImage,
        publishMessage.split('\n')[0] || "VitrineX Pin", // Title (primeira linha)
        publishMessage, // Description
        "https://vitrinex.ai" // Link opcional
      );

      addToast({ type: 'success', message: 'Pin criado com sucesso!' });
      setShowPinterestModal(false);
    } catch (e: any) {
      console.error(e);
      addToast({ type: 'error', message: `Erro ao criar Pin: ${translateError(e)}` });
    } finally {
      setPinterestLoading(false);
    }
  };

  const handleOpenPublishModal = (post: Post) => {
    setPublishMessage(`${post.title}\n\n${post.content_text}\n\n${(post.hashtags || []).join(' ')}`);
    setPublishImage(post.image_url !== PLACEHOLDER_IMAGE_BASE64 ? post.image_url : '');
    setShowPublishModal(true);
    setPublishStatus("");
  };

  const handleFacebookPublish = async () => {
    const fbAccessToken = localStorage.getItem("fb_access_token");
    try {
      if (!fbPageId) {
        addToast({ type: 'warning', message: 'ID da Página não configurado (.env)' });
      }
      setPublishStatus("Publicando no Facebook...");
      await publishFacebookPost(fbPageId || "", fbAccessToken || "", publishMessage);
      setPublishStatus("Publicação no Facebook concluída!");
      addToast({ type: 'success', message: 'Publicado no Facebook com sucesso!' });
      setTimeout(() => setShowPublishModal(false), 2000);
    } catch (e: any) {
      console.error(e);
      const errorMsg = translateError(e);
      setPublishStatus("Erro na publicação.");
      addToast({ type: 'error', message: `Erro Facebook: ${errorMsg}` });
    }
  };

  const handleInstagramPublish = async () => {
    const igAccessToken = localStorage.getItem("ig_access_token");
    try {
      if (!igUserId) {
        addToast({ type: 'warning', message: 'ID do Instagram não configurado (.env)' });
      }
      setPublishStatus("Criando mídia no Instagram...");
      const mediaId = await createInstagramMedia(igUserId || "", igAccessToken || "", publishImage, publishMessage);
      setPublishStatus("Publicando no Instagram...");
      await publishInstagramMedia(igUserId || "", igAccessToken || "", mediaId);
      setPublishStatus("Publicação no Instagram concluída!");
      addToast({ type: 'success', message: 'Publicado no Instagram com sucesso!' });
      setTimeout(() => setShowPublishModal(false), 2000);
    } catch (e: any) {
      console.error(e);
      const errorMsg = translateError(e);
      setPublishStatus("Erro na publicação Instagram.");
      addToast({ type: 'error', message: `Erro Instagram: ${errorMsg}` });
    }
  };


  const handleDownloadRSS = () => {
    if (generatedPosts.length === 0) {
      addToast({ type: 'warning', message: 'Gere posts primeiro.' });
      return;
    }
    const xml = generatePinterestRSS(generatedPosts);
    const blob = new Blob([xml], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinterest-feed-${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Feed RSS baixado! Faça upload no seu site.' });
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 font-sans pb-40">

      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[150px] rounded-full animate-pulse-slow italic" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 pb-24 md:pb-12 max-w-7xl animate-fade-in">

        {/* Premium Header */}
        <div className="relative z-20 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-up">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Gemini Pro Reasoning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 filter drop-shadow-2xl">
              Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Pulse</span>
            </h1>
            <p className="text-lg text-[var(--text-premium-muted)] font-light leading-relaxed max-w-lg">
              O coração da sua estratégia digital: transforme tendências em conteúdo viral com raciocínio de IA avançado.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-4">
            <Button
              onClick={() => setShowLibraryModal(true)}
              variant="ghost"
              className="h-12 px-6 border-white/10 hover:bg-white/5 text-[var(--text-premium-muted)] hover:text-white group rounded-2xl"
              title="Importar da Biblioteca"
            >
              <div className="flex items-center gap-2">
                <ClipboardDocumentIcon className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Importar Conteúdo</span>
              </div>
            </Button>


            <HowToUse
              title="Guia Rápido"
              steps={[
                "1. Tendência ou Ideia: Input manual ou via Trend Hunter.",
                "2. Gerar Conteúdo: '1 Post' para agilidade ou 'Série' para profundidade.",
                "3. Refino: Edite textos e hashtags gerados.",
                "4. Visual: Gere imagens ultra-realistas ou use prompts sugeridos.",
                "5. Publicação: Salve na Biblioteca ou exporte."
              ]}
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8 relative z-20">
          <div className="bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('standard')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${viewMode === 'standard' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-400 hover:text-white'}`}
            >
              Standard Mode
            </button>
            <button
              onClick={() => setViewMode('flash')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${viewMode === 'flash' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25' : 'text-gray-400 hover:text-white'}`}
            >
              <BoltIcon className="w-4 h-4" />
              Flash Designer
            </button>
          </div>
        </div>

        {viewMode === 'flash' ? (
          <div className="h-[800px] w-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 animate-fade-in">
            <FlashDesigner />
          </div>
        ) : (
          <>
            <LiquidGlassCard className="p-4 md:p-6 mb-6 md:mb-8" blurIntensity="xl" glowIntensity="sm">

              <h3 className="text-xl font-semibold text-gray-100 mb-5">Input Criativo</h3>

              {/* Menu de Prompts (Seasonal Templates) */}
              {/* Menu de Prompts (Seasonal Templates) REPLACED */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowPromptLibrary(true)}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-md"
                >
                  <div className="p-1.5 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400/80">Biblioteca</span>
                    <span className="text-sm font-bold text-white">Matrizes Criativas</span>
                  </div>
                </button>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="content-prompt-area" className="md:col-span-2">
                  <Textarea
                    id="contentPrompt"
                    label="Descreva o conteúdo que deseja gerar (Colagem Automática Ativa):"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    placeholder="Cole sua tendência ou descreva sua ideia..."
                    className="w-full"
                  />
                </div>
                <div id="target-audience-selector">
                  <TargetAudienceDropdown selectedAudience={targetAudience} onAudienceChange={setTargetAudience} />
                </div>
              </div>

              <div id="generator-action-buttons" className="flex flex-col sm:flex-row gap-3 mt-4">
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
                  {generatedPosts.map((post, index) => (
                    <GeneratedPostCard
                      key={post.id}
                      post={post}
                      index={index}
                      loadingImages={loadingImages}
                      aspectRatio={aspectRatio}
                      userId={userId}
                      onUpdatePostField={updatePostField}
                      onRefineImagePrompt={handleRefineImagePrompt}
                      onSavePrompt={handleSavePrompt}
                      onGenerateImageFinal={handleGenerateImageFinal}
                      onSetAspectRatio={setAspectRatio}
                      onSaveToDrive={handleSaveToDrive}
                      onDownloadImage={handleDownloadImage}
                      onOpenPublishModal={handleOpenPublishModal}
                      onPinterestShare={handlePinterestShare}
                    />
                  ))}
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
                  <div className="flex flex-col gap-4 mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tema do Avatar</label>
                    <select
                      value={avatarTheme}
                      onChange={(e) => setAvatarTheme(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-200 outline-none focus:border-primary/50"
                    >
                      <option value="Profissional">👔 Profissional</option>
                      <option value="Casual">👕 Casual / Lifestyle</option>
                      <option value="Luxury">💎 Luxo / High-End</option>
                      <option value="Geek">🎮 Geek / Tech</option>
                      <option value="Fitness">💪 Saúde / Fitness</option>
                      <option value="Cyberpunk">🌆 Cyberpunk / Futurista</option>
                    </select>
                  </div>
                  <Button onClick={generateAvatars} isLoading={loadingAvatars} variant="secondary" className="w-full">
                    {loadingAvatars ? 'Processando...' : 'GERAR PERSONAS COM TEMA'}
                  </Button>

                  {avatars.length > 0 && (
                    <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs text-purple-400 font-bold">
                        <SparklesIcon className="w-4 h-4" />
                        <span>{avatars.length} Personas Criadas com Sucesso!</span>
                      </div>
                      <Button
                        onClick={handleDownloadAvatarsTxt}
                        variant="ghost"
                        size="sm"
                        className="w-full text-[10px] bg-white/5 hover:bg-white/10 border-white/10"
                      >
                        <ArrowDownTrayIcon className="w-3 h-3 mr-2" />
                        BAIXAR EM TXT
                      </Button>
                    </div>
                  )}
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

              {/* Pinterest Feed RSS */}
              <div className="bg-[var(--background-input)] p-6 rounded-2xl border border-[var(--border-default)]">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.069-8.702-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z" /></svg>
                  <h4 className="font-bold text-white">Automação RSS (Pinterest)</h4>
                </div>
                <p className="text-xs text-muted mb-4">Gere um arquivo XML com seus posts atuais para conectar ao "Importar RSS" do Pinterest Business.</p>
                <Button onClick={handleDownloadRSS} variant="secondary" className="w-full border-orange-500/20 text-orange-200 bg-orange-500/10 hover:bg-orange-500/20">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  BAIXAR FEED RSS (.XML)
                </Button>
              </div>
            </div>


            {/* Social Publish Modal */}
            {showPublishModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPublishModal(false)}>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setShowPublishModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <span className="sr-only">Fechar</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <PaperAirplaneIcon className="w-6 h-6 text-primary" />
                    Publicar Agora
                  </h2>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Legenda Final</label>
                      <textarea
                        className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all placeholder-gray-600 text-sm"
                        rows={6}
                        value={publishMessage}
                        onChange={(e) => setPublishMessage(e.target.value)}
                      />
                    </div>

                    {publishImage && (
                      <div className="flex items-center gap-3 p-3 bg-black/50 rounded-xl border border-white/10">
                        <img src={publishImage} className="w-12 h-12 object-cover rounded-lg" alt="Preview" />
                        <div className="overflow-hidden">
                          <p className="text-xs text-green-400 font-bold">Imagem Anexada</p>
                          <p className="text-[10px] text-gray-500 truncate">{publishImage}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button
                        className="flex-1 px-4 py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#166fe5] transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1877F2]/20 hover:shadow-[#1877F2]/40"
                        onClick={handleFacebookPublish}
                        disabled={!publishMessage || !!publishStatus}
                      >
                        Facebook
                      </button>
                      <button
                        className="flex-1 px-4 py-3 bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white rounded-xl hover:opacity-90 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E1306C]/20 hover:shadow-[#E1306C]/40"
                        onClick={handleInstagramPublish}
                        disabled={!publishMessage || !publishImage || !!publishStatus}
                      >
                        Instagram
                      </button>
                    </div>
                    {publishStatus && (
                      <p className="text-sm text-center text-primary mt-2 flex items-center justify-center gap-2">
                        <LoadingSpinner className="w-4 h-4" /> {publishStatus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <LibraryImportModal
              isOpen={showLibraryModal}
              onClose={() => setShowLibraryModal(false)}
              onSelect={(content) => {
                setPrompt(content);
                addToast({ type: 'success', message: 'Conteúdo carregado da biblioteca!' });
              }}
              initialFilter="text"
            />

            {/* Pinterest Publish Modal */}
            {showPinterestModal && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={() => setShowPinterestModal(false)}>
                <div className="bg-[#111] border border-[#E60023]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setShowPinterestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                  </button>

                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#E60023]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" /></svg>
                    Publicar Pin
                  </h2>

                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black/50 relative group">
                      <img src={publishImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Pin Preview" />
                    </div>

                    {/* Board Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Escolha a Pasta (Board)</label>
                      {pinterestLoading && pinterestBoards.length === 0 ? (
                        <div className="text-sm text-gray-400 animate-pulse">Carregando pastas...</div>
                      ) : (
                        <select
                          className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#E60023] focus:ring-1 focus:ring-[#E60023] outline-none appearance-none"
                          value={selectedBoardId}
                          onChange={(e) => setSelectedBoardId(e.target.value)}
                        >
                          <option value="" disabled>Selecione...</option>
                          {pinterestBoards.map(board => (
                            <option key={board.id} value={board.id}>{board.name}</option>
                          ))}
                        </select>
                      )}
                      {pinterestBoards.length === 0 && !pinterestLoading && (
                        <p className="text-xs text-red-400 mt-1">Nenhuma pasta encontrada. Crie uma no Pinterest primeiro.</p>
                      )}
                    </div>

                    {/* Description Edit */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descrição</label>
                      <textarea
                        className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-[#E60023] outline-none resize-none h-24"
                        value={publishMessage}
                        onChange={(e) => setPublishMessage(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handlePinterestPublish}
                      isLoading={pinterestLoading}
                      className="w-full bg-[#E60023] hover:bg-[#ad081b] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#E60023]/20"
                    >
                      Criar Pin Agora
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Library Modal */}
            {showPromptLibrary && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowPromptLibrary(false)}>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-purple-400" />
                      Biblioteca de Matrizes Criativas
                    </h2>
                    <button onClick={() => setShowPromptLibrary(false)} className="text-gray-500 hover:text-white transition-colors">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {SEASONAL_TEMPLATES.map((template, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          let promptValue = template.basePrompt;
                          try {
                            const parsed = JSON.parse(template.basePrompt);
                            if (parsed.image_prompt?.scene?.description) {
                              promptValue = parsed.image_prompt.scene.description;
                            } else if (parsed.image_prompt?.description) {
                              promptValue = parsed.image_prompt.description;
                            }
                          } catch (e) {
                            // Not JSON, use as is
                          }
                          setPrompt(promptValue);
                          setShowPromptLibrary(false);
                          addToast({ type: 'success', message: `Template "${template.label}" aplicado!` });
                        }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-100 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                            <span>{template.icon}</span>
                            {template.label}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-bold uppercase tracking-widest">
                            Prompt Estruturado
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{template.basePrompt.substring(0, 100)}..."</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <Button onClick={() => setShowPromptLibrary(false)} variant="secondary" size="sm">Fechar</Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>

  );
};

export default ContentGenerator;

