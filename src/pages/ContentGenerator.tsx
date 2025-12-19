import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SaveToLibraryButton from '../components/features/SaveToLibraryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MediaActionsToolbar from '../components/features/MediaActionsToolbar'; // NOVO
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { generateText, generateImage } from '../services/ai';
import { savePost } from '../services/core/firestore';
import { saveLibraryItem } from '../services/core/db';
import { Post } from '../types';
import { GEMINI_FLASH_MODEL, GEMINI_IMAGE_MODEL, PLACEHOLDER_IMAGE_BASE64 } from '../constants';
import { uploadFile } from '../services/media/storage';
import { useToast } from '../contexts/ToastContext';
import HowToUse from '../components/ui/HowToUse';

import { useAuth } from '../contexts/AuthContext';
import { GEMINI_PRO_MODEL } from '../constants';

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
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(PLACEHOLDER_IMAGE_BASE64);
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [useThinking, setUseThinking] = useState<boolean>(false);

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

  // Use real user ID if available, otherwise check login
  const userId = user?.id || 'guest-user';

  // Generate 4 Buyer Personas from Trend
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

      // Clean response if it contains markdown code blocks
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

  // Analyze Profile from Text
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

  // Generate Creative Ideas based on Avatar
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

      // Clean response if it contains markdown code blocks
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

  const generateContent = useCallback(async (isWeekly: boolean = false) => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', title: 'Atenção', message: 'Por favor, insira um prompt para gerar conteúdo.' });
      return;
    }

    setLoadingText(true);
    setLoadingImage(true);
    setGeneratedPost(null);
    setGeneratedImageUrl(PLACEHOLDER_IMAGE_BASE64);
    setSavedItemName('');
    setSavedItemTags('');

    try {
      let fullPrompt = `Generate a compelling social media post for: "${prompt}".`;
      if (isWeekly) {
        fullPrompt = `Generate 7 unique social media post ideas (including text and image descriptions for each) for a weekly content plan based on: "${prompt}". Format as a JSON array of objects with 'text' and 'image_description' keys.`;
      } else {
        fullPrompt = `Generate a compelling social media post (text only) for: "${prompt}". Include relevant hashtags.`;
      }

      const textResponse = await generateText(fullPrompt, {
        model: GEMINI_FLASH_MODEL,
        useThinking: useThinking
      });

      let postContent: string = '';
      let imageDescription: string = '';
      let weeklyPosts: { text: string; image_description: string }[] = [];

      if (isWeekly) {
        try {
          // Attempt to parse JSON for weekly generation
          weeklyPosts = JSON.parse(textResponse);
          if (weeklyPosts.length > 0) {
            postContent = weeklyPosts[0].text; // Just take the first one for display
            imageDescription = weeklyPosts[0].image_description || prompt;
          } else {
            postContent = "No weekly posts generated in JSON format. Here's the raw response: " + textResponse;
            imageDescription = prompt;
          }
        } catch (jsonError) {
          console.warn("Failed to parse weekly posts as JSON, using raw text.", jsonError);
          postContent = textResponse;
          imageDescription = prompt;
        }
      } else {
        postContent = textResponse;
        imageDescription = `An image illustrating the post content: "${postContent.substring(0, 100)}..."`;
      }

      setLoadingText(false);

      const imageResponse = await generateImage(imageDescription, { model: GEMINI_IMAGE_MODEL });

      let finalImageUrl = imageResponse.imageUrl || PLACEHOLDER_IMAGE_BASE64;

      // Upload to Storage if Base64 and User is logged in
      if (imageResponse.imageUrl && imageResponse.imageUrl.startsWith('data:') && user) {
        try {
          const res = await fetch(imageResponse.imageUrl);
          const blob = await res.blob();
          const file = new File([blob], `post-image-${Date.now()}.png`, { type: 'image/png' });
          const uploadedItem = await uploadFile(file, user.id, 'image');
          finalImageUrl = uploadedItem.file_url;
        } catch (uploadErr) {
          console.error("Failed to upload generated image to storage:", uploadErr);
        }
      }

      setGeneratedImageUrl(finalImageUrl);
      setLoadingImage(false);

      const newPost: Post = {
        id: `post-${Date.now()}`,
        userId: userId,
        content_text: postContent,
        image_url: finalImageUrl,
        createdAt: new Date().toISOString(),
      };
      setGeneratedPost(newPost);

      // AUTO-SAVE: Salvar na biblioteca (apenas se logado)
      if (user) {
        try {
          // Save Text Content
          await saveLibraryItem({
            id: `lib-${Date.now()}`,
            userId: user.id,
            name: `Post - ${postContent.substring(0, 30)}`,
            file_url: postContent,
            type: 'text',
            tags: ['content-generator', 'post', 'text'],
            createdAt: new Date().toISOString()
          });

          // Save Image Content (using the persistent URL)
          if (finalImageUrl && finalImageUrl !== PLACEHOLDER_IMAGE_BASE64) {
            const isBase64 = finalImageUrl.startsWith('data:');
            // Only save to library if it's a URL (already uploaded) or if we accept base64 (which we try to avoid)
            // Since we attempted upload above, finalImageUrl should be a URL if successful.
            if (!isBase64) {
              await saveLibraryItem({
                id: `lib-img-${Date.now()}`,
                userId: user.id,
                name: `Imagem - ${postContent.substring(0, 30)}`,
                file_url: finalImageUrl,
                type: 'image',
                tags: ['content-generator', 'post', 'image'],
                createdAt: new Date().toISOString()
              });
            } else {
              console.warn("Skipping auto-save of duplicate base64 image to library to prevent DB bloat.");
            }
          }
        } catch (saveError) {
          console.warn('Failed to auto-save to library:', saveError);
        }
      }

      addToast({ type: 'success', title: 'Conteúdo Gerado', message: 'Texto e imagem foram gerados com sucesso.' });

    } catch (err) {
      console.error('Error generating content:', err);
      addToast({ type: 'error', title: 'Erro na Geração', message: `Falha: ${err instanceof Error ? err.message : String(err)}` });
      setLoadingText(false);
      setLoadingImage(false);
    }
  }, [prompt, userId, addToast]);

  const handleGenerateOnePost = useCallback(() => generateContent(false), [generateContent]);
  const handleGenerateWeek = useCallback(() => generateContent(true), [generateContent]);

  const handleRegenerateImage = useCallback(async () => {
    if (!generatedPost) {
      addToast({ type: 'error', message: 'Por favor gere um post primeiro.' });
      return;
    }
    setLoadingImage(true);
    try {
      const imageDescription = `An alternative image for: "${generatedPost.content_text.substring(0, 100)}..."`;
      const imageResponse = await generateImage(imageDescription, { model: GEMINI_IMAGE_MODEL });
      setGeneratedImageUrl(imageResponse.imageUrl || PLACEHOLDER_IMAGE_BASE64);
      // Update the stored post with the new image URL
      if (generatedPost) {
        const updatedPost = { ...generatedPost, image_url: imageResponse.imageUrl || undefined };
        setGeneratedPost(updatedPost);
      }
      addToast({ type: 'success', message: 'Imagem regenerada com sucesso.' });
    } catch (err) {
      console.error('Error regenerating image:', err);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao regenerar imagem.' });
    } finally {
      setLoadingImage(false);
    }
  }, [generatedPost, addToast]);

  const handleSavePost = useCallback(async () => {
    if (!generatedPost) {
      addToast({ type: 'warning', message: 'Nenhum post para salvar.' });
      return;
    }
    setLoadingText(true); // Re-use loading state for saving
    try {
      const savedPost = await savePost(generatedPost); // Save to mock Firestore
      addToast({
        type: 'success',
        title: 'Salvo na Biblioteca',
        message: `Post "${savedPost.content_text.substring(0, 20)}..." salvo com sucesso!`
      });
    } catch (err) {
      console.error('Error saving post:', err);
      addToast({ type: 'error', title: 'Erro ao Salvar', message: 'Não foi possível salvar o post na biblioteca.' });
    } finally {
      setLoadingText(false);
    }
  }, [generatedPost, addToast]);

  return (
    <div className="container mx-auto py-8 lg:py-10 pb-40 lg:pb-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Content Generator</h2>

      <HowToUse
        title="Como Gerar Conteúdo"
        steps={[
          "Digite uma descrição do conteúdo que deseja criar",
          "Escolha entre gerar 1 post ou uma semana completa de posts",
          "Ative 'Thinking Mode' para raciocínio avançado (opcional)",
          "Clique em 'Gerar' e aguarde",
          "Revise o texto e imagem gerados",
          "Use 'Regenerar Imagem' se quiser uma imagem diferente",
          "Salve na biblioteca quando estiver satisfeito"
        ]}
        tips={[
          "Seja específico na descrição para melhores resultados",
          "Use 'Thinking Mode' para conteúdos complexos ou estratégicos",
          "Você pode baixar o texto como .txt separadamente",
          "Todos os posts são salvos automaticamente na biblioteca"
        ]}
      />

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Gerar Novo Conteúdo</h3>
        <Textarea
          id="contentPrompt"
          label="Descreva o conteúdo que você deseja gerar:"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Ex: 'Um post sobre os benefícios da meditação para o bem-estar mental', ou 'Ideias para 7 posts semanais sobre dicas de produtividade no trabalho.'"
        />
        <div className="flex items-center gap-2 mt-4 text-sm text-muted">
          <input
            type="checkbox"
            id="useThinking"
            checked={useThinking}
            onChange={(e) => setUseThinking(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-600 bg-gray-700"
          />
          <label htmlFor="useThinking" className="cursor-pointer select-none flex items-center gap-1">
            Ativar <b>Thinking Mode</b> 🧠 <span className="text-xs text-gray-500">(Raciocínio Avançado com Gemini 2.0 Thinking)</span>
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={handleGenerateOnePost}
            isLoading={loadingText && !generatedPost}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {loadingText && !generatedPost ? 'Gerando Post...' : 'Gerar 1 Post'}
          </Button>
          <Button
            onClick={handleGenerateWeek}
            isLoading={loadingText && !generatedPost && prompt.includes('semanal')}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {loadingText && !generatedPost && prompt.includes('semanal') ? 'Gerando Semana...' : 'Gerar Semana'}
          </Button>
        </div>
      </div>

      {/* Avatar Generation Section */}
      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
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
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-textlight">Interesses:</strong>
                    <ul className="list-disc list-inside text-muted">
                      {avatar.interests.map((interest, i) => (
                        <li key={i}>{interest}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-textlight">Dores:</strong>
                    <ul className="list-disc list-inside text-muted">
                      {avatar.painPoints.map((pain, i) => (
                        <li key={i}>{pain}</li>
                      ))}
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

      {/* Profile Analysis Section */}
      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
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

      {/* Creative Ideas Section */}
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

      {generatedPost && (
        <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 animate-slide-in-from-bottom duration-500">
          <h3 className="text-xl font-semibold text-textlight mb-5">Conteúdo Gerado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold text-textlight mb-3">Texto do Post</h4>
              {loadingText && !generatedPost.content_text ? ( // Check content_text specifically for text loading
                <LoadingSpinner />
              ) : (
                <div className="prose max-w-none text-textlight leading-relaxed bg-darkbg p-4 rounded-md h-full min-h-[150px]" style={{ whiteSpace: 'pre-wrap' }}>
                  {generatedPost.content_text}
                </div>
              )}
              <button
                onClick={() => {
                  const blob = new Blob([generatedPost.content_text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `vitrinex-texto-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  addToast({ type: 'success', message: 'Texto baixado como .txt' });
                }}
                className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-2 rounded border border-blue-900 text-sm font-medium transition-colors"
                title="Baixar texto como arquivo .txt"
              >
                <ArrowDownTrayIcon className="w-4 h-4" /> Baixar TXT
              </button>
            </div>
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold text-textlight mb-3">Imagem do Post</h4>
              {loadingImage ? (
                <div className="flex items-center justify-center h-48 bg-gray-900 rounded-md">
                  <LoadingSpinner />
                </div>
              ) : (
                <img
                  src={generatedImageUrl}
                  alt="Generated content visual"
                  className="w-full h-48 object-contain rounded-md border border-gray-700 mb-4"
                />
              )}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleRegenerateImage} isLoading={loadingImage} variant="outline" className="w-full sm:w-auto">
                  {loadingImage ? 'Regenerando...' : 'Regenerar Imagem'}
                </Button>
                {/* NOVO: Ações de Mídia */}
                <MediaActionsToolbar
                  mediaUrl={generatedImageUrl}
                  fileName={`vitrinex-post.png`}
                  shareTitle="Confira este post!"
                  shareText={generatedPost.content_text}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-lg font-semibold text-textlight mb-4">Salvar na Biblioteca</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="saveName"
                label="Nome do Item"
                value={savedItemName}
                onChange={(e) => setSavedItemName(e.target.value)}
                placeholder="Ex: Post Campanha Verão"
              />
              <Input
                id="saveTags"
                label="Tags (separadas por vírgula)"
                value={savedItemTags}
                onChange={(e) => setSavedItemTags(e.target.value)}
                placeholder="Ex: instagram, verão, promoção"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSavePost} variant="primary" isLoading={loadingText} disabled={!generatedPost} className="w-full sm:w-auto">
                {loadingText ? 'Salvando Post Completo...' : 'Salvar Post Completo'}
              </Button>
              <SaveToLibraryButton
                content={generatedImageUrl}
                type="image"
                userId={userId}
                initialName={savedItemName || 'Imagem Gerada'}
                tags={savedItemTags.split(',').map(t => t.trim()).filter(Boolean)}
                label="Salvar Apenas Imagem"
                variant="secondary"
                disabled={!generatedImageUrl || generatedImageUrl === PLACEHOLDER_IMAGE_BASE64}
                className="w-full sm:w-auto"
              />
              <SaveToLibraryButton
                content={generatedPost.content_text}
                type="text"
                userId={userId}
                initialName={savedItemName ? `${savedItemName} (Texto)` : 'Texto do Post'}
                tags={savedItemTags.split(',').map(t => t.trim()).filter(Boolean)}
                label="Salvar Apenas Texto"
                variant="outline"
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
