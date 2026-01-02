

import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { campaignBuilder } from '../services/ai';
import { saveCampaign } from '../services/core/db';
import { Campaign } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import {
  CurrencyDollarIcon,
  HashtagIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline';

const CampaignBuilder: React.FC = () => {
  const [campaignPrompt, setCampaignPrompt] = useState<string>('');
  const [generatedCampaign, setGeneratedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Profit Calculator State
  const [costPrice, setCostPrice] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(30); // Default 30%
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [profitAmount, setProfitAmount] = useState<number>(0);

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';

  const calculateROI = useCallback(() => {
    const price = costPrice * (1 + profitMargin / 100);
    setCalculatedPrice(price);
    setProfitAmount(price - costPrice);
  }, [costPrice, profitMargin]);

  React.useEffect(() => {
    calculateROI();
  }, [calculateROI]);

  const handleCreateCampaign = useCallback(async () => {
    if (!campaignPrompt.trim()) {
      addToast({ type: 'warning', message: 'Por favor, forneça uma descrição para a campanha.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCampaign(null);

    try {
      const { campaign } = await campaignBuilder(campaignPrompt, userId);

      // Save to Database
      await saveCampaign(campaign);

      setGeneratedCampaign(campaign);
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
    const campaignName = generatedCampaign.name.trim().replace(/\s/g, '-') || 'untitled-campaign';
    link.download = `vitrinex-campaign-${campaignName}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'info', message: 'Download dos materiais iniciado.' });
  }, [generatedCampaign, addToast]);

  const handleAddCalendar = useCallback(() => {
    if (generatedCampaign) {
      // navigateTo('SmartScheduler', { campaign: generatedCampaign });
      addToast({ type: 'info', message: `Navegando para o calendário para agendar a campanha "${generatedCampaign.name}".` });
    } else {
      addToast({ type: 'warning', message: 'Nenhuma campanha gerada para adicionar ao calendário.' });
    }
  }, [generatedCampaign, navigateTo, addToast]);


  return (
    <div className="container mx-auto py-8 lg:py-10 pb-24 md:pb-10">
      <h2 className="text-3xl font-bold text-white mb-8">Construtor de Campanhas</h2>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-gray-100 mb-5">Descreva sua Campanha</h3>
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
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800">
          {/* Nova Seção: Estratégia 360 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-black/20 p-6 rounded-xl border border-primary/20">
              <h4 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
                <PresentationChartLineIcon className="w-5 h-5" /> Estratégia 360 & Canais
              </h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                {generatedCampaign.strategy || "Estratégia personalizada focada em conversão e visibilidade orgânica."}
              </p>

              <div className="flex flex-wrap gap-2">
                {generatedCampaign.hashtags?.map((tag, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                    <HashtagIcon className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg">
              <h4 className="text-lg font-bold text-title mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-500" /> Calculadora ROI
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-1">Custo do Produto (R$)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-black/20 border border-gray-700 rounded p-2 text-white outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-1">Margem Lucro (%)</label>
                  <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full bg-black/20 border border-gray-700 rounded p-2 text-white outline-none focus:border-primary"
                  />
                </div>
                <div className="pt-2 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Preço Sugerido:</span>
                    <span className="text-white font-bold">R$ {calculatedPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Lucro por Venda:</span>
                    <span className="text-green-500 font-bold">R$ {profitAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-primary" /> Cronograma & Posts
              </h4>
              <p className="text-sm text-muted mb-3 italic">{generatedCampaign.timeline}</p>
              <ul className="list-disc list-inside text-gray-100 space-y-3 max-h-64 overflow-y-auto bg-black/20 p-4 rounded-md border border-gray-700">
                {generatedCampaign.posts.map((post, index) => (
                  <li key={post.id || index} className="text-sm">
                    <span className="text-accent font-bold">[{post.date || `Dia ${index + 1}`}]</span> {post.content_text.substring(0, 100)}...
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" /> Anúncios Gerados
              </h4>
              <ul className="list-disc list-inside text-gray-100 space-y-3 max-h-64 overflow-y-auto bg-black/20 p-4 rounded-md border border-gray-700">
                {generatedCampaign.ads.map((ad, index) => (
                  <li key={ad.id || index} className="text-sm">
                    <strong>{ad.platform}:</strong> "{ad.headline}"
                  </li>
                ))}
              </ul>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadMaterials} variant="primary" className="w-full sm:w-auto">Baixar Materiais</Button>
            {/* <Button onClick={handleAddCalendar} variant="secondary" className="w-full sm:w-auto">Adicionar ao Calendário</Button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;
