import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech, decode, decodeAudioData } from '../../services/ai';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import { SpeakerWaveIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // FIX: Imported ArrowDownTrayIcon

interface VoiceoverControlProps {
  text: string;
}

const VoiceoverControl: React.FC<VoiceoverControlProps> = ({ text }) => {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { addToast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Cleanup function to revoke object URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    let pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(36 + buffer.length * 2 * numOfChan);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(buffer.length * 2 * numOfChan);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const handleGenerateVoiceover = useCallback(async () => {
    if (!text) return;
    setLoading(true);
    setAudioUrl(null);
    try {
      const base64Audio = await generateSpeech(text, 'Kore');
      if (!base64Audio) throw new Error("Nenhum áudio foi gerado.");

      const audioBytes = decode(base64Audio);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);

      const wavBlob = bufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);

      setAudioUrl(url);
      addToast({ type: 'success', message: 'Narração gerada.' });

    } catch (err) {
      console.error("Voiceover generation failed:", err);
      addToast({ type: 'error', message: `Falha ao gerar narração: ${err instanceof Error ? err.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  }, [text, addToast]);


  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <div className="flex items-center gap-2">
        <Button onClick={handleGenerateVoiceover} isLoading={loading} variant="outline" size="sm">
          <SpeakerWaveIcon className="w-4 h-4 mr-2" />
          Gerar Narração
        </Button>

        {audioUrl && (
          <a
            href={audioUrl}
            download={`voiceover-${Date.now()}.wav`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
            title="Baixar Áudio"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Baixar
          </a>
        )}
      </div>

      {audioUrl && !loading && (
        <audio ref={audioRef} controls src={audioUrl} className="w-full mt-3 h-10" />
      )}
    </div>
  );
};

export default VoiceoverControl;
