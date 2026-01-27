
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import {
    CreditCardIcon,
    SparklesIcon,
    CheckBadgeIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const SubscriptionSection: React.FC = () => {
    const { user } = useAuth();
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

    return (
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

                <div className="flex flex-col md:flex-row gap-8 items-center bg-[var(--background-input)] rounded-2xl p-6 border border-[var(--border-default)]">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)]">VitrineX PRO</h3>
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">RECOMENDADO</span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                            Libere todo o potencial da inteligência artificial para o seu marketing. Criações ilimitadas, acesso ao Gemini Ultra e suporte prioritário.
                        </p>

                        <ul className="space-y-2 mb-8">
                            {[
                                'Geração de Imagens Ilimitada',
                                'Agendamento Multi-plataforma',
                                'Análise de Tendências em Tempo Real',
                                'Remoção de marca d\'água'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <CheckBadgeIcon className="w-4 h-4 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-center md:border-l border-[var(--border-default)] md:pl-8 min-w-[200px]">
                        <div className="mb-4">
                            <span className="text-4xl font-black text-[var(--text-primary)]">R$ 148,90</span>
                            <span className="text-[var(--text-secondary)] text-sm ml-1">/mês</span>
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
    );
};

export default SubscriptionSection;
