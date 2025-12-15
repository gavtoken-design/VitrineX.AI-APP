

import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { campaignBuilder } from '../services/ai';
import { saveCampaign } from '../services/core/firestore';
import { Campaign } from '../types';
import { useNavigate } from '../hooks/useNavigate'; // Custom hook for navigation
import { useToast } from '../contexts/ToastContext';

const CampaignBuilder: React.FC = () => {
  const [campaignPrompt, setCampaignPrompt] = useState<string>('');
  const [generatedCampaign, setGeneratedCampaign] = useState<Campaign | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { navigateTo } = useNavigate();
  const { addToast } = useToast();

  const handleCreateCampaign = useCallback(async () => {
    if (!campaignPrompt.trim()) {
      addToast({ type: 'warning', message: 'Por favor, forneça uma descrição para a campanha.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCampaign(null);
    setGeneratedVideoUrl(null);

    try {
      const { campaign, videoUrl } = await campaignBuilder(campaignPrompt);
      setGeneratedCampaign(campaign);
      setGeneratedVideoUrl(videoUrl);
      addToast({ type: 'success', title: 'Sucesso!', message: `Campanha "${campaign.name}" criada e salva com sucesso!` });
    } catch (err) {
      console.error('Error building campaign:', err);
      const errorMessage = `Falha ao criar campanha: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro na Criação', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [campaignPrompt, addToast]);

  const handleDownloadMaterials = useCallback(() => {
    if (!generatedCampaign) {
      addToast({ type: 'warning', message: 'Nenhum material de campanha para baixar.' });
      return;
    }
    const campaignData = JSON.stringify(generatedCampaign, null, 2);
    const blob = new Blob([campaignData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vitrinex-campaign-${generatedCampaign.name.replace(/\s/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'info', message: 'Download dos materiais iniciado.' });
  }, [generatedCampaign, addToast]);

  const handleAddCalendar = useCallback(() => {
    if (generatedCampaign) {
      navigateTo('SmartScheduler');
      addToast({ type: 'info', message: `Navegando para o calendário para agendar a campanha "${generatedCampaign.name}".` });
    } else {
      addToast({ type: 'warning', message: 'Nenhuma campanha gerada para adicionar ao calendário.' });
    }
  }, [generatedCampaign, navigateTo, addToast]);


  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Construtor de Campanhas</h2>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Descreva sua Campanha</h3>
        <Textarea
          id="campaignPrompt"
          label="Qual campanha você gostaria de criar? Seja o mais detalhado possível:"
          value={campaignPrompt}
          onChange={(e) => setCampaignPrompt(e.target.value)}
          rows={6}
          placeholder="Ex: 'Uma campanha de lançamento para um novo curso online de fotografia avançada, visando fotógrafos amadores que querem profissionalizar seus trabalhos, duração de 2 semanas, com foco em Instagram e Facebook.'"
        />
        <Button
          onClick={handleCreateCampaign}
          isLoading={loading}
          variant="primary"
          className="w-full md:w-auto mt-4"
        >
          {loading ? 'Criando Campanha...' : 'Criar Campanha'}
        </Button>
      </div>

      {generatedCampaign && (
        <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800">
          <h3 className="text-xl font-semibold text-textlight mb-5">Campanha Gerada: {generatedCampaign.name}</h3>
          <p className="text-textlight mb-6">
            <span className="font-semibold">Cronograma:</span> {generatedCampaign.timeline}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold text-textlight mb-4">Posts ({generatedCampaign.posts.length})</h4>
              <ul className="list-disc list-inside text-textlight space-y-3 max-h-64 overflow-y-auto bg-darkbg p-4 rounded-md border border-gray-700">
                {generatedCampaign.posts.map((post, index) => (
                  <li key={post.id || index} className="text-sm">
                    <strong>Post {index + 1}:</strong> {post.content_text.substring(0, 100)}...
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-textlight mb-4">Anúncios ({generatedCampaign.ads.length})</h4>
              <ul className="list-disc list-inside text-textlight space-y-3 max-h-64 overflow-y-auto bg-darkbg p-4 rounded-md border border-gray-700">
                {generatedCampaign.ads.map((ad, index) => (
                  <li key={ad.id || index} className="text-sm">
                    <strong>Ad {index + 1} ({ad.platform}):</strong> "{ad.headline}" - {ad.copy.substring(0, 70)}...
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {generatedVideoUrl && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-textlight mb-4">Vídeo da Campanha</h4>
              <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden border border-gray-700">
                <video controls src={generatedVideoUrl} className="w-full h-full object-contain"></video>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadMaterials} variant="primary" className="w-full sm:w-auto">Baixar Materiais</Button>
            <Button onClick={handleAddCalendar} variant="secondary" className="w-full sm:w-auto">Adicionar ao Calendário</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;
