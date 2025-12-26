import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
    SparklesIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Logo from '../components/ui/Logo';
import AnoAI from '../components/ui/animated-shader-background';

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                await signIn(email, password);
            } else {
                await signUp(email, password, { full_name: name });
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            let errorMessage = err.message || 'Erro ao processar sua solicitação';

            // Tratamento amigável para erro comum de configuração
            if (errorMessage.includes('signups are disabled')) {
                errorMessage = 'O cadastro por e-mail está desativado no Supabase. Vá em Authentication > Providers > Email e habilite-o.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError(null);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center p-4">
            {/* Animated Background */}
            <AnoAI />

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-card p-8 md:p-10 border border-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl bg-white/5">
                    {/* Decorative top line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />

                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <Logo className="h-12 w-12" showText={false} />
                        </div>
                    </div>

                    {/* Supabase Configuration Warning */}
                    {!isSupabaseConfigured && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                        >
                            <div className="flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-yellow-500 mb-1">
                                        Modo de Demonstração (Sem Supabase)
                                    </h4>
                                    <p className="text-xs text-yellow-200/80 mb-2">
                                        O Supabase não foi configurado ou as chaves estão ausentes.
                                        Você pode entrar com <strong>qualquer e-mail e senha</strong> para testar a interface.
                                    </p>
                                    <p className="text-xs text-yellow-200/60 mt-1 italic">
                                        Para login real, edite o arquivo .env com suas chaves.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Title */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300">
                                {mode === 'login' ? 'Bem-vindo de volta!' : 'Criar conta'}
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {mode === 'login'
                                    ? 'Acesse sua conta VitrineX AI'
                                    : 'Comece sua jornada com IA'}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field (only for signup) */}
                        <AnimatePresence>
                            {mode === 'signup' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Nome completo
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="João Silva"
                                            required={mode === 'signup'}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {mode === 'signup' && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Mínimo de 6 caracteres
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                                    <ArrowRightIcon className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                        >
                            {mode === 'login' ? (
                                <>
                                    Não tem uma conta? <span className="font-semibold">Cadastre-se</span>
                                </>
                            ) : (
                                <>
                                    Já tem uma conta? <span className="font-semibold">Entrar</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Forgot Password (only on login) */}
                    {mode === 'login' && (
                        <div className="mt-4 text-center">
                            <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                                Esqueceu a senha?
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-gray-500 text-xs">
                    © 2025 VitrineX AI. Todos os direitos reservados.
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
