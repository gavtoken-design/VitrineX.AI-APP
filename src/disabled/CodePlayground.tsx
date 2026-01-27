import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  CodeBracketIcon, SparklesIcon, ArrowDownTrayIcon, EyeIcon,
  XMarkIcon, ShareIcon, GlobeAltIcon, LinkIcon, ClipboardDocumentIcon,
  DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon,
  BoltIcon, AdjustmentsHorizontalIcon, FolderArrowDownIcon,
  ChatBubbleBottomCenterTextIcon, SwatchIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import { GEMINI_PRO_MODEL, CODE_TEMPLATES } from '../constants';
import { uploadFileToDrive } from '../services/integrations/googleDrive';
import Modal from '../components/ui/Modal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';

const CodePlayground = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  // -- State: Core --
  const [contentText, setContentText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{ name: string; data: string }[]>([]);
  const [pageDescription, setPageDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // -- State: Refinement --
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinementPanel, setShowRefinementPanel] = useState(false);

  // -- State: UI/UX --
  const [activeTab, setActiveTab] = useState<'setup' | 'design' | 'content' | 'assets' | 'social'>('setup');
  const [showTemplates, setShowTemplates] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'html' | 'react'>('html');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCodeView, setShowCodeView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // -- State: Design --
  const [palette, setPalette] = useState({ primary: '#6366f1', secondary: '#a855f7', accent: '#fbbf24', bg: '#0f172a', text: '#f8fafc' });
  const [aiImagePrompts, setAiImagePrompts] = useState<{ label: string, prompt: string }[]>([]);
  const [isDesigning, setIsDesigning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- State: Social Links --
  const [socialLinks, setSocialLinks] = useState({
    instagram: '', facebook: '', pinterest: '', twitter: '', tiktok: '',
    contact: '', email: '', website: ''
  });

  // -- Effects --
  useEffect(() => {
    if (profile?.contactInfo) {
      setSocialLinks(prev => ({
        ...prev,
        instagram: profile.contactInfo?.instagram || prev.instagram,
        facebook: profile.contactInfo?.facebook || prev.facebook,
        pinterest: profile.contactInfo?.pinterest || prev.pinterest,
        twitter: profile.contactInfo?.twitter || prev.twitter,
        tiktok: profile.contactInfo?.tiktok || prev.tiktok,
        contact: profile.contactInfo?.contact || prev.contact,
        email: profile.contactInfo?.contactEmail || profile.email || prev.email,
        website: profile.contactInfo?.website || prev.website
      }));
    }
  }, [profile]);

  useEffect(() => {
    const pendingContext = localStorage.getItem('vitrinex_pending_web_context');
    if (pendingContext) {
      try {
        const data = JSON.parse(pendingContext);
        setPageDescription(data.description || '');
        setContentText(data.content || '');
        addToast({ type: 'info', message: 'Dados da campanha importados!' });
        localStorage.removeItem('vitrinex_pending_web_context');
      } catch (e) {
        console.error('Failed to parse web context', e);
      }
    }
  }, [addToast]);

  // -- Handlers: Assets --
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        addToast({ type: 'warning', message: `${file.name} inválida.` });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages(prev => [...prev, { name: file.name, data: reader.result as string }]);
          addToast({ type: 'success', message: `${file.name} adicionada.` });
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDisplayCode = (code: string) => {
    let cleanCode = code.trim();
    cleanCode = cleanCode.replace(/^```(html|jsx|tsx|typescript|javascript|css)?\n?/, '').replace(/\n?```$/, '');
    setGeneratedCode(cleanCode);
  };

  // -- Handlers: Generation --
  const generateHtmlCode = async () => {
    if (!pageDescription.trim()) {
      addToast({ type: 'warning', message: 'Descreva sua página primeiro.' });
      return;
    }

    setIsGenerating(true);
    setGeneratedCode(''); // Clear previous code to show loading state better

    // Prepare Prompt
    const isReact = outputFormat === 'react';
    const techStack = isReact
      ? "React (Functional Components), TailwindCSS (Utility classes only), Lucide-React Icons."
      : "HTML5, TailwindCSS (CDN), FontAwesome/Heroicons (SVG).";

    const prompt = `Atue como um Arquiteto de Software Frontend Sênior. CRITICAL: Gere código de PRODUÇÃO.
    
    TAREFA: Criar uma interface web moderna baseada na descrição abaixo.
    DESCRIÇÃO: "${pageDescription}"
    
    CONTEÚDO:
    ${contentText ? `Texto/Copy: ${contentText}` : ''}
    ${imageUrl ? `CTA Link: ${imageUrl}` : ''}
    ${uploadedImages.length > 0 ? `Imagens: Use as imagens Base64 fornecidas.` : ''}
    Social: ${JSON.stringify(socialLinks)}
    
    PALETA DE CORES (Use estes hexadecimais):
    - Primary: ${palette.primary}
    - Secondary: ${palette.secondary}
    - Accent: ${palette.accent}
    - Background: ${palette.bg}
    - Text: ${palette.text}

    REQUISITOS TÉCNICOS:
    1. Stack: ${techStack}
    2. Design: "Premium", "Clean", "Futurista". Use Glassmorphism, Gradientes suaves (ex: bg-slate-900), e Tipografia moderna.
    3. Responsividade: Mobile-First obrigatório.
    4. Imagens: ${uploadedImages.length > 0 ? 'Use EXATAMENTE as strings base64 fornecidas nas tags <img>.' : 'Use placeholders profissionais (placehold.co).'}
    
    FORMATO DE SAÍDA:
    - Retorne APENAS O CÓDIGO PURO. Sem bloco markdown (\`\`\`), sem explicações.
    - Se for HTML, inclua <!DOCTYPE html>.
    - Se for React, exporte 'export default function Page()'.
    `;

    try {
      const code = await generateText(prompt, { model: GEMINI_PRO_MODEL });
      handleDisplayCode(code);

      // Auto-save
      if (user) {
        saveLibraryItem({
          id: `lib-${Date.now()}`,
          userId: user.id,
          name: `${outputFormat.toUpperCase()} - ${pageDescription.substring(0, 20)}...`,
          file_url: code,
          type: 'code',
          tags: ['generated', outputFormat],
          createdAt: new Date().toISOString()
        }).catch(err => console.warn("Auto-save failed", err));
      }

      addToast({ type: 'success', message: 'Interface gerada com sucesso!' });
      setShowRefinementPanel(true);
    } catch (error) {
      addToast({ type: 'error', message: `Erro: ${error instanceof Error ? error.message : 'Falha na geração'}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDesign = async () => {
    if (!pageDescription) return;
    setIsDesigning(true);

    try {
      const prompt = `Atue como um Diretor de Arte Digital.
      PARA: "${pageDescription}"
      
      TAREFA:
      1. Crie uma paleta de cores moderna e harmoniosa (Hex codes).
      2. Crie 3 prompts detalhados para gerar imagens IA (Midjourney/DALL-E style) que sirvam para o site (Ex: Hero, Features, Background).
      
      RETORNE APENAS JSON:
      {
        "colors": { "primary": "#...", "secondary": "#...", "accent": "#...", "bg": "#...", "text": "#..." },
        "prompts": [
           { "label": "Hero Section", "prompt": "Cinematic photo of..." },
           { "label": "Feature Icon", "prompt": "Minimalist 3d icon of..." }
        ]
      }`;

      const response = await generateText(prompt, { model: GEMINI_PRO_MODEL, responseMimeType: 'application/json' });
      const data = JSON.parse(response);

      if (data.colors) setPalette(prev => ({ ...prev, ...data.colors }));
      if (data.prompts) setAiImagePrompts(data.prompts);

      addToast({ type: 'success', message: 'Design gerado!' });
    } catch (error) {
      addToast({ type: 'error', message: 'Erro ao gerar design.' });
    } finally {
      setIsDesigning(false);
    }
  };

  // -- Handlers: Refinement --
  const handleRefineCode = async () => {
    if (!refinementInstruction.trim() || !generatedCode) return;

    setIsRefining(true);
    const prompt = `Atue como um Especialista em UI/UX.
    
    TASK: Refinar o código existente com base no feedback.
    
    CÓDIGO ATUAL:
    ${generatedCode.substring(0, 15000)} ${generatedCode.length > 15000 ? '...(truncado)' : ''}
    
    INSTRUÇÃO DE REFINAMENTO:
    "${refinementInstruction}"
    
    Retorne o CÓDIGO COMPLETO e ATUALIZADO. Mantenha o que estava bom, melhore o que foi pedido.
    Sem markdown. Apenas código.`;

    try {
      const updatedCode = await generateText(prompt, { model: GEMINI_PRO_MODEL });
      handleDisplayCode(updatedCode);
      setRefinementInstruction('');
      addToast({ type: 'success', message: 'Design atualizado!' });
    } catch (error) {
      addToast({ type: 'error', message: 'Falha ao refinar design.' });
    } finally {
      setIsRefining(false);
    }
  };

  // -- Handlers: Export --
  const handleExportZip = async () => {
    if (!generatedCode) return;

    const zip = new JSZip();
    const extension = outputFormat === 'react' ? 'tsx' : 'html';
    const mainFileName = `index.${extension}`;

    // Add Main File
    zip.file(mainFileName, generatedCode);

    // Add Readme
    zip.file("README.md", `# Projeto VitrineX AI\n\nEste projeto foi gerado via VitrineX AI.\n\n## Como usar\nAbra o arquivo ${mainFileName} no seu navegador ou editor.`);

    // Generate ZIP
    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `vitrinex-project-${Date.now()}.zip`);
      addToast({ type: 'success', message: 'Projeto baixado (ZIP)!' });
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao criar ZIP.' });
    }
  };

  const handlePublish = async () => {
    if (!generatedCode || !user) {
      addToast({ type: 'warning', message: 'Faça login para publicar.' });
      return;
    }
    setLoading(true);
    try {
      // Create a Blob directly
      const blob = new Blob([generatedCode], { type: 'text/html' }); // Always serve as HTML for preview if possible
      const file = new File([blob], `site-${Date.now()}.html`, { type: 'text/html' });

      const uploadedItem = await uploadFile(file, user.id, 'html');
      if (uploadedItem && uploadedItem.file_url) {
        setPublishedUrl(uploadedItem.file_url);
        addToast({ type: 'success', title: 'Publicado!', message: 'Seu site está online.' });
      } else {
        throw new Error("URL de arquivo inválida");
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao publicar.' });
    } finally {
      setLoading(false);
    }
  };

  // -- Render Helpers --
  const getPreviewDimensions = () => {
    switch (viewMode) {
      case 'mobile': return 'w-[375px] h-[667px]';
      case 'tablet': return 'w-[768px] h-[1024px]';
      default: return 'w-full h-full';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CodeBracketIcon className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">AI Code Studio</h1>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase font-bold text-slate-500 border border-white/5">Beta</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)} className="text-slate-400 hover:text-white gap-2">
            <BoltIcon className="w-4 h-4 text-amber-400" /> Templates
          </Button>

          <div className="h-6 w-px bg-white/10 mx-1" />

          <Button
            variant="primary"
            isLoading={isGenerating}
            onClick={generateHtmlCode}
            disabled={!pageDescription.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-none"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Página'}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">

        {/* Left Sidebar: Config */}
        <aside className="w-full md:w-[350px] lg:w-[400px] bg-black/20 border-r border-white/5 flex flex-col overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'setup', label: 'Setup', icon: AdjustmentsHorizontalIcon },
              { id: 'design', label: 'Design', icon: SwatchIcon },
              { id: 'content', label: 'Texto', icon: ChatBubbleBottomCenterTextIcon },
              { id: 'assets', label: 'Assets', icon: FolderArrowDownIcon },
              { id: 'social', label: 'Social', icon: ShareIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors relative
                  ${activeTab === tab.id ? 'text-indigo-400 bg-white/[0.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-6 flex-1">
            {activeTab === 'setup' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Textarea
                  id="desc"
                  label="Descrição do Projeto (Prompt)"
                  value={pageDescription}
                  onChange={e => setPageDescription(e.target.value)}
                  rows={8}
                  placeholder="Ex: Landing Page para produto de IA, tema escuro, minimalista..."
                  className="bg-zinc-900/50 border-white/10 focus:border-indigo-500/50"
                />

                <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/10">
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase">Formato de Saída</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setOutputFormat('html')} className={`py-2 px-3 rounded text-sm transition-colors ${outputFormat === 'html' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-white/5 text-slate-400'}`}>HTML 5</button>
                    <button onClick={() => setOutputFormat('react')} className={`py-2 px-3 rounded text-sm transition-colors ${outputFormat === 'react' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-white/5 text-slate-400'}`}>React UI</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Textarea
                  id="copy"
                  label="Copywriting / Texto Principal"
                  value={contentText}
                  onChange={e => setContentText(e.target.value)}
                  rows={10}
                  placeholder="Cole aqui os textos que devem aparecer na página..."
                  className="bg-zinc-900/50 border-white/10"
                />
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Input
                  id="cta-link"
                  label="Link Botão Principal (CTA)"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-900/50 border-white/10"
                />

                <div className="border-t border-white/5 pt-4">
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase">Upload de Imagens</label>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full border-dashed border-white/20 bg-transparent hover:bg-white/5 text-slate-400">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Escolher Arquivos
                  </Button>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group aspect-square bg-zinc-900 rounded-md overflow-hidden border border-white/10">
                        <img src={img.data} className="w-full h-full object-cover" />
                        <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <XMarkIcon className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Input id="website" label="Site" value={socialLinks.website} onChange={e => setSocialLinks(p => ({ ...p, website: e.target.value }))} className="bg-zinc-900/50 border-white/10" />
                <Input id="instagram" label="Instagram" value={socialLinks.instagram} onChange={e => setSocialLinks(p => ({ ...p, instagram: e.target.value }))} className="bg-zinc-900/50 border-white/10" />
                <Input id="email" label="Email" value={socialLinks.email} onChange={e => setSocialLinks(p => ({ ...p, email: e.target.value }))} className="bg-zinc-900/50 border-white/10" />
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Color Palette Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Paleta de Cores</label>
                    <Button
                      variant="ghost"
                      onClick={handleGenerateDesign}
                      isLoading={isDesigning}
                      disabled={!pageDescription}
                      size="sm"
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-6"
                    >
                      <SparklesIcon className="w-3 h-3 mr-1" /> Gerar via IA
                    </Button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {['primary', 'secondary', 'accent', 'bg', 'text'].map((colorKey) => (
                      <div key={colorKey} className="group relative">
                        <input
                          type="color"
                          id={`color-${colorKey}`}
                          value={palette[colorKey as keyof typeof palette]}
                          onChange={(e) => setPalette(prev => ({ ...prev, [colorKey]: e.target.value }))}
                          className="w-full aspect-square rounded-lg cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                          title={colorKey}
                        />
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity capitalize">
                          {colorKey}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* divider */}
                <div className="h-px bg-white/5" />

                {/* AI Image Prompts Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Prompts de Imagem (IA)</label>
                  </div>

                  {aiImagePrompts.length > 0 ? (
                    <div className="space-y-2">
                      {aiImagePrompts.map((item, idx) => (
                        <div key={idx} className="bg-zinc-900/50 p-3 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">{item.label}</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(item.prompt); addToast({ type: 'success', message: 'Prompt copiado!' }) }}
                              className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ClipboardDocumentIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{item.prompt}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-zinc-900/30 rounded-lg border border-white/5 border-dashed">
                      <PhotoIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Gere o design para ver sugestões de prompts.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </aside>

        {/* Center: Preview Area */}
        <section className="flex-1 bg-zinc-950 relative flex flex-col min-h-0">

          {/* Preview Toolbar */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/30">
            <div className="flex bg-black/20 rounded-lg p-0.5 border border-white/5">
              {[
                { mode: 'mobile', icon: DevicePhoneMobileIcon },
                { mode: 'tablet', icon: DeviceTabletIcon },
                { mode: 'desktop', icon: ComputerDesktopIcon },
              ].map(m => (
                <button
                  key={m.mode}
                  onClick={() => setViewMode(m.mode as any)}
                  className={`p-1.5 rounded-md transition-all ${viewMode === m.mode ? 'bg-white/10 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <m.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowCodeView(!showCodeView)} className="flex items-center text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">
                <CodeBracketIcon className="w-4 h-4 mr-2" />
                {showCodeView ? 'Ver Preview' : 'Ver Código'}
              </button>

              {generatedCode && (
                <>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <Button size="sm" variant="ghost" onClick={handleExportZip} className="text-slate-300 hover:text-white" title="Baixar ZIP">
                    <FolderArrowDownIcon className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handlePublish} isLoading={loading} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 h-8 text-xs">
                    <GlobeAltIcon className="w-3 h-3 mr-1.5" /> Publicar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-zinc-950">

            {!generatedCode ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-slate-400 font-medium">Pronto para criar</h3>
                <p className="text-slate-600 text-sm mt-1">Configure o projeto ao lado e clique em Gerar.</p>
              </div>
            ) : (
              showCodeView ? (
                <div className="w-full h-full bg-[#0d1117] rounded-xl border border-white/10 overflow-auto p-4">
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{generatedCode}</pre>
                </div>
              ) : (
                <div className={`transition-all duration-500 relative shadow-2xl ${getPreviewDimensions()} ${viewMode === 'mobile' || viewMode === 'tablet' ? 'border-[10px] border-zinc-900 rounded-[2rem] ring-1 ring-white/10' : 'w-full h-full rounded-none'}`}>
                  {outputFormat === 'html' ? (
                    <iframe
                      srcDoc={generatedCode}
                      className="w-full h-full bg-white rounded-[inherit]"
                      sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                      title="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-slate-400 p-8 text-center rounded-[inherit] border border-white/5">
                      <div>
                        <CodeBracketIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Preview React nativo não disponível neste ambiente.</p>
                        <p className="text-sm opacity-50 mt-1">Use a visualização de código ou exporte o projeto.</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Refinement Floating Panel */}
            <AnimatePresence>
              {generatedCode && showRefinementPanel && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col gap-3"
                >
                  <div className="flex gap-2">
                    <Textarea
                      id="refinement"
                      value={refinementInstruction}
                      onChange={e => setRefinementInstruction(e.target.value)}
                      placeholder="O que você quer mudar? (Ex: 'Troque o fundo para azul marinho', 'Aumente a fonte do título')..."
                      rows={1}
                      className="bg-black/30 border-white/5 resize-none min-h-[44px] py-3 rounded-xl text-sm"
                    />
                    <Button
                      onClick={handleRefineCode}
                      isLoading={isRefining}
                      variant="primary"
                      disabled={!refinementInstruction.trim()}
                      className="h-[44px] w-12 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 p-0"
                    >
                      <SparklesIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Published URL Toast/Banner */}
      {publishedUrl && (
        <div className="fixed top-20 right-6 z-[60] animate-in slide-in-from-right duration-500">
          <div className="bg-green-500/10 backdrop-blur-md border border-green-500/20 p-4 rounded-xl shadow-2xl flex gap-4 items-center max-w-sm">
            <div className="p-2 bg-green-500/20 rounded-full text-green-400">
              <GlobeAltIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-green-400">Publicado com sucesso!</h4>
              <a href={publishedUrl} target="_blank" className="text-xs text-green-300/70 hover:text-green-300 truncate block mt-0.5 underline decoration-green-500/30">
                {publishedUrl}
              </a>
            </div>
            <button onClick={() => setPublishedUrl(null)} className="text-green-500/50 hover:text-green-500"><XMarkIcon className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      <Modal isOpen={showTemplates} onClose={() => setShowTemplates(false)} title="Galeria de Templates">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {CODE_TEMPLATES.map((tpl) => (
            <div key={tpl.id} onClick={() => { setPageDescription(tpl.prompt); setShowTemplates(false); }} className="bg-zinc-800/50 border border-white/5 p-4 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all group">
              <h4 className="font-bold text-white group-hover:text-indigo-400">{tpl.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
};

export default CodePlayground;
