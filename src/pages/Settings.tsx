import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../services/core/db';
import Button from '../components/ui/Button';
import {
    UserIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    BellIcon,
    LanguageIcon,
    ArrowTopRightOnSquareIcon,
    CheckBadgeIcon,
    SparklesIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();
    const [verifying, setVerifying] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
        if (profile?.contactInfo) {
            setPhone(profile.contactInfo.phone || '');
            setCnpj(profile.contactInfo.cnpj || '');
            setAddress(profile.contactInfo.address || '');
        }
    }, [user, profile]);

    const planLink = `https://buy.stripe.com/cNibJ0aqfeUTaA66Pv6oo01?client_reference_id=${user?.id}`;

    const handleVerifyPayment = async () => {
        if (!user) return;
        setVerifying(true);
        try {
            // @ts-ignore - Supabase functions type might need casting
            const { data, error } = await supabase.functions.invoke('stripe-manager', {
                body: { action: 'verify-session', userId: user.id }
            });

            if (data?.plan === 'pro') {
                addToast({
                    type: 'success',
                    title: 'Parabéns!',
                    message: 'Seu plano PRO foi ativado com sucesso.'
                });
                // Recarregar perfil
                window.location.reload();
            } else {
                addToast({
                    type: 'info',
                    title: 'Ainda em processamento',
                    message: 'Não encontramos um pagamento ativo recente. Se você já pagou, aguarde alguns minutos.'
                });
            }
        } catch (error) {
            console.error('Verify error:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao conectar com o serviço de pagamentos.'
            });
        } finally {
            setVerifying(false);
        }
    };

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

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateUserProfile(user.id, {
                name: fullName,
                contactInfo: {
                    phone,
                    cnpj,
                    address
                }
            });

            // Sync with Supabase Auth Metadata for immediate UI updates (Dashboard Greeting)
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    name: fullName // Backup for legacy checks
                }
            });

            addToast({
                type: 'success',
                title: 'Salvo',
                message: 'Suas informações foram atualizadas com sucesso.'
            });
        } catch (error) {
            console.error('Error saving profile:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao salvar as alterações.'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-title">Configurações</h1>
                <p className="text-muted mt-2">Gerencie sua conta, assinatura e preferências do sistema.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral Navigation (Cards for Desktop, scroll for mobile) */}
                <div className="lg:col-span-1 space-y-4">
                    <section className="glass-card p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-bold text-title text-lg truncate max-w-[180px]">
                                    {user?.user_metadata?.full_name || 'Usuário VitrineX'}
                                </h2>
                                <p className="text-sm text-muted truncate max-w-[180px]">{user?.email}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 border border-primary/20">
                                    Plano {profile?.plan || 'Free'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-primary/10 text-primary border border-primary/20 transition-colors"
                            >
                                <UserIcon className="w-5 h-5" />
                                Perfil
                            </button>
                            <button
                                onClick={() => document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:bg-surface-hover hover:text-title transition-colors"
                            >
                                <ShieldCheckIcon className="w-5 h-5" />
                                Segurança
                            </button>
                            <button
                                onClick={() => document.getElementById('notifications-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:bg-surface-hover hover:text-title transition-colors"
                            >
                                <BellIcon className="w-5 h-5" />
                                Notificações
                            </button>
                            <button
                                onClick={() => document.getElementById('language-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:bg-surface-hover hover:text-title transition-colors"
                            >
                                <LanguageIcon className="w-5 h-5" />
                                Idioma e Região
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
                    {/* Subscription Card - Highlighted */}
                    <section className="glass-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <SparklesIcon className="w-32 h-32 text-primary rotate-12" />
                        </div>

                        <div className="p-8 relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <CreditCardIcon className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-title">Assinatura e Plano</h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-center bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-2xl font-bold text-white">VitrineX PRO</h3>
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">RECOMENDADO</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                        Libere todo o potencial da inteligência artificial para o seu marketing. Criações ilimitadas, acesso ao Gemini Ultra e suporte prioritário.
                                    </p>

                                    <ul className="space-y-2 mb-8">
                                        {[
                                            'Geração de Imagens Ilimitada',
                                            'Agendamento Multi-plataforma',
                                            'Análise de Tendências em Tempo Real',
                                            'Remoção de marca d\'água'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <CheckBadgeIcon className="w-4 h-4 text-primary" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="text-center md:border-l border-white/10 md:pl-8 min-w-[200px]">
                                    <div className="mb-4">
                                        <span className="text-4xl font-black text-white">R$ 148,90</span>
                                        <span className="text-muted text-sm ml-1">/mês</span>
                                    </div>
                                    <a
                                        href={planLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 transform hover:scale-[1.05] active:scale-[0.98]"
                                    >
                                        Assinar Agora
                                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-4 text-xs opacity-60 hover:opacity-100"
                                        onClick={handleVerifyPayment}
                                        isLoading={verifying}
                                    >
                                        Já paguei? Verificar status
                                    </Button>
                                    <p className="mt-3 text-[10px] text-muted">Cancelamento fácil a qualquer momento.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Settings */}
                    <section id="profile-section" className="glass-card p-8">
                        <h2 className="text-xl font-bold text-title mb-6">Informações da Conta</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Nome Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">E-mail</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-surface-hover/50 border border-border rounded-xl px-4 py-3 text-muted cursor-not-allowed"
                                />
                            </div>
                            {/* New Fields */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Telefone / WhatsApp</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">CNPJ</label>
                                <input
                                    type="text"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    placeholder="00.000.000/0001-00"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Endereço Comercial</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Rua Exemplo, 123 - Cidade/UF"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button variant="primary" onClick={handleSaveProfile} isLoading={saving}>
                                Salvar Alterações
                            </Button>
                        </div>
                    </section>

                    {/* Security Section (New) */}
                    <section id="security-section" className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheckIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold text-title">Segurança</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-xl border border-border">
                                <div>
                                    <h3 className="font-semibold text-title">Senha de Acesso</h3>
                                    <p className="text-sm text-muted">Última alteração: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Desconhecido'}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (user?.email) {
                                            supabase.auth.resetPasswordForEmail(user.email);
                                            addToast({ type: 'success', title: 'E-mail enviado', message: 'Verifique sua caixa de entrada para redefinir a senha.' });
                                        }
                                    }}
                                >
                                    Redefinir Senha
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Notifications Section (New) */}
                    <section id="notifications-section" className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <BellIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold text-title">Notificações</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'email-notif', label: 'Notificações por E-mail', desc: 'Receba resumos semanais e alertas de conta.' },
                                { id: 'mkt-notif', label: 'Novidades e Marketing', desc: 'Fique por dentro das atualizações da VitrineX.' },
                                { id: 'browser-notif', label: 'Alertas no Navegador', desc: 'Receba notificações push enquanto usa o app.' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors">
                                    <div>
                                        <h3 className="font-medium text-title">{item.label}</h3>
                                        <p className="text-xs text-muted">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                            <div className="pt-4">
                                <Button variant="outline" onClick={() => addToast({ type: 'success', message: 'Preferências de notificação salvas.' })}>
                                    Salvar Preferências
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Language Section (New) */}
                    <section id="language-section" className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <LanguageIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold text-title">Idioma e Região</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Idioma do Sistema</label>
                                <select
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors [&>option]:bg-gray-900 [&>option]:text-white"
                                    // Note: In a real implementation this would sync with LanguageContext
                                    defaultValue="pt-BR"
                                    onChange={(e) => {
                                        // Fake implementation for UI demo, reliable sync is via Navbar
                                        addToast({ type: 'info', message: `Idioma alterado para ${e.target.value}` });
                                    }}
                                >
                                    <option value="pt-BR" className="bg-gray-900 text-white">Português (Brasil)</option>
                                    <option value="en-US" className="bg-gray-900 text-white">English (US)</option>
                                    <option value="es" className="bg-gray-900 text-white">Español</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Fuso Horário</label>
                                <div className="p-3 bg-surface-hover/50 border border-border rounded-xl text-muted text-sm flex items-center gap-2">
                                    <GlobeAltIcon className="w-4 h-4" />
                                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
