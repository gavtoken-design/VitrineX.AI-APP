import * as React from 'react';
import { useState } from 'react';
import { CodeBracketIcon, SparklesIcon, ArrowDownTrayIcon, EyeIcon, XMarkIcon, ShareIcon, ArrowTopRightOnSquareIcon, GlobeAltIcon, LinkIcon, ClipboardDocumentIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, BoltIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import HowToUse from '../components/ui/HowToUse';
import { GEMINI_PRO_MODEL, CODE_TEMPLATES } from '../constants';
import { uploadFileToDrive } from '../services/integrations/googleDrive';
import Modal from '../components/ui/Modal';

const CodePlayground = () => {
  const { user } = useAuth();
  const [contentText, setContentText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{ name: string; data: string }[]>([]);
  const [pageDescription, setPageDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // New Features State
  const [showTemplates, setShowTemplates] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'html' | 'react'>('html');

  // Social Links State
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    pinterest: '',
    twitter: '',
    tiktok: '',
    contact: '',
    email: '',
    website: ''
  });

  const handleSocialChange = (field: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        addToast({ type: 'warning', message: `${file.name} não é uma imagem válida.` });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages(prev => [...prev, { name: file.name, data: reader.result as string }]);
          addToast({ type: 'success', message: `${file.name} adicionada!` });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    addToast({ type: 'info', message: 'Imagem removida.' });
  };

  const handleApplyTemplate = (template: typeof CODE_TEMPLATES[0]) => {
    setPageDescription(template.prompt);
    // Optional: setGeneratedCode(template.code); // If we want to show immediate preview
    setShowTemplates(false);
    addToast({ type: 'success', message: `Template "${template.name}" aplicado!` });
  };

  const generateHtmlCode = async () => {
    if (!pageDescription.trim()) {
      addToast({ type: 'warning', message: 'Descreva o tipo de página que deseja criar.' });
      return;
    }

    const isReact = outputFormat === 'react';
    const techStackBase = isReact
      ? `React Functional Component (TypeScript), TailwindCSS, Lucide React Icons.`
      : `HTML5, TailwindCSS (CDN), FontAwesome (CDN) or Heroicons (SVG).`;

    const prompt = `Você é um EXPERT WEB DEVELOPER especializado em criar interfaces modernas, responsivas e de alta conversão.

## TAREFA
Gere um código **${isReact ? 'REACT (TSX)' : 'HTML'}** completo, profissional e production-ready.

## FORMATO DE SAÍDA: ${isReact ? 'REACT COMPONENT' : 'HTML PAGE'}
${isReact ? '- Exporte um componente funcional padrão: `export default function Page() { ... }`\n- Use `lucide-react` para ícones.\n- NÃO inclua imports de CSS externo, use apenas Tailwind classes.' : '- Retorne um arquivo HTML completo começando com `<!DOCTYPE html>`.\n- Use Tailwind via CDN.'}

## CONTEÚDO FORNECIDO
${contentText ? `**Texto/Copy:**\n${contentText}\n` : ''}
${imageUrl ? `**Link de Destino (CTA):**\nUse esta URL em todos os botões principais/CTA: ${imageUrl}\n` : ''}
${uploadedImages.length > 0 ? `**Imagens Carregadas (${uploadedImages.length}):**\n${uploadedImages.map((img, i) => `${i + 1}. ${img.name} (Base64 embutida)`).join('\n')}\n` : ''}

## LINKS DE REDE SOCIAL E CONTATO
${Object.entries(socialLinks).filter(([_, v]) => v).map(([k, v]) => `- ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('\n') || 'Nenhum link fornecido.'}

## DESCRIÇÃO DO PROJETO
${pageDescription}

## REQUISITOS TÉCNICOS
1. **Stack**: ${techStackBase}
2. **Estilo**: TailwindCSS. Use uma paleta de cores moderna (Slate-950 background, Indigo/Purple accents, Glassmorphism).
3. **Imagens**: ${uploadedImages.length > 0 ? 'Use as imagens base64 fornecidas.' : 'Use placeholders do https://placehold.co/ se necessário.'}
4. **Responsividade**: Mobile-first.

Retorne APENAS o código. Sem markdown, sem explicações.`;

    setIsGenerating(true);
    try {
      const code = await generateText(prompt, { model: GEMINI_PRO_MODEL });

      let cleanCode = code.trim();
      // Improved cleanup for thinking models or markdown blocks
      cleanCode = cleanCode.replace(/^```(html|jsx|tsx|typescript|javascript)?\n?/, '').replace(/\n?```$/, '');

      setGeneratedCode(cleanCode);
      setShowPreview(true);

      try {
        await saveLibraryItem({
          id: `lib-${Date.now()}`,
          userId: user?.id || 'anonymous',
          name: `${outputFormat.toUpperCase()} - ${prompt.substring(0, 30)}`,
          file_url: cleanCode,
          type: 'text',
          tags: ['code-playground', outputFormat, 'code'],
          createdAt: new Date().toISOString()
        });
      } catch (saveError) {
        console.warn('Failed to auto-save to library:', saveError);
      }

      addToast({ type: 'success', message: 'Código gerado com sucesso!' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({ type: 'error', message: `Erro ao gerar código: ${message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!generatedCode || !user) {
      if (!user) addToast({ type: 'warning', message: 'Faça login para publicar páginas.' });
      return;
    }

    setLoading(true);

    try {
      const extension = outputFormat === 'react' ? 'tsx' : 'html';
      const file = new File([generatedCode], `vitrinex-page-${Date.now()}.${extension}`, { type: outputFormat === 'react' ? 'text/plain' : 'text/html' });
      const uploadedItem = await uploadFile(file, user.id, outputFormat === 'react' ? 'code' : 'html');

      setPublishedUrl(uploadedItem.file_url);
      addToast({ type: 'success', title: 'Página Publicada!', message: 'Link gerado com sucesso.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({ type: 'error', message: `Erro ao publicar: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!generatedCode) return;
    setLoading(true);
    try {
      const blob = new Blob([generatedCode], { type: outputFormat === 'react' ? 'text/plain' : 'text/html' });
      const fileName = `Site-${Date.now()}.${outputFormat === 'react' ? 'tsx' : 'html'}`;
      addToast({ type: 'info', message: 'Salvando no Google Drive...' });
      await uploadFileToDrive(blob, fileName, outputFormat === 'react' ? 'text/plain' : 'text/html');
      addToast({ type: 'success', title: 'Sucesso', message: `Arquivo salvo no Drive: ${fileName}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao salvar no Drive.';
      addToast({
        type: 'error',
        title: 'Erro no Drive',
        message: message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;

    const extension = outputFormat === 'react' ? 'tsx' : 'html';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vitrinex-project.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Arquivo baixado!' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    addToast({ type: 'success', message: 'Código copiado para a área de transferência!' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-white/5 shadow-inner shadow-white/5">
              <CodeBracketIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                AI Code Studio
              </h1>
              <p className="text-slate-400 text-sm">Crie interfaces web profissionais em segundos com Inteligência Artificial.</p>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
            <HowToUse
              title="Guia Rápido"
              steps={[
                "Defina o objetivo da sua página",
                "Adicione conteúdo, imagens e links sociais",
                "Gere o código e visualize em tempo real",
                "Publique ou exporte seu projeto"
              ]}
              tips={[
                "Use os Templates para começar mais rápido",
                "Experimente o modo React para componentes reutilizáveis",
                "Verifique o preview mobile para garantir responsividade"
              ]}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel - Controls */}
          <div className="lg:col-span-5 space-y-6">

            {/* Template & Format Selection */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowTemplates(true)}
                variant="secondary"
                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
              >
                <BoltIcon className="w-4 h-4 mr-2 text-yellow-400" />
                Explorar Templates
              </Button>

              <div className="bg-white/5 rounded-lg p-1 flex border border-white/10">
                <button
                  onClick={() => setOutputFormat('html')}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${outputFormat === 'html' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setOutputFormat('react')}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${outputFormat === 'react' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  REACT
                </button>
              </div>
            </div>

            {/* Input Card */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl shadow-black/50 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white tracking-wide">Configuração do Projeto</h2>
              </div>

              <div className="space-y-5">
                <Textarea
                  id="page-description"
                  label="Descreva sua Visão"
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  rows={5}
                  placeholder="Ex: Landing page futurista para um SaaS de IA, com hero section imersiva, grid de features com glassmorphism, e rodapé minimalista. Cores: Deep Blue e Neon Purple."
                  className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl transition-all"
                />

                <div className="h-px bg-white/5" />

                <Textarea
                  id="content-text"
                  label="Conteúdo de Texto (Copy)"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={3}
                  placeholder="Cole aqui seus textos, títulos e descrições..."
                  className="bg-black/20 border-white/10 focus:border-indigo-500/50 rounded-xl"
                />
              </div>
            </div>

            {/* Assets Card */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl shadow-black/50 space-y-6">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Assets & Mídia</h3>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  id="cta-link"
                  label="Link de Destino / CTA"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://seu-site.com (Para onde os botões devem levar)"
                  className="bg-black/20 border-white/10 rounded-xl"
                />

                {/* Legacy or multi-purpose image field if needed, but user requested specific replacement semantics for 'External Image URL' spot */}
                {/* Keeping logic bound to 'imageUrl' state variable for now to minimize refactor risk, 
                    but repurposing UI label as requested. 
                    Ideally valid variable rename would be 'targetUrl' but 'imageUrl' is deeply wired. 
                    I will update the prompt generation to clearer handle this as a CTA Link.
                */}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 transition-all h-12 rounded-xl"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2 rotate-180" />
                    Upload de Imagens Locais
                  </Button>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/30">
                        <img
                          src={img.data}
                          alt={img.name}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl shadow-black/50 space-y-6">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Conexões Sociais</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['instagram', 'facebook', 'pinterest', 'twitter', 'tiktok', 'contact', 'email', 'website'] as const).map((social) => (
                  <div key={social} className="relative group">
                    <input
                      type="text"
                      placeholder={social.charAt(0).toUpperCase() + social.slice(1)}
                      value={socialLinks[social]}
                      onChange={(e) => handleSocialChange(social, e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateHtmlCode}
              isLoading={isGenerating}
              disabled={!pageDescription.trim()}
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 border border-white/10"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Gerar Interface {outputFormat === 'react' ? '(React)' : '(HTML)'}
            </Button>

          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-7 sticky top-6 space-y-4">

            {/* Preview Controls */}
            <div className="flex items-center justify-between bg-white/[0.03] backdrop-blur-md p-2 rounded-xl border border-white/5">
              <div className="flex bg-black/20 rounded-lg p-1">
                <button
                  onClick={() => setIsMobilePreview(false)}
                  className={`p-2 rounded-md transition-all ${!isMobilePreview ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ComputerDesktopIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsMobilePreview(true)}
                  className={`p-2 rounded-md transition-all ${isMobilePreview ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <DevicePhoneMobileIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                {generatedCode && (
                  <>
                    <Button onClick={handleCopyCode} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleDownload} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={handlePublish} variant="secondary" size="sm" isLoading={loading} className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                      <GlobeAltIcon className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Preview Window */}
            <div className="relative bg-black/40 rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center min-h-[600px] lg:h-[calc(100vh-12rem)]">
              {generatedCode ? (
                outputFormat === 'html' ? (
                  <iframe
                    srcDoc={generatedCode}
                    className={`transition-all duration-500 bg-white shadow-2xl ${isMobilePreview
                      ? 'w-[375px] h-[667px] rounded-[2.5rem] border-[8px] border-zinc-900 ring-1 ring-white/10'
                      : 'w-full h-full'
                      }`}
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="w-full h-full p-6 overflow-auto bg-[#0d1117] text-gray-300 font-mono text-sm">
                    <pre>{generatedCode}</pre>
                  </div>
                )
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 animate-pulse">
                    <CodeBracketIcon className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-slate-500 font-medium">Aguardando geração de código...</p>
                </div>
              )}
            </div>

            {publishedUrl && (
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-green-500/10 rounded-full text-green-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:text-green-300 truncate transition-colors">
                    {publishedUrl}
                  </a>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(publishedUrl);
                    addToast({ type: 'success', message: 'Link copiado!' });
                  }}
                  className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </Button>
              </div>
            )}

          </div>

        </div>

        {/* Templates Modal */}
        <Modal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          title="Escolha um Template"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {CODE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => handleApplyTemplate(template)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-white/[0.07] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{template.name}</h4>
                  <SparklesIcon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
              </div>
            ))}
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default CodePlayground;
