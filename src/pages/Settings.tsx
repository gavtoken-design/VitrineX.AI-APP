
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getUserProfile, updateUserProfile } from '../services/core/db';
import { testGeminiConnection } from '../services/ai/gemini';
import { UserProfile } from '../types';
import { DEFAULT_BUSINESS_PROFILE, HARDCODED_API_KEY, SUBSCRIPTION_CURRENCY, SUBSCRIPTION_PRICE_PROMO, SUBSCRIPTION_PRICE_FULL } from '../constants';
// FIX: Add missing import for Cog6ToothIcon
import { KeyIcon, ServerStackIcon, InformationCircleIcon, ArrowDownOnSquareIcon, PaintBrushIcon, GlobeAltIcon, SunIcon, MoonIcon, UserCircleIcon, Cog6ToothIcon, CheckCircleIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/ui/Logo';
import { useNavigate } from '../hooks/useNavigate';

const Settings: React.FC = () => {
  // Profile State
  const [businessProfileForm, setBusinessProfileForm] = useState<UserProfile['businessProfile']>(DEFAULT_BUSINESS_PROFILE);
  const [contactInfoForm, setContactInfoForm] = useState<UserProfile['contactInfo']>({
    instagram: '', tiktok: '', twitter: '', pinterest: '', whatsapp: '', facebook: ''
  });
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { navigateTo } = useNavigate();
  const userId = 'mock-user-123';

  useEffect(() => {
    const fetchInitialData = async () => {
      setProfileLoading(true);
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setBusinessProfileForm(profile.businessProfile);
          if (profile.contactInfo) {
            setContactInfoForm(profile.contactInfo);
          }
        }
        const savedKey = localStorage.getItem('vitrinex_gemini_api_key');
        if (savedKey) {
          setApiKey(savedKey);
          setIsKeySaved(true);
        } else if (HARDCODED_API_KEY) {
          setApiKey(HARDCODED_API_KEY);
          setIsKeySaved(true);
        }
      } catch (err) {
        addToast({ type: 'error', message: 'Falha ao carregar dados iniciais.' });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchInitialData();
  }, [userId, addToast]);

  const validateAndSetKey = (key: string) => {
    setApiKey(key);
    if (!key.trim()) {
      setKeyError(null);
      return;
    }
    if (!key.startsWith('AIzaSy')) {
      setKeyError('Formato inválido. A chave deve começar com "AIzaSy".');
    } else if (key.length < 38) {
      setKeyError('Chave muito curta.');
    } else if (/\s/.test(key)) {
      setKeyError('A chave não pode conter espaços.');
    } else {
      setKeyError(null);
    }
  };

  const handleSaveKey = async () => {
    if (keyError || !apiKey.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira uma chave de API válida.' });
      return;
    }
    setIsTesting(true);
    try {
      await testGeminiConnection(apiKey.trim());
      localStorage.setItem('vitrinex_gemini_api_key', apiKey.trim());
      setIsKeySaved(true);
      addToast({ type: 'success', title: 'Chave Salva!', message: 'O motor de IA foi ativado com sucesso.' });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Chave Inválida', message: `A conexão falhou: ${e.message}` });
      setIsKeySaved(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira uma chave de API para testar.' });
      return;
    }
    setIsTesting(true);
    try {
      const result = await testGeminiConnection(apiKey.trim());
      addToast({ type: 'success', title: 'Conexão bem-sucedida!', message: `Resposta da IA: "${result.substring(0, 50)}..."` });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Falha na Conexão', message: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const profileData = {
        businessProfile: businessProfileForm,
        contactInfo: contactInfoForm
      };
      await updateUserProfile(userId, profileData);
      addToast({ type: 'success', message: 'Perfil do negócio salvo com sucesso!' });
    } catch (err) {
      addToast({ type: 'error', message: `Falha ao salvar perfil: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportKey = () => {
    const savedKey = localStorage.getItem('vitrinex_gemini_api_key') || apiKey;
    if (!savedKey) {
      addToast({ type: 'warning', message: 'Nenhuma chave salva para exportar.' });
      return;
    }
    const blob = new Blob([savedKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vitrinex_gemini_api_key.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'info', message: 'Backup da chave iniciado.' });
  };

  return (
    <div className="animate-fade-in duration-500 space-y-10 max-w-3xl mx-auto pb-10">
      <h2 className="text-3xl font-bold text-title">Configurações</h2>

      {/* API Key Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-primary" /> Motor de Inteligência (Gemini)
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-title mb-1.5">
              Chave API
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => validateAndSetKey(e.target.value)}
              placeholder="AIzaSy..."
              className={`block w-full px-3 py-2.5 liquid-glass-light border rounded-lg shadow-sm text-title placeholder-muted liquid-transition sm:text-sm focus:outline-none ${keyError ? 'border-error ring-1 ring-error' : 'border-white/20 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
            />
            {keyError && <p className="mt-2 text-xs text-error">{keyError}</p>}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted mt-2">
              Cole sua chave de API do Google Gemini para ativar as funcionalidades de IA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={handleSaveKey}
              isLoading={isTesting && !keyError}
              disabled={!!keyError || !apiKey.trim()}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <ServerStackIcon className="w-4 h-4 mr-2" />
              {isKeySaved ? 'Salvar & Reativar' : 'Salvar & Ativar'}
            </Button>
            <Button
              onClick={handleTestKey}
              isLoading={isTesting}
              disabled={!apiKey.trim()}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Testar Conexão
            </Button>
            <Button
              onClick={handleExportKey}
              variant="ghost"
              className="w-full sm:w-auto sm:ml-auto"
              disabled={!isKeySaved && !apiKey}
            >
              <ArrowDownOnSquareIcon className="w-4 h-4 mr-2" />
              Exportar Chave
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Plan Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <MegaphoneIcon className="w-32 h-32 text-primary rotate-12" />
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
            <ServerStackIcon className="w-5 h-5 text-primary" /> Meu Plano
          </h3>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-background rounded-lg p-6 border border-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold tracking-wider text-primary uppercase">Plano Pro (Early Adopter)</span>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">ATIVO</span>
              </div>
              <h4 className="text-3xl font-bold text-title mb-1">
                {SUBSCRIPTION_CURRENCY} {SUBSCRIPTION_PRICE_PROMO} <span className="text-sm font-normal text-muted">/mês</span>
              </h4>
              <p className="text-sm text-muted line-through opacity-70">
                De: {SUBSCRIPTION_CURRENCY} {SUBSCRIPTION_PRICE_FULL}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-title">
                <CheckCircleIcon className="w-4 h-4 text-green-500" /> <span>Acesso Ilimitado ao TrendHunter Deeper</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-title">
                <CheckCircleIcon className="w-4 h-4 text-green-500" /> <span>Geração de Vídeo (Veo) & Imagens 4K</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-title">
                <CheckCircleIcon className="w-4 h-4 text-green-500" /> <span>Modo "Thinking" (Raciocínio Profundo)</span>
              </div>
            </div>

            <Button variant="outline" className="h-fit whitespace-nowrap">
              Gerenciar Assinatura
            </Button>
          </div>
        </div>
      </div>

      {/* Business Profile Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5 text-primary" /> Perfil do Negócio
        </h3>
        {profileLoading ? <LoadingSpinner /> : (
          <div className="space-y-4">
            <Input
              id="businessName"
              label="Nome da Empresa"
              value={businessProfileForm.name}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, name: e.target.value })}
            />
            <Textarea
              id="industry"
              label="Indústria / Nicho"
              value={businessProfileForm.industry}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, industry: e.target.value })}
              rows={2}
              placeholder="Ex: E-commerce de moda sustentável"
            />
            <Textarea
              id="targetAudience"
              label="Público-alvo"
              value={businessProfileForm.targetAudience}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, targetAudience: e.target.value })}
              rows={3}
              placeholder="Ex: Mulheres de 25-40 anos, conscientes ambientalmente..."
            />
            <Input
              id="visualStyle"
              label="Estilo Visual"
              value={businessProfileForm.visualStyle}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, visualStyle: e.target.value })}
              placeholder="Ex: Minimalista, vibrante, retrô..."
            />
            <Button onClick={handleSaveProfile} isLoading={savingProfile} variant="primary" className="w-full sm:w-auto">
              Salvar Perfil
            </Button>
          </div>
        )}
      </div>

      {/* Social & Contact Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-primary" /> Redes Sociais & Contato
        </h3>
        {profileLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="email"
              label="Email de Contato"
              value={'gavtoken@gmail.com'}
              disabled={true}
              placeholder="gavtoken@gmail.com"
              className="md:col-span-2"
            />
            <Input
              id="instagram"
              label="Instagram"
              value={contactInfoForm?.instagram || ''}
              onChange={(e) => setContactInfoForm({ ...contactInfoForm, instagram: e.target.value })}
              placeholder="@seu_perfil"
            />
            <Input
              id="twitter"
              label="Twitter / X"
              value={contactInfoForm?.twitter || ''}
              onChange={(e) => setContactInfoForm({ ...contactInfoForm, twitter: e.target.value })}
              placeholder="@seu_perfil"
            />
            <Input
              id="tiktok"
              label="TikTok"
              value={contactInfoForm?.tiktok || ''}
              onChange={(e) => setContactInfoForm({ ...contactInfoForm, tiktok: e.target.value })}
              placeholder="@seu_perfil"
            />
            <Input
              id="pinterest"
              label="Pinterest"
              value={contactInfoForm?.pinterest || ''}
              onChange={(e) => setContactInfoForm({ ...contactInfoForm, pinterest: e.target.value })}
              placeholder="@seu_perfil"
            />
            <Input
              id="whatsapp"
              label="WhatsApp"
              value={contactInfoForm?.whatsapp || ''}
              onChange={(e) => setContactInfoForm({ ...contactInfoForm, whatsapp: e.target.value })}
              placeholder="(00) 00000-0000"
              className="md:col-span-2"
            />

            <div className="md:col-span-2 pt-4">
              <Button onClick={handleSaveProfile} isLoading={savingProfile} variant="primary" className="w-full sm:w-auto">
                Salvar Informações
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* System Preferences Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <Cog6ToothIcon className="w-5 h-5 text-primary" /> Preferências do Sistema
        </h3>
        <div className="space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-medium text-title mb-2 flex items-center gap-2">
              <PaintBrushIcon className="w-4 h-4" /> Tema da Interface
            </label>
            <div className="flex gap-2 rounded-lg bg-background p-1 border border-border w-fit">
              <button onClick={() => toggleTheme()} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-white text-title shadow-sm' : 'text-muted hover:text-title'}`}>
                <SunIcon className="w-4 h-4 inline mr-1.5" /> Claro
              </button>
              <button onClick={() => toggleTheme()} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted hover:text-title'}`}>
                <MoonIcon className="w-4 h-4 inline mr-1.5" /> Escuro
              </button>
            </div>
          </div>
          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-title mb-2 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" /> Idioma
            </label>
            <div className="flex gap-2 rounded-lg bg-background p-1 border border-border w-fit">
              <button onClick={() => setLanguage('pt-BR')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${language === 'pt-BR' ? 'bg-white text-title shadow-sm' : 'text-muted hover:text-title'}`}>
                Português
              </button>
              <button onClick={() => setLanguage('en-US')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${language === 'en-US' ? 'bg-white text-title shadow-sm' : 'text-muted hover:text-title'}`}>
                English
              </button>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-title mb-3">Gerenciamento de Dados (Ficar Seguro)</h4>
            <p className="text-xs text-muted mb-4">
              Seus dados (posts, campanhas) ficam salvos neste navegador. Exporte regularmente para não perder nada.
            </p>
            <Button
              onClick={() => {
                const data = {
                  db: localStorage.getItem('vitrinex_mock_db'),
                  apiKey: localStorage.getItem('vitrinex_gemini_api_key'),
                  date: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `backup-vitrinex-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                addToast({ type: 'success', message: 'Backup de dados baixado com sucesso!' });
              }}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <ArrowDownOnSquareIcon className="w-4 h-4 mr-2" />
              Exportar Todos os Dados (.JSON)
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Access - Discreet */}
      <div className="flex justify-center pt-10 pb-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
        <button
          onClick={() => navigateTo('Admin')}
          className="group relative p-3 rounded-full hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-500"
          aria-label="Access Admin Console"
        >
          <div className="transform group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out">
            <Logo showText={false} className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all duration-500" />
          </div>
          {/* Subtle Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
        </button>
      </div>

    </div>
  );
};

export default Settings;
