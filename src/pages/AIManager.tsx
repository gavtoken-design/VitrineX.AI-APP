

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';
import InteractiveActionCenter from '../components/features/InteractiveActionCenter';
import { aiManagerStrategy } from '../services/ai';
import { getUserProfile, updateUserProfile } from '../services/core/firestore';
import { UserProfile } from '../types';
import { DEFAULT_BUSINESS_PROFILE } from '../constants';
import { CommandLineIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AIManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'command'>('command');

  // Strategy State
  const [prompt, setPrompt] = useState<string>('');
  const [strategyText, setStrategyText] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile['businessProfile']>(DEFAULT_BUSINESS_PROFILE);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

  // For now, using a mock user ID. In a real app, this would come from auth context.
  const userId = 'mock-user-123';

  const fetchUserProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        setUserProfile(profile.businessProfile);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Falha ao carregar o perfil do negócio. Por favor, atualize-o em Configurações.');
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateStrategy = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Por favor, insira um prompt para gerar uma estratégia.');
      return;
    }

    setLoading(true);
    setError(null);
    setStrategyText(null);
    setSuggestions([]);

    try {
      const result = await aiManagerStrategy(prompt, userProfile);
      setStrategyText(result.strategyText);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error('Error generating strategy:', err);
      setError(`Falha ao gerar estratégia: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [prompt, userProfile]);

  const handleUpdateProfile = useCallback(async (field: keyof UserProfile['businessProfile'], value: string) => {
    const updatedProfile = { ...userProfile, [field]: value };
    setUserProfile(updatedProfile);
    try {
      await updateUserProfile(userId, { businessProfile: updatedProfile });
    } catch (err) {
      console.error('Failed to update business profile for AI Manager:', err);
      setError('Falha ao salvar as alterações do perfil para o Gerente de IA. Isso pode afetar futuras gerações.');
    }
  }, [userProfile, userId]);


  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
        <p className="ml-2 text-textlight">Carregando perfil do negócio...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 lg:py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-textdark">Gerente de IA</h2>

        <div className="flex bg-lightbg rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'command' ? 'bg-accent text-darkbg shadow-sm' : 'text-textlight hover:text-white'}`}
          >
            <CommandLineIcon className="w-4 h-4" />
            Central de Comando
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'strategy' ? 'bg-accent text-darkbg shadow-sm' : 'text-textlight hover:text-white'}`}
          >
            <ChartBarIcon className="w-4 h-4" />
            Estratégia & Diagnóstico
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {activeTab === 'command' && (
        <div className="animate-slide-in-from-bottom duration-500">
          <InteractiveActionCenter />
          <p className="text-center text-textmuted text-sm mt-6">
            Use a Central de Comando para executar ações rápidas em qualquer módulo do sistema sem sair desta tela.
          </p>
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="animate-slide-in-from-bottom duration-500 space-y-8">
          <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800">
            <h3 className="text-xl font-semibold text-textlight mb-5">Informações do Negócio (Contexto)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="businessName"
                label="Nome da Empresa"
                value={userProfile.name}
                onChange={(e) => handleUpdateProfile('name', e.target.value)}
              />
              <Input
                id="industry"
                label="Indústria"
                value={userProfile.industry}
                onChange={(e) => handleUpdateProfile('industry', e.target.value)}
              />
              <Input
                id="targetAudience"
                label="Público-alvo"
                value={userProfile.targetAudience}
                onChange={(e) => handleUpdateProfile('targetAudience', e.target.value)}
              />
              <Input
                id="visualStyle"
                label="Estilo Visual"
                value={userProfile.visualStyle}
                onChange={(e) => handleUpdateProfile('visualStyle', e.target.value)}
              />
            </div>
          </div>

          <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800">
            <h3 className="text-xl font-semibold text-textlight mb-5">Solicitação Estratégica</h3>
            <Textarea
              id="aiManagerPrompt"
              label="Qual é o seu desafio de marketing atual?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Ex: 'Quero um diagnóstico completo do meu marketing digital e ideias para uma campanha de lançamento.'"
            />
            <Button
              onClick={handleGenerateStrategy}
              isLoading={loading}
              variant="primary"
              className="w-full md:w-auto mt-4"
            >
              {loading ? 'Gerando Estratégia...' : 'Gerar Estratégia'}
            </Button>
          </div>

          {strategyText && (
            <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800">
              <h3 className="text-xl font-semibold text-textlight mb-5">Plano Gerado</h3>
              <div className="prose max-w-none text-textlight leading-relaxed mb-6" style={{ whiteSpace: 'pre-wrap' }}>
                {strategyText}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-6 border-t border-gray-800 pt-6">
                  <h4 className="text-lg font-semibold text-textlight mb-4">Sugestões Acionáveis:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestions.map((s, index) => (
                      <li key={index} className="bg-darkbg p-3 rounded border border-gray-700 text-sm text-textlight flex items-start gap-2">
                        <span className="text-accent">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIManager;
