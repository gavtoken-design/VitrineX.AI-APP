import * as React from 'react';
import { useState } from 'react';
import { CodeBracketIcon, SparklesIcon, ArrowDownTrayIcon, EyeIcon, XMarkIcon, ShareIcon, ArrowTopRightOnSquareIcon, GlobeAltIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import { uploadFile } from '../services/media/storage';
import HowToUse from '../components/ui/HowToUse';
import { GEMINI_PRO_MODEL } from '../constants';
import { uploadFileToDrive } from '../services/integrations/googleDrive';

const CodePlayground: React.FC = () => {
  const { user } = useAuth();
  const [contentText, setContentText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; data: string }>>([]);
  const [pageDescription, setPageDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false); // Used for publishing
  const [showPreview, setShowPreview] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    addToast({ type: 'info', message: 'Imagem removida.' });
  };

  const generateHtmlCode = async () => {
    if (!pageDescription.trim()) {
      addToast({ type: 'warning', message: 'Descreva o tipo de página que deseja criar.' });
      return;
    }

    const prompt = `Você é um EXPERT WEB DEVELOPER especializado em criar landing pages modernas, responsivas e de alta conversão.

## TAREFA
Gere um código HTML completo, profissional e production-ready baseado nas informações fornecidas.

## CONTEÚDO FORNECIDO
${contentText ? `**Texto/Copy:**\n${contentText}\n` : ''}
${imageUrl ? `**Imagem URL Externa:**\n${imageUrl}\n` : ''}
${uploadedImages.length > 0 ? `**Imagens Carregadas (${uploadedImages.length}):**\n${uploadedImages.map((img, i) => `${i + 1}. ${img.name} (Base64 embutida)`).join('\n')}\n` : ''}

## TIPO DE PÁGINA SOLICITADA
${pageDescription}

## INSTRUÇÕES PARA IMAGENS
${uploadedImages.length > 0 ? `- Use as ${uploadedImages.length} imagens fornecidas em base64 (já incluídas no src)
- Distribua as imagens de forma estratégica na página
- Adicione alt text descritivo para cada imagem
- Use lazy loading quando apropriado` : '- Se precisar de imagens de placeholder, use https://placehold.co/'}

## REQUISITOS TÉCNICOS OBRIGATÓRIOS

1. **HTML5 Semântico** - Use tags apropriadas (section, article, header, footer)
   - Use TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
   - **PREMIUM COLOR PALETTE (Strict Adherence):**
     - Backgrounds: 'bg-slate-950' or 'bg-gray-900' (Dark Theme)
     - Accents: Gradient 'from-indigo-500 via-purple-500 to-pink-500'
     - Cards: Glassmorphism ('bg-white/5 backdrop-blur-xl border-white/10')
     - Text: 'text-slate-50' (Headings), 'text-slate-300' (Body)
   - Animate elements using Tailwind utility classes (e.g., hover:scale-105 transition-all)
3. **Responsivo** - Mobile-first com breakpoints
4. **Performance** - Código otimizado e limpo
5. **SEO** - Meta tags, alt em imagens, headings hierárquicos

## DESIGN GUIDELINES
- Paleta de cores harmoniosa e moderna
- Tipografia elegante (use Google Fonts se necessário)
- Espaçamento generoso (breathing room)
- Call-to-Actions destacados
- Micro-interações (hover effects)

## OUTPUT FORMAT
Retorne APENAS o código HTML completo, começando com \`<!DOCTYPE html>\`.
${uploadedImages.length > 0 ? `IMPORTANTE: Substitua os src das imagens por estas strings base64:\n${uploadedImages.map((img, i) => `Imagem ${i + 1}: src="${img.data.substring(0, 50)}..."`).join('\n')}` : ''}
Não inclua explicações, markdown ou comentários fora do código.
O código deve ser copy-paste ready.`;

    setIsGenerating(true);
    try {
      const code = await generateText(prompt, { model: GEMINI_PRO_MODEL });

      // Limpar markdown se houver
      let cleanCode = code.trim();
      if (cleanCode.startsWith('```html')) {
        cleanCode = cleanCode.replace(/```html\n?/, '').replace(/\n?```$/, '');
      } else if (cleanCode.startsWith('```')) {
        cleanCode = cleanCode.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      setGeneratedCode(cleanCode);
      setShowPreview(true);

      // AUTO-SAVE: Salvar HTML na biblioteca
      try {
        await saveLibraryItem({
          id: `lib-${Date.now()}`,
          userId: user?.id || 'anonymous',
          name: `HTML - ${prompt.substring(0, 30)}`,
          file_url: cleanCode,
          type: 'text',
          tags: ['code-playground', 'html', 'code'],
          createdAt: new Date().toISOString()
        });
      } catch (saveError) {
        console.warn('Failed to auto-save to library:', saveError);
      }

      addToast({ type: 'success', message: 'Código HTML gerado com sucesso!' });
    } catch (error: any) {
      addToast({ type: 'error', message: `Erro ao gerar código: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  // State for sharing
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!generatedCode || !user) {
      if (!user) addToast({ type: 'warning', message: 'Faça login para publicar páginas.' });
      return;
    }

    setLoading(true); // Reusing loading state if possible or create new? Using setIsGenerating(true) might be confusing visually logic-wise but setIsGenerating controls the big button spinner. 
    // Let's create a local loading state or reuse a generic one. CodePlayground has isGenerating.
    // I'll use a specific loading state for publish to avoid blocking generation UI? 
    // Actually, locking UI is fine.

    try {
      const file = new File([generatedCode], `vitrinex-page-${Date.now()}.html`, { type: 'text/html' });
      // Use uploadFile service
      // We need to cast 'html' or 'other' if type is strict.
      const uploadedItem = await uploadFile(file, user.id, 'other' as any);

      setPublishedUrl(uploadedItem.file_url);
      addToast({ type: 'success', title: 'Página Publicada!', message: 'Link gerado com sucesso.' });
    } catch (error: any) {
      addToast({ type: 'error', message: `Erro ao publicar: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!generatedCode) return;
    setLoading(true);
    try {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      addToast({ type: 'info', message: 'Salvando HTML no Google Drive...' });
      await uploadFileToDrive(blob, `Site-${Date.now()}.html`, 'text/html');
      addToast({ type: 'success', title: 'Sucesso', message: 'HTML salvo no seu Google Drive!' });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro no Drive',
        message: err.message || 'Falha ao salvar no Drive.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;

    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vitrinex-page-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Código baixado!' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    addToast({ type: 'success', message: 'Código copiado para a área de transferência!' });
  };

  const handleSendCode = () => {
    if (!generatedCode) return;

    // If we have a published URL, send that instead!
    const contentToSend = publishedUrl
      ? `Confira minha página criada com VitrineX AI: ${publishedUrl}`
      : `Olá!\n\nCriei esta página HTML usando o VitrineX AI:\n\n${generatedCode.substring(0, 500)}...\n\n[Código completo anexado]`;

    const subject = encodeURIComponent('Minha Página VitrineX AI');
    const body = encodeURIComponent(contentToSend);

    // Open email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    addToast({ type: 'info', message: 'Abrindo cliente de email...' });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <CodeBracketIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Gerador de HTML com IA</h1>
            <p className="text-[var(--text-secondary)]">Crie páginas HTML completas com IA</p>
          </div>
        </div>
      </div>

      <HowToUse
        title="Como Usar o Code Playground"
        steps={[
          "Descreva a página HTML que deseja criar",
          "Seja específico sobre layout, cores e funcionalidades",
          "Clique em 'Gerar Código HTML'",
          "Aguarde a geração",
          "Visualize o resultado no preview",
          "Use 'Baixar', 'Copiar' ou 'Enviar' conforme necessário"
        ]}
        tips={[
          "O código é salvo automaticamente na biblioteca",
          "Você pode editar o código manualmente se quiser",
          "Ideal para landing pages, formulários ou protótipos",
          "Use 'Enviar' para compartilhar via email"
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-[var(--background-input)] p-6 rounded-xl border border-[var(--border-default)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-blue-500" />
                Conteúdo para a Página
              </h3>

              <div className="space-y-4">
                <Textarea
                  id="content-text"
                  label="Texto/Copy (opcional)"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={4}
                  placeholder="Cole aqui o texto gerado anteriormente (título, descrição, copy, etc.)"
                />

                <Input
                  id="image-url"
                  label="URL da Imagem (opcional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />

                <div>
                  <label className="block text-sm font-medium text-title mb-2">
                    Upload de Imagens (múltiplas)
                  </label>
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
                    className="w-full"
                    type="button"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2 rotate-180" />
                    Selecionar Imagens
                  </Button>

                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.data}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg border border-[var(--border-default)]"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-muted mt-1 truncate">{img.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Textarea
                  id="page-description"
                  label="Descreva a Página Desejada *"
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  rows={5}
                  placeholder="Ex: Landing page moderna para produto SaaS, com hero section, 3 benefícios principais, depoimentos e CTA destacado. Cores vibrantes azul e roxo."
                />

                <Button
                  onClick={generateHtmlCode}
                  isLoading={isGenerating}
                  disabled={!pageDescription.trim()}
                  variant="primary"
                  className="w-full"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Gerar Código HTML Profissional
                </Button>
              </div>
            </div>

            {generatedCode && (
              <div className="bg-[var(--background-input)] p-6 rounded-xl border border-[var(--border-default)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Código Gerado</h3>
                <div className="bg-black/40 p-4 rounded-lg overflow-x-auto max-h-96 border border-[var(--border-default)]">
                  <pre className="text-xs text-green-400 font-mono">{generatedCode}</pre>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                  <Button onClick={handleCopyCode} variant="secondary" size="sm" className="flex-1">
                    Copiar Código
                  </Button>
                  <Button onClick={handleDownload} variant="primary" size="sm" className="flex-1">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Baixar .html
                  </Button>
                  <Button onClick={() => {
                    const blob = new Blob([generatedCode], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }} variant="outline" size="sm" className="flex-1" title="Abrir em Nova Aba">
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                    Abrir Página
                  </Button>

                  <Button
                    onClick={handlePublish}
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-none text-white shadow-lg shadow-purple-500/20"
                    isLoading={loading}
                    title="Publicar na Web"
                  >
                    <GlobeAltIcon className="w-4 h-4 mr-2" />
                    Publicar
                  </Button>

                  <Button onClick={handleSendCode} variant="ghost" size="sm" className="flex-1">
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                  <Button
                    onClick={handleSaveToDrive}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/10 hover:bg-white/5"
                    isLoading={loading}
                    title="Salvar no seu Google Drive"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                    Drive
                  </Button>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="ghost"
                    size="sm"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    {showPreview ? 'Ocultar' : 'Ver'} Preview
                  </Button>
                </div>

                {publishedUrl && (
                  <div className="mt-4 p-4 bg-green-900/10 border border-green-500/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Página Publicada</p>
                        <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:underline truncate block">
                          {publishedUrl}
                        </a>
                      </div>
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
                      <ClipboardDocumentIcon className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-[var(--background-input)] rounded-xl border border-[var(--border-default)] overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="bg-black/20 px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">Preview ao Vivo</h3>
                <div className="flex items-center bg-black/30 rounded-lg p-1 border border-white/5">
                  <button
                    onClick={() => setIsMobilePreview(false)}
                    className={`p-1.5 rounded-md transition-all ${!isMobilePreview ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Desktop View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsMobilePreview(true)}
                    className={`p-1.5 rounded-md transition-all ${isMobilePreview ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Mobile View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </button>
                </div>
              </div>
              {showPreview && (
                <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Ativo
                </span>
              )}
            </div>
            <div className={`flex-1 bg-black/50 flex items-center justify-center p-4 transition-all duration-300 ${isMobilePreview ? 'bg-black/80' : ''}`}>
              {showPreview && generatedCode ? (
                <iframe
                  srcDoc={generatedCode}
                  className={`transition-all duration-500 bg-white shadow-2xl ${isMobilePreview ? 'w-[375px] h-[667px] rounded-[2rem] border-8 border-gray-800' : 'w-full h-full rounded-none border-none'}`}
                  title="HTML Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-muted">
                  <CodeBracketIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm">Preview aparecerá aqui após gerar o código</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong>💡 Dica:</strong> Quanto mais detalhada a descrição da página, melhor será o código gerado.
          Especifique cores, layout, seções e estilo desejado.
        </p>
      </div>
    </div>
  );
};

export default CodePlayground;
