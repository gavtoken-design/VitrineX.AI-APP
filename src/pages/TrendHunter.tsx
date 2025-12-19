
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { generateText } from '../services/ai';
import { saveTrend } from '../services/core/db';
import { getUserProfile } from '../services/core/firestore';
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
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { saveLibraryItem } from '../services/core/db';
import { LibraryItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

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
  }, [requestLocation]);

  // BUSCA DE TENDÊNCIAS COM RESULTADO ESTRUTURADO
  const handleSearchTrends = useCallback(async () => {
    if (!query.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira uma palavra-chave.' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setRawQuery(query.trim());

    const objectiveLabel = OBJECTIVES.find(o => o.id === objective)?.label || 'Todos os objetivos';
    const locationText = city.trim() ? `${city.trim()} – Brasil` : 'Brasil';

    const prompt = `Analise a tendência atual para a keyword "${query.trim()}" no local "${city || 'Brasil'}".
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

IMPORTANTE: Forneça insights práticos e prontos para uso. Retorne APENAS o JSON puro.`;

    try {
      const response = await generateText(prompt, {
        model: GEMINI_FLASH_MODEL,
        tools: [{ googleSearch: {} }]
      });

      // Tentar parsear o JSON de forma robusta
      let parsed: TrendResultStructured;
      try {
        // Encontrar o primeiro '{' e o último '}'
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError, response);
        throw new Error('Falha ao processar resposta da IA. Tente novamente.');
      }

      setResult(parsed);

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
    navigateTo('ContentGenerator');
    addToast({ type: 'info', message: 'Abrindo gerador de conteúdo...' });
  }, [navigateTo, addToast]);

  const handleSchedule = useCallback(() => {
    navigateTo('SmartScheduler');
    addToast({ type: 'info', message: 'Abrindo agendador...' });
  }, [navigateTo, addToast]);

  const handleClear = useCallback(() => {
    setQuery('');
    setCity('');
    setResult(null);
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

  const handleSaveToLibrary = useCallback(async () => {
    if (!result) return;

    setLoading(true);
    try {
      const item: LibraryItem = {
        id: `lib-${Date.now()}`,
        userId,
        type: 'text',
        name: `Tendência: ${query}`,
        file_url: '', // No file for text-only trend
        tags: ['tendencia', 'trendhunter', ...result.motivadores],
        createdAt: new Date().toISOString()
      };
      // We save the full text content as "file_url" or strictly text content based on implementation. 
      // Assuming 'file_url' stores the content for type 'text' if not a link.
      // Re-using the text generation logic for content
      const textContent = `Tendência: ${query}\n\n${result.resumo}`;
      item.file_url = textContent; // Storing text directly for simplicity in text type

      await saveLibraryItem(item);
      addToast({ type: 'success', message: 'Salvo na Biblioteca com sucesso!' });
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
          <p className="text-lg font-semibold text-white">{score}/100</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-title flex items-center gap-3">
          <MagnifyingGlassIcon className="w-8 h-8 text-primary" />
          Caçador de Tendências
        </h2>
        <p className="text-muted mt-1">Descubra tendências e oportunidades de mercado com Google Search + IA</p>
      </div>

      <HowToUse
        title="Como Pesquisar Tendências"
        steps={[
          "Digite uma palavra-chave ou tema para pesquisar",
          "Clique em 'Buscar Tendências'",
          "A IA busca no Google e analisa os resultados",
          "Aguarde a análise (pode levar alguns segundos)",
          "Revise as tendências, insights e oportunidades",
          "Use as informações para planejar conteúdo"
        ]}
        tips={[
          "Seja específico: 'marketing digital 2024' é melhor que 'marketing'",
          "Use para pesquisa de mercado, análise de concorrentes",
          "Combine com seu perfil de negócio para insights personalizados",
          "Resultados são baseados em dados reais do Google"
        ]}
      />

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Formulário de Busca */}
      <div className="bg-surface p-6 rounded-xl shadow-card border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Input
              id="trendQuery"
              label="Palavra-chave:"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: ebook, pizza artesanal, moda fitness..."
              className="mb-0"
            />
            <button
              onClick={handlePaste}
              className="absolute right-2 top-8 p-1.5 text-muted hover:text-primary transition-colors rounded-md bg-gray-700/50"
              title="Colar texto"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-title mb-1.5 flex justify-between">
              <span>Localização:</span>
              {locationStatus === 'success' && !city && (
                <span className="text-xs text-success flex items-center gap-1">
                  <GlobeAltIcon className="w-3 h-3" /> GPS Ativo
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                className="block w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary sm:text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade, Estado ou País..."
              />
              {locationStatus === 'success' && !city && (
                <MapPinIcon className="absolute right-3 top-2.5 w-4 h-4 text-success" />
              )}
            </div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-title mb-2">Objetivo:</label>
          <div className="flex flex-wrap gap-2">
            {OBJECTIVES.map(obj => (
              <button
                key={obj.id}
                onClick={() => setObjective(obj.id)}
                className={`px - 4 py - 2 rounded - lg text - sm font - medium transition - all flex items - center gap - 2 ${objective === obj.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  } `}
              >
                <span>{obj.icon}</span>
                {obj.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSearchTrends} isLoading={loading} variant="primary" className="flex-1 sm:flex-none">
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            {loading ? 'Analisando...' : 'Buscar Tendências'}
          </Button>
          {(query || result) && (
            <Button onClick={handleClear} variant="outline">Limpar</Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-surface p-12 rounded-xl border border-gray-800 text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-white text-lg font-medium">Analisando tendências para "{query}"...</p>
          <p className="text-muted mt-2">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Resultado Estruturado */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Header do Resultado */}
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 rounded-xl border border-primary/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted uppercase tracking-wider">Busca de Tendência</p>
                <h3 className="text-2xl font-bold text-white mt-1">Palavra-chave: {rawQuery}</h3>
                <p className="text-muted mt-1">Localização: {city || 'Brasil'} • Objetivo: {OBJECTIVES.find(o => o.id === objective)?.label}</p>
              </div>
              {renderScore(result.score)}
            </div>
          </div>

          {/* 📊 Resultado da Busca */}
          <div className="bg-surface p-6 rounded-xl border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-primary" />
                📊 RESULTADO DA BUSCA
              </h4>
              <button
                onClick={() => handleCopySection(result.resumo, 'Resumo')}
                className="p-1.5 text-muted hover:text-primary transition-colors rounded-md bg-gray-800"
                title="Copiar Resumo"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">{result.resumo}</p>

            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-muted mb-2">Principais motivadores de busca:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.motivadores.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Leitura do cenário:</strong> {result.leituraCenario}
              </p>
            </div>
          </div>

          {/* 🔎 Buscas Semelhantes */}
          <div className="bg-surface p-6 rounded-xl border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary" />
                🔎 PRODUTOS / BUSCAS SEMELHANTES
              </h4>
              <button
                onClick={() => handleCopySection(result.buscasSemelhantes.join(', '), 'Buscas Semelhantes')}
                className="p-1.5 text-muted hover:text-primary transition-colors rounded-md bg-gray-800"
                title="Copiar Termos"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.buscasSemelhantes.map((b, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                  {b}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              <strong>Interpretação:</strong> {result.interpretacaoBuscas}
            </p>
          </div>

          {/* 💡 Sugestão de Conteúdo */}
          {(objective === 'content' || objective === 'all') && (
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-primary" />
                  💡 SUGESTÃO DE CONTEXTO
                </h4>
                <button
                  onClick={() => handleCopySection(`${result.sugestaoConteudo.oque}\n\nFormato: ${result.sugestaoConteudo.formato}`, 'Sugestão de Conteúdo')}
                  className="p-1.5 text-muted hover:text-primary transition-colors rounded-md bg-gray-800"
                  title="Copiar Conteúdo"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-4">
                <p className="text-white">{result.sugestaoConteudo.oque}</p>
              </div>
              <p className="text-muted text-sm">
                <strong>Formato recomendado:</strong> <span className="text-primary font-medium">{result.sugestaoConteudo.formato}</span>
              </p>
            </div>
          )}

          {/* 📘 Sugestão de Produto */}
          {(objective === 'product' || objective === 'all') && (
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5 text-primary" />
                  📘 SUGESTÃO DE PRODUTO
                </h4>
                <button
                  onClick={() => handleCopySection(`${result.sugestaoProduto.tipo}\n\nTemas:\n${result.sugestaoProduto.temas.map(t => `- ${t}`).join('\n')}`, 'Sugestão de Produto')}
                  className="p-1.5 text-muted hover:text-primary transition-colors rounded-md bg-gray-800"
                  title="Copiar Produto"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-300 mb-4">{result.sugestaoProduto.tipo}</p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-muted mb-2">Temas que convertem:</p>
                <ul className="space-y-2">
                  {result.sugestaoProduto.temas.map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <SparklesIcon className="w-4 h-4 text-accent" />
                      "{t}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 🚀 Sugestão de Campanha */}
          {(objective === 'campaign' || objective === 'all') && (
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <RocketLaunchIcon className="w-5 h-5 text-primary" />
                  🚀 ESTRATÉGIA DE CAMPANHA
                </h4>
                <button
                  onClick={() => handleCopySection(`${result.sugestaoCampanha.estrategia}\n\nCTA: ${result.sugestaoCampanha.cta}`, 'Sugestão de Campanha')}
                  className="p-1.5 text-muted hover:text-primary transition-colors rounded-md bg-gray-800"
                  title="Copiar Campanha"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-300 mb-4">{result.sugestaoCampanha.estrategia}</p>
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
                <p className="text-sm text-muted mb-1">CTA sugerido:</p>
                <p className="text-green-300 text-lg font-medium">"{result.sugestaoCampanha.cta}"</p>
              </div>
            </div>
          )}

          {/* ✅ Conclusão */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              ✅ CONCLUSÃO AUTOMÁTICA DO SISTEMA
            </h4>
            <p className="text-gray-300 mb-4">{result.conclusao.avaliacao}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted mb-2">Ideal para:</p>
                <ul className="space-y-1">
                  {result.conclusao.idealPara.map((p, i) => (
                    <li key={i} className="text-gray-300 flex items-center gap-2">
                      <span className="text-green-400">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted mb-2">Melhor estratégia:</p>
                <p className="text-white font-medium">{result.conclusao.melhorEstrategia}</p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleUseInContent} variant="primary" className="flex items-center gap-2">
              <PencilSquareIcon className="w-4 h-4" />
              Usar no Criador
            </Button>

            <div className="flex gap-2">
              <Button onClick={() => handleDownload('txt')} variant="secondary" className="flex items-center gap-2" title="Baixar TXT">
                <ArrowDownTrayIcon className="w-4 h-4" /> TXT
              </Button>
              <Button onClick={() => handleDownload('doc')} variant="secondary" className="flex items-center gap-2" title="Copiar para Docs">
                <ClipboardDocumentIcon className="w-4 h-4" /> Docs
              </Button>
            </div>

            <Button onClick={handleSaveToLibrary} variant="outline" className="flex items-center gap-2">
              <BookmarkSquareIcon className="w-4 h-4" />
              Salvar Biblioteca
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendHunter;