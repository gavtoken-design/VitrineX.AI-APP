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
import { GEMINI_FLASH_MODEL, GEMINI_IMAGE_FLASH_MODEL, PLACEHOLDER_IMAGE_BASE64 } from '../constants';
import { useToast } from '../contexts/ToastContext';
import HowToUse from '../components/ui/HowToUse';

const ContentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(PLACEHOLDER_IMAGE_BASE64);
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [useThinking, setUseThinking] = useState<boolean>(false);

  // Library Save State
  const [savedItemName, setSavedItemName] = useState<string>('');
  const [savedItemTags, setSavedItemTags] = useState<string>('');

  const { addToast } = useToast();

  // Mock user ID
  const userId = 'mock-user-123';

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

      const imageResponse = await generateImage(imageDescription, { model: GEMINI_IMAGE_FLASH_MODEL });
      setGeneratedImageUrl(imageResponse.imageUrl || PLACEHOLDER_IMAGE_BASE64);
      setLoadingImage(false);

      const newPost: Post = {
        id: `post-${Date.now()}`,
        userId: userId,
        content_text: postContent,
        image_url: imageResponse.imageUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      setGeneratedPost(newPost);

      // AUTO-SAVE: Salvar na biblioteca
      try {
        await saveLibraryItem({
          id: `lib-${Date.now()}`,
          userId,
          name: `Post - ${postContent.substring(0, 30)}`,
          file_url: postContent,
          type: 'text',
          tags: ['content-generator', 'post', 'text'],
          createdAt: new Date().toISOString()
        });
        if (imageResponse.imageUrl) {
          await saveLibraryItem({
            id: `lib-img-${Date.now()}`,
            userId,
            name: `Imagem - ${postContent.substring(0, 30)}`,
            file_url: imageResponse.imageUrl,
            type: 'image',
            tags: ['content-generator', 'post', 'image'],
            createdAt: new Date().toISOString()
          });
        }
      } catch (saveError) {
        console.warn('Failed to auto-save to library:', saveError);
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
      const imageResponse = await generateImage(imageDescription, { model: GEMINI_IMAGE_FLASH_MODEL });
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
    <div className="container mx-auto py-8 lg:py-10">
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
