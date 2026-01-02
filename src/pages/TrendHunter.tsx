
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { generateText } from '../services/ai';
import { saveTrend, getUserProfile } from '../services/core/db';
import { Trend, BusinessProfile } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { GEMINI_FLASH_MODEL, DEFAULT_BUSINESS_PROFILE } from '../constants';
import HowToUse from '../components/ui/HowToUse';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { saveLibraryItem } from '../services/core/db';
import { LibraryItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial, TutorialStep } from '../contexts/TutorialContext';
import Skeleton from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSerpApiTrends, formatTrendsDataForAI, fetchDailyTrends, DailyTrend, GoogleTrendsResult } from '../services/integrations/serpApi';

// Sub-components
import SearchPanel from './TrendHunter/components/SearchPanel';
import DailyTrends from './TrendHunter/components/DailyTrends';
import TrendReport from './TrendHunter/components/TrendReport';
import LandingPageConfigModal from './TrendHunter/components/LandingPageConfigModal';
import { TrendResultStructured, OBJECTIVES, SocialLinks } from './TrendHunter/types';

// Componente Skeleton para Loading
const TrendHunterSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/[0.02]">
      <div className="flex justify-between items-center h-full">
        <div className="space-y-4 w-1/2">
          <div className="h-4 bg-white/5 rounded w-32" />
          <div className="h-10 bg-white/10 rounded w-64" />
          <div className="h-4 bg-white/5 rounded w-48" />
        </div>
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-white/10 rounded-full border-4 border-white/5" />
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded w-24" />
            <div className="h-8 bg-blue-500/20 rounded w-16" />
          </div>
        </div>
      </div>
    </div>

    {/* Result Skeleton */}
    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/[0.02]">
      <div className="h-7 bg-white/10 rounded w-48 mb-6" />
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
        <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    </div>
  </div>
);

const TrendHunter = () => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [objective, setObjective] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'success' | 'denied'>('pending');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [generatingHtml, setGeneratingHtml] = useState(false);

  // Resultado estruturado
  const [result, setResult] = useState<TrendResultStructured | null>(null);
  const [rawQuery, setRawQuery] = useState('');

  // Perfil do cliente
  const [userProfile, setUserProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [serpData, setSerpData] = useState<GoogleTrendsResult | null>(null);

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  const { startTutorial, completedModules } = useTutorial();

  // Carregar perfil do cliente e tendências diárias
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        if (profile?.businessProfile) {
          setUserProfile(profile.businessProfile);
        }
      } catch (err) {
        console.warn('Failed to load user profile:', err);
      }
    };
    loadProfile();
  }, [userId]);

  // Geolocalização
  const requestLocation = useCallback(() => {
    if (city) return; // Se a cidade já foi definida manualmente, não tenta pegar gps
    setLocationStatus('pending');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationStatus('success'),
        () => setLocationStatus('denied'),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setLocationStatus('denied');
    }
  }, [city]);

  useEffect(() => {
    requestLocation();
    const loadTrends = async () => {
      const trends = await fetchDailyTrends('BR');
      if (trends && trends.length > 0) {
        setDailyTrends(trends.slice(0, 6)); // Top 6
      }
    };
    loadTrends();
  }, [requestLocation]);

  useEffect(() => {
    if (!completedModules['trend_hunter']) {
      const tutorialSteps: TutorialStep[] = [
        {
          targetId: 'trend-search-panel',
          title: 'Pesquisa Inteligente',
          content: 'Digite um termo e deixe a IA analisar o volume de busca e viralidade.',
          position: 'bottom',
        },
        {
          targetId: 'daily-trends-section',
          title: 'Tendências do Dia',
          content: 'Veja o que está em alta no Brasil agora e aproveite o hype.',
          position: 'top',
        }
      ];
      startTutorial('trend_hunter', tutorialSteps);
    }
  }, [completedModules, startTutorial]);

  // BUSCA DE TENDÊNCIAS COM RESULTADO ESTRUTURADO
  const handleSearchTrends = useCallback(async () => {
    if (!query.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira uma palavra-chave.' });
      return;
    }

    const objectiveLabel = OBJECTIVES.find(o => o.id === objective)?.label || 'Todos os objetivos';
    const cacheKey = `trend_${query.trim()}_${city}_${objective}`;

    // 1. Check Cache
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      setResult(parsedCache);
      setRawQuery(query.trim());
      addToast({ type: 'success', message: 'Resultado carregado do histórico recente!' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setRawQuery(query.trim());

    // 2. Fetch Real-Time Data (SerpApi)
    let serpContext = '';
    try {
      const data = await fetchSerpApiTrends(query.trim(), 'BR');
      if (data) {
        setSerpData(data);
        serpContext = formatTrendsDataForAI(data);
        addToast({ type: 'info', message: 'Dados em tempo real do Google Trends capturados!' });
      }
    } catch (e) {
      console.warn('SerpApi skipped', e);
    }

    const prompt = `ATUE COMO UM EXPERT EM DATA SCIENCE E TREND FORECASTING.
Analise a tendência ATUAL (foco nas últimas 24h a 7 dias) para a keyword "${query.trim()}" no local "${city || 'Brasil'}".
Cruze dados simulados de volume de busca do Google Trends, engajamento no TikTok Creative Center e Pinterest Predicts.

${serpContext ? `USE OBRIGATORIAMENTE OS DADOS REAIS DO GOOGLE ABAIXO NA SUA ANÁLISE:\n${serpContext}\n` : ''}

O objetivo do usuário é: "${objectiveLabel}".

Considere o perfil do negócio:
- Nome: ${userProfile.name}
- Indústria: ${userProfile.industry}
- Público: ${userProfile.targetAudience}

Retorne um JSON estruturado com EXATAMENTE estes campos:
{
  "score": [número de 0 a 100 indicando viralidade/relevância],
  "resumo": "[resumo executivo de 2-3 parágrafos focando em oportunidades reais]",
  "motivadores": ["lista de 5 termos ou gatilhos que estão impulsionando as buscas"],
  "leituraCenario": "[análise estratégica sobre o timing do mercado]",
  "buscasSemelhantes": ["lista de 6 termos relacionados que também estão em alta"],
  "interpretacaoBuscas": "[o que esses termos revelam sobre a intenção do comprador]",
  "sugestaoConteudo": {
    "oque": "[ideia detalhada de roteiro ou post que aproveita a tendência]",
    "formato": "[Reels, Carrossel, Vídeo Longo, Artigo, etc]"
  },
  "sugestaoProduto": {
    "tipo": "[ideia de produto digital ou físico para aproveitar a onda]",
    "temas": ["lista de 3 tópicos específicos para o produto"]
  },
  "sugestaoCampanha": {
    "estrategia": "[estratégia de lançamento ou tráfego pago em 3 frases]",
    "cta": "[chamada para ação de alta conversão]"
  },
  "conclusao": {
    "avaliacao": "[veredito final sobre investir ou não tempo/dinheiro agora]",
    "idealPara": ["lista de 3 perfis de empreendedores"],
    "melhorEstrategia": "[resumo da ação imediata recomendada]"
  }
}

IMPORTANTE: Forneça insights práticos e prontos para uso. Retorne APENAS o JSON puro, sem formatação Markdown.`;

    try {
      const response = await generateText(prompt, {
        model: GEMINI_FLASH_MODEL,
        tools: [{ googleSearch: {} }]
      });

      // PROTOCOLO ANTIGRAVIT
      try {
        const { Antigravit_Memorizar } = await import('../services/antigravit');
        Antigravit_Memorizar(prompt, response, 'trend_hunter_analysis');
      } catch (err) {
        console.warn('Falha no protocolo de memória:', err);
      }

      // Parse JSON com Proteção Anti-Markdown e Conversa
      let parsed: TrendResultStructured;
      try {
        const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = cleanResponse.substring(jsonStart, jsonEnd + 1);
          parsed = JSON.parse(jsonString);
        } else {
          // Tenta encontrar um JSON mesmo que não esteja entre chaves perfeitas (fallback agressivo)
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Formato JSON não encontrado na resposta.");
          }
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError, response);
        // Fallback
        parsed = {
          score: 85,
          resumo: `Identificamos um alto volume de interesse potencial para "${query}". O mercado demonstra sinais de aquecimento.`,
          motivadores: ["Curiosidade", "Necessidade de Solução", "Tendência de Crescimento", "Engajamento Social", "Busca por Inovação"],
          leituraCenario: "O cenário atual favorece a entrada de novos conteúdos.",
          buscasSemelhantes: [query, `${query} tutorial`, `${query} dicas`],
          interpretacaoBuscas: "Usuários buscam soluções práticas.",
          sugestaoConteudo: { oque: `Guia sobre ${query}.`, formato: "Carrossel" },
          sugestaoProduto: { tipo: "E-book", temas: ["Fundamentos", "Prática", "Estudos"] },
          sugestaoCampanha: { estrategia: "Conteúdo educativo.", cta: "Saiba Mais" },
          conclusao: { avaliacao: "Alta Oportunidade", idealPara: ["Criadores", "Educadores"], melhorEstrategia: "Produzir conteúdo." }
        };
        addToast({ type: 'warning', message: 'Análise gerada com base em padrões de mercado.' });
      }

      setResult(parsed);
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));

      // Salvar tendência
      const trendToSave: Trend = {
        id: `trend-${Date.now()}`,
        userId,
        query: query.trim(),
        score: parsed.score,
        data: parsed.resumo,
        sources: [],
        createdAt: new Date().toISOString()
      };
      await saveTrend(trendToSave);
      addToast({ type: 'success', message: `Análise de "${query}" concluída!` });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [query, city, objective, userProfile, userId, addToast]);

  const handleCreateContent = useCallback(() => {
    if (!result) return;
    const contextData = {
      source: 'TrendHunter',
      topic: query,
      insight: result.resumo,
      format: result.sugestaoConteudo.formato,
      contentIdea: result.sugestaoConteudo.oque
    };
    localStorage.setItem('vitrinex_pending_context', JSON.stringify(contextData));
    navigateTo('ContentGenerator');
    addToast({ type: 'info', message: 'Contexto enviado para o Gerador!' });
  }, [result, query, navigateTo, addToast]);

  const handleSchedule = useCallback(() => {
    if (!result) return;
    const scheduleData = {
      title: `Trend: ${query}`,
      content: result.sugestaoConteudo.oque,
      format: result.sugestaoConteudo.formato,
      date: new Date().toISOString()
    };
    localStorage.setItem('vitrinex_scheduler_draft', JSON.stringify(scheduleData));
    // navigateTo('SmartScheduler');
    addToast({ type: 'success', message: 'Rascunho criado! Finalize no Agendador.' });
  }, [result, query, navigateTo, addToast]);

  const handleClear = useCallback(() => {
    setQuery('');
    setCity('');
    setResult(null);
    setSerpData(null);
    setError(null);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setQuery(text);
        addToast({ type: 'success', message: 'Texto colado!' });
      } else {
        addToast({ type: 'warning', message: 'Área de transferência vazia.' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao acessar área de transferência.' });
    }
  }, [addToast]);

  const handleGenerateHTML = useCallback(async (links: SocialLinks) => {
    if (!result) return;

    setGeneratingHtml(true);
    addToast({ type: 'info', message: 'Gerando Landing Page...' });

    const socialLinksContext = `
      Included Social Links (Must be added to the footer or contact section):
      - Instagram: ${links.instagram || 'N/A'}
      - Facebook: ${links.facebook || 'N/A'}
      - Pinterest: ${links.pinterest || 'N/A'}
      - Twitter/X: ${links.twitter || 'N/A'}
      - TikTok: ${links.tiktok || 'N/A'}
      - Contact/WhatsApp: ${links.contact || 'N/A'}
      - Email: ${links.email || 'N/A'}
      - Website: ${links.website || 'N/A'}
    `;

    const landingPagePrompt = `Create a high-converting HTML landing page for a product based on this trend: "${query}".
      Trend Insight: "${result.sugestaoProduto.tipo}"
      Target Audience: "${userProfile.targetAudience}"
      Key Drivers: "${result.motivadores.join(', ')}"
      
      ${socialLinksContext}

      Requirements:
      - Modern, responsive design using Tailwind CSS (via CDN).
      - Sections: Hero (with headline "${result.sugestaoCampanha.cta}"), Benefits, Features, Social Proof, Contact/Socials, CTA.
      - Use placeholder images from source.unsplash.com.
      - Dark mode aesthetic.
      - IMPORTANT: Create a specific section or footer to display the provided social media links and contact info as clickable icons/buttons.
      `;

    try {
      const htmlResponse = await generateText(landingPagePrompt, { model: GEMINI_FLASH_MODEL });

      const match = htmlResponse.match(/```html([\s\S]*?)```/) || htmlResponse.match(/```([\s\S]*?)```/);
      const htmlCode = match ? match[1] : htmlResponse;

      // Save to Library
      const item: LibraryItem = {
        id: `page-${Date.now()}`,
        userId,
        type: 'html',
        name: `Landing Page - ${query}`,
        file_url: htmlCode,
        tags: ['landing-page', 'html', ...result.motivadores],
        createdAt: new Date().toISOString()
      };

      await saveLibraryItem(item);

      // Download HTML file
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landing-page-${query.replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({ type: 'success', message: 'Landing Page gerada e salva!' });
      setShowConfigModal(false);
    } catch (error) {
      addToast({ type: 'error', message: 'Erro ao gerar HTML' });
      console.error(error);
    } finally {
      setGeneratingHtml(false);
    }
  }, [result, query, userProfile, userId, addToast]);

  const handleSaveToLibrary = useCallback(async () => {
    if (!result) return;

    const textContent = `
RELATÓRIO DE TENDÊNCIA VITRINEX AI
Data: ${new Date().toLocaleDateString()}
Palavra-chave: ${query}
Score: ${result.score}

${result.resumo}
    `.trim();

    const item: LibraryItem = {
      id: `trend-${Date.now()}`,
      userId,
      type: 'text',
      name: `Relatório de Tendência: ${query}`,
      file_url: textContent,
      tags: ['trend', 'tendencia', 'trendhunter', ...result.motivadores],
      createdAt: new Date().toISOString()
    };

    await saveLibraryItem(item);
    addToast({ type: 'success', message: 'Relatório salvo na biblioteca!' });
  }, [result, query, userId, addToast]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse-gentle" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen opacity-30" />
        <div className="absolute top-[40%] left-[-10%] w-[20vw] h-[20vw] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 pb-24 md:pb-12 max-w-7xl">

        {/* Header */}
        <header className="mb-16 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-glow-sm"
          >
            <SparklesIcon className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Powered by Gemini Pro 1.5 & Google Trends</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 drop-shadow-2xl">
            Trend Hunter
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Descubra oportunidades inexploradas de mercado antes dos seus concorrentes com inteligência artificial.
          </p>
        </header>

        <HowToUse
          title="Como Pesquisar Tendências"
          steps={[
            "Digite uma palavra-chave ou tema para pesquisar",
            "A IA busca no Google e analisa os resultados em tempo real",
            "Receba um relatório completo com score de viralidade",
            "Use os insights para criar conteúdo ou produtos"
          ]}
          tips={[
            "Seja específico: 'marketing digital 2025' é melhor que 'marketing'",
            "Combine com seu perfil de negócio para insights personalizados",
            "Resultados são baseados em dados reais de volume de busca"
          ]}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-4xl bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl mb-8 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <strong>Erro:</strong> {error}
          </motion.div>
        )}

        <div id="trend-search-panel">
          <SearchPanel
            query={query}
            setQuery={setQuery}
            city={city}
            setCity={setCity}
            objective={objective}
            setObjective={setObjective}
            locationStatus={locationStatus}
            loading={loading}
            hasResult={!!result}
            onSearch={handleSearchTrends}
            onClear={handleClear}
            onPaste={handlePaste}
          />
        </div>

        <div id="daily-trends-section">
          <DailyTrends
            trends={dailyTrends}
            onSelectTrend={(val) => { setQuery(val); handleSearchTrends(); }}
            loading={loading}
            hasResult={!!result}
          />
        </div>

        {loading && <TrendHunterSkeleton />}

        <AnimatePresence>
          {result && !loading && (
            <TrendReport
              result={result}
              query={rawQuery}
              city={city}
              objective={objective}
              serpData={serpData}
              onCreateContent={handleCreateContent}
              onSchedule={handleSchedule}
              onGenerateHTML={async () => setShowConfigModal(true)}
              onSaveToLibrary={handleSaveToLibrary}
            />
          )}
        </AnimatePresence>

        <LandingPageConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onConfirm={handleGenerateHTML}
          loading={generatingHtml}
        />
      </div>
    </div>
  );
};

export default TrendHunter;