
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
  SparklesIcon
} from '@heroicons/react/24/outline';
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

    const prompt = `Você é um analista de tendências de mercado experiente.

  PALAVRA - CHAVE PESQUISADA: "${query.trim()}"
LOCALIZAÇÃO: ${locationText}
OBJETIVO DO CLIENTE: ${objectiveLabel}
PERFIL DO NEGÓCIO: ${userProfile.name} (${userProfile.industry}) - Público: ${userProfile.targetAudience}

Analise a tendência dessa palavra - chave e retorne um JSON com a seguinte estrutura EXATA:

{
  "score": [número de 0 a 100 indicando relevância da keyword],
    "resumo": "[resumo de 2-3 parágrafos sobre a tendência atual dessa keyword na localização especificada]",
      "motivadores": ["motivador1", "motivador2", "motivador3", "motivador4", "motivador5"],
        "leituraCenario": "[análise de 1-2 frases sobre o potencial de monetização]",
          "buscasSemelhantes": ["termo1", "termo2", "termo3", "termo4", "termo5", "termo6"],
            "interpretacaoBuscas": "[interpretação do que essas buscas indicam sobre a intenção do público]",
              "sugestaoConteudo": {
    "oque": "[descrição detalhada do tipo de conteúdo a criar]",
      "formato": "[formato recomendado: Reels, Carrossel, Stories, Blog, etc]"
  },
  "sugestaoProduto": {
    "tipo": "[tipo de produto digital sugerido]",
      "temas": ["tema1 que converte", "tema2 que converte", "tema3 que converte"]
  },
  "sugestaoCampanha": {
    "estrategia": "[estratégia de campanha em 2-3 frases]",
      "cta": "[CTA pronto para usar entre aspas]"
  },
  "conclusao": {
    "avaliacao": "[avaliação final da keyword em 1-2 frases]",
      "idealPara": ["perfil1", "perfil2", "perfil3"],
        "melhorEstrategia": "[melhor estratégia resumida]"
  }
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional antes ou depois.`;

    try {
      const response = await generateText(prompt, {
        model: GEMINI_FLASH_MODEL,
        tools: [{ googleSearch: {} }]
      });

      // Tentar parsear o JSON
      let parsed: TrendResultStructured;
      try {
        // Limpar possíveis caracteres extras
        const cleanedResponse = response.replace(/```json\n ?|\n ? ```/g, '').trim();
        parsed = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError, response);
        throw new Error('Falha ao processar resposta da IA. Tente novamente.');
      }

      setResult(parsed);

      // Salvar tendência no banco
      const trendToSave: Trend = {
        id: `trend - ${Date.now()} `,
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
    navigateTo('CalendarManager');
    addToast({ type: 'info', message: 'Abrindo agendador...' });
  }, [navigateTo, addToast]);

  const handleClear = useCallback(() => {
    setQuery('');
    setCity('');
    setResult(null);
    setError(null);
  }, []);

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
          <Input
            id="trendQuery"
            label="Palavra-chave:"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: ebook, pizza artesanal, moda fitness..."
            className="mb-0"
          />

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
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-primary" />
              📊 RESULTADO DA BUSCA
            </h4>
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
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <TagIcon className="w-5 h-5 text-primary" />
              🔎 PRODUTOS / BUSCAS SEMELHANTES
            </h4>
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
              <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
                💡 SUGESTÃO DE CONTEÚDO
              </h4>
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
              <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <ShoppingBagIcon className="w-5 h-5 text-primary" />
                📘 SUGESTÃO DE PRODUTO DIGITAL
              </h4>
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
              <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <RocketLaunchIcon className="w-5 h-5 text-primary" />
                🚀 SUGESTÃO DE CAMPANHA
              </h4>
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
            <Button onClick={handleCreateContent} variant="primary" className="flex items-center gap-2">
              <LightBulbIcon className="w-4 h-4" />
              Criar Conteúdo
            </Button>
            <Button onClick={handleSchedule} variant="secondary" className="flex items-center gap-2">
              Agendar Publicação
            </Button>
            <Button onClick={() => setResult(null)} variant="outline">
              Nova Busca
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendHunter;