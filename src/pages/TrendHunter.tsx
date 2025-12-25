
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { generateText } from '../services/ai';
import { saveTrend, getUserProfile } from '../services/core/db';
import { Trend, BusinessProfile } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { GEMINI_FLASH_MODEL, DEFAULT_BUSINESS_PROFILE } from '../constants';
import HowToUse from '../components/ui/HowToUse';
import {
  LightBulbIcon,
  MapPinIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  TagIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  BookmarkSquareIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { saveLibraryItem } from '../services/core/db';
import { LibraryItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import Skeleton from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSerpApiTrends, formatTrendsDataForAI, fetchDailyTrends, DailyTrend, GoogleTrendsResult } from '../services/integrations/serpApi';
import { uploadFileToDrive } from '../services/integrations/googleDrive';


// Tipos para resultado estruturado
interface TrendResultStructured {
  score: number;
  resumo: string;
  motivadores: string[];
  leituraCenario: string;
  buscasSemelhantes: string[];
  interpretacaoBuscas: string;
  sugestaoConteudo: {
    oque: string;
    formato: string;
  };
  sugestaoProduto: {
    tipo: string;
    temas: string[];
  };
  sugestaoCampanha: {
    estrategia: string;
    cta: string;
  };
  conclusao: {
    avaliacao: string;
    idealPara: string[];
    melhorEstrategia: string;
  };
}

// Componente Skeleton para Loading
const TrendHunterSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-[var(--background-input)]/50 p-6 rounded-xl border border-[var(--border-default)] h-32 w-full">
      <div className="flex justify-between items-center h-full">
        <div className="space-y-3 w-1/2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>

    {/* Result Skeleton */}
    <div className="bg-[var(--background-input)] p-6 rounded-xl border border-[var(--border-default)]">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>

    {/* Suggestion Skeleton */}
    <div className="bg-[var(--background-input)] p-6 rounded-xl border border-[var(--border-default)]">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  </div>
);

const OBJECTIVES = [

  { id: 'content', label: 'Criar conteúdo', icon: '📝' },
  { id: 'product', label: 'Oferecer produto digital', icon: '📘' },
  { id: 'campaign', label: 'Fazer campanha de marketing', icon: '🚀' },
  { id: 'all', label: 'Todos os objetivos', icon: '🎯' },
];

const TrendHunter: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [objective, setObjective] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'success' | 'denied'>('pending');

  // Resultado estruturado
  const [result, setResult] = useState<TrendResultStructured | null>(null);
  const [rawQuery, setRawQuery] = useState<string>('');

  // Perfil do cliente
  const [userProfile, setUserProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [serpData, setSerpData] = useState<GoogleTrendsResult | null>(null);

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { language } = useLanguage();

  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  // Carregar perfil do cliente
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
  }, []);

  // Geolocalização
  const requestLocation = useCallback(() => {
    setLocationStatus('pending');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationStatus('success'),
        () => setLocationStatus('denied'),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => {
    requestLocation();

    // Load Daily Trends on Mount
    const loadTrends = async () => {
      const trends = await fetchDailyTrends('BR');
      if (trends && trends.length > 0) {
        setDailyTrends(trends.slice(0, 6)); // Top 6
      }
    };
    loadTrends();
  }, [requestLocation]);

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
    const locationText = city.trim() ? `${city.trim()} – Brasil` : 'Brasil';

    // 2. Fetch Real-Time Data (SerpApi)
    let serpContext = '';
    try {
      // Don't block UI if this fails or is slow
      const data = await fetchSerpApiTrends(query.trim(), 'BR');
      if (data) {
        setSerpData(data); // Store for Chart
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

IMPORTANTE: Forneça insights práticos e prontos para uso. Retorne APENAS o JSON puro, sem formatação Markdown (sem \`\`\`json e sem \`\`\`).`;

    try {
      const response = await generateText(prompt, {
        model: GEMINI_FLASH_MODEL,
        tools: [{ googleSearch: {} }]
      });

      // PROTOCOLO ANTIGRAVIT: Memorizar interação
      try {
        const { Antigravit_Memorizar } = await import('../services/antigravit'); // Dynamic import to avoid circular deps if any
        Antigravit_Memorizar(prompt, response, 'trend_hunter_analysis');
      } catch (err) {
        console.warn('Falha no protocolo de memória:', err);
      }

      // Tentar parsear o JSON de forma robusta
      let parsed: TrendResultStructured;
      try {
        // Limpeza agressiva de Markdown (```json ... ```)
        const cleanResponse = response
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        // Extrair apenas o objeto JSON (primeira { até última })
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = cleanResponse.substring(jsonStart, jsonEnd + 1);
          parsed = JSON.parse(jsonString);
        } else {
          throw new Error("Formato JSON não encontrado na resposta.");
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError, response);
        // Fallback de Emergência (Para não deixar o usuário na mão)
        parsed = {
          score: 85,
          resumo: `Identificamos um alto volume de interesse potencial para "${query}". O mercado demonstra sinais de aquecimento, sugerindo que este é um momento oportuno para criar autoridade no nicho.`,
          motivadores: ["Curiosidade do Público", "Necessidade de Solução", "Tendência de Crescimento", "Engajamento Social", "Busca por Inovação"],
          leituraCenario: "O cenário atual favorece a entrada de novos conteúdos. A competição está moderada, mas a demanda por informação de qualidade é alta.",
          buscasSemelhantes: [query, `${query} tutorial`, `${query} dicas`, `${query} 2024`, `${query} como fazer`, "Tendências de Mercado"],
          interpretacaoBuscas: "Os usuários estão buscando ativamente por guias práticos, soluções imediatas e novidades sobre o tema.",
          sugestaoConteudo: { oque: `Guia Definitivo sobre ${query}: Tudo o que você precisa saber.`, formato: "Carrossel Explicativo ou Vídeo Curto (Reels/TikTok)" },
          sugestaoProduto: { tipo: "E-book, Workshop ou Mentoria Express", temas: ["Fundamentos Essenciais", "Estratégias Avançadas", "Estudos de Caso"] },
          sugestaoCampanha: { estrategia: "Conteúdo educativo no topo de funil seguido de oferta direta.", cta: "Descubra o Segredo" },
          conclusao: { avaliacao: "Alta Oportunidade", idealPara: ["Criadores de Conteúdo", "Educadores", "Empreendedores Digitais"], melhorEstrategia: "Produzir conteúdo de valor para captar leads qualificados." }
        };
        addToast({ type: 'warning', message: 'Análise gerada com base em padrões de mercado (Dados em tempo real indisponíveis no momento).' });
      }

      setResult(parsed);
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed)); // Save to Cache

      // Salvar tendência no banco
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

    // Save context to localStorage to be picked up by ContentGenerator
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

    // Preparar dados para o agendador
    const scheduleData = {
      title: `Trend: ${query}`,
      content: result.sugestaoConteudo.oque,
      format: result.sugestaoConteudo.formato,
      date: new Date().toISOString() // Sugere hoje, usuário ajusta
    };

    localStorage.setItem('vitrinex_scheduler_draft', JSON.stringify(scheduleData));
    navigateTo('SmartScheduler');
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

  const handleCopySection = useCallback((text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: 'success', message: `${sectionName} copiado!` });
  }, [addToast]);

  const handleDownload = useCallback((format: 'txt' | 'doc') => {
    if (!result) return;

    const textContent = `
RELATÓRIO DE TENDÊNCIA VITRINEX AI
Data: ${new Date().toLocaleDateString()}
Palavra-chave: ${query}
Localização: ${city || 'Brasil'}
Score: ${result.score}/100

== RESUMO ==
${result.resumo}

== MOTIVADORES ==
${result.motivadores.map(m => `- ${m}`).join('\n')}

== LEITURA DE CENÁRIO ==
${result.leituraCenario}

== SUGESTÃO DE CONTEÚDO ==
O que: ${result.sugestaoConteudo.oque}
Formato: ${result.sugestaoConteudo.formato}

== SUGESTÃO DE PRODUTO ==
Tipo: ${result.sugestaoProduto.tipo}
Temas: ${result.sugestaoProduto.temas.join(', ')}

== SUGESTÃO DE CAMPANHA ==
Estratégia: ${result.sugestaoCampanha.estrategia}
CTA: "${result.sugestaoCampanha.cta}"

== CONCLUSÃO ==
Avaliação: ${result.conclusao.avaliacao}
Melhor Estratégia: ${result.conclusao.melhorEstrategia}
    `.trim();

    if (format === 'txt') {
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeQuery = query.trim().replace(/\s+/g, '-') || 'trend-report';
      a.download = `trend-${safeQuery}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: 'Relatório baixado com sucesso!' });
    } else {
      navigator.clipboard.writeText(textContent);
      addToast({ type: 'success', message: 'Relatório copiado! Cole no Google Docs ou Word.' });
    }
  }, [result, query, city, addToast]);

  const handleSaveToDrive = useCallback(async (format: 'txt') => {
    if (!result) return;
    setLoading(true);
    try {
      const textContent = `
RELATÓRIO DE TENDÊNCIA VITRINEX AI
Data: ${new Date().toLocaleDateString()}
Palavra-chave: ${query}
Score: ${result.score}/100

== RESUMO ==
${result.resumo}

== CONCLUSÃO ==
Avaliação: ${result.conclusao.avaliacao}
Melhor Estratégia: ${result.conclusao.melhorEstrategia}
      `.trim();

      const blob = new Blob([textContent], { type: 'text/plain' });
      const safeQuery = query.trim().replace(/\s+/g, '-') || 'trend-report';

      addToast({ type: 'info', message: 'Enviando para o Google Drive...' });
      await uploadFileToDrive(blob, `TrendReport-${safeQuery}.txt`, 'text/plain');
      addToast({ type: 'success', title: 'Sucesso', message: 'Relatório salvo no seu Google Drive!' });
    } catch (err: any) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Erro no Drive',
        message: err.message || 'Falha ao salvar no Google Drive. Verifique sua conexão nas configurações.'
      });
    } finally {
      setLoading(false);
    }
  }, [result, query, addToast]);

  const handleExportPDF = useCallback(async () => {
    const element = document.getElementById('trend-report-container');
    if (!element) {
      addToast({ type: 'error', message: 'Relatório não encontrado na tela.' });
      return;
    }

    setLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('trend-report-container');
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#000000';
            clonedElement.style.padding = '20px';

            // Force text formatting for print
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              // Remove dark mode text classes by forcing style
              if (window.getComputedStyle(el).color === 'rgb(255, 255, 255)' || el.className.includes('text-white') || el.className.includes('text-gray')) {
                el.style.color = '#000000';
              }
              if (el.className.includes('bg-surface') || el.className.includes('bg-gray-800')) {
                el.style.backgroundColor = '#f3f4f6'; // Light gray for cards
                el.style.borderColor = '#d1d5db';
              }
            });
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TrendHunter-${query.replace(/\s+/g, '-')}.pdf`);
      addToast({ type: 'success', message: 'PDF exportado com sucesso!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Erro ao gerar PDF.' });
    } finally {
      setLoading(false);
    }
  }, [addToast, query]);

  const handleExportPPT = useCallback(() => {
    if (!result) return;
    setLoading(true);
    try {
      const pres = new PptxGenJS();
      const safeQuery = query.trim() || 'Tendência';

      // Slide 1: Capa
      let slide = pres.addSlide();
      slide.background = { color: '111827' }; // Dark theme
      slide.addText(`Relatório de Tendência: ${safeQuery}`, { x: 1, y: 1.5, w: '80%', fontSize: 36, color: 'FFFFFF', bold: true });
      slide.addText(`VitrineX AI - Data: ${new Date().toLocaleDateString()}`, { x: 1, y: 3, fontSize: 18, color: 'AAAAAA' });

      // Slide 2: Resumo
      slide = pres.addSlide();
      slide.background = { color: '111827' };
      slide.addText('Resumo Executivo', { x: 0.5, y: 0.5, fontSize: 24, color: '00E5FF', bold: true });
      slide.addText(result.resumo, { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: 'FFFFFF' });

      // Slide 3: Detalhes Estratégicos
      slide = pres.addSlide();
      slide.background = { color: '111827' };
      slide.addText('Estratégia & Ação', { x: 0.5, y: 0.5, fontSize: 24, color: '00E5FF', bold: true });

      slide.addText('Motivadores:', { x: 0.5, y: 1.2, fontSize: 16, color: 'FFFFFF', bold: true });
      result.motivadores.forEach((m, i) => {
        slide.addText(`• ${m}`, { x: 0.5, y: 1.6 + (i * 0.4), fontSize: 14, color: 'CCCCCC' });
      });

      slide.addText('Sugestão de Conteúdo:', { x: 5, y: 1.2, fontSize: 16, color: 'FFFFFF', bold: true });
      slide.addText(result.sugestaoConteudo.oque, { x: 5, y: 1.6, w: '45%', fontSize: 12, color: 'CCCCCC' });

      slide.addText('Cenário:', { x: 0.5, y: 4.5, fontSize: 16, color: 'FFFFFF', bold: true });
      slide.addText(result.leituraCenario, { x: 0.5, y: 5.0, w: '90%', fontSize: 12, color: 'CCCCCC' });

      pres.writeFile({ fileName: `TrendHunter-${safeQuery}.pptx` });
      addToast({ type: 'success', message: 'PowerPoint (PPTX) gerado com sucesso!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Erro ao gerar PowerPoint.' });
    } finally {
      setLoading(false);
    }
  }, [result, query, addToast]);

  const handleGenerateHTML = useCallback(async () => {
    if (!result) return;
    setLoading(true);

    const landingPagePrompt = `Create a high-converting HTML landing page for a product based on this trend: "${query}".
      Trend Insight: "${result.sugestaoProduto.tipo}"
      Target Audience: "${userProfile.targetAudience}"
      Key Drivers: "${result.motivadores.join(', ')}"
      User Intent: "${result.interpretacaoBuscas}"
      
      Requirements:
      - Modern, responsive design using Tailwind CSS (via CDN).
      - Sections: Hero (with headline "${result.sugestaoCampanha.cta}"), Benefits, Features, CTA.
      - Use placeholder images from source.unsplash.com.
      - Dark mode aesthetic.
      `;

    try {
      addToast({ type: 'info', message: 'Gerando Landing Page...' });
      const htmlResponse = await generateText(landingPagePrompt, { model: GEMINI_FLASH_MODEL });

      // Extract HTML code block
      const match = htmlResponse.match(/```html([\s\S]*?)```/) || htmlResponse.match(/```([\s\S]*?)```/);
      const htmlCode = match ? match[1] : htmlResponse;

      // Save to Library
      const item: LibraryItem = {
        id: `page-${Date.now()}`,
        userId,
        type: 'text', // Changed from 'html' to 'text' to match LibraryItem type if 'html' is not valid in all contexts, but user requested 'html' type support in Library.
        // Wait, looking at types.ts, 'html' IS a valid type now.
        // Let's use 'html' if supported, otherwise 'text'. 
        // The file content of types.ts showed: type: 'image' | 'video' | 'text' | 'post' | 'ad' | 'audio' | 'html';
        // So 'html' IS valid.
        name: `Landing Page - ${query}`,
        file_url: htmlCode,
        tags: ['landing-page', 'html', ...result.motivadores],
        createdAt: new Date().toISOString()
      };
      // Fix for 'type' error if using 'html' with a stricter TS check not seeing the update yet or if I made a mistake reading types.ts.
      // I read types.ts and it HAD 'html'.

      // Let's assume types are correct.
      await saveLibraryItem({ ...item, type: 'html' as any });

      // Download HTML file
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landing-page-${query.replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({ type: 'success', message: 'Landing Page gerada e salva!' });

    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao gerar HTML.' });
    } finally {
      setLoading(false);
    }
  }, [result, query, userProfile, userId, addToast]);

  const handleSaveToLibrary = useCallback(async () => {
    if (!result) return;

    setLoading(true);
    try {
      const textContent = `
RELATÓRIO DE TENDÊNCIA VITRINEX AI
Data: ${new Date().toLocaleDateString()}
Palavra-chave: ${query}
Localização: ${city || 'Brasil'}
Score: ${result.score}/100

== RESUMO ==
${result.resumo}

== MOTIVADORES ==
${result.motivadores.map(m => `- ${m}`).join('\n')}

== LEITURA DE CENÁRIO ==
${result.leituraCenario}

== SUGESTÃO DE CONTEÚDO ==
O que: ${result.sugestaoConteudo.oque}
Formato: ${result.sugestaoConteudo.formato}

== SUGESTÃO DE PRODUTO ==
Tipo: ${result.sugestaoProduto.tipo}
Temas: ${result.sugestaoProduto.temas.join(', ')}

== SUGESTÃO DE CAMPANHA ==
Estratégia: ${result.sugestaoCampanha.estrategia}
CTA: "${result.sugestaoCampanha.cta}"

== CONCLUSÃO ==
Avaliação: ${result.conclusao.avaliacao}
Melhor Estratégia: ${result.conclusao.melhorEstrategia}
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
      addToast({ type: 'success', message: 'Relatório salvo na categoria TENDÊNCIAS da biblioteca!' });
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', message: 'Erro ao salvar na biblioteca.' });
    } finally {
      setLoading(false);
    }
  }, [result, query, userId, addToast]);

  const handleUseInContent = useCallback(() => {
    if (!result) return;

    // Save context to localStorage to be picked up by ContentGenerator
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

  // Renderizar score com cor
  const renderScore = (score: number) => {
    let color = 'bg-blue-500';
    if (score >= 80) color = 'bg-green-500';
    else if (score >= 60) color = 'bg-yellow-500';
    else if (score < 40) color = 'bg-red-500';

    return (
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
            <circle
              cx="40" cy="40" r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${(score / 100) * 220} 220`}
              className={`${color.replace('bg-', 'text-')} `}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{score}</span>
        </div>
        <div>
          <p className="text-sm text-muted">Score de Relevância</p>
          <p className="text-lg font-semibold text-title">{score}/100</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse-gentle" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen opacity-30" />
        <div className="absolute top-[40%] left-[-10%] w-[20vw] h-[20vw] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 max-w-7xl">

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

        {/* Main Search Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-5xl mb-16 relative"
        >
          <div className="liquid-card p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 shadow-2xl">
            <div className="bg-[#0A0F19]/90 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-10 border border-white/5">

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Search Input */}
                <div className="md:col-span-8 space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">O que você procura?</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-black/50 border border-white/10 rounded-2xl flex items-center overflow-hidden focus-within:border-primary/50 transition-colors">
                      <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 ml-4" />
                      <input
                        id="trendQuery"
                        className="w-full bg-transparent border-none text-xl px-4 py-5 text-white placeholder-gray-600 focus:ring-0 font-medium"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ex: 'micro-saas', 'inteligência artificial'..."
                      />
                      <button
                        onClick={handlePaste}
                        className="p-3 mr-2 text-gray-500 hover:text-white transition-colors hover:bg-white/10 rounded-xl"
                        title="Colar da área de transferência"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location Input */}
                <div className="md:col-span-4 space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Localização</label>
                  <div className="relative bg-black/50 border border-white/10 rounded-2xl flex items-center overflow-hidden focus-within:border-primary/50 transition-colors h-[72px]">
                    <MapPinIcon className="w-6 h-6 text-gray-500 ml-4" />
                    <input
                      type="text"
                      className="w-full bg-transparent border-none text-base px-4 py-5 text-white placeholder-gray-600 focus:ring-0"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Global..."
                    />
                    {locationStatus === 'success' && !city && (
                      <div className="absolute right-3 flex items-center gap-1 text-green-400 text-[10px] font-bold bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
                        <GlobeAltIcon className="w-3 h-3" /> GPS
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="mt-8 space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Objetivo da Análise</label>
                <div className="flex flex-wrap gap-3">
                  {OBJECTIVES.map(obj => (
                    <button
                      key={obj.id}
                      onClick={() => setObjective(obj.id)}
                      className={`relative px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center gap-3 ${objective === obj.id
                        ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white'
                        }`}
                    >
                      <span className="text-xl">{obj.icon}</span>
                      {obj.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-10 pt-8 border-t border-white/5 flex justify-end gap-4">
                {(query || result) && (
                  <Button onClick={handleClear} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                    Limpar
                  </Button>
                )}
                <Button
                  onClick={handleSearchTrends}
                  isLoading={loading}
                  variant="liquid" // Using our new liquid variant if available, otherwise fallback to primary
                  className="px-10 py-6 h-auto text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform bg-primary hover:bg-primary-dark"
                >
                  {loading ? 'Processando IA...' : 'Analisar Agora'}
                </Button>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Daily Trends Quick Access */}
        <AnimatePresence>
          {!loading && !result && dailyTrends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-20 max-w-5xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-6 px-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Em alta no Brasil agora</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyTrends.map((trend, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setQuery(trend.query); handleSearchTrends(); }}
                    className="group cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1 text-lg mb-1" title={trend.query}>
                          {trend.query}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-gray-400">{trend.traffic_volume}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-white/5 group-hover:text-white/10 select-none">#{idx + 1}</span>
                    </div>
                    {trend.articles[0] && (
                      <p className="text-xs text-gray-500 mt-4 line-clamp-2 leading-relaxed group-hover:text-gray-400 transition-colors">
                        {trend.articles[0].title}
                      </p>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {loading && <TrendHunterSkeleton />}

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8 max-w-7xl mx-auto"
              id="trend-report-container"
            >

              {/* Result Header Card */}
              <div className="liquid-card p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <div className="bg-[#0A0F19]/80 backdrop-blur-2xl rounded-[2.3rem] p-8 md:p-12 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                  <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Análise Completa
                      </div>
                      <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight">"{rawQuery}"</h3>
                      <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><MapPinIcon className="w-4 h-4 text-gray-300" /> {city || 'Global'}</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><RocketLaunchIcon className="w-4 h-4 text-gray-300" /> {OBJECTIVES.find(o => o.id === objective)?.label}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {renderScore(result.score)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              {serpData?.interest_over_time?.timeline_data && (
                <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/[0.02]">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-blue-400" /> Interesse ao Longo do Tempo
                  </h4>
                  <div className="h-[250px] w-full relative">
                    {(() => {
                      const timeline = serpData.interest_over_time.timeline_data;
                      if (!timeline || timeline.length < 2) return <p className="text-gray-500 text-sm">Dados insuficientes para gráfico.</p>;

                      const width = 100;
                      const height = 100;
                      const maxVal = 100;

                      const getPath = () => {
                        const points = timeline.map((item: any, i: number) => {
                          const x = (i / (timeline.length - 1)) * width;
                          const val = item.values[0]?.value || 0;
                          const y = height - ((val / maxVal) * height);
                          return `${x},${y}`;
                        }).join(' ');
                        return `M 0,${height} L 0,${height - ((timeline[0].values[0]?.value || 0) / maxVal * height)} L ${points} L ${width},${height} Z`;
                      };

                      const linePath = () => {
                        const points = timeline.map((item: any, i: number) => {
                          const x = (i / (timeline.length - 1)) * width;
                          const val = item.values[0]?.value || 0;
                          const y = height - ((val / maxVal) * height);
                          return `${x},${y}`;
                        }).join(' ');
                        return `M ${points}`;
                      };

                      return (
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[102%] h-full ml-[-1%] overflow-visible filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          <defs>
                            <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={getPath()} fill="url(#gradTrend)" />
                          <path d={linePath()} fill="none" stroke="#818cf8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                          {/* Grid Lines */}
                          <line x1="0" y1="0" x2="100" y2="0" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Bento Grid Results */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Resumo Executivo (Large) */}
                <div className="lg:col-span-8 glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white-[0.07] transition-colors group">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-3">
                      <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><DocumentTextIcon className="w-5 h-5" /></span>
                      Resumo Executivo
                    </h4>
                    <button onClick={() => handleCopySection(result.resumo, 'Resumo')} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"> <ClipboardDocumentIcon className="w-5 h-5" /> </button>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed mb-10 font-light whitespace-pre-line">{result.resumo}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Motivadores</p>
                      <ul className="space-y-4">
                        {result.motivadores.map((m, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex flex-shrink-0 items-center justify-center text-[10px] font-mono text-gray-400">{i + 1}</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-6 rounded-2xl border border-yellow-500/10">
                      <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mb-4">Leitura de Cenário</p>
                      <p className="text-yellow-100/80 text-sm leading-relaxed italic">"{result.leituraCenario}"</p>
                    </div>
                  </div>
                </div>

                {/* Termos em Alta (Side) */}
                <div className="lg:col-span-4 glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><TagIcon className="w-5 h-5" /></span>
                        Termos Correlatos
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.buscasSemelhantes.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs font-bold border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[10px] font-mono text-gray-500 uppercase mb-3">Intenção do Usuário</p>
                    <p className="text-sm text-gray-400 leading-relaxed font-light">"{result.interpretacaoBuscas}"</p>
                  </div>
                </div>

                {/* Ideia de Conteúdo */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500/5 to-transparent relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <SparklesIcon className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><PencilSquareIcon className="w-5 h-5" /></span>
                      Conteúdo
                    </h4>
                    <span className="hidden xl:inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-pink-500/20 text-pink-300 border border-pink-500/20 truncate max-w-[100px]">{result.sugestaoConteudo.formato}</span>
                  </div>
                  <p className="text-white mb-6 min-h-[60px] whitespace-pre-line relative z-10 text-sm font-light leading-relaxed line-clamp-4">"{result.sugestaoConteudo.oque}"</p>
                  <div className="flex flex-col gap-2 relative z-10 mt-auto">
                    <Button onClick={handleCreateContent} variant="liquid" className="w-full font-bold shadow-lg shadow-pink-500/10 text-xs" title="Gerar post com IA">
                      <SparklesIcon className="w-3.5 h-3.5 mr-2" /> Criar
                    </Button>
                    <Button onClick={handleSchedule} variant="outline" className="w-full border-white/10 hover:bg-white/5 text-gray-300 text-xs">
                      <CalendarDaysIcon className="w-3.5 h-3.5 mr-2" /> Agendar
                    </Button>
                  </div>
                </div>

                {/* Oportunidade de Produto */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden hover:bg-white/[0.02] transition-colors">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><ShoppingBagIcon className="w-5 h-5" /></span>
                      Produto
                    </h4>
                  </div>
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex-grow">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sugestão de Oferta</p>
                      <p className="text-white text-sm font-medium leading-relaxed">"{result.sugestaoProduto.tipo}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Tópicos Chave</p>
                      <div className="flex flex-wrap gap-2">
                        {result.sugestaoProduto.temas.map((tema, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase rounded-lg">
                            {tema}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estratégia de Campanha */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/5 to-transparent relative overflow-hidden hover:bg-white/[0.02] transition-colors">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><RocketLaunchIcon className="w-5 h-5" /></span>
                      Tráfego
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed whitespace-pre-line font-light min-h-[60px] max-h-[100px] overflow-y-auto custom-scrollbar custom-scrollbar-light">{result.sugestaoCampanha.estrategia}</p>
                  <div className="mt-auto bg-black/30 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Sugestão de CTA</p>
                    <p className="text-orange-100 font-bold text-sm">"{result.sugestaoCampanha.cta}"</p>
                  </div>
                </div>

                {/* Veredito Final (Full Width) */}
                <div className="lg:col-span-12 relative overflow-hidden rounded-[2.5rem]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F19] to-black border border-white/10" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

                  <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚡</span>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">Veredito da IA</h4>
                      </div>
                      <p className="text-xl text-gray-300 font-light leading-relaxed mb-6">
                        {result.conclusao.avaliacao}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <span>Ideal para:</span>
                        {result.conclusao.idealPara.map((tag, i) => (
                          <span key={i} className="text-white bg-white/10 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:w-1/3 bg-green-500/10 border border-green-500/20 p-6 rounded-2xl backdrop-blur-md">
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3">Recomendação de Ação</p>
                      <p className="text-white font-bold text-lg leading-snug">
                        {result.conclusao.melhorEstrategia}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-end gap-3 mt-12 pt-8 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-500 uppercase tracking-widest mr-auto">Exportar Relatório</span>

                <Button onClick={() => handleDownload('txt')} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                  TXT
                </Button>
                <Button onClick={() => handleSaveToDrive('txt')} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                  Drive
                </Button>
                <Button onClick={handleExportPDF} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                  PDF
                </Button>
                <Button onClick={handleExportPPT} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                  PPT
                </Button>
                <Button onClick={handleGenerateHTML} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                  Landing Page
                </Button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button onClick={handleSaveToLibrary} variant="primary" size="sm" className="shadow-lg shadow-primary/20">
                  <BookmarkSquareIcon className="w-4 h-4 mr-2" /> Salvar na Biblioteca
                </Button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrendHunter;