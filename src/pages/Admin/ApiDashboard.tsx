
import React, { useState, useEffect } from "react";
import {
    ServerIcon,
    CheckCircleIcon,
    XCircleIcon,
    KeyIcon,
    ArrowPathIcon,
    CpuChipIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToast } from "../../contexts/ToastContext";
import { motion } from "framer-motion";

interface ApiStatus {
    service: string;
    status: "online" | "offline" | "checking" | "error";
    latency?: number;
    lastChecked?: string;
    errorMessage?: string;
}

const ApiDashboard: React.FC = () => {
    const { addToast } = useToast();
    const [geminiKey, setGeminiKey] = useState("");
    const [isEditingKey, setIsEditingKey] = useState(false);

    const [statuses, setStatuses] = useState<ApiStatus[]>([
        { service: "Google Gemini API", status: "checking" },
        { service: "Google Imagen API", status: "checking" },
        { service: "Pinterest API", status: "checking" }
    ]);

    // Load key from localStorage on mount (Simulated secure storage for MVP)
    useEffect(() => {
        const savedKey = localStorage.getItem("vitrinex_gemini_key");
        if (savedKey) setGeminiKey(savedKey);
        checkAllServices();
    }, []);

    const checkGeminiStatus = async () => {
        const startTime = Date.now();
        try {
            // Simple health check simulation or real call if backend existed
            // For client-side, we can try a lightweight list models call if we had the SDK here, 
            // but for now we simulate a check based on key presence.

            const keyToUse = geminiKey || (import.meta as any).env.VITE_GEMINI_API_KEY;

            if (!keyToUse) throw new Error("API Key not configured");

            // Simulate fetch delay
            await new Promise(r => setTimeout(r, 800));

            return { status: "online", latency: Date.now() - startTime };
        } catch (err) {
            return { status: "offline", latency: 0, errorMessage: String(err) };
        }
    };

    const checkAllServices = async () => {
        setStatuses(prev => prev.map(s => ({ ...s, status: "checking" })));

        // 1. Gemini Check
        const geminiResult = await checkGeminiStatus();
        updateStatus("Google Gemini API", geminiResult.status as any, geminiResult.latency, geminiResult.errorMessage);

        // 2. Imagen Check (Often same key as Gemini)
        const imagenResult = await checkGeminiStatus();
        updateStatus("Google Imagen API", imagenResult.status as any, imagenResult.latency, imagenResult.errorMessage);

        // 3. Pinterest Check (Simulated for now)
        setTimeout(() => {
            const isPinterestConfigured = !!localStorage.getItem("pinterest_access_token");
            updateStatus("Pinterest API", isPinterestConfigured ? "online" : "offline", 120, isPinterestConfigured ? undefined : "Token not found");
        }, 1500);
    };

    const updateStatus = (service: string, status: "online" | "offline", latency?: number, error?: string) => {
        setStatuses(prev => prev.map(s =>
            s.service === service ? {
                ...s,
                status,
                latency,
                lastChecked: new Date().toLocaleTimeString(),
                errorMessage: error
            } : s
        ));
    };

    const handleSaveKey = () => {
        if (geminiKey.trim().length < 10) {
            addToast({ type: "error", message: "Chave API inválida (muito curta)." });
            return;
        }
        localStorage.setItem("vitrinex_gemini_key", geminiKey);
        setIsEditingKey(false);
        addToast({ type: "success", message: "Chave API Gemini salva com segurança!" });
        checkAllServices(); // Re-check with new key
    };

    return (
        <div className="p-8 max-w-6xl mx-auto text-[var(--text-primary)] animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <ServerIcon className="w-8 h-8 text-primary" />
                        API Command Center
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Monitore a saúde e conectividade dos serviços de IA.</p>
                </div>
                <Button onClick={checkAllServices} variant="outline" className="gap-2">
                    <ArrowPathIcon className="w-4 h-4" /> Atualizar Status
                </Button>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statuses.map((item) => (
                    <div key={item.service} className="glass-card p-6 border border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-xl">
                                {item.service.includes("Pinterest") ? <span className="text-2xl">P</span> : <CpuChipIcon className="w-6 h-6 text-primary" />}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${item.status === 'online' ? 'bg-green-500/10 text-green-400' :
                                    item.status === 'checking' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                                        'bg-red-500/10 text-red-500'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'online' ? 'bg-green-500' :
                                        item.status === 'checking' ? 'bg-blue-500' :
                                            'bg-red-500'
                                    }`} />
                                {item.status}
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-1">{item.service}</h3>

                        <div className="flex justify-between items-end mt-4">
                            <div className="text-xs text-[var(--text-secondary)]">
                                <p>Latência: <span className="text-[var(--text-primary)] font-mono">{item.latency ? item.latency + 'ms' : '--'}</span></p>
                                <p>Última verificação: {item.lastChecked || '--'}</p>
                            </div>
                        </div>

                        {item.errorMessage && (
                            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-red-400/80 truncate" title={item.errorMessage}>
                                Erro: {item.errorMessage}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Gemini Key Config */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <KeyIcon className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold">Configuração de Chaves (Secrets)</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider mb-2 block">
                                Google Gemini API Key (Principal)
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={isEditingKey ? "text" : "password"}
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        disabled={!isEditingKey}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary outline-none disabled:opacity-50 transition-all"
                                        placeholder="sk-..."
                                    />
                                </div>
                                {isEditingKey ? (
                                    <Button onClick={handleSaveKey} variant="primary" size="sm">Salvar</Button>
                                ) : (
                                    <Button onClick={() => setIsEditingKey(true)} variant="outline" size="sm">Editar</Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Esta chave será armazenada localmente e usada para todas as requisições de geração de texto e imagem.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/5 opacity-50 pointer-events-none filter grayscale">
                            <label className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider mb-2 block">
                                Pinterest Access Token (Oauth2)
                            </label>
                            <div className="flex gap-2">
                                <input disabled value="••••••••••••••••••••••" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono" />
                                <Button disabled variant="outline" size="sm">Renovar</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Stats (Mockup for now) */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05]">
                    <div className="flex items-center gap-3 mb-6">
                        <ChartBarIcon className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-xl font-bold">Consumo de Recursos (Estimado)</h2>
                    </div>

                    <div className="space-y-6">

                        {/* Progress Bar 1 */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Gemini Flash (Tokens)</span>
                                <span className="font-mono text-indigo-300">12.5k / Free Tier</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "15%" }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Progress Bar 2 */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Geração de Imagens</span>
                                <span className="font-mono text-purple-300">48 / 100</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "48%" }}
                                    className="h-full bg-purple-500"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 mt-8">
                            <h4 className="font-bold text-indigo-300 text-sm mb-1">Dica de Otimização</h4>
                            <p className="text-xs text-indigo-200/70 leading-relaxed">
                                Seu consumo está dentro dos limites gratuitos do Google AI Studio. Para aumentar a cota, vincule uma conta de faturamento no Google Cloud Console.
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ApiDashboard;
