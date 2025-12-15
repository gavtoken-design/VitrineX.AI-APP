
import * as React from 'react';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNavMenu from './components/layout/MobileNavMenu'; // Import the new mobile menu
import BottomNav from './components/layout/BottomNav'; // Import Bottom Nav
import LoadingSpinner from './components/ui/LoadingSpinner';
import Logo from './components/ui/Logo';
import TutorialOverlay from './components/features/TutorialOverlay';
import { NavigationContext } from './hooks/useNavigate';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KeyIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/outline';
import { testGeminiConnection } from './services/ai/gemini';
import { HARDCODED_API_KEY } from './constants';

// Lazy load all page components for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AIManager = React.lazy(() => import('./pages/AIManager'));
const ContentGenerator = React.lazy(() => import('./pages/ContentGenerator'));
const AdStudio = React.lazy(() => import('./pages/AdStudio'));
const CampaignBuilder = React.lazy(() => import('./pages/CampaignBuilder'));
const TrendHunter = React.lazy(() => import('./pages/TrendHunter'));
const CreativeStudio = React.lazy(() => import('./pages/CreativeStudio'));
const ContentLibrary = React.lazy(() => import('./pages/ContentLibrary'));
const SmartScheduler = React.lazy(() => import('./pages/SmartScheduler'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Chatbot = React.lazy(() => import('./pages/Chatbot'));
const CodeAudit = React.lazy(() => import('./pages/CodeAudit'));
const AudioTools = React.lazy(() => import('./pages/AudioTools'));
const CalendarManager = React.lazy(() => import('./pages/CalendarManager'));
const CodePlayground = React.lazy(() => import('./pages/CodePlayground'));
const LocalFinder = React.lazy(() => import('./pages/LocalFinder'));


export type ModuleName =
  | 'Dashboard'
  | 'AIManager'
  | 'ContentGenerator'
  | 'AdStudio'
  | 'CampaignBuilder'
  | 'TrendHunter'
  | 'CreativeStudio'
  | 'ContentLibrary'
  | 'SmartScheduler'
  | 'Settings'
  | 'Chatbot'
  | 'CodeAudit'
  | 'AudioTools'
  | 'CalendarManager'
  | 'CodePlayground'
  | 'LocalFinder';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const [activeModule, setActiveModule] = useState<ModuleName>('Dashboard');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [loadingApiKeyCheck, setLoadingApiKeyCheck] = useState<boolean>(true);
  const [manualApiKey, setManualApiKey] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const checkAndSelectApiKey = useCallback(async () => {
    // 1. Check Window (AI Studio)
    if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
      try {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        if (selected) {
          setHasApiKey(true);
          setLoadingApiKeyCheck(false);
          return;
        }
      } catch (error) {
        console.error("Error checking AI Studio API key:", error);
      }
    }

    // 2. Check Local Storage
    const localKey = localStorage.getItem('vitrinex_gemini_api_key');
    if (localKey) {
      setHasApiKey(true);
      setLoadingApiKeyCheck(false);
      return;
    }

    // 3. Check Hardcoded Fallback
    if (HARDCODED_API_KEY) {
      setHasApiKey(true);
    }

    setLoadingApiKeyCheck(false);
  }, []);

  useEffect(() => {
    checkAndSelectApiKey();
  }, [checkAndSelectApiKey]);

  const handleManualKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = manualApiKey.trim();
    if (!key) return;

    localStorage.setItem('vitrinex_gemini_api_key', key);
    setHasApiKey(true);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'Dashboard': return <Dashboard />;
      case 'AIManager': return <AIManager />;
      case 'ContentGenerator': return <ContentGenerator />;
      case 'AdStudio': return <AdStudio />;
      case 'CampaignBuilder': return <CampaignBuilder />;
      case 'TrendHunter': return <TrendHunter />;
      case 'CreativeStudio': return <CreativeStudio />;
      case 'ContentLibrary': return <ContentLibrary />;
      case 'SmartScheduler': return <SmartScheduler />;
      case 'Chatbot': return <Chatbot />;
      case 'CodeAudit': return <CodeAudit />;
      case 'AudioTools': return <AudioTools />;
      case 'CalendarManager': return <CalendarManager />;
      case 'CodePlayground': return <CodePlayground />;
      case 'LocalFinder': return <LocalFinder />;
      case 'Settings': return <Settings />;

      default: return <Dashboard />;
    }
  };

  if (loadingApiKeyCheck) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <LoadingSpinner className="w-8 h-8" />
        <p className="mt-4 text-body font-medium animate-pulse">Inicializando VitrineX AI...</p>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <div className="p-10 bg-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md w-full">
          <div className="flex justify-center mb-8">
            <Logo className="h-20 w-20" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-title mb-4">Bem-vindo à VitrineX</h1>
          <p className="text-body mb-8 leading-relaxed">
            Para ativar a plataforma, insira sua chave de API do Google Gemini. Validaremos a conexão com um teste rápido.
          </p>

          <form onSubmit={handleManualKeySubmit} className="space-y-4">
            <div className="relative">
              <KeyIcon className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
              <input
                type="password"
                value={manualApiKey}
                onChange={(e) => setManualApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui..."
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-body transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!manualApiKey}
              className="w-full px-6 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Ativar & Entrar
            </button>
          </form>

          <p className="mt-6 text-xs text-muted">
            A chave será salva localmente no seu navegador.
          </p>
        </div>
      </div>
    );
  }



  const isFullHeightModule = activeModule === 'Chatbot';

  return (
    <NavigationContext.Provider value={{ setActiveModule, activeModule }}>
      <div className="flex flex-col h-screen bg-background text-body font-sans overflow-hidden">
        <TutorialOverlay />
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            activeModule={activeModule}
            setActiveModule={setActiveModule}
          />
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
          />
          <main className={`flex-1 flex flex-col min-w-0 relative overflow-x-hidden ${isFullHeightModule
            ? 'h-full'
            // REQUISITO: Garante que haja rolagem vertical e um padding generoso na parte inferior
            // Ajustado pb-32 para mobile (BottomNav) e pb-16 para desktop
            : 'overflow-y-auto pb-32 md:pb-16'
            }`}>
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }>
              {/* REQUISITO: Container fluido, centralizado e com max-width */}
              <div className={`w-full ${isFullHeightModule ? 'h-full' : 'max-w-[1200px] mx-auto p-6 md:p-8'}`}>
                {renderModule()}
              </div>
            </Suspense>
          </main>

          {/* Mobile Bottom Navigation - Moved outside to ensure Z-Index layer is top-level relative to viewport */}
          <BottomNav
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            onMoreClick={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </div>
    </NavigationContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <NotificationProvider>
              <TutorialProvider>
                <AppContent />
              </TutorialProvider>
            </NotificationProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
