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
import { saveAd } from '../services/core/firestore';
import { Ad } from '../types';
import { GEMINI_PRO_MODEL, GEMINI_IMAGE_PRO_MODEL, PLACEHOLDER_IMAGE_BASE64 } from '../constants';
import { Type } from '@google/genai';
import { useToast } from '../contexts/ToastContext';

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

  const { addToast } = useToast();

  const userId = 'mock-user-123';

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
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            copy: { type: Type.STRING },
            visual_description: { type: Type.STRING },
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
        model: GEMINI_IMAGE_PRO_MODEL,
        aspectRatio: '1:1', // Common for most platforms
        imageSize: '1K',
      });
      setGeneratedImageUrl(imageResponse.imageUrl || PLACEHOLDER_IMAGE_BASE64);
      newAd.media_url = imageResponse.imageUrl || undefined; // Add image URL to ad object

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


  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Estúdio de Anúncios</h2>

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Detalhes do Anúncio</h3>
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
          <label htmlFor="platform" className="block text-sm font-medium text-textlight mb-1">
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
          className="w-full md:w-auto mt-4"
        >
          {loading && !generatedAd ? 'Gerando Anúncio...' : 'Gerar Anúncio'}
        </Button>
      </div>

      {generatedAd && (
        <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 animate-slide-in-from-bottom duration-500">
          <h3 className="text-xl font-semibold text-textlight mb-5">Anúncio Gerado para {generatedAd.platform}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-textlight mb-3">Título:</h4>
              <p className="text-textdark text-xl font-medium mb-4">{generatedAd.headline}</p>

              <h4 className="text-lg font-semibold text-textlight mb-3">Texto:</h4>
              <div className="prose max-w-none text-textlight leading-relaxed bg-darkbg p-4 rounded-md h-auto min-h-[150px]" style={{ whiteSpace: 'pre-wrap' }}>
                {generatedAd.copy}
              </div>

              {/* Implante do VoiceoverControl */}
              <VoiceoverControl text={generatedAd.copy} />

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => addToast({ type: 'info', message: 'Funcionalidade em desenvolvimento.' })}>Gerar Variações</Button>
                <Button variant="outline" onClick={() => addToast({ type: 'info', message: 'Funcionalidade em desenvolvimento.' })}>Editar</Button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-textlight mb-3">Criativo Visual:</h4>
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
            <h4 className="text-lg font-semibold text-textlight mb-4">Salvar Criativo na Biblioteca</h4>
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
