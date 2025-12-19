import * as React from 'react';
import { useState } from 'react';
import { SpeakerWaveIcon, MicrophoneIcon, MusicalNoteIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { useToast } from '../contexts/ToastContext';
import { generateSpeech, decode, decodeAudioData, base64AudioToWavBlob } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import HowToUse from '../components/ui/HowToUse';
import { useAuth } from '../contexts/AuthContext';

const VOICES = [
  { id: 'Kore', name: 'Kore', gender: 'Feminino', description: 'Voz clara, padrão e profissional' },
  { id: 'Aoede', name: 'Aoede', gender: 'Feminino', description: 'Voz suave, gentil e acolhedora' },
  { id: 'Charon', name: 'Charon', gender: 'Masculino', description: 'Voz profunda, ideal para narrações sérias' },
  { id: 'Puck', name: 'Puck', gender: 'Masculino', description: 'Voz jovem, enérgica e entusiasmada' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Masculino', description: 'Voz equilibrada e direta' }
];

// Utility: Convert Base64 audio to File for storage upload
const base64ToAudioFile = async (base64: string): Promise<File> => {
  const response = await fetch(`data:audio/wav;base64,${base64}`);
  const blob = await response.blob();
  return new File(
    [blob],
    `audio-${Date.now()}.wav`,
    { type: 'audio/wav' }
  );
};

const AudioTools: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const { addToast } = useToast();
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);

  const handleDownloadMP3 = async () => {
    if (!generatedAudioBase64) {
      addToast({ type: 'warning', message: 'Nenhum áudio gerado ainda.' });
      return;
    }

    try {
      // Convert to WAV blob for playable audio
      const wavBlob = await base64AudioToWavBlob(generatedAudioBase64);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vitrinex-audio-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: 'Áudio baixado!' });
    } catch (error: any) {
      addToast({ type: 'error', message: `Erro ao baixar: ${error.message}` });
    }
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      addToast({ type: 'warning', message: 'Digite um texto para gerar áudio.' });
      return;
    }

    setIsGenerating(true);
    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      if (!base64Audio) throw new Error('Falha na geração de áudio.');

      setGeneratedAudioBase64(base64Audio); // Store for download

      const audioBytes = decode(base64Audio);
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);

      if (sourceRef.current) {
        sourceRef.current.stop();
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      sourceRef.current = source;

      addToast({ type: 'success', message: 'Áudio gerado e reproduzido!' });

      // AUTO-SAVE: Salvar áudio na biblioteca
      if (user) {
        try {
          await saveLibraryItem({
            id: `lib-${Date.now()}`,
            userId: user.id,
            name: `Áudio - ${text.substring(0, 30)}`,
            file_url: base64Audio,
            type: 'audio',
            tags: ['audio-tools', 'tts', 'audio'],
            createdAt: new Date().toISOString()
          });
        } catch (saveError) {
          console.warn('Failed to auto-save to library:', saveError);
        }
      }
    } catch (error: any) {
      addToast({ type: 'error', message: `Erro: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <MusicalNoteIcon className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-title">Ferramentas de Áudio</h1>
          <p className="text-muted">Gere áudio natural com Text-to-Speech usando Gemini.</p>
        </div>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <SpeakerWaveIcon className="w-5 h-5 text-purple-500" />
          Gerador de Voz (Text-to-Speech)
        </h3>

        <Textarea
          id="tts-text"
          label="Texto para Conversão"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Digite o texto que deseja converter em áudio natural..."
          className="mb-6"
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-title mb-3">
            Selecione a Persona da Voz
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-3 rounded-xl border text-left transition-all ${selectedVoice === voice.id
                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                    : 'border-border bg-surface hover:border-purple-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-title">{voice.name}</span>
                  <span className="text-[10px] uppercase font-bold text-muted bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {voice.gender === 'Feminino' ? 'FEM' : 'MASC'}
                  </span>
                </div>
                <p className="text-[10px] text-muted leading-tight">{voice.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGenerateSpeech}
            isLoading={isGenerating}
            disabled={!text.trim()}
            variant="primary"
            className="flex-1 sm:flex-none"
          >
            <SpeakerWaveIcon className="w-4 h-4 mr-2" />
            Gerar e Reproduzir Áudio
          </Button>

          {generatedAudioBase64 && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={handleDownloadMP3}
                variant="secondary"
                className="flex-1 sm:flex-none"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Baixar WAV
              </Button>

              <Button
                onClick={async () => {
                  if (!user) {
                    addToast({ type: 'error', message: 'Você precisa estar logado para salvar.' });
                    return;
                  }
                  if (!generatedAudioBase64) {
                    addToast({ type: 'error', message: 'Nenhum áudio para salvar.' });
                    return;
                  }

                  try {
                    // 1️⃣ Convert Base64 to File
                    const audioFile = await base64ToAudioFile(generatedAudioBase64);

                    // 2️⃣ Upload to Supabase Storage
                    const uploadedItem = await uploadFile(audioFile, user.id, 'audio');

                    // 3️⃣ Save to Database using the public URL
                    await saveLibraryItem({
                      ...uploadedItem,
                      name: `Narrativa: ${text.substring(0, 30)}`,
                      userId: user.id,
                      tags: ['audio-tools', 'tts', 'audio']
                    });

                    addToast({ type: 'success', message: 'Áudio salvo na biblioteca com sucesso!' });
                  } catch (error: any) {
                    console.error(error);
                    addToast({ type: 'error', message: 'Erro ao salvar áudio na biblioteca.' });
                  }
                }}
                variant="outline"
                className="flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50"
              >
                <MusicalNoteIcon className="w-4 h-4 mr-2" />
                Salvar na Biblioteca
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted">
            <strong>Dica:</strong> Use textos naturais e bem pontuados para obter a melhor qualidade de áudio.
            O motor de voz VitrineX suporta português brasileiro com alta naturalidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioTools;
