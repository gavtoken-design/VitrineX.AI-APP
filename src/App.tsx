
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { NavigationContext } from './hooks/useNavigate';
import { useNotifications } from './hooks/useNotifications';
import { useContextualSuggestions } from './hooks/useContextualSuggestions';
import { useNotificationCenter } from './contexts/NotificationContext';
import { useToast } from './contexts/ToastContext';


// Layout
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import MobileNavMenu from './components/layout/MobileNavMenu';

// Pages (Lazy Load)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ChatVitrineX = React.lazy(() => import('./pages/ChatVitrineX'));
const ContentGenerator = React.lazy(() => import('./pages/ContentGenerator'));
const TrendHunter = React.lazy(() => import('./pages/TrendHunter'));

const SmartScheduler = React.lazy(() => import('./pages/SmartScheduler'));
const ContentLibrary = React.lazy(() => import('./pages/ContentLibrary'));
const AdStudio = React.lazy(() => import('./pages/AdStudio'));
const CampaignBuilder = React.lazy(() => import('./pages/CampaignBuilder'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const Settings = React.lazy(() => import('./pages/Settings'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const MarketRadar = React.lazy(() => import('./pages/MarketRadar'));
const SocialNetworks = React.lazy(() => import('./pages/SocialNetworks'));
const IndicationsPage = React.lazy(() => import('./pages/IndicationsPage'));
const AnimationShowcase = React.lazy(() => import('./pages/AnimationShowcase'));
// const CosmicStudio = React.lazy(() => import('./pages/CosmicStudio/CosmicStudio'));
const AdminGate = React.lazy(() => import('./pages/Admin/AdminGate'));


// Components
import { ToastContainer } from './components/ui/Toast';
import AnimatedBackground from './components/ui/animated-shader-background';
import OnboardingOverlay from './components/features/OnboardingOverlay';
import LoadingSpinner from './components/ui/LoadingSpinner';
import GlobalFilters from './components/ui/GlobalFilters'; // Optimization

// Module Type Definition
export const MODULE_NAMES = [
    'Dashboard',
    // 'ChatVitrineX',
    'ContentGenerator',
    'TrendHunter',
    'SmartScheduler',
    'ContentLibrary',
    'AdStudio',
    'CampaignBuilder',
    'Settings',
    'MarketRadar',
    'SocialNetworks',
    'Indications',
    'AnimationShowcase',
    'LandingPage',
    // 'CosmicStudio',
    // 'CosmicEditor',
    // 'CosmicCarousel',
    'Admin'
] as const;

export type ModuleName = typeof MODULE_NAMES[number];

export const isValidModule = (name: string): name is ModuleName => {
    return MODULE_NAMES.includes(name as ModuleName);
};


const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [activeModule, setActiveModuleState] = useState<ModuleName>('Dashboard');
    const [navigationParams, setNavigationParams] = useState<Record<string, unknown> | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Initialize background notifications
    useNotifications();
    const { addNotification, notifications } = useNotificationCenter();
    const { addToast } = useToast();
    useContextualSuggestions(activeModule);

    // Initial "Guide" Notification logic
    useEffect(() => {
        const welcomeNotifId = 'welcome-guide-prompt';
        const hasSeen = localStorage.getItem(welcomeNotifId);

        if (!hasSeen && user) {
            const message = 'Para um tour completo, ative o "Modo Guia" em Configurações > Preferências.';
            addNotification({
                type: 'system',
                title: 'Bem-vindo ao VitrineX!',
                message: message,
                metadata: { platform: 'system' }
            });

            // Visual prompt
            addToast({
                type: 'info',
                title: 'Bem-vindo ao VitrineX!',
                message: message,
                duration: 8000
            });

            localStorage.setItem(welcomeNotifId, 'true');
        }
    }, [user, addNotification, addToast]);

    // Sync activeModule with authentication state
    useEffect(() => {
        if (loading) return;

        if (!user) {
            // Se não houver usuário, as páginas internas não devem ser acessíveis.
            // O AppContent retornará AuthPage.
        }
    }, [user, loading]);

    // URL Sync (Deep Linking)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const moduleFromUrl = params.get('module');

        if (moduleFromUrl && isValidModule(moduleFromUrl)) {
            setActiveModuleState(moduleFromUrl);
        }
    }, []);

    // Handle Mobile Detection
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');

        const handleChange = () => {
            setIsMobile(mediaQuery.matches);
        };

        handleChange();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Navigation Handler
    const setActiveModule = (module: ModuleName, params?: Record<string, unknown>) => {
        console.log(`[Navigation] Navigating to: ${module}`, params ? 'with params' : '');
        setActiveModuleState(module);
        setNavigationParams(params || null);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('module', module);
        window.history.replaceState({}, '', `?${urlParams.toString()}`);
    };

    // Debugging current state
    useEffect(() => {
        console.log(`[App] Current Active Module: ${activeModule}`);
    }, [activeModule]);

    // Render Module Dictionary
    const renderModule = () => {
        const modules: Record<ModuleName, React.ReactNode> = {
            Dashboard: <Dashboard />,
            // ChatVitrineX: <ChatVitrineX />,
            ContentGenerator: <ContentGenerator />,
            TrendHunter: <TrendHunter />,

            SmartScheduler: <SmartScheduler />,
            ContentLibrary: <ContentLibrary />,
            AdStudio: <AdStudio />,
            CampaignBuilder: <CampaignBuilder />,
            Settings: <Settings />,
            MarketRadar: <MarketRadar />,
            SocialNetworks: <SocialNetworks />,
            Indications: <IndicationsPage />,
            AnimationShowcase: <AnimationShowcase />,
            LandingPage: <LandingPage />,
            // CosmicStudio: <CosmicStudio />,
            // CosmicEditor: <CosmicStudio initialView="editor" />,
            // CosmicCarousel: <CosmicStudio initialView="carousel" />,
            Admin: <AdminGate />

        };

        return modules[activeModule] ?? <Dashboard />;
    };

    // Scroll to Top on Module Change
    const mainContentRef = React.useRef<HTMLElement>(null);
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [activeModule]);

    // NavigationContext.Provider DEVE envolver TUDO, inclusive loading e LandingPage
    return (
        <NavigationContext.Provider value={{ activeModule, setActiveModule, navigationParams }}>
            <GlobalFilters />
            {loading ? (
                <div className="flex items-center justify-center h-screen bg-background text-primary">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : !user ? (
                <React.Suspense fallback={<div className="h-screen bg-black" />}>
                    <AuthPage />
                </React.Suspense>
            ) : (
                <div className="flex h-[100dvh] overflow-hidden bg-background text-body transition-colors duration-300">

                    {/* Desktop Sidebar */}
                    {!isMobile && (
                        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
                        {/* Global Animated Background */}
                        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                            <AnimatedBackground />
                        </div>

                        {/* Header / Navbar */}
                        <div className="relative z-50">
                            <Navbar
                                onMenuClick={() => setMobileMenuOpen(true)}
                            />
                        </div>

                        {/* Module Content */}
                        <main
                            ref={mainContentRef}
                            className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-40 pt-24 md:px-6 md:pb-48 md:pt-28 lg:px-8 lg:pb-32 lg:pt-32 scroll-smooth relative z-10"
                        >
                            <div className="max-w-7xl mx-auto w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeModule}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full"
                                    >
                                        <React.Suspense fallback={
                                            <div className="flex h-full items-center justify-center">
                                                <LoadingSpinner />
                                            </div>
                                        }>
                                            {renderModule()}
                                        </React.Suspense>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Global Spacer Section - Adds breathing room at the bottom of all pages */}
                                <div className="mt-24 md:mt-40 h-40 md:h-64 flex flex-col items-center justify-center text-[var(--text-premium-muted)]/10 select-none pointer-events-none">
                                    <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mb-6 opacity-50" />
                                    <span className="text-[12px] tracking-[1em] font-black uppercase font-mono opacity-30">VitrineX.AI // FIM DA TRANSMISSÃO</span>
                                </div>
                            </div>
                        </main>

                        {/* Mobile Navigation */}
                        {isMobile && (
                            <>
                                <BottomNav
                                    activeModule={activeModule}
                                    setActiveModule={setActiveModule}
                                    onMoreClick={() => setMobileMenuOpen(true)}
                                />
                                <MobileNavMenu
                                    isOpen={mobileMenuOpen}
                                    onClose={() => setMobileMenuOpen(false)}
                                    activeModule={activeModule}
                                    setActiveModule={setActiveModule}
                                />
                            </>
                        )}

                    </div>

                    {/* Toast & Overlays */}
                    <OnboardingOverlay />

                </div>
            )}
        </NavigationContext.Provider>
    );
}

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <ToastProvider>
                                <TutorialProvider>
                                    <AppContent />
                                </TutorialProvider>
                            </ToastProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
