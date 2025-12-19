import * as React from 'react';
import { useState } from 'react';
import { CodeBracketIcon, SparklesIcon, ArrowDownTrayIcon, EyeIcon, XMarkIcon, ShareIcon, RectangleStackIcon, MagnifyingGlassIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import * as LucideIcons from 'lucide-react';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { generateText } from '../services/ai';
import { saveLibraryItem } from '../services/core/db';
import HowToUse from '../components/ui/HowToUse';
import { GEMINI_PRO_MODEL, CODE_TEMPLATES } from '../constants';

const TEMPLATES = CODE_TEMPLATES.map(t => ({
  ...t,
  icon: LucideIcons.LayoutTemplateIcon // Fallback icon since we can't persist icon components in plain objects easily, or map by ID
}));


const CodePlayground: React.FC = () => {
  const [contentText, setContentText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; data: string }>>([]);
  const [pageDescription, setPageDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [showIconSelector, setShowIconSelector] = useState(false);
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredIcons = React.useMemo(() => {
    return Object.keys(LucideIcons).filter(name =>
      name.toLowerCase().includes(iconSearch.toLowerCase()) &&
      !name.endsWith('Icon') // Filter redundant aliases if any
    ).slice(0, 50); // Limit results for performance
  }, [iconSearch]);

  const copyIconCode = (name: string) => {
    const code = `<${name} size={24} />`;
    navigator.clipboard.writeText(code);
    addToast({ type: 'success', message: `Código do ícone ${name} copiado!` });
  };

  const applyTemplate = (prompt: string) => {
    setPageDescription(prompt);
    addToast({ type: 'info', message: 'Modelo selecionado! Clique em Gerar para ver o resultado.' });
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

    const prompt = `Você é um EXPERT WEB DEVELOPER e DESIGNER premiado (Awwwards level), especializado em criar Landing Pages de Alta Conversão com estética "21.dev" / "Aceternity UI".

## TAREFA
Gere um código HTML/CSS/JS (Single File) completo, deslumbrante e production-ready.

## CONTEÚDO FORNECIDO
${contentText ? `**Texto/Copy:**\n${contentText}\n` : ''}
${imageUrl ? `**Imagem URL Externa:**\n${imageUrl}\n` : ''}
${uploadedImages.length > 0 ? `**Imagens Carregadas (${uploadedImages.length}):**\n${uploadedImages.map((img, i) => `${i + 1}. ${img.name} (Base64 embutida)`).join('\n')}\n` : ''}

## TIPO DE PÁGINA SOLICITADA
${pageDescription}

## ESTILO VISUAL & UX (Inspired by 21.dev)
- **Aesthetic:** Dark mode default (ou light mode elegante se pedido), gradientes sutis, "glassmorphism", bordas finas com brilho.
- **Animações:** Use CSS animations (@keyframes) para fade-in, slide-up, hover effects ricos, e elementos que reagem ao scroll se possível.
- **Tipografia:** Use fontes modernas do Google Fonts (Inter, Plus Jakarta Sans, Outfit).
- **Layout:** Bento grids, seções de Hero imersivas, cards flutuantes.

## INSTRUÇÕES PARA IMAGENS
${uploadedImages.length > 0 ? `- Use as ${uploadedImages.length} imagens fornecidas em base64 (já incluídas no src)
- Distribua as imagens de forma estratégica na página
- Adicione alt text descritivo para cada imagem` : '- Use https://placehold.co/ para placeholders elegantes se necessário'}

## REQUISITOS TÉCNICOS OBRIGATÓRIOS
1. **HTML5 Semântico**
2. **CSS Moderno (Internal <style>)**:
   - Use variáveis CSS (:root) para cores.
   - Flexbox e Grid para layouts complexos.
   - Media queries para responsividade TOTAL (Mobile First).
3. **Conversão**: Botões CTA (Call-to-Action) vibrantes e com efeitos de pulso ou brilho.

## OUTPUT FORMAT
Retorne APENAS o código HTML completo, começando com \`<!DOCTYPE html>\`.
${uploadedImages.length > 0 ? `IMPORTANTE: Substitua os src das imagens por estas strings base64:\n${uploadedImages.map((img, i) => `Imagem ${i + 1}: src="${img.data.substring(0, 50)}..."`).join('\n')}` : ''}
Sem comentários markdown. Apenas o código.`;

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
          userId: 'mock-user-123',
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

    const subject = encodeURIComponent('Página HTML criada com VitrineX AI');
    const body = encodeURIComponent(`Olá!\n\nCriei esta página HTML usando o VitrineX AI:\n\n${generatedCode.substring(0, 500)}...\n\n[Código completo anexado]`);

    // Open email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    addToast({ type: 'info', message: 'Abrindo cliente de email...' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <CodeBracketIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-title">Gerador de HTML com IA</h1>
            <p className="text-muted">Crie páginas HTML completas com IA</p>
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
        {/* Left Side: Input & Templates */}
        <div className="space-y-6">
          {/* Templates Library */}
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-title mb-4 flex items-center gap-2">
              <RectangleStackIcon className="w-5 h-5 text-purple-500" />
              Biblioteca de Modelos Premium (21st.dev)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyTemplate(tmpl.prompt)}
                  className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all text-center group"
                >
                  <tmpl.icon className="w-6 h-6 mb-2 text-muted group-hover:text-purple-500" />
                  <span className="text-xs font-medium text-title">{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-title mb-4 flex items-center gap-2">
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
                          className="w-full h-24 object-cover rounded-lg border border-border"
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

              <div className="flex flex-col gap-2">
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

                <button
                  onClick={() => setShowIconSelector(!showIconSelector)}
                  className="text-xs text-blue-500 hover:underline flex items-center justify-center gap-1"
                >
                  {showIconSelector ? 'Fechar Seletor de Ícones' : 'Abrir Seletor de Ícones Lucide'}
                </button>
              </div>

              {showIconSelector && (
                <div className="p-4 bg-darkbg rounded-lg border border-border mt-2">
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder="Buscar ícone (ex: Arrow, Heart...)"
                      className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-title outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredIcons.map((iconName) => {
                      const Icon = (LucideIcons as any)[iconName];
                      if (!Icon || typeof Icon !== 'function' && typeof Icon !== 'object') return null;
                      return (
                        <button
                          key={iconName}
                          onClick={() => copyIconCode(iconName)}
                          className="p-2 border border-border rounded hover:bg-surface hover:border-blue-500 transition-colors flex items-center justify-center"
                          title={iconName}
                        >
                          <Icon size={18} className="text-muted hover:text-blue-500" />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted mt-2 text-center">Clique no ícone para copiar o código React/HTML</p>
                </div>
              )}
            </div>
          </div>

          {generatedCode && (
            <div className="bg-surface p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-title">Editor de Código</h3>
                <span className="text-xs text-muted">Edite o HTML abaixo para atualizar o preview</span>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-border">
                <textarea
                  value={generatedCode}
                  onChange={(e) => setGeneratedCode(e.target.value)}
                  className="w-full h-96 bg-transparent text-xs text-green-400 font-mono outline-none resize-none"
                  spellCheck={false}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleCopyCode} variant="secondary" size="sm" className="flex-1">
                  Copiar Código
                </Button>
                <Button onClick={handleDownload} variant="primary" size="sm" className="flex-1">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Baixar .html
                </Button>
                <Button onClick={handleSendCode} variant="ghost" size="sm" className="flex-1">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Enviar
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
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-title uppercase tracking-wide">Preview ao Vivo</h3>
            {showPreview && (
              <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Ativo
              </span>
            )}
          </div>
          {showPreview && generatedCode ? (
            <iframe
              srcDoc={generatedCode}
              className="w-full h-[600px] bg-white"
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

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted">
          <strong>💡 Dica:</strong> Quanto mais detalhada a descrição da página, melhor será o código gerado.
          Especifique cores, layout, seções e estilo desejado.
        </p>
      </div>
    </div>
  );
};

export default CodePlayground;
