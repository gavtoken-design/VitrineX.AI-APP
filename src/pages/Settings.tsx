
import * as React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import {
    UserIcon,
    ShieldCheckIcon,
    BellIcon,
    LanguageIcon,
    SparklesIcon,
    SunIcon,
    CloudIcon
} from '@heroicons/react/24/outline';
import ProfileSection from './settings/ProfileSection';
import SubscriptionSection from './settings/SubscriptionSection';
import IntegrationsSection from './settings/IntegrationsSection';
import SecuritySection from './settings/SecuritySection';
import NotificationsSection from './settings/NotificationsSection';
import PreferencesSection from './settings/PreferencesSection';

const Settings: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const { addToast } = useToast();

    const handleSignOut = async () => {
        try {
            await signOut();
            addToast({
                type: 'success',
                title: 'Desconectado',
                message: 'Você saiu da sua conta com sucesso.'
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Erro ao sair',
                message: 'Não foi possível desconectar.'
            });
        }
    };

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="animate-fade-in pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Configurações</h1>
                <p className="text-[var(--text-secondary)] mt-2">Gerencie sua conta, assinatura e preferências do sistema.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <section className="glass-card p-6 sticky top-24">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-bold text-[var(--text-primary)] text-lg truncate max-w-[180px]">
                                    {user?.user_metadata?.full_name || 'Usuário VitrineX'}
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)] truncate max-w-[180px]">{user?.email}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 border border-primary/20">
                                    Plano {profile?.plan || 'Free'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => scrollToSection('profile-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <UserIcon className="w-5 h-5" />
                                Perfil
                            </button>
                            <button
                                onClick={() => scrollToSection('security-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <ShieldCheckIcon className="w-5 h-5" />
                                Segurança
                            </button>
                            <button
                                onClick={() => scrollToSection('notifications-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <BellIcon className="w-5 h-5" />
                                Notificações
                            </button>
                            <button
                                onClick={() => scrollToSection('language-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <LanguageIcon className="w-5 h-5" />
                                Idioma e Região
                            </button>
                            <button
                                onClick={() => scrollToSection('appearance-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <SunIcon className="w-5 h-5" />
                                Aparência
                            </button>
                            <button
                                onClick={() => scrollToSection('interface-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                Interface e Guias
                            </button>
                            <button
                                onClick={() => scrollToSection('integrations-section')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--background-input)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <CloudIcon className="w-5 h-5" />
                                Canais Digitais
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <Button
                                variant="outline"
                                className="w-full justify-center text-red-500 border-red-500/20 hover:bg-red-500/10"
                                onClick={handleSignOut}
                            >
                                Sair da Conta
                            </Button>
                        </div>
                    </section>
                </div>

                {/* Main Settings Area */}
                <div className="lg:col-span-2 space-y-8">
                    <SubscriptionSection />
                    <ProfileSection />
                    <SecuritySection />
                    <NotificationsSection />
                    <PreferencesSection />
                    <IntegrationsSection />
                </div>
            </div>
        </div>
    );
};

export default Settings;
