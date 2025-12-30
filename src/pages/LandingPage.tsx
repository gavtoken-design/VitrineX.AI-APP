import * as React from 'react';
import { motion, Variants } from 'framer-motion';
// Se estiveres a usar react-router-dom padrão, troca a linha abaixo por:
// import { useNavigate } from 'react-router-dom';
import { useNavigate } from '../hooks/useNavigate';
import { ArrowRightIcon, SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Logo from '../components/ui/Logo';
import AnoAI from '../components/ui/animated-shader-background';
import { WHATSAPP_SUPPORT_LINK, PAYMENT_LINK } from '../constants';

export const LandingPage: React.FC = () => {
    // Se usares o padrão do react-router-dom: const navigate = useNavigate();
    const { navigateTo } = useNavigate();

    const handleGetStarted = () => {
        // Se usares o padrão: navigate('/dashboard');
        navigateTo('Dashboard');
    };

    // Variantes de animação (Orquestração)
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2, // Cria o efeito de cascata nos filhos
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 50 }
        }
    };

    const [showApiKey, setShowApiKey] = React.useState(false);
    const [apiKey, setApiKey] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('vitrinex_gemini_api_key', apiKey.trim());
            // Opcional: Recarregar a página ou notificar sucesso
            alert('Chave de acesso salva com sucesso! O sistema agora está ativo.');
            setShowApiKey(false);
        }
    };

    return (
        // Layout atualizado para permitir scroll vertical mantendo o fundo fixo
        <div className="relative min-h-screen w-full bg-[#050505] text-[var(--text-primary)] font-sans selection:bg-blue-500/30">

            {/* Fundo Animado Fixo */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AnoAI />
            </div>

            {/* Conteúdo com Scroll */}
            <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden scroll-smooth">

                {/* HERO SECTION */}
                <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-5xl w-full mx-auto"
                    >
                        {/* Cartão principal com efeito Glass Premium */}
                        <motion.div className="glass-card p-8 md:p-14 text-center border border-[var(--border-default)] backdrop-blur-3xl shadow-2xl rounded-[2rem] overflow-hidden relative bg-[var(--background-input)]/30">

                            {/* Efeitos de Luz Decorativos */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-40 animate-pulse" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-40 animate-pulse delay-1000" />

                            {/* Conteúdo Hero */}
                            <div className="relative z-10 flex flex-col items-center">
                                {/* Logo & Badge */}
                                <motion.div variants={itemVariants} className="mb-8 relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative p-5 bg-[#0A0F19] rounded-2xl border border-[var(--border-default)]/50 shadow-2xl">
                                        <Logo className="h-16 w-16 md:h-20 md:w-20" showText={false} />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-[10px] font-bold tracking-widest text-white uppercase shadow-lg">
                                        v2.0 Beta
                                    </div>
                                </motion.div>

                                {/* Título Principal */}
                                <motion.h1
                                    variants={itemVariants}
                                    className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-1"
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400">
                                        VitrineX AI
                                    </span>
                                </motion.h1>

                                {/* Subtítulo */}
                                <motion.p
                                    variants={itemVariants}
                                    className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                                >
                                    A suíte de inteligência definitiva. Crie <span className="text-blue-400 font-semibold">campanhas</span>, monitore <span className="text-purple-400 font-semibold">tendências</span> e domine as redes sociais com o poder da IA generativa.
                                </motion.p>

                                {/* Botão CTA Principal */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-12"
                                >
                                    <button
                                        onClick={handleGetStarted}
                                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 group border border-blue-400/20"
                                    >
                                        <SparklesIcon className="w-6 h-6 group-hover:animate-spin-slow text-yellow-300" />
                                        <span>Acessar Dashboard</span>
                                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>

                                {/* Configuração Rápida de API (Expansível) */}
                                <motion.div variants={itemVariants} className="w-full max-w-md">
                                    {!showApiKey ? (
                                        <button
                                            onClick={() => setShowApiKey(true)}
                                            className="mx-auto text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2 border border-gray-800 rounded-full px-4 py-1.5 hover:bg-gray-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            Configurar Licença / API Key (Opcional)
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-[#0A0F19] p-4 rounded-xl border border-gray-800 shadow-2xl"
                                        >
                                            <div className="flex gap-2 mb-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                        placeholder="Cole sua API Key do Google AI Studio"
                                                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                    >
                                                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <button onClick={handleSaveKey} className="px-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors">
                                                    SALVAR
                                                </button>
                                            </div>
                                            <button onClick={() => setShowApiKey(false)} className="text-[10px] text-gray-500 hover:text-gray-300 w-full text-center">Cancelar</button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1, duration: 2, repeat: Infinity }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
                    >
                        <span className="text-xs uppercase tracking-widest text-gray-600">Descubra Mais</span>
                        <div className="w-[1px] h-8 bg-gradient-to-b from-gray-500 to-transparent"></div>
                    </motion.div>
                </div>

                {/* FEATURES SECTION */}
                <section className="py-24 px-4 relative">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Poder Ilimitado</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Ferramentas integradas para superalimentar sua criatividade e produtividade.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Content Generator", desc: "Criação de posts, legendas e roteiros ultra-realistas com IA.", icon: "✨", color: "blue" },
                                { title: "Trend Hunter", desc: "Monitore o que está em alta no Google e Redes Sociais em tempo real.", icon: "📈", color: "green" },
                                { title: "Ad Studio", desc: "Crie campanhas publicitárias de alta conversão em segundos.", icon: "🎯", color: "red" },
                                { title: "Smart Scheduler", desc: "Agende e gerencie seu conteúdo com um calendário inteligente.", icon: "📅", color: "purple" }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS SECTION */}
                <section className="py-24 px-4 bg-gradient-to-b from-transparent to-black/40">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">O que dizem os Creators</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Ana Silva", role: "Digital Influencer", text: "O VitrineX revolucionou a forma como crio conteúdo. O Trend Hunter é simplesmente genial!" },
                                { name: "Carlos Mendes", role: "Marketing Digital", text: "Aumentei minha produtividade em 300%. As legendas geradas são indistinguíveis de um humano." },
                                { name: "Studio Tech", role: "Agência Criativa", text: "A ferramenta essencial que faltava no nosso fluxo de trabalho. Interface incrível e resultados surpreendentes." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="bg-[#0f1522] p-8 rounded-2xl border border-gray-800 relative"
                                >
                                    <div className="absolute -top-4 left-8 text-4xl text-blue-500">"</div>
                                    <p className="text-gray-300 italic mb-6 relative z-10">{item.text}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{item.name}</h4>
                                            <span className="text-xs text-gray-500">{item.role}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-12 border-t border-white/10 bg-[#020408]">
                    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h4 className="font-bold text-lg text-white mb-2">VitrineX AI</h4>
                            <p className="text-sm text-gray-500">Transformando o futuro do marketing digital.</p>
                        </div>
                        <div className="flex gap-6">
                            <a href={WHATSAPP_SUPPORT_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Suporte</a>
                            <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Planos</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Termos</a>
                        </div>
                    </div>
                    <div className="text-center mt-10 text-xs text-gray-600">
                        © 2025 VitrineX AI. Todos os direitos reservados.
                    </div>
                </footer>

            </div>
        </div>

    );
};
export default LandingPage;