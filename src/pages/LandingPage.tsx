import * as React from 'react';
import { motion, Variants } from 'framer-motion';
// Se estiveres a usar react-router-dom padrão, troca a linha abaixo por:
// import { useNavigate } from 'react-router-dom';
import { useNavigate } from '../hooks/useNavigate';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
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

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('vitrinex_gemini_api_key', apiKey.trim());
            // Opcional: Recarregar a página ou notificar sucesso
            alert('Chave de acesso salva com sucesso! O sistema agora está ativo.');
            setShowApiKey(false);
        }
    };

    return (
        // Adicionei 'bg-slate-900' como fallback caso o CSS personalizado falhe
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-4">

            {/* Animated AI Background */}
            <AnoAI />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-4xl w-full mx-auto"
            >
                {/* Cartão principal com efeito Glass */}
                <motion.div className="glass-card p-10 md:p-16 text-center border border-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden relative bg-white/5">

                    {/* Brilho decorativo no topo */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />

                    {/* Logo */}
                    <motion.div variants={itemVariants} className="flex justify-center mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                            <Logo className="h-16 w-16 md:h-20 md:w-20" showText={false} />
                        </div>
                    </motion.div>

                    {/* Título Principal */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 drop-shadow-lg"
                    >
                        Bem-vindo ao <br className="md:hidden" /> VitrineX AI
                    </motion.h1>

                    {/* Subtítulo / Descrição */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        A plataforma definitiva para criadores. Gere campanhas, imagens e códigos de vendas com o poder da <span className="text-blue-400 font-semibold">Inteligência Artificial</span>.
                    </motion.p>

                    {/* Botão de Ação (CTA) */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center gap-6 w-full"
                    >
                        <button
                            onClick={handleGetStarted}
                            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 group border border-blue-400/30"
                        >
                            <SparklesIcon className="w-5 h-5 group-hover:animate-spin-slow" />
                            Começar Agora
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Link para Configurar API Key */}
                        {!showApiKey ? (
                            <button
                                onClick={() => setShowApiKey(true)}
                                className="text-sm text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                </svg>
                                Configurar Licença
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full max-w-md flex flex-col gap-2 bg-black/40 p-4 rounded-xl border border-white/5"
                            >
                                <label className="text-xs text-left text-gray-400 ml-1">Insira sua Chave de Acesso / Licença</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                                    />
                                    <button
                                        onClick={handleSaveKey}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors border border-white/5"
                                    >
                                        Salvar
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowApiKey(false)}
                                    className="text-xs text-gray-500 hover:text-gray-300 self-end mt-1"
                                >
                                    Cancelar
                                </button>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Links Adicionais de Suporte */}
                    <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-6">
                        <a href={WHATSAPP_SUPPORT_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 text-sm transition-colors flex items-center gap-2">
                            Whatsapp
                        </a>
                        <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-sm transition-colors flex items-center gap-2">
                            Planos Premium
                        </a>
                    </motion.div>
                </motion.div>

                {/* Rodapé Simples */}
                <motion.div variants={itemVariants} className="mt-8 text-center text-gray-500 text-sm">
                    © 2025 VitrineX AI. Todos os direitos reservados.
                </motion.div>
            </motion.div>
        </div>
    );
};
export default LandingPage;