import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SaveToLibraryButton from '../components/features/SaveToLibraryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MediaActionsToolbar from '../components/features/MediaActionsToolbar';
import {
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  BookmarkSquareIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { uploadFileToDrive, isDriveConnected } from '../services/integrations/googleDrive';
import { generateText, generateImage } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { Post } from '../types';
import { GEMINI_FLASH_MODEL, GEMINI_IMAGE_MODEL, PLACEHOLDER_IMAGE_BASE64 } from '../constants';
import { uploadFile } from '../services/media/storage';
import { useToast } from '../contexts/ToastContext';
import HowToUse from '../components/ui/HowToUse';
import { useAuth } from '../contexts/AuthContext';
import { GEMINI_PRO_MODEL } from '../constants';
import TargetAudienceDropdown from '../components/ui/TargetAudienceDropdown';

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
  const [loadingImages, setLoadingImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [useThinking, setUseThinking] = useState<boolean>(false);
  const [targetAudience, setTargetAudience] = useState<string>('general');

  // Library Save State
  const [savedItemName, setSavedItemName] = useState<string>('');
  const [savedItemTags, setSavedItemTags] = useState<string>('');

  // Avatar & Analysis State
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [profileAnalysisText, setProfileAnalysisText] = useState('');
  const [profileAnalysisResult, setProfileAnalysisResult] = useState('');
  const [loadingProfileAnalysis, setLoadingProfileAnalysis] = useState(false);
  const [creativeIdeas, setCreativeIdeas] = useState<string[]>([]);
  const [loadingCreativeIdeas, setLoadingCreativeIdeas] = useState(false);
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
          setPrompt(`Tópico: ${data.topic}\nInsight: ${data.insight}\nIdeia: ${data.contentIdea}\n\nCrie um post engajador sobre isso.`);
          addToast({ type: 'info', title: 'Contexto Carregado', message: `Trazendo dados de tendência sobre "${data.topic}"` });
        }
        localStorage.removeItem('vitrinex_pending_context');
      } catch (e) {
        console.error('Error parsing pending context', e);
      }
    }
  }, [addToast]);

  const generateAvatars = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Insira uma tendência primeiro.' });
      return;
    }

    setLoadingAvatars(true);
    try {
      const avatarPrompt = `Analise esta tendência e gere 4 personas distintas de compradores em formato JSON:

Tendência: "${prompt}"

Para cada persona, forneça:
- id (string única)
- name (nome fictício)
- age (faixa etária, ex: "25-35")
- occupation (ocupação)
- interests (array de interesses)
- painPoints (array de dores/necessidades)
- buyingBehavior (comportamento de compra em uma frase)

Formate como array JSON válido.`;

      const response = await generateText(avatarPrompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json'
      });

      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedAvatars: Avatar[] = JSON.parse(cleanResponse);
      setAvatars(parsedAvatars);
      addToast({ type: 'success', message: `${parsedAvatars.length} avatares gerados!` });
    } catch (error) {
      console.error('Erro ao gerar avatares:', error);
      addToast({ type: 'error', message: 'Falha ao processar dados dos avatares. Tente novamente.' });
    } finally {
      setLoadingAvatars(false);
    }
  }, [prompt, addToast]);

  const analyzeProfile = useCallback(async () => {
    if (!profileAnalysisText.trim()) {
      addToast({ type: 'warning', message: 'Insira um texto para análise.' });
      return;
    }

    setLoadingProfileAnalysis(true);
    try {
      const analysisPrompt = `Identifique o perfil de avatar/persona baseado neste texto:

"${profileAnalysisText}"

Forneça:
- Segmento demográfico
- Principais características
- Interesses prováveis
- Dores e necessidades
- Como abordar essa persona`;

      const response = await generateText(analysisPrompt, {
        model: GEMINI_PRO_MODEL
      });

      setProfileAnalysisResult(response);
      addToast({ type: 'success', message: 'Perfil analisado!' });
    } catch (error) {
      console.error('Erro na análise:', error);
      addToast({ type: 'error', message: 'Falha na análise de perfil.' });
    } finally {
      setLoadingProfileAnalysis(false);
    }
  }, [profileAnalysisText, addToast]);

  const generateCreativeIdeas = useCallback(async (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setLoadingCreativeIdeas(true);

    try {
      const ideasPrompt = `Gere 5 prompts perfeitos para criativos visuais (imagens) baseados nesta persona:

Nome: ${avatar.name}
Idade: ${avatar.age}
Ocupação: ${avatar.occupation}
Interesses: ${avatar.interests.join(', ')}
Dores: ${avatar.painPoints.join(', ')}
Comportamento: ${avatar.buyingBehavior}

Cada prompt deve ser otimizado para Imagen 4.0 e focado em:
- Conectar emocionalmente com a persona
- Resolver uma dor específica
- Usar elementos visuais que ressoam com os interesses

Formate como array JSON de strings (apenas os prompts).`;

      const response = await generateText(ideasPrompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json'
      });

      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const ideas: string[] = JSON.parse(cleanResponse);
      setCreativeIdeas(ideas);
      addToast({ type: 'success', message: `${ideas.length} ideias criativas geradas!` });
    } catch (error) {
      console.error('Erro ao gerar ideias:', error);
      addToast({ type: 'error', message: 'Falha ao processar ideias criativas. Tente novamente.' });
    } finally {
      setLoadingCreativeIdeas(false);
    }
  }, [addToast]);

  const formatAvatarText = (avatar: Avatar) => {
    return `PERFIL DE AVATAR - VITRINEX AI
Nome: ${avatar.name}
Idade: ${avatar.age}
Ocupação: ${avatar.occupation}

== INTERESSES ==
${avatar.interests.map(i => `- ${i}`).join('\n')}

== DORES E NECESSIDADES ==
${avatar.painPoints.map(p => `- ${p}`).join('\n')}

== COMPORTAMENTO DE COMPRA ==
${avatar.buyingBehavior}
`.trim();
  };

  const handleDownloadAvatar = useCallback((avatar: Avatar) => {
    const text = formatAvatarText(avatar);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avatar-${avatar.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Avatar baixado!' });
  }, [addToast]);

  const handleCopyAvatar = useCallback((avatar: Avatar) => {
    const text = formatAvatarText(avatar);
    navigator.clipboard.writeText(text);
    addToast({ type: 'success', message: 'Avatar copiado!' });
  }, [addToast]);

  const handleSaveAvatarToLibrary = useCallback(async (avatar: Avatar) => {
    try {
      const text = formatAvatarText(avatar);
      await saveLibraryItem({
        id: `avatar-${Date.now()}`,
        userId,
        type: 'text',
        name: `Persona: ${avatar.name}`,
        file_url: text,
        tags: ['avatar', 'persona', ...avatar.interests.slice(0, 3)],
        createdAt: new Date().toISOString()
      });
      addToast({ type: 'success', message: 'Avatar salvo na biblioteca!' });
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: 'Erro ao salvar avatar.' });
    }
  }, [userId, addToast]);

  const generateContent = useCallback(async (isWeekly: boolean = false) => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', title: 'Atenção', message: 'Por favor, insira um prompt para gerar conteúdo.' });
      return;
    }

    setIsGenerating(true);
    setLoadingText(true);
    setGeneratedPosts([]);
    setSavedItemName('');
    setSavedItemTags('');

    try {
      let fullPrompt = `Generate a compelling social media post for: "${prompt}".`;
      if (isWeekly) {
        fullPrompt = `Generate a series of 3 to 5 unique social media post ideas (including text and image descriptions for each) for a content plan based on: "${prompt}". Format as a JSON array of objects with 'text' and 'image_description' keys.`;
      } else {
        fullPrompt = `Generate a compelling social media post (text only) for: "${prompt}". Include relevant hashtags.`;
      }

      if (targetAudience !== 'general') {
        fullPrompt += ` The target audience is ${targetAudience}.`;
      }

      const textResponse = await generateText(fullPrompt, { model: GEMINI_FLASH_MODEL, useThinking: useThinking });
      setLoadingText(false);

      let postsToProcess: { text: string; image_description: string }[] = [];

      if (isWeekly) {
        try {
          const cleanResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          postsToProcess = JSON.parse(cleanResponse);
        } catch (jsonError) {
          console.warn("Failed to parse weekly posts as JSON, using raw text.", jsonError);
          postsToProcess = [{ text: textResponse, image_description: prompt }];
        }
      } else {
        postsToProcess = [{ text: textResponse, image_description: `An image illustrating the post content: "${textResponse.substring(0, 100)}..."` }];
      }

      const newPosts: Post[] = postsToProcess.map((p, index) => ({
        id: `post-${Date.now()}-${index}`,
        userId: userId,
        content_text: p.text,
        image_url: PLACEHOLDER_IMAGE_BASE64,
        createdAt: new Date().toISOString(),
      }));
      setGeneratedPosts(newPosts);

      for (const post of newPosts) {
        setLoadingImages(prev => [...prev, post.id]);
        try {
          const imageResponse = await generateImage(post.content_text.substring(0, 150), { model: GEMINI_IMAGE_MODEL });

          let finalImageUrl = PLACEHOLDER_IMAGE_BASE64;
          if (imageResponse.type === 'image') {
            finalImageUrl = imageResponse.imageUrl;
          } else if (imageResponse.type === 'error') {
            console.error(`Post ${post.id} image generation error:`, imageResponse.message);
          }

          if (finalImageUrl.startsWith('data:') && user) {
            const res = await fetch(finalImageUrl);
            const blob = await res.blob();
            const file = new File([blob], `post-image-${Date.now()}.png`, { type: 'image/png' });
            const uploadedItem = await uploadFile(file, user.id, 'image');
            finalImageUrl = uploadedItem.file_url;
          }

          setGeneratedPosts(prev => prev.map(p => p.id === post.id ? { ...p, image_url: finalImageUrl } : p));

          if (user) {
            await saveLibraryItem({
              id: `lib-txt-${post.id}`, userId: user.id, name: `Post - ${post.content_text.substring(0, 30)}`,
              file_url: post.content_text, type: 'text', tags: ['content-generator', 'post', 'text'], createdAt: new Date().toISOString()
            });
            if (finalImageUrl !== PLACEHOLDER_IMAGE_BASE64 && !finalImageUrl.startsWith('data:')) {
              await saveLibraryItem({
                id: `lib-img-${post.id}`, userId: user.id, name: `Imagem - ${post.content_text.substring(0, 30)}`,
                file_url: finalImageUrl, type: 'image', tags: ['content-generator', 'post', 'image'], createdAt: new Date().toISOString()
              });
            }
          }
        } catch (imgErr) {
          console.error(`Failed to generate or upload image for post ${post.id}`, imgErr);
          addToast({ type: 'error', message: `Falha ao gerar imagem para um dos posts.` });
        } finally {
          setLoadingImages(prev => prev.filter(id => id !== post.id));
        }
      }

      addToast({ type: 'success', title: 'Conteúdo Gerado', message: `${newPosts.length} post(s) foram gerados.` });

    } catch (err) {
      console.error('Error generating content:', err);
      addToast({ type: 'error', title: 'Erro na Geração', message: `Falha: ${err instanceof Error ? err.message : String(err)}` });
      setLoadingText(false);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, userId, addToast, targetAudience, user, useThinking]);

  const handleGenerateOnePost = useCallback(() => generateContent(false), [generateContent]);
  const handleGenerateWeek = useCallback(() => generateContent(true), [generateContent]);

  const handleRegenerateImage = useCallback(async (postId: string) => {
    const postToUpdate = generatedPosts.find(p => p.id === postId);
    if (!postToUpdate) return;

    setLoadingImages(prev => [...prev, postId]);
    try {
      const imageDescription = `An alternative image for: "${postToUpdate.content_text.substring(0, 100)}..."`;
      const imageResponse = await generateImage(imageDescription, { model: GEMINI_IMAGE_MODEL });

      let finalImageUrl = PLACEHOLDER_IMAGE_BASE64;
      if (imageResponse.type === 'image') {
        finalImageUrl = imageResponse.imageUrl;
      } else if (imageResponse.type === 'error') {
        throw new Error(imageResponse.message);
      }

      if (finalImageUrl.startsWith('data:') && user) {
        const res = await fetch(finalImageUrl);
        const blob = await res.blob();
        const file = new File([blob], `post-image-${Date.now()}.png`, { type: 'image/png' });
        const uploadedItem = await uploadFile(file, user.id, 'image');
        finalImageUrl = uploadedItem.file_url;
      }

      setGeneratedPosts(prev => prev.map(p => p.id === postId ? { ...p, image_url: finalImageUrl } : p));
      addToast({ type: 'success', message: 'Imagem regenerada com sucesso.' });
    } catch (err) {
      console.error('Error regenerating image:', err);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao regenerar imagem.' });
    } finally {
      setLoadingImages(prev => prev.filter(id => id !== postId));
    }
  }, [generatedPosts, addToast, user]);

  const handleSaveToDrive = async (post: Post) => {
    if (!post) return;
    try {
      const isConnected = await isDriveConnected();
      if (!isConnected) {
        addToast({ type: 'warning', message: 'Conecte o Google Drive nas Configurações primeiro.' });
        return;
      }
      addToast({ type: 'info', message: 'Enviando para o Drive...' });
      const textBlob = new Blob([post.content_text], { type: 'text/plain' });
      await uploadFileToDrive(textBlob, `post-texto-${Date.now()}.txt`, 'text/plain');
      if (post.image_url && post.image_url !== PLACEHOLDER_IMAGE_BASE64) {
        const res = await fetch(post.image_url);
        const blob = await res.blob();
        await uploadFileToDrive(blob, `post-imagem-${Date.now()}.png`, 'image/png');
      }
      addToast({ type: 'success', message: 'Arquivos salvos no Google Drive!' });
    } catch (e: any) {
      console.error(e);
      addToast({ type: 'error', message: `Erro ao salvar no Drive: ${e.message}` });
    }
  };

  return (
    <div className="container mx-auto py-8 lg:py-10 pb-40 lg:pb-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Content Generator</h2>

      <HowToUse
        title="Como Gerar Conteúdo"
        steps={[
          "Digite uma descrição do conteúdo que deseja criar",
          "Escolha o público-alvo para direcionar a comunicação",
          "Escolha entre gerar 1 post ou um conjunto de posts",
          "Clique em 'Gerar' e aguarde a mágica acontecer",
          "Revise o texto e as imagens geradas para cada post",
          "Use 'Regenerar Imagem' se quiser uma imagem diferente para um post específico",
          "Salve na biblioteca ou no Google Drive individualmente"
        ]}
      />

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Gerar Novo Conteúdo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            id="contentPrompt"
            label="Descreva o conteúdo que você deseja gerar:"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="Ex: 'Um post sobre os benefícios da meditação', ou 'Uma série de posts sobre dicas de produtividade'"
            className="md:col-span-2"
          />
          <TargetAudienceDropdown selectedAudience={targetAudience} onAudienceChange={setTargetAudience} />
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted">
          <input type="checkbox" id="useThinking" checked={useThinking} onChange={(e) => setUseThinking(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-600 bg-gray-700" />
          <label htmlFor="useThinking" className="cursor-pointer select-none flex items-center gap-1">
            Ativar <b>Thinking Mode</b> 🧠 <span className="text-xs text-gray-500">(Raciocínio Avançado)</span>
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={handleGenerateOnePost} isLoading={isGenerating} variant="primary" className="w-full sm:w-auto">
            {isGenerating ? 'Gerando...' : 'Gerar 1 Post'}
          </Button>
          <Button onClick={handleGenerateWeek} isLoading={isGenerating} variant="secondary" className="w-full sm:w-auto">
            {isGenerating ? 'Gerando...' : 'Gerar Série'}
          </Button>
        </div>
      </div>

      {loadingText && <div className="flex justify-center"><LoadingSpinner /></div>}
      {generatedPosts.length > 0 && (
        <div className="space-y-8">
          {generatedPosts.map((post) => {
            const isImageLoading = loadingImages.includes(post.id);
            return (
              <div key={post.id} className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 animate-slide-in-from-bottom duration-500">
                <h3 className="text-xl font-semibold text-textlight mb-5">Post Gerado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <h4 className="text-lg font-semibold text-textlight mb-3">Texto do Post</h4>
                    <div className="prose max-w-none text-textlight leading-relaxed bg-darkbg p-4 rounded-md h-full min-h-[150px]" style={{ whiteSpace: 'pre-wrap' }}>
                      {post.content_text}
                    </div>
                    <button
                      onClick={() => {
                        const blob = new Blob([post.content_text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `vitrinex-texto-${post.id}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        addToast({ type: 'success', message: 'Texto baixado como .txt' });
                      }}
                      className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-2 rounded border border-blue-900 text-sm font-medium transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" /> Baixar TXT
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-lg font-semibold text-textlight mb-3">Imagem do Post</h4>
                    {isImageLoading ? (
                      <div className="flex items-center justify-center h-48 bg-gray-900 rounded-md"><LoadingSpinner /></div>
                    ) : (
                      <img src={post.image_url} alt="Generated content visual" className="w-full h-48 object-contain rounded-md border border-gray-700 mb-4" />
                    )}
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => handleRegenerateImage(post.id)} isLoading={isImageLoading} variant="outline" className="w-full sm:w-auto">
                        {isImageLoading ? 'Regenerando...' : 'Regenerar Imagem'}
                      </Button>
                      <MediaActionsToolbar
                        mediaUrl={post.image_url || ''}
                        fileName={`vitrinex-post-${post.id}.png`}
                        shareTitle="Confira este post!"
                        shareText={post.content_text}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h4 className="text-lg font-semibold text-textlight mb-4">Ações</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <SaveToLibraryButton
                      content={post.image_url || ''} type="image" userId={userId}
                      initialName={`Imagem Post - ${post.content_text.substring(0, 20)}`}
                      tags={['content-generator', 'image']} label="Salvar Apenas Imagem"
                      variant="secondary" disabled={!post.image_url || post.image_url === PLACEHOLDER_IMAGE_BASE64 || isImageLoading} className="w-full sm:w-auto"
                    />
                    <SaveToLibraryButton
                      content={post.content_text} type="text" userId={userId}
                      initialName={`Texto Post - ${post.content_text.substring(0, 20)}`}
                      tags={['content-generator', 'text']} label="Salvar Apenas Texto"
                      variant="outline" className="w-full sm:w-auto"
                    />
                    <Button onClick={() => handleSaveToDrive(post)} variant="ghost" className="w-full sm:w-auto text-blue-400 hover:bg-blue-900/20 border border-blue-900/30">
                      <CloudIcon className="w-5 h-5 mr-2" />
                      Salvar no Drive
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8 mt-8">
        <h3 className="text-xl font-semibold text-textlight mb-4">Perfis de Avatar</h3>
        <p className="text-muted text-sm mb-4">Gere 4 personas distintas de compradores baseadas na tendência acima</p>
        <Button
          onClick={generateAvatars}
          isLoading={loadingAvatars}
          variant="secondary"
          className="mb-4"
        >
          {loadingAvatars ? 'Gerando Avatares...' : 'Gerar 4 Avatares'}
        </Button>

        {avatars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {avatars.map((avatar) => (
              <div key={avatar.id} className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-textlight">{avatar.name}</h4>
                    <p className="text-sm text-muted">{avatar.age} • {avatar.occupation}</p>
                  </div>
                  <Button
                    onClick={() => generateCreativeIdeas(avatar)}
                    variant="outline"
                    className="text-xs py-1 px-2"
                  >
                    Gerar Ideias
                  </Button>
                </div>

                <div className="flex gap-2 mb-3">
                  <button onClick={() => handleDownloadAvatar(avatar)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors" title="Baixar Avatar (TXT)">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleCopyAvatar(avatar)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors" title="Copiar Texto">
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleSaveAvatarToLibrary(avatar)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors" title="Salvar na Biblioteca">
                    <BookmarkSquareIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-textlight">Interesses:</strong>
                    <ul className="list-disc list-inside text-muted">
                      {avatar.interests.map((interest, i) => (<li key={i}>{interest}</li>))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-textlight">Dores:</strong>
                    <ul className="list-disc list-inside text-muted">
                      {avatar.painPoints.map((pain, i) => (<li key={i}>{pain}</li>))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-textlight">Comportamento:</strong>
                    <p className="text-muted">{avatar.buyingBehavior}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8" >
        <h3 className="text-xl font-semibold text-textlight mb-4">Análise de Perfil</h3>
        <p className="text-muted text-sm mb-4">Cole um texto e a IA identificará o perfil do avatar</p>
        <Textarea
          id="profileAnalysisText"
          label=""
          value={profileAnalysisText}
          onChange={(e) => setProfileAnalysisText(e.target.value)}
          rows={4}
          placeholder="Cole aqui um texto, post ou descrição para identificar o perfil da persona..."
          className="mb-3"
        />
        <Button
          onClick={analyzeProfile}
          isLoading={loadingProfileAnalysis}
          variant="secondary"
        >
          {loadingProfileAnalysis ? 'Analisando...' : 'Analisar Perfil'}
        </Button>

        {profileAnalysisResult && (
          <div className="bg-surface p-4 rounded-lg border border-border mt-4">
            <h4 className="font-semibold text-textlight mb-2">Resultado da Análise:</h4>
            <pre className="text-sm text-muted whitespace-pre-wrap">{profileAnalysisResult}</pre>
          </div>
        )}
      </div>

      {creativeIdeas.length > 0 && selectedAvatar && (
        <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8 animate-slide-in-from-bottom">
          <h3 className="text-xl font-semibold text-textlight mb-2">Ideias de Criativos</h3>
          <p className="text-muted text-sm mb-4">
            Baseado na persona: <strong>{selectedAvatar.name}</strong>
          </p>
          <div className="space-y-3">
            {creativeIdeas.map((idea, index) => (
              <div key={index} className="bg-surface p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-primary">Prompt {index + 1}</span>
                    <p className="text-sm text-textlight mt-1">{idea}</p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(idea);
                      addToast({ type: 'success', message: 'Prompt copiado!' });
                    }}
                    variant="outline"
                    className="text-xs py-1 px-2 flex-shrink-0"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
