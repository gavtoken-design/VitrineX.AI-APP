
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlayIcon, UserCircleIcon } from '@heroicons/react/24/outline'; // Changed icon usage
import { testGeminiConnection } from './services/ai/gemini';
import { HARDCODED_API_KEY } from './constants';
import { loginWithGoogle } from './services/core/auth';

// Lazy load all page components for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ContentGenerator = React.lazy(() => import('./pages/ContentGenerator'));
const AdStudio = React.lazy(() => import('./pages/AdStudio'));
const CampaignBuilder = React.lazy(() => import('./pages/CampaignBuilder'));
const TrendHunter = React.lazy(() => import('./pages/TrendHunter'));
const CreativeStudio = React.lazy(() => import('./pages/CreativeStudio'));
const ContentLibrary = React.lazy(() => import('./pages/ContentLibrary'));
const SmartScheduler = React.lazy(() => import('./pages/SmartScheduler'));
const Settings = React.lazy(() => import('./pages/Settings'));
const CodeAudit = React.lazy(() => import('./pages/CodeAudit'));
const AudioTools = React.lazy(() => import('./pages/AudioTools'));
const CalendarManager = React.lazy(() => import('./pages/CalendarManager'));
const CodePlayground = React.lazy(() => import('./pages/CodePlayground'));


export type ModuleName =
  | 'Dashboard'
  | 'ContentGenerator'
  | 'AdStudio'
  | 'CampaignBuilder'
  | 'TrendHunter'
  | 'CreativeStudio'
  | 'ContentLibrary'
  | 'SmartScheduler'
  | 'Settings'
  | 'CodeAudit'
  | 'AudioTools'
  | 'CalendarManager'
  | 'CodePlayground';


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
  const { user, loading: authLoading } = useAuth(); // Use Auth Context
  const [activeModule, setActiveModule] = useState<ModuleName>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Note: We are now using Supabase Auth. 
  // API Key check logic for Gemini is secondary to User Auth.
  // We can keep the API check if we want to ensure user provides their own key even after login,
  // or we can move it to Settings/Onboarding.
  // For now, let's assume if user is logged in, they get access to the app, 
  // and we show the API Key prompt inside the app if missing?
  // Or we keep the "Gatekeeper" style.
  // Let's migrate to: Login First -> Then check API Key (optional or required).

  // Actually, let's keep it simple: Login Screen replaces the "Enter API Key" screen as the primary gate.

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'Dashboard': return <Dashboard />;
      case 'ContentGenerator': return <ContentGenerator />;
      case 'AdStudio': return <AdStudio />;
      case 'CampaignBuilder': return <CampaignBuilder />;
      case 'TrendHunter': return <TrendHunter />;
      case 'CreativeStudio': return <CreativeStudio />;
      case 'ContentLibrary': return <ContentLibrary />;
      case 'SmartScheduler': return <SmartScheduler />;
      case 'CodeAudit': return <CodeAudit />;
      case 'AudioTools': return <AudioTools />;
      case 'CalendarManager': return <CalendarManager />;
      case 'CodePlayground': return <CodePlayground />;
      case 'Settings': return <Settings />;

      default: return <Dashboard />;
    }
  };

  // Determine if the current module requires full height (no padding)
  const isFullHeightModule = ['CodePlayground', 'CreativeStudio', 'AdStudio'].includes(activeModule);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <LoadingSpinner className="w-8 h-8" />
        <p className="mt-4 text-body font-medium animate-pulse">Inicializando VitrineX AI...</p>
      </div>
    );
  }

  if (!user) {
    // LOGIN SCREEN
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <div className="p-10 bg-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md w-full">
          <div className="flex justify-center mb-8">
            <Logo className="h-20 w-20" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-title mb-4">Bem-vindo à VitrineX</h1>
          <p className="text-body mb-8 leading-relaxed">
            Faça login para acessar sua plataforma de IA.
          </p>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <UserCircleIcon className="w-5 h-5" />
            Entrar com Google
          </button>

          <p className="mt-6 text-xs text-muted">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    );
  }

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
          <main className={`flex-1 flex flex-col min-w-0 overflow-y-auto pb-32 md:pb-16`}>
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
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
