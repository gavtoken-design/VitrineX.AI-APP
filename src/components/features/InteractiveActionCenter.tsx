
import * as React from 'react';
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  generateText,
  generateImage,
  generateSpeech,
  generateVideo,
  queryFileSearchStore
} from '../../services/ai';
import {
  CommandLineIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { IMAGE_SIZES, VIDEO_RESOLUTIONS } from '../../constants';

type ModuleType = 'content_generation' | 'image_generation' | 'audio_generation' | 'file_search' | 'video_generation';

const InteractiveActionCenter: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleType>('content_generation');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null); // For Image/Video results
  const [error, setError] = useState<string | null>(null);

  // Form States - Default prompt updated to match "Explain how AI works" logic
  const [prompt, setPrompt] = useState('Explain how AI works in a few words');
  const [style, setStyle] = useState('');
  const [size, setSize] = useState('1K');
  const [voice, setVoice] = useState('Zephyr');
  const [resolution, setResolution] = useState('720p');
  const [kbName, setKbName] = useState(localStorage.getItem('vitrinex_kb_name') || '');

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setMediaUrl(null);

    try {
      let outputText = '';
      let outputUrl = null;

      switch (selectedModule) {
        case 'content_generation':
          // Logic mapping to adjust_module_settings -> content_generation
          // If KB is named, use it for queryFileSearchStore, otherwise use generateText
          if (kbName) {
            const kbResponse = await queryFileSearchStore(prompt);
            outputText = kbResponse.resposta; // Extract the string response
          } else {
            outputText = await generateText(prompt);
          }
          break;

        case 'image_generation':
          // Logic mapping to adjust_module_settings -> image_generation
          const imagePrompt = style ? `${prompt}, estilo ${style}` : prompt;
          const imgRes = await generateImage(imagePrompt, { imageSize: size as any });
          outputUrl = imgRes.imageUrl;
          outputText = imgRes.text || 'Imagem gerada com sucesso.';
          break;

        case 'audio_generation':
          // Logic mapping to adjust_module_settings -> audio_generation
          const audioBase64 = await generateSpeech(prompt, voice);
          if (audioBase64) {
            // Create a playable blob URL (simplified for mock, actual playback in AudioTools module)
            // For InteractiveActionCenter, just return success text
            outputText = "Áudio gerado. (Reprodução disponível no módulo Audio Tools)";
          } else {
            outputText = "Falha ao gerar áudio.";
          }
          break;

        case 'file_search':
          if (!kbName) throw new Error("Nome da Base de Conhecimento é obrigatório para pesquisa.");
          const kbSearchResponse = await queryFileSearchStore(prompt);
          outputText = kbSearchResponse.resposta; // Extract the string response
          break;

        case 'video_generation':
          const videoPrompt = style ? `${prompt}, estilo visual ${style}` : prompt;
          outputUrl = await generateVideo(videoPrompt, { config: { resolution: resolution } });
          outputText = outputUrl ? "Vídeo gerado com sucesso." : "Falha na geração do vídeo.";
          break;
      }

      setResult(outputText);
      setMediaUrl(outputUrl || null);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    { id: 'content_generation', label: 'Geração de Conteúdo', icon: CommandLineIcon },
    { id: 'image_generation', label: 'Geração de Imagem', icon: PhotoIcon },
    { id: 'audio_generation', label: 'Geração de Áudio', icon: SpeakerWaveIcon },
    { id: 'file_search', label: 'Pesquisa de Arquivos', icon: MagnifyingGlassIcon },
    { id: 'video_generation', label: 'Geração de Vídeo', icon: VideoCameraIcon },
  ];

  return (
    <div className="bg-lightbg rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="bg-darkbg/50 border-b border-gray-800 p-4 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-textdark">Central de Comando Interativa</h3>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Selector */}
        <div className="w-full md:w-64 bg-darkbg/30 border-r border-gray-800 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = selectedModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id as ModuleType)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                  ? 'bg-accent text-darkbg shadow-md shadow-accent/20'
                  : 'text-textmuted hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Dynamic Inputs based on Module */}
            <div className="space-y-4 animate-in fade-in duration-300">

              {/* Common Prompt Input */}
              <Textarea
                id="unifiedPrompt"
                label={selectedModule === 'file_search' ? "Consulta de Pesquisa" : "Prompt / Descrição / Texto"}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={selectedModule === 'audio_generation' ? "Texto para falar..." : "Descreva o que você quer..."}
                rows={3}
              />

              {/* Module Specific Inputs */}
              {selectedModule === 'content_generation' && (
                <Input
                  id="kbNameInput"
                  label="Base de Conhecimento (Opcional)"
                  value={kbName}
                  onChange={(e) => setKbName(e.target.value)}
                  placeholder="Nome da store (ex: meus-docs)"
                />
              )}

              {(selectedModule === 'image_generation' || selectedModule === 'video_generation') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="styleInput"
                    label="Estilo Visual"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="Ex: Futurista, Minimalista, Cyberpunk"
                  />
                  {selectedModule === 'image_generation' ? (
                    <div>
                      <label className="block text-sm font-medium text-textlight mb-1">Tamanho</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-lightbg border border-gray-700 rounded-md px-3 py-2 text-textdark"
                      >
                        {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-textlight mb-1">Resolução</label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full bg-lightbg border border-gray-700 rounded-md px-3 py-2 text-textdark"
                      >
                        {VIDEO_RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {selectedModule === 'audio_generation' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textlight mb-1">Voz</label>
                    <select
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      className="w-full bg-lightbg border border-gray-700 rounded-md px-3 py-2 text-textdark"
                    >
                      {['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedModule === 'file_search' && (
                <Input
                  id="kbNameSearch"
                  label="Nome da Base de Conhecimento (Obrigatório)"
                  value={kbName}
                  onChange={(e) => setKbName(e.target.value)}
                />
              )}

              <Button
                onClick={handleExecute}
                isLoading={loading}
                variant="primary"
                className="w-full"
                disabled={!prompt}
              >
                Executar Ação
              </Button>
            </div>

            {/* Output Section */}
            {(result || mediaUrl || error) && (
              <div className="mt-8 pt-6 border-t border-gray-800 animate-in slide-in-from-bottom-2">
                <h4 className="text-sm font-semibold text-textmuted uppercase tracking-wider mb-4">Resultado</h4>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 mb-4">
                    {error}
                  </div>
                )}

                {mediaUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-700 bg-black/50 flex justify-center">
                    {selectedModule === 'image_generation' ? (
                      <img src={mediaUrl} alt="Generated" className="max-h-96 w-auto object-contain" />
                    ) : (
                      <video src={mediaUrl} controls className="max-h-96 w-full" />
                    )}
                  </div>
                )}

                {result && (
                  <div className="p-4 bg-darkbg rounded-lg border border-gray-700 text-textlight font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {result}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveActionCenter;
