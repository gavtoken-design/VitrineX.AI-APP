import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import {
    UserIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    BellIcon,
    LanguageIcon,
    ArrowTopRightOnSquareIcon,
    CheckBadgeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();
    const [verifying, setVerifying] = useState(false);

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
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <UserIcon className="w-5 h-5" />
                                Perfil
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:bg-surface-hover hover:text-title transition-colors">
                                <ShieldCheckIcon className="w-5 h-5" />
                                Segurança
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:bg-surface-hover hover:text-title transition-colors">
                                <BellIcon className="w-5 h-5" />
                                Notificações
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:bg-surface-hover hover:text-title transition-colors">
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
                                            'IA de Vídeo Avançada',
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
                                        <span className="text-4xl font-black text-white">R$ 97</span>
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
                    <section className="glass-card p-8">
                        <h2 className="text-xl font-bold text-title mb-6">Informações da Conta</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Nome Completo</label>
                                <input
                                    type="text"
                                    defaultValue={user?.user_metadata?.full_name || ''}
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
                                    defaultValue={profile?.contactInfo?.phone || ''}
                                    placeholder="(11) 99999-9999"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                    onChange={(e) => {
                                        // TODO: Implement state/form handling properly
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">CNPJ</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.contactInfo?.cnpj || ''}
                                    placeholder="00.000.000/0001-00"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Endereço Comercial</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.contactInfo?.address || ''}
                                    placeholder="Rua Exemplo, 123 - Cidade/UF"
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-title focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button variant="primary" onClick={() => addToast({ type: 'success', title: 'Salvo', message: 'Dados atualizados (simulação)' })}>
                                Salvar Alterações
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
