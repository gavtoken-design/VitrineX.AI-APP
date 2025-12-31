import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon, CpuChipIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AdminChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Interface Administrativa do VitrineX AI. (Modo Visual - Sem Conexão AI)' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

        // Non-functional: No AI response is triggered.
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[85vh] max-w-5xl mx-auto">
            <header className="mb-6 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                    <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Interface Neural Admin</h1>
                    <p className="text-[var(--text-secondary)] text-sm">Painel de controle (Mockup Visual)</p>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 glass-card overflow-hidden flex flex-col border border-[var(--border-default)] shadow-2xl">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                  max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 rounded-tr-none'
                                        : 'bg-[var(--background-input)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-tl-none'}
                `}
                            >
                                {msg.role === 'model' && (
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold opacity-50 uppercase tracking-wider">
                                        <SparklesIcon className="w-3 h-3" />
                                        Sistema
                                    </div>
                                )}
                                <div className="markdown-body">
                                    <ReactMarkdown>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--surface-hover)] border-t border-[var(--border-default)]">
                    <div className="relative flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite algo (apenas visual)..."
                            className="w-full bg-[var(--background)] border border-[var(--border-default)] rounded-xl pl-4 pr-12 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-all resize-none min-h-[50px] max-h-[150px]"
                            rows={1}
                            style={{ height: 'auto', minHeight: '50px' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 bottom-2 p-2 rounded-lg h-9 w-9 flex items-center justify-center bg-primary text-white disabled:opacity-50"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
