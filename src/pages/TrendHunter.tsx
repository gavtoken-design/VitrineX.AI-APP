
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { searchTrends, generateText } from '../services/ai';
import { getTrends, saveTrend } from '../services/core/db';
import { Trend, GroundingMetadata } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { GEMINI_FLASH_MODEL } from '../constants';
import { LightBulbIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

const TrendHunter: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'success' | 'denied'>('pending');

  const [generatedIdeas, setGeneratedIdeas] = useState<Record<string, string>>({});
  const [generatingIdeaFor, setGeneratingIdeaFor] = useState<string | null>(null);

  const { navigateTo } = useNavigate();
  const { addToast } = useToast();
  const { language } = useLanguage();

  const userId = 'mock-user-123';

  const requestLocation = useCallback(() => {
    setLocationStatus('pending');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (err) => {
          console.warn('Geolocation access denied or failed:', err);
          setLocationStatus('denied');
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleSearchTrends = useCallback(async () => {
    if (!query.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira um termo de busca para tendências.' });
      return;
    }

    setLoading(true);
    setError(null);
    setTrends([]);
    setGeneratedIdeas({});

    try {
      // Se tiver cidade, concatenamos na query para garantir contexto.
      let finalQuery = query;
      if (city.trim()) {
        finalQuery += ` em ${city}`;
      }

      const fetchedTrends = await searchTrends(finalQuery, language);
      const trendsWithUserId = fetchedTrends.map(t => ({ ...t, userId: userId }));
      setTrends(trendsWithUserId);

      for (const trend of trendsWithUserId) {
        await saveTrend(trend);
      }
      addToast({ type: 'success', message: `${trendsWithUserId.length} tendências encontradas e salvas!` });

    } catch (err) {
      const errorMessage = `Falha ao buscar tendências: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro na Busca', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [query, city, userId, addToast, language]);

  const handleGenerateContentIdea = useCallback(async (trend: Trend) => {
    setGeneratingIdeaFor(trend.id);
    try {
      const prompt = language === 'pt-BR'
        ? `Com base no tópico em alta "${trend.query}" e nos seguintes detalhes: "${trend.data}", sugira uma ideia de conteúdo criativa e envolvente (por exemplo, um conceito de post para rede social ou título de blog). Mantenha a sugestão concisa e em português.`
        : `Based on the trending topic "${trend.query}" and the following details: "${trend.data}", suggest a creative and engaging content idea (e.g., a social media post concept or blog title). Keep it concise.`;

      const idea = await generateText(prompt, { model: GEMINI_FLASH_MODEL });
      setGeneratedIdeas(prev => ({ ...prev, [trend.id]: idea }));
    } catch (err) {
      console.error('Error generating idea:', err);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao gerar ideia de conteúdo.' });
    } finally {
      setGeneratingIdeaFor(null);
    }
  }, [addToast, language]);

  const handleCreateContentFromTrend = useCallback((trend: Trend) => {
    navigateTo('ContentGenerator');
    addToast({ type: 'info', message: `Criando conteúdo baseado na tendência: ${trend.query}` });
  }, [navigateTo, addToast]);

  const handleAddTrendToCalendar = useCallback((trend: Trend) => {
    navigateTo('SmartScheduler');
    addToast({ type: 'info', message: `Adicionando tendência "${trend.query}" ao calendário.` });
  }, [navigateTo, addToast]);

  const hasActiveFilters = query.trim() || city.trim();

  const handleClearSearch = useCallback(() => {
    setQuery('');
    setCity('');
    setTrends([]);
    setGeneratedIdeas({});
    setError(null);
  }, []);

  const renderTextWithCitations = (text: string, metadata: GroundingMetadata | undefined) => {
    if (!metadata?.groundingSupports || !metadata?.groundingChunks || metadata.groundingSupports.length === 0) {
      return <p className="text-body leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    const supports = metadata.groundingSupports;
    const chunks = metadata.groundingChunks;
    let textWithMarkdown = text;

    const sortedSupports = [...supports].sort(
      (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0),
    );

    for (const support of sortedSupports) {
      const endIndex = support.segment?.endIndex;
      if (endIndex === undefined || !support.groundingChunkIndices?.length) continue;

      const citationLinks = support.groundingChunkIndices
        .map(i => {
          const uri = chunks[i]?.web?.uri || chunks[i]?.maps?.uri;
          if (uri) {
            return `[${i + 1}](${uri})`;
          }
          return null;
        })
        .filter(Boolean);

      if (citationLinks.length > 0) {
        const citationString = " " + citationLinks.join("");
        textWithMarkdown = textWithMarkdown.slice(0, endIndex) + citationString + textWithMarkdown.slice(endIndex);
      }
    }

    const parts = textWithMarkdown.split(/(\[\d+\]\(.+?\))/g);

    return (
      <p className="text-body leading-relaxed whitespace-pre-wrap">
        {parts.map((part, index) => {
          const match = part.match(/\[(\d+)\]\((.+?)\)/);
          if (match) {
            const [, number, url] = match;
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block align-baseline text-xs bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md mx-0.5 hover:bg-primary/20 hover:underline"
                title={`Ir para fonte ${number}`}
              >
                {number}
              </a>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-title mb-8">Caçador de Tendências</h2>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-surface p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-title mb-5 flex justify-between items-center">
          Buscar Tendências
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="trendQuery"
            label="Nicho ou Tópico:"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: 'Marketing digital para restaurantes'"
            className="mb-0"
          />

          <div className="relative">
            <label className="block text-sm font-medium text-title mb-1.5 flex justify-between">
              <span>Local (Opcional)</span>
              {locationStatus === 'success' && !city && (
                <span className="text-xs text-success flex items-center gap-1">
                  <GlobeAltIcon className="w-3 h-3" /> Usando GPS
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="trendCity"
                type="text"
                className={`block w-full px-3 py-2.5 bg-surface border rounded-lg shadow-sm text-body placeholder-muted transition-colors focus:outline-none sm:text-sm ${locationStatus === 'success' && !city
                  ? 'border-success/50 ring-1 ring-success/20 pl-9'
                  : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={locationStatus === 'success' ? "GPS Ativo (Digite para alterar)" : "Digite cidade ou país..."}
              />
              {locationStatus === 'success' && !city && (
                <MapPinIcon className="absolute left-3 top-2.5 w-4 h-4 text-success" />
              )}
              <button
                onClick={requestLocation}
                className={`absolute right-2 top-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${locationStatus === 'success' ? 'text-success' : 'text-muted'}`}
                title={locationStatus === 'success' ? 'GPS Ativo' : 'Ativar GPS'}
              >
                {locationStatus === 'pending' ? <LoadingSpinner className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={handleSearchTrends}
            isLoading={loading}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {loading ? 'Buscando Tendências...' : 'Buscar Tendências'}
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={handleClearSearch}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Limpar Busca
            </Button>
          )}
        </div>
      </div>

      {trends.length > 0 && (
        <div className="bg-surface p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-title mb-5">Resultados de Tendências</h3>
          <div className="space-y-8">
            {trends.map((trend) => (
              <div key={trend.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-title">{trend.query}</h4>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${trend.score > 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : trend.score > 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                    Score Viral: {trend.score}
                  </span>
                </div>
                <div className="mb-4">
                  {renderTextWithCitations(trend.data, trend.groundingMetadata)}
                </div>
                {trend.sources && trend.sources.length > 0 && (
                  <div className="mt-3 bg-background/50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-muted mb-2">Fontes:</p>
                    <ol className="list-decimal list-inside text-sm text-primary space-y-1">
                      {trend.sources.map((source, idx) => (
                        <li key={idx}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {generatedIdeas[trend.id] && (
                  <div className="mt-4 mb-4 p-4 bg-primary/5 border border-primary/20 rounded-md animate-in fade-in">
                    <h5 className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                      <LightBulbIcon className="w-4 h-4" />
                      Ideia de Conteúdo
                    </h5>
                    <p className="text-sm text-body italic">"{generatedIdeas[trend.id]}"</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
                  <Button
                    onClick={() => handleGenerateContentIdea(trend)}
                    isLoading={generatingIdeaFor === trend.id}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Gerar Ideia de Conteúdo
                  </Button>
                  <Button onClick={() => handleCreateContentFromTrend(trend)} variant="primary" className="w-full sm:w-auto">Criar Conteúdo da Tendência</Button>
                  <Button onClick={() => handleAddTrendToCalendar(trend)} variant="secondary" className="w-full sm:w-auto">Adicionar ao Calendário</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendHunter;