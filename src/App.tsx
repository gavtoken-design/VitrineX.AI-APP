
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
import { PlayIcon, UserCircleIcon, ChatBubbleLeftRightIcon, CreditCardIcon } from '@heroicons/react/24/outline'; // Changed icon usage
import { testGeminiConnection } from './services/ai/gemini';
import { HARDCODED_API_KEY, WHATSAPP_SUPPORT_LINK, PAYMENT_LINK } from './constants';
import { loginWithGoogle, loginWithEmail, signUpWithEmail } from './services/core/auth';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// Lazy load all page components for code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
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
  | 'LandingPage'
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
  const { user, loading: authLoading, profile, signOut } = useAuth(); // Use Auth Context
  const [activeModule, setActiveModule] = useState<ModuleName>('LandingPage');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  // ... (Login Logic) ...

  const handleLogin = async () => {
    // Check Supabase Config explicitly
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';

    if (!isConfigured) {
      alert("Erro de Configuração: O Supabase não está configurado corretamente.\nPor favor, verifique o arquivo .env e adicione suas credenciais (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).");
      return;
    }

    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      alert("Falha no Login: Não foi possível conectar ao provedor de autenticação.");
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'LandingPage': return <LandingPage />;
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

  // --- CHECK BLOCKING STATUS ---
  // Se o usuário está logado, verificamos apenas se ele está explicitamente BLOQUEADO.
  // "Quando for cadastrado na supabase pode liberar" -> Acesso padrão permitido.
  if (user && profile?.status === 'blocked') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <div className="p-10 bg-surface rounded-3xl shadow-2xl border border-red-500/20 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <LockClosedIcon className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-title mb-3">Acesso Bloqueado</h1>
          <p className="text-body mb-6">
            Sua conta foi suspensa ou bloqueada pelo administrador. Entre em contato com o suporte.
          </p>
          <p className="text-xs text-muted mb-8">
            ID do Usuário: <span className="font-mono bg-black/10 px-1 rounded">{user.id.slice(0, 8)}...</span>
            <br />
            Status Atual: <span className="font-bold text-yellow-600 uppercase">{profile?.status || 'INDEFINIDO'}</span>
          </p>

          <button
            onClick={() => signOut()}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
          >
            Sair Agora
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    // LOGIN SCREEN
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-6 text-center">
        <div className="p-6 md:p-10 bg-surface rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm md:max-w-md mx-auto">
          <div className="flex justify-center mb-6 md:mb-8">
            <Logo className="h-16 w-16 md:h-20 md:w-20" showText={false} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-title mb-2">Bem-vindo à VitrineX</h1>
          <p className="text-body mb-6 leading-relaxed text-sm">
            {isSignUp ? 'Crie sua conta para começar.' : 'Faça login para acessar sua plataforma.'}
          </p>

          {/* Email/Password Form */}
          <div className="space-y-4 mb-6 text-left">
            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
                {authError}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">E-mail</label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Senha</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                setAuthError(null);
                setIsAuthProcessing(true);
                try {
                  if (isSignUp) {
                    await signUpWithEmail(email, password);
                    alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
                    setIsSignUp(false);
                  } else {
                    await loginWithEmail(email, password);
                  }
                } catch (err: any) {
                  console.error(err);
                  setAuthError(err.message || 'Erro na autenticação.');
                } finally {
                  setIsAuthProcessing(false);
                }
              }}
              disabled={isAuthProcessing}
              className="w-full px-6 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthProcessing ? <LoadingSpinner className="w-5 h-5 border-white" /> : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>

            <div className="text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}
                className="text-xs text-muted hover:text-primary transition-colors underline"
              >
                {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-muted text-xs uppercase">Ou continue com</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-3.5 bg-surface border border-border text-body font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
          >

            <UserCircleIcon className="w-5 h-5" />
            Entrar com Google
          </button>

          <p className="mt-6 text-xs text-muted">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>

          {/* Links de Suporte e Pagamento */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 w-full border-t border-gray-100 dark:border-gray-800 pt-6">
            <a
              href={WHATSAPP_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Suporte WhatsApp
            </a>
            <a
              href={PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <CreditCardIcon className="w-4 h-4" />
              Planos Premium
            </a>
          </div>
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
