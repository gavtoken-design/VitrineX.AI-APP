
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTutorial } from '../../contexts/TutorialContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import {
    LanguageIcon,
    SunIcon,
    MoonIcon,
    SparklesIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

const PreferencesSection: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { isGuidesEnabled, toggleGuides, resetTutorials } = useTutorial();
    const { addToast } = useToast();

    return (
        <div className="space-y-8">
            {/* Language Section */}
            <section id="language-section" className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <LanguageIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Idioma e Região</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Idioma do Sistema</label>
                        <select
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value as any);
                                addToast({ type: 'info', message: `Idioma alterado para ${e.target.value}` });
                            }}
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fuso Horário</label>
                        <div className="p-3 bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-secondary)] text-sm flex items-center gap-2">
                            <GlobeAltIcon className="w-4 h-4" />
                            {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </div>
                    </div>
                </div>
            </section>

            {/* Appearance Section */}
            <section id="appearance-section" className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    {theme === 'light' ? (
                        <SunIcon className="w-6 h-6 text-primary" />
                    ) : (
                        <MoonIcon className="w-6 h-6 text-primary" />
                    )}
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Aparência</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--background-input)] rounded-xl border border-[var(--border-default)]">
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">Modo Escuro / Claro</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Alternar entre o tema claro e escuro.
                            <span className="block text-xs mt-1 text-primary">Atual: {theme === 'light' ? 'Modo Claro ☀️' : 'Modo Escuro 🌙'}</span>
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        <span
                            className={`${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md flex items-center justify-center`}
                        >
                            {theme === 'dark' ? (
                                <MoonIcon className="w-3 h-3 text-primary" />
                            ) : (
                                <SunIcon className="w-3 h-3 text-yellow-500" />
                            )}
                        </span>
                    </button>
                </div>
            </section>

            {/* Interface & Guides Section */}
            <section id="interface-section" className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Interface e Guias</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--background-input)] rounded-xl border border-[var(--border-default)]">
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Guias de Onboarding</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Exibir dicas e tutoriais ao acessar novas páginas.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isGuidesEnabled}
                                onChange={(e) => toggleGuides(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--background-input)] rounded-xl border border-[var(--border-default)]">
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Reiniciar Tour de Boas-vindas</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Voltar a ver a tela de boas-vindas inicial.
                            </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={resetTutorials}>
                            Reiniciar
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PreferencesSection;
