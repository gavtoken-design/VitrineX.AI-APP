import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import {
    Heart,
    Cpu,
    Zap,
    Layout,
    Terminal,
    Cloud,
    Check,
    Copy,
    ExternalLink,
    Sparkles,
    ArrowRight,
    Gift
} from 'lucide-react';

interface Referral {
    id: string;
    name: string;
    description: string;
    link: string;
    icon: React.ElementType;
    color: string;
    tag?: string;
}

const REFERRALS: Referral[] = [
    {
        id: 'lovable',
        name: 'Lovable',
        description: 'Plataforma de IA para criar aplicações completas usando linguagem natural.',
        link: 'https://lovable.dev/invite/KJ6COUJ',
        icon: Heart,
        color: 'from-rose-500 to-pink-500',
        tag: 'Hot'
    },
    {
        id: 'manus',
        name: 'Manus',
        description: 'Agente de IA autônomo para execução de tarefas e automação de fluxos.',
        link: 'https://manus.im/invitation/F4URYJXDCNIK',
        icon: Cpu,
        color: 'from-blue-500 to-indigo-500',
        tag: 'Novo'
    },
    {
        id: 'tess',
        name: 'Tess',
        description: 'Plataforma de IA voltada à automação inteligente e produtividade.',
        link: 'https://tess.cello.so/XlEEa65MXH4',
        icon: Zap,
        color: 'from-amber-400 to-orange-500'
    },
    {
        id: 'base44',
        name: 'Base44',
        description: 'Plataforma SaaS para criação e gerenciamento de aplicações digitais.',
        link: 'https://app.base44.com/register?ref=S8FBBS91DD861HGO',
        icon: Layout,
        color: 'from-emerald-400 to-teal-500'
    },
    {
        id: 'replit',
        name: 'Replit',
        description: 'IDE online para criar, executar e publicar aplicações no navegador.',
        link: 'https://replit.com/refer/jeanavila997',
        icon: Terminal,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'hostinger',
        name: 'Hostinger',
        description: 'Plataforma de hospedagem para sites, aplicações e serviços web.',
        link: 'https://hostinger.com.br?REFERRALCODE=UWEJEANAVLAH',
        icon: Cloud,
        color: 'from-violet-500 to-purple-500',
        tag: 'Oferta'
    }
];

const ReferralCard: React.FC<{ referral: Referral; index: number }> = ({ referral, index }) => {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(referral.link);
            setCopied(true);
            addToast({
                type: 'success',
                title: 'Link copiado!',
                message: 'Link de indicação copiado para a área de transferência.'
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao copiar o link.'
            });
        }
    };

    return (
        <motion.a
            href={referral.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:bg-zinc-800/60 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
        >
            {/* Gradient Glow Effect */}
            <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${referral.color} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`} />

            <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${referral.color} shadow-lg shadow-black/20`}>
                        {referral.icon ? <referral.icon className="h-6 w-6 text-white" /> : null}
                    </div>
                    {referral.tag && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                            {referral.tag}
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                            {referral.name}
                        </h3>
                        <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
                        {referral.description}
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="truncate text-xs font-medium text-gray-500 group-hover:text-gray-400">
                        Benefício exclusivo
                    </span>
                </div>

                <button
                    onClick={handleCopy}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-green-400">Copiado</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar</span>
                        </>
                    )}
                </button>
            </div>
        </motion.a>
    );
};

const IndicationsPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full p-6 md:p-8 lg:p-12 pb-24 animate-in fade-in zoom-in duration-500">
            <div className="mx-auto max-w-6xl space-y-12">
                <header className="relative space-y-4 text-center md:text-left">
                    <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px] opacity-30 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm"
                    >
                        <Gift className="h-3 w-3" />
                        <span>Parceiros Oficiais</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl"
                    >
                        Indicações <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Premium</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl text-lg text-gray-400 md:text-xl leading-relaxed"
                    >
                        Acesse ferramentas de elite com benefícios exclusivos.
                        Nossa curadoria das melhores plataformas de IA e desenvolvimento para impulsionar seus projetos.
                    </motion.p>
                </header>

                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {REFERRALS.map((referral, index) => (
                        <ReferralCard key={referral.id} referral={referral} index={index} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500"
                >
                    <Sparkles className="h-4 w-4" />
                    <span>Novas indicações são adicionadas mensalmente</span>
                </motion.div>
            </div>
        </div>
    );
};

export default IndicationsPage;
