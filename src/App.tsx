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

// Layout
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import MobileNavMenu from './components/layout/MobileNavMenu';

// Pages
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import TrendHunter from './pages/TrendHunter';
import CreativeStudio from './pages/CreativeStudio';
import SmartScheduler from './pages/SmartScheduler';
import ContentLibrary from './pages/ContentLibrary';
import AdStudio from './pages/AdStudio';
import CampaignBuilder from './pages/CampaignBuilder';
import CalendarManager from './pages/CalendarManager';
import CodePlayground from './pages/CodePlayground';
import AuthPage from './pages/AuthPage';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';

// Components
import { ToastContainer } from './components/ui/Toast';

// Mock missing components
const TutorialOverlay: React.FC = () => null;

export type ModuleName =
    | 'Dashboard'
    | 'ContentGenerator'
    | 'TrendHunter'
    | 'CreativeStudio'
    | 'SmartScheduler'
    | 'ContentLibrary'
    | 'AdStudio'
    | 'CampaignBuilder'
    | 'CalendarManager'
    | 'CodePlayground'
    | 'Settings'
    | 'LandingPage';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [activeModule, setActiveModuleState] = useState<ModuleName>('Dashboard');
    const [navigationParams, setNavigationParams] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Initialize background notifications
    useNotifications();

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
        const moduleFromUrl = params.get('module') as ModuleName | null;

        if (moduleFromUrl) {
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
    const setActiveModule = (module: ModuleName, params?: any) => {
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
            ContentGenerator: <ContentGenerator />,
            TrendHunter: <TrendHunter />,
            CreativeStudio: <CreativeStudio />,
            SmartScheduler: <SmartScheduler />,
            ContentLibrary: <ContentLibrary />,
            AdStudio: <AdStudio />,
            CampaignBuilder: <CampaignBuilder />,
            CalendarManager: <CalendarManager />,
            CodePlayground: <CodePlayground />,
            Settings: <Settings />,
            LandingPage: <LandingPage />
        };

        return modules[activeModule] ?? <Dashboard />;
    };

    // NavigationContext.Provider DEVE envolver TUDO, inclusive loading e LandingPage
    return (
        <NavigationContext.Provider value={{ activeModule, setActiveModule, navigationParams }}>
            {loading ? (
                <div className="flex items-center justify-center h-screen bg-background text-primary">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : !user ? (
                <AuthPage />
            ) : (
                <div className="flex h-[100dvh] overflow-hidden bg-background text-body transition-colors duration-300">

                    {/* Desktop Sidebar */}
                    {!isMobile && (
                        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">

                        {/* Header / Navbar */}
                        <Navbar
                            onMenuClick={() => setMobileMenuOpen(true)}
                        />

                        {/* Module Content */}
                        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth relative z-0">
                            <div className="max-w-7xl mx-auto h-full w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeModule}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full"
                                    >
                                        {renderModule()}
                                    </motion.div>
                                </AnimatePresence>
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
                    <TutorialOverlay />

                </div>
            )}
        </NavigationContext.Provider>
    );
}

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ... other imports

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
