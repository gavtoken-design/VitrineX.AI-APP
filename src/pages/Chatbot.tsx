

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { sendMessageToChat } from '../services/ai';
import { Part } from '@google/genai';
import { GEMINI_PRO_MODEL } from '../constants';
import {
  TrashIcon,
  SparklesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PaperClipIcon,
  ArrowPathIcon,
  CircleStackIcon,
  // FIX: Add missing import for ChatBubbleLeftRightIcon
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import ChatMessage from '../components/features/ChatMessage';
import TypingIndicator from '../components/features/TypingIndicator';
import MultimodalChatInput from '../components/features/MultimodalChatInput';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { useToast } from '../contexts/ToastContext';
import { generateSpeech, decode, decodeAudioData } from '../services/ai';
import { useDownloader } from '../hooks/useDownloader';
import ArtifactPanel from '../components/features/ArtifactPanel';
import { compactChatHistory } from '../services/ai/memory';
import { saveToDrive, GOOGLE_DRIVE_FOLDER_ID } from '../services/integrations/drive';

const commands = [
  { key: '/post', text: 'Crie um post para Instagram sobre: ', desc: 'Gera legenda + ideia de imagem' },
  { key: '/refinar', text: 'Reescreva o texto acima tornando-o mais: ', desc: 'Ajuste de tom' },
  { key: '/analisar', text: 'Analise os pontos fortes e fracos de: ', desc: 'Crítica estratégica' }
];

const SUGGESTIONS = [
  "Crie um calendário editorial de 7 dias para marketing de SaaS.",
  "Escreva 5 títulos persuasivos para um webinar B2B.",
  "Analise as tendências atuais em computação em nuvem.",
  "Refine este parágrafo para um nível mais executivo: [Cole o texto]"
];

const DEFAULT_SYSTEM_INSTRUCTION = `Sua função principal é atuar como um Arquiteto de Marketing Digital e Copywriter Sênior. Você utiliza ferramentas para gerar imagens, textos persuasivos e estratégias de campanha. Para agendamentos, instrua o usuário a utilizar o Calendário Visual (SmartScheduler) da plataforma.`;

const STORAGE_KEY = 'vitrinex_chat_history';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showBrainSettings, setShowBrainSettings] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);

  const [attachedFile, setAttachedFile] = useState<{ name: string, type: string, data: string | Part } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [useHistory, setUseHistory] = useState(true);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState<boolean>(false);
  const kbName = localStorage.getItem('vitrinex_kb_name');

  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { addToast } = useToast();
  const { download } = useDownloader();

  // FASE 4: Artifact State
  const [artifacts, setArtifacts] = useState<{ title: string, content: string }[]>([]);
  const [activeArtifactIndex, setActiveArtifactIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      setMessages([{
        role: 'model',
        text: `Olá! Sou seu Assistente de IA Empresarial. Como posso ajudar hoje?`,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

      // Auto-save compact memory to Drive every 5 turns (user+model pairs)
      if (messages.length % 5 === 0) {
        console.log("Auto-compacting memory for Drive...");
        const userIdToUse = 'mock-user-123'; // Replace with real Auth
        compactChatHistory(messages).then((memory) => {
          saveToDrive(userIdToUse, 'memory.json', JSON.stringify(memory, null, 2));
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const processArtifacts = (text: string): { cleanedText: string; newArtifacts: { title: string, content: string }[] } => {
    const artifactRegex = /<artifact title="([^"]+)">([\s\S]*?)<\/artifact>/g;
    const newArtifacts: { title: string, content: string }[] = [];
    let match;
    let lastIndex = 0;

    let cleanedText = text;

    while ((match = artifactRegex.exec(text)) !== null) {
      const [fullMatch, title, content] = match;
      const artifact = { title, content: content.trim() };
      newArtifacts.push(artifact);

      const artifactPlaceholder = `[ARTIFACT|${artifacts.length + newArtifacts.length - 1}|${title}]`;
      cleanedText = cleanedText.replace(fullMatch, artifactPlaceholder);
    }

    return { cleanedText, newArtifacts };
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const userMessageText = text;
    const attachmentData = attachedFile && typeof attachedFile.data === 'string' ? {
      name: attachedFile.name,
      type: attachedFile.type,
      data: attachedFile.data
    } : undefined;

    const newUserMessage: ChatMessageType = {
      role: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString(),
      attachment: attachmentData
    };

    const currentHistory = useHistory ? [...messages, newUserMessage] : [newUserMessage];
    setMessages(currentHistory);
    setLoading(true);
    setError(null);

    setMessages((prev) => [...prev, { role: 'model', text: '', timestamp: new Date().toISOString() }]);

    try {
      let messagePayload: string | (string | Part)[] = text;

      if (attachedFile) {
        // Build multimodal payload: [text, imagePart]
        if (typeof attachedFile.data === 'string') {
          // Base64 string - convert to Part
          const base64Data = attachedFile.data.includes(',') ? attachedFile.data.split(',')[1] : attachedFile.data;
          const imagePart: Part = {
            inlineData: {
              data: base64Data,
              mimeType: attachedFile.type
            }
          };
          messagePayload = [text, imagePart];
        } else {
          // Already a Part object
          messagePayload = [text, attachedFile.data as Part];
        }
      }

      let fullResponse = "";
      const onChunk = (partialText: string) => {
        fullResponse = partialText; // Accumulate
        const { cleanedText } = processArtifacts(fullResponse);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: cleanedText };
          return newMessages;
        });
      };

      const finalResponseText = await sendMessageToChat(
        useHistory ? messages : [],
        messagePayload,
        onChunk,
        { model: GEMINI_PRO_MODEL, systemInstruction, useKnowledgeBase },
        signal
      );

      const { cleanedText, newArtifacts } = processArtifacts(finalResponseText);
      if (newArtifacts.length > 0) {
        setArtifacts(prev => [...prev, ...newArtifacts]);
      }
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].text = cleanedText;
        return updatedMessages;
      });

    } catch (err) {
      if (!signal.aborted) {
        setError('Erro de processamento. Por favor, tente novamente.');
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      setAttachedFile(null);
    }
  }, [messages, attachedFile, useHistory, useKnowledgeBase, systemInstruction, artifacts.length]);

  const handleStopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  const handleClearChat = () => {
    if (window.confirm('Limpar histórico da sessão?')) {
      abortControllerRef.current?.abort();
      localStorage.removeItem(STORAGE_KEY);
      setMessages([{
        role: 'model',
        text: `Olá! Sou seu Assistente de IA Empresarial. Como posso ajudar hoje?`,
        timestamp: new Date().toISOString(),
      }]);
      setArtifacts([]);
      setActiveArtifactIndex(null);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Apenas imagens são suportadas no momento.' });
      return;
    }

    // Validate file size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      addToast({ type: 'error', message: 'Imagem muito grande. Máximo 20MB.' });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAttachedFile({
          name: file.name,
          type: file.type,
          data: reader.result // base64 with data:image/... prefix
        });
        addToast({ type: 'success', message: `Imagem "${file.name}" anexada!` });
      }
    };
    reader.onerror = () => {
      addToast({ type: 'error', message: 'Erro ao carregar imagem.' });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => setAttachedFile(null);

  const handleTTS = useCallback(async (text: string) => {
    addToast({ type: 'info', message: 'Gerando áudio...' });
    try {
      const base64Audio = await generateSpeech(text);
      if (!base64Audio) throw new Error("Audio generation failed.");

      const audioBytes = decode(base64Audio);
      const audioContext = playbackContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      playbackContextRef.current = audioContext;

      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);

      if (playbackSourceRef.current) {
        playbackSourceRef.current.stop();
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      playbackSourceRef.current = source;

    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Falha ao gerar áudio.' });
    }
  }, [addToast]);

  const handleDownloadTxt = useCallback((text: string) => {
    download(text, `vitrinex-chat-${Date.now()}.txt`, 'text/plain');
  }, [download]);

  const handleShareCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({ type: 'success', message: 'Copiado para a área de transferência!' });
    }, (err) => {
      console.error('Could not copy text: ', err);
      addToast({ type: 'error', message: 'Falha ao copiar texto.' });
    });
  }, [addToast]);

  return (
    <div className={`flex h-full bg-background relative overflow-hidden rounded-tl-xl border-l border-t border-border`}>
      {/* BRAIN SETTINGS MODAL */}
      {showBrainSettings && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-title flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary" /> Cérebro da IA (Persona)
              </h3>
              <button onClick={() => setShowBrainSettings(false)} className="p-1.5 rounded-full hover:bg-background">
                <XMarkIcon className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <Textarea
                id="system-instruction"
                label="Instrução do Sistema"
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                rows={15}
                className="text-sm font-mono"
              />
            </div>
            <div className="p-4 bg-background border-t border-border flex justify-end">
              <Button variant="primary" onClick={() => { setShowBrainSettings(false); addToast({ type: 'success', message: 'Cérebro da IA atualizado.' }); }}>
                Salvar e Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 h-full min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <h3 className="text-lg font-semibold text-title flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" /> Chat IA
          </h3>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowBrainSettings(true)} variant="ghost" size="sm">
              <Cog6ToothIcon className="w-4 h-4 mr-1.5" /> Cérebro da IA
            </Button>
            <Button onClick={handleClearChat} variant="ghost" size="sm">
              <TrashIcon className="w-4 h-4 mr-1.5" /> Limpar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 space-background">
          {messages.map((msg, index) => (
            <ChatMessage
              key={`${msg.timestamp}-${index}`}
              message={msg}
              onSpeak={handleTTS}
              onDownload={handleDownloadTxt}
              onShare={handleShareCopy}
              onViewArtifact={setActiveArtifactIndex}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3 px-20">
              <button onClick={() => setUseHistory(!useHistory)} className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border transition-colors ${useHistory ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-100 dark:bg-gray-800 border-border text-muted hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <ArrowPathIcon className="w-4 h-4" /> Manter Contexto
              </button>
              <button onClick={() => setUseKnowledgeBase(!useKnowledgeBase)} disabled={!kbName} className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border transition-colors ${useKnowledgeBase ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-100 dark:bg-gray-800 border-border text-muted hover:border-gray-300 dark:hover:border-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                <CircleStackIcon className="w-4 h-4" /> Consultar Base (RAG)
              </button>
            </div>

            <div className="flex items-center gap-2 relative">
              <button onClick={handleFileClick} className="p-2.5 rounded-xl text-muted hover:bg-background" title="Anexar arquivo">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

              <div className="flex-1">
                {attachedFile && (
                  <div className="mx-4 mb-2 p-2 bg-surface border border-border rounded-lg inline-flex items-center gap-3 animate-fade-in relative z-10 w-fit">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-black/20">
                      {typeof attachedFile.data === 'string' && (
                        <img src={attachedFile.data} className="w-full h-full object-cover" alt="Preview" />
                      )}
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-title truncate max-w-[150px]">{attachedFile.name}</p>
                      <p className="text-muted text-[10px]">Imagem anexada</p>
                    </div>
                    <button onClick={removeAttachment} className="ml-2 p-1 hover:bg-gray-700 rounded-full text-muted hover:text-white">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <MultimodalChatInput
                  onSendText={handleSendMessage}
                  onStartVoice={() => { }}
                  onStopVoice={() => { }}
                  isTextLoading={loading}
                  isVoiceActive={false}
                  isListening={false}
                  commands={commands}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artifact Panel */}
      <ArtifactPanel
        isOpen={activeArtifactIndex !== null}
        onClose={() => setActiveArtifactIndex(null)}
        artifact={activeArtifactIndex !== null ? artifacts[activeArtifactIndex] : null}
      />
    </div>
  );
};

export default Chatbot;
