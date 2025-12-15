import * as React from 'react';
import { useState } from 'react';
import { SpeakerWaveIcon, MicrophoneIcon, MusicalNoteIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { useToast } from '../contexts/ToastContext';
import { generateSpeech, decode, decodeAudioData, base64AudioToWavBlob } from '../services/ai';

const AudioTools: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
      const base64Audio = await generateSpeech(text);
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
          className="mb-4"
        />

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
            <Button
              onClick={handleDownloadMP3}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Baixar WAV
            </Button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted">
            <strong>Dica:</strong> Use textos naturais e bem pontuados para obter a melhor qualidade de áudio.
            O modelo Gemini TTS suporta português brasileiro com alta naturalidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioTools;
