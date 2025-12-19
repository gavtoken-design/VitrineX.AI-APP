import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { generateText } from '../services/ai';
import { GEMINI_PRO_MODEL } from '../constants';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SparklesIcon, DocumentArrowDownIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const PromptChat: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const SYSTEM_PROMPT = `Você é um especialista em Marketing Digital com mais de 15 anos de experiência.
Seu trabalho é ajudar a criar prompts perfeitos para:
- Geração de conteúdo visual (imagens com Imagen/DALL-E)
- Copywriting persuasivo
- Estratégias de campanha
- Análise de público-alvo

Seja criativo, técnico e específico nas suas recomendações.
Sempre forneça prompts otimizados e detalhados.`;

    const handleSend = useCallback(async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Limit history to the last 6 messages to keep context focused and save tokens
            const recentMessages = messages.slice(-6);
            const chatHistory = recentMessages.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n\n');

            const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\nHistórico Recente:\n${chatHistory}\n\nUsuário: ${input}\n\nAssistente:`;

            const response = await generateText(fullPrompt, {
                model: GEMINI_PRO_MODEL,
                temperature: 0.7
            });

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setLastGeneratedPrompt(response);

        } catch (error) {
            console.error('Erro no chat:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao gerar resposta. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, addToast]);

    const exportAsJSON = useCallback(() => {
        if (!lastGeneratedPrompt) {
            addToast({ type: 'warning', message: 'Nenhum prompt disponível para exportar.' });
            return;
        }

        const jsonData = {
            prompt: lastGeneratedPrompt,
            metadata: {
                generated_at: new Date().toISOString(),
                user_id: user?.id || 'guest',
                model: GEMINI_PRO_MODEL,
            },
            conversation: messages.map(m => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp.toISOString()
            }))
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-marketing-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        addToast({ type: 'success', message: 'JSON exportado com sucesso!' });
    }, [lastGeneratedPrompt, messages, user, addToast]);

    const copyPrompt = useCallback(() => {
        if (!lastGeneratedPrompt) {
            addToast({ type: 'warning', message: 'Nenhum prompt disponível para copiar.' });
            return;
        }

        navigator.clipboard.writeText(lastGeneratedPrompt);
        addToast({ type: 'success', message: 'Prompt copiado para a área de transferência!' });
    }, [lastGeneratedPrompt, addToast]);

    return (
        <div className="container mx-auto py-8 lg:py-10 pb-40 lg:pb-10 max-w-4xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-textdark mb-2">Chat Gerador de Prompt</h2>
                <p className="text-muted">Converse com um especialista em Marketing Digital para criar prompts perfeitos</p>
            </div>

            {/* Chat Messages */}
            <div className="bg-lightbg rounded-lg border border-border mb-4 h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <SparklesIcon className="w-16 h-16 text-muted mb-4" />
                        <h3 className="text-lg font-semibold text-textlight mb-2">Comece sua conversa</h3>
                        <p className="text-muted text-sm max-w-md">
                            Peça ajuda para criar prompts de marketing, imagens, copywriting ou estratégias de campanha.
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-surface border border-border text-textlight'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <span className="text-xs opacity-70 mt-2 block">
                                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface border border-border rounded-lg p-4">
                            <LoadingSpinner className="w-5 h-5" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-lightbg rounded-lg border border-border p-4 mb-4">
                <Textarea
                    id="chat-input"
                    label=""
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    rows={3}
                    placeholder="Digite sua pergunta ou pedido... (Enter para enviar, Shift+Enter para quebra de linha)"
                    className="resize-none"
                />
                <div className="flex justify-end mt-3">
                    <Button
                        onClick={handleSend}
                        isLoading={loading}
                        disabled={!input.trim() || loading}
                        variant="primary"
                    >
                        {loading ? 'Gerando...' : 'Enviar'}
                    </Button>
                </div>
            </div>

            {/* Export Actions */}
            {lastGeneratedPrompt && (
                <div className="bg-lightbg rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-textlight mb-3">Ações do Último Prompt</h3>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={copyPrompt}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copiar Prompt
                        </Button>
                        <Button
                            onClick={exportAsJSON}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                            Exportar JSON
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptChat;
