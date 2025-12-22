import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SaveToLibraryButton from '../components/features/SaveToLibraryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import VoiceoverControl from '../components/features/VoiceoverControl';
import MediaActionsToolbar from '../components/features/MediaActionsToolbar'; // NOVO
import { generateText, generateImage } from '../services/ai';
import { saveAd } from '../services/core/db';
import { Ad } from '../types';
import { GEMINI_PRO_MODEL, IMAGEN_ULTRA_MODEL, PLACEHOLDER_IMAGE_BASE64 } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { uploadFile } from '../services/media/storage';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

type Platform = 'Instagram' | 'Facebook' | 'TikTok' | 'Google' | 'Pinterest';

const platforms: Platform[] = ['Instagram', 'Facebook', 'TikTok', 'Google', 'Pinterest'];

const AdStudio: React.FC = () => {
  const [productDescription, setProductDescription] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram');
  const [generatedAd, setGeneratedAd] = useState<Ad | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(PLACEHOLDER_IMAGE_BASE64);
  const [loading, setLoading] = useState<boolean>(false);

  // Library Save State
  const [savedItemName, setSavedItemName] = useState<string>('');
  const [savedItemTags, setSavedItemTags] = useState<string>('');

  // Analysis State
  const [adToAnalyze, setAdToAnalyze] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);



  const { addToast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  const handleGenerateAd = useCallback(async () => {
    if (!productDescription.trim() || !targetAudience.trim()) {
      addToast({ type: 'warning', title: 'Campos Vazios', message: 'Por favor, preencha a descrição e o público-alvo.' });
      return;
    }

    setLoading(true);
    setGeneratedAd(null);
    setGeneratedImageUrl(PLACEHOLDER_IMAGE_BASE64);
    setSavedItemName('');
    setSavedItemTags('');

    try {
      const adPrompt = `Generate a compelling ad for ${selectedPlatform}.
      Product: "${productDescription}".
      Target Audience: "${targetAudience}".
      Provide a headline, ad copy, and a visual description for an image/video creative.
      Return the output as a JSON object with 'headline', 'copy', and 'visual_description' keys.`;

      const textResponse = await generateText(adPrompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            headline: { type: 'STRING' },
            copy: { type: 'STRING' },
            visual_description: { type: 'STRING' },
          },
          required: ['headline', 'copy', 'visual_description'],
        },
      });

      const adData = JSON.parse(textResponse);
      const newAd: Ad = {
        id: `ad-${Date.now()}`,
        userId: userId,
        platform: selectedPlatform,
        headline: adData.headline,
        copy: adData.copy,
        createdAt: new Date().toISOString(),
      };

      setGeneratedAd(newAd);

      const imageResponse = await generateImage(adData.visual_description, {
        model: IMAGEN_ULTRA_MODEL,
        aspectRatio: '1:1', // Common for most platforms
        numberOfImages: 1,
      });

      let finalImageUrl = PLACEHOLDER_IMAGE_BASE64;
      if (imageResponse.type === 'image') {
        finalImageUrl = imageResponse.imageUrl;
      } else if (imageResponse.type === 'error') {
        console.error("Ad image generation error:", imageResponse.message);
      }

      // Upload if Base64 and User Logged In
      if (imageResponse.type === 'image' && imageResponse.imageUrl.startsWith('data:') && user) {
        try {
          const res = await fetch(imageResponse.imageUrl);
          const blob = await res.blob();
          const file = new File([blob], `ad-creative-${Date.now()}.png`, { type: 'image/png' });
          const uploadedItem = await uploadFile(file, user.id, 'image');
          finalImageUrl = uploadedItem.file_url;
        } catch (uploadErr) {
          console.error("Failed to upload ad creative:", uploadErr);
        }
      }

      setGeneratedImageUrl(finalImageUrl);
      newAd.media_url = finalImageUrl; // Add PERSISTENT image URL to ad object

      addToast({ type: 'success', title: 'Anúncio Criado', message: 'Anúncio gerado com sucesso.' });

    } catch (err) {
      console.error('Error generating ad:', err);
      addToast({ type: 'error', title: 'Erro', message: `Falha ao gerar anúncio: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setLoading(false);
    }
  }, [productDescription, targetAudience, selectedPlatform, userId, addToast]);

  const handleSaveAd = useCallback(async () => {
    if (!generatedAd) {
      addToast({ type: 'warning', message: 'Nenhum anúncio para salvar.' });
      return;
    }
    setLoading(true); // Re-use loading state for saving
    try {
      const savedAd = await saveAd(generatedAd); // Save to mock Firestore
      addToast({
        type: 'success',
        title: 'Salvo',
        message: `Anúncio para "${savedAd.platform}" salvo com sucesso!`
      });
    } catch (err) {
      console.error('Error saving ad:', err);
      addToast({ type: 'error', title: 'Erro ao Salvar', message: 'Falha ao salvar o anúncio.' });
    } finally {
      setLoading(false);
    }
  }, [generatedAd, addToast]);

  const handleAnalyzeAd = useCallback(async () => {
    if (!adToAnalyze.trim()) {
      addToast({ type: 'warning', message: 'Cole um anúncio para analisar.' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const prompt = `Analise este anúncio criticamente como um especialista em marketing de alta conversão:

"${adToAnalyze}"

Forneça:
1. Score de efetividade (0-10)
2. Pontos fortes
3. Pontos fracos e o que pode ser melhorado
4. Sugestões práticas de copy.

Responda em Markdown estruturado.`;

      const response = await generateText(prompt, { model: GEMINI_PRO_MODEL });
      setAnalysisResult(response);
      addToast({ type: 'success', message: 'Análise concluída!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Falha na análise.' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [adToAnalyze, addToast]);

  const handleRewriteAd = useCallback(async (mode: 'minimalist' | 'engagement' | 'sell' | 'news') => {
    if (!generatedAd) return;

    setLoading(true);
    const rewriteModes = {
      minimalist: `Reescreva o anúncio abaixo de forma minimalista, direta e focando apenas no essencial.`,
      engagement: `Reescreva o anúncio abaixo focando em gerar engajamento, curtidas e comentários (use perguntas).`,
      sell: `Reescreva o anúncio abaixo com foco total em conversão/venda, benefícios claros e CTA forte.`,
      news: `Reescreva o anúncio abaixo como se fosse uma notícia urgente e importante de última hora.`
    };

    try {
      const prompt = `${rewriteModes[mode]}

Anúncio Original:
Título: ${generatedAd.headline}
Texto: ${generatedAd.copy}

Retorne no formato JSON: { "headline": "...", "copy": "..." }`;

      const response = await generateText(prompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json'
      });

      const data = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim());

      setGeneratedAd(prev => prev ? {
        ...prev,
        headline: data.headline,
        copy: data.copy
      } : null);

      addToast({ type: 'success', message: `Anúncio reescrito: Modo ${mode}` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Falha ao reescrever.' });
    } finally {
      setLoading(false);
    }
  }, [generatedAd, addToast]);


  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-title mb-8 flex items-center gap-3">
        <RocketLaunchIcon className="w-8 h-8 text-primary" />
        Estúdio de Anúncios
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Lado Esquerdo: Geração */}
        <div className="bg-surface p-6 rounded-xl shadow-card border border-gray-800">
          <h3 className="text-xl font-semibold text-title mb-5 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-accent" />
            Criar Novo Anúncio
          </h3>
          <Textarea
            id="productDescription"
            label="Descrição do Produto/Serviço:"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={4}
            placeholder="Ex: 'Um novo software de gestão de projetos com IA para pequenas e médias empresas que otimiza tarefas e comunicação.'"
          />
          <Input
            id="targetAudience"
            label="Público-alvo:"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Ex: 'Empreendedores, gerentes de equipe, freelancers que buscam eficiência.'"
          />

          <div className="mb-6">
            <label htmlFor="platform" className="block text-sm font-medium text-gray-100 mb-1">
              Plataforma:
            </label>
            <select
              id="platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-neonGreen focus:ring-offset-2 focus:ring-offset-lightbg sm:text-sm"
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleGenerateAd}
            isLoading={loading && !generatedAd}
            variant="primary"
            className="w-full mt-4 py-4 text-lg font-bold"
          >
            {loading && !generatedAd ? 'Gerando Anúncio...' : 'Gerar Anúncio Mágico'}
          </Button>
        </div>

        {/* Lado Direito: Análise */}
        <div className="bg-surface p-6 rounded-xl shadow-card border border-gray-800">
          <h3 className="text-xl font-semibold text-title mb-5 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-primary" />
            Analisar Copys Existentes
          </h3>
          <Textarea
            id="adToAnalyze"
            label="Cole aqui um anúncio para ser criticado pela IA:"
            value={adToAnalyze}
            onChange={(e) => setAdToAnalyze(e.target.value)}
            rows={6}
            placeholder="Ex: Cole aqui o texto daquele anúncio que não está convertendo..."
          />
          <Button
            onClick={handleAnalyzeAd}
            isLoading={isAnalyzing}
            variant="secondary"
            className="w-full mt-4"
          >
            {isAnalyzing ? 'Analisando...' : 'Analisar Efetividade'}
          </Button>

          {analysisResult && (
            <div className="mt-6 p-4 bg-black/20 rounded-lg border border-primary/20 animate-fade-in">
              <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                <CheckBadgeIcon className="w-4 h-4" /> Resultado da Análise
              </h4>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                {analysisResult.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {generatedAd && (
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800 animate-slide-in-from-bottom duration-500">
          <h3 className="text-xl font-semibold text-gray-100 mb-5">Anúncio Gerado para {generatedAd.platform}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-100 mb-3">Título:</h4>
              <p className="text-white text-xl font-medium mb-4">{generatedAd.headline}</p>

              <h4 className="text-lg font-semibold text-gray-100 mb-3">Texto:</h4>
              <div className="prose max-w-none text-gray-100 leading-relaxed bg-black/20 p-4 rounded-md h-auto min-h-[150px]" style={{ whiteSpace: 'pre-wrap' }}>
                {generatedAd.copy}
              </div>

              {/* Implante do VoiceoverControl */}
              <VoiceoverControl text={generatedAd.copy} />

              <div className="mt-6">
                <h5 className="text-sm font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BoltIcon className="w-4 h-4 text-accent" /> Modos de Reescrita IA
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleRewriteAd('minimalist')} className="text-xs border border-gray-700">
                    Minimalista
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRewriteAd('engagement')} className="text-xs border border-gray-700">
                    Engajamento
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRewriteAd('sell')} className="text-xs border border-gray-700">
                    Foco em Venda
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRewriteAd('news')} className="text-xs border border-gray-700">
                    Estilo Notícia
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-100 mb-3">Criativo Visual:</h4>
              <div className="w-full aspect-square bg-gray-900 rounded-md flex items-center justify-center overflow-hidden border border-gray-700">
                {loading && !generatedImageUrl ? ( // Only show spinner if image is actively loading
                  <LoadingSpinner />
                ) : (
                  <img
                    src={generatedImageUrl}
                    alt="Generated ad creative"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {/* Ações de Mídia agora usam o componente reutilizável */}
                <MediaActionsToolbar
                  mediaUrl={generatedImageUrl}
                  fileName={`vitrinex-ad-${selectedPlatform}.png`}
                  shareTitle={`Confira este anúncio para ${selectedPlatform}!`}
                  shareText={generatedAd.copy}
                />
                <Button onClick={handleSaveAd} variant="primary" isLoading={loading} disabled={!generatedAd} className="w-full sm:w-auto">
                  {loading && generatedAd ? 'Salvando Anúncio...' : 'Salvar Anúncio'}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Salvar Criativo na Biblioteca</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="adSaveName"
                label="Nome do Arquivo"
                value={savedItemName}
                onChange={(e) => setSavedItemName(e.target.value)}
                placeholder="Ex: Anúncio Black Friday"
              />
              <Input
                id="adSaveTags"
                label="Tags"
                value={savedItemTags}
                onChange={(e) => setSavedItemTags(e.target.value)}
                placeholder="Ex: ad, instagram, black friday"
              />
            </div>
            <SaveToLibraryButton
              content={generatedImageUrl}
              type="image"
              userId={userId}
              initialName={savedItemName || `Anúncio ${generatedAd.platform}`}
              tags={savedItemTags.split(',').map(t => t.trim()).filter(Boolean)}
              label="Salvar Apenas Criativo (Imagem)"
              variant="secondary"
              disabled={!generatedImageUrl || generatedImageUrl === PLACEHOLDER_IMAGE_BASE64}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdStudio;
