
import * as React from 'react';
import { useState, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { campaignBuilder, generateText } from '../services/ai';
import { GEMINI_FLASH_MODEL } from '../constants';
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
  ArrowRightCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ExecutionTips {
  steps: string[];
  channels: string[];
  budget_estimation: string;
  pitfalls: string[];
  hook_suggestion: string;
}

const CampaignBuilder: React.FC = () => {
  const [campaignPrompt, setCampaignPrompt] = useState<string>('');
  const [generatedCampaign, setGeneratedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tips State
  const [tipsLoading, setTipsLoading] = useState(false);
  const [executionTips, setExecutionTips] = useState<ExecutionTips | null>(null);

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

  // Load pending context from TrendHunter or MarketRadar
  React.useEffect(() => {
    const pendingContext = localStorage.getItem('vitrinex_pending_campaign_context');
    if (pendingContext) {
      try {
        const data = JSON.parse(pendingContext);
        const autoPrompt = `Campanha para: ${data.title || data.topic}
Estratégia Recomendada: ${data.strategy}
Insight de Mercado: ${data.insight}
CTA Sugerido: ${data.cta || 'Saiba Mais'}`;

        setCampaignPrompt(autoPrompt);
        addToast({ type: 'info', message: 'Dados da campanha importados da análise!' });

        // Clean up
        localStorage.removeItem('vitrinex_pending_campaign_context');
      } catch (e) {
        console.error('Failed to parse campaign context', e);
      }
    }
  }, [addToast]);

  const handleCreateWebPage = useCallback(() => {
    if (!generatedCampaign) return;

    const webContext = {
      campaignName: generatedCampaign.name,
      description: `Landing page para a campanha: ${generatedCampaign.name}.
      Estratégia: ${generatedCampaign.strategy}
      Timeline: ${generatedCampaign.timeline}
      
      Objetivo: Criar uma página de alta conversão para suportar esta campanha.`,
      content: generatedCampaign.ads.map(ad => `[${ad.platform}] ${ad.headline}: ${ad.copy}`).join('\n\n')
    };

    localStorage.setItem('vitrinex_pending_web_context', JSON.stringify(webContext));
    // navigateTo('CodePlayground');
    addToast({ type: 'info', message: 'Funcionalidade "Criar Página Web" (CodePlayground) está temporariamente desativada.' });
  }, [generatedCampaign, navigateTo, addToast]);

  const handleCreateCampaign = useCallback(async () => {
    if (!campaignPrompt.trim()) {
      addToast({ type: 'warning', message: 'Por favor, forneça uma descrição para a campanha.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCampaign(null);
    setExecutionTips(null); // Reset tips when creating new campaign

    try {
      // Parallel execution: Build Campaign AND Gen Tips (Optional: could serve tips separately)
      // For now, let's keep them separate user actions or trigger together?
      // User asked for "dicas e indicações" separate from general build? Or integrated?
      // The request implies "descreva dicas... de como fazer a campanha".
      // Let's trigger both or just campaign first. Let's stick to campaign first, then tips button.

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
  }, [campaignPrompt, addToast, userId]);

  const handleGenerateTips = useCallback(async () => {
    if (!campaignPrompt.trim()) {
      addToast({ type: 'warning', message: 'Descreva a campanha primeiro.' });
      return;
    }
    setTipsLoading(true);

    const prompt = `Atue como um Diretor de Marketing Digital Sênior.
    Analise esta ideia de campanha: "${campaignPrompt}".
    
    Forneça um guia prático de execução e indicações reais.
    Retorne um JSON ESTRITAMENTE neste formato:
    {
      "steps": ["Passo 1: ...", "Passo 2: ...", "Passo 3: ...", "Passo 4: ...", "Passo 5: ..."],
      "channels": ["Canal 1 (Motivo)", "Canal 2 (Motivo)"],
      "budget_estimation": "Estimativa de investimento inicial (Baixo/Médio/Alto) e onde gastar.",
      "pitfalls": ["Erro comum 1", "Erro comum 2 a evitar"],
      "hook_suggestion": "Uma frase de gancho matadora para usar no primeiro ad."
    }
    Use tom profissional e direto. Dê dicas acionáveis.`;

    try {
      const response = await generateText(prompt, {
        model: GEMINI_FLASH_MODEL,
        responseMimeType: 'application/json'
      });

      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const tips = JSON.parse(cleanJson);
      setExecutionTips(tips);
      addToast({ type: 'success', message: 'Dicas de execução geradas!' });
    } catch (e) {
      console.error("Failed to generate tips", e);
      addToast({ type: 'error', message: 'Erro ao gerar dicas.' });
    } finally {
      setTipsLoading(false);
    }
  }, [campaignPrompt, addToast]);


  const handleDownloadMaterials = useCallback(() => {
    if (!generatedCampaign) {
      addToast({ type: 'warning', message: 'Nenhum material de campanha para baixar.' });
      return;
    }
    // Include tips in download if available
    const dataToSave = {
      ...generatedCampaign,
      execution_tips: executionTips
    };

    const campaignData = JSON.stringify(dataToSave, null, 2);
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
  }, [generatedCampaign, executionTips, addToast]);

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
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={handleCreateCampaign}
            isLoading={loading}
            variant="primary"
            className="w-full md:w-auto"
          >
            {loading ? 'Criando Estratégia...' : 'Gerar Estratégia Mestra'}
          </Button>

          <Button
            onClick={handleGenerateTips}
            isLoading={tipsLoading}
            variant="secondary"
            className="w-full md:w-auto border-accent/50 text-accent hover:bg-accent/10"
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            {tipsLoading ? 'Analisando...' : 'Gerar Dicas de Execução'}
          </Button>
        </div>
      </div>

      {/* Execution Tips Section */}
      <AnimatePresence>
        {executionTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-xl border border-indigo-500/30 mb-8 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <LightBulbIcon className="w-32 h-32 text-indigo-400" />
            </div>

            <h3 className="text-xl font-bold text-indigo-300 mb-6 flex items-center gap-2 relative z-10">
              <SparklesIcon className="w-6 h-6 text-yellow-400" /> Guia de Execução Estratégica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" /> Passo a Passo
                </h4>
                <ul className="space-y-3">
                  {executionTips.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-gray-300 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="font-bold text-indigo-400">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Canais Recomendados</h4>
                  <div className="flex flex-wrap gap-2">
                    {executionTips.channels.map((ch, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="font-bold text-gray-200 mb-1 text-sm">Estimativa de Orçamento</h4>
                  <p className="text-gray-400 text-sm italic">{executionTips.budget_estimation}</p>
                </div>

                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <h4 className="font-bold text-red-300 mb-2 text-sm flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" /> Pontos de Atenção (Pitfalls)
                  </h4>
                  <ul className="list-disc list-inside text-red-200/80 text-xs space-y-1">
                    {executionTips.pitfalls.map((fail, i) => (
                      <li key={i}>{fail}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 bg-gradient-to-r from-yellow-500/10 to-transparent p-4 rounded-xl border border-yellow-500/20">
                <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest block mb-1">Sugestão de Gancho (Hook)</span>
                <p className="text-white font-medium text-lg leading-relaxed">"{executionTips.hook_suggestion}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {generatedCampaign && (
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <Button onClick={handleCreateWebPage} variant="secondary" className="w-full sm:w-auto text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10">
              <CodeBracketIcon className="w-5 h-5 mr-2" /> Criar Página Web
            </Button>
            {/* <Button onClick={handleAddCalendar} variant="secondary" className="w-full sm:w-auto">Adicionar ao Calendário</Button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;
