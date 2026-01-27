
import React from 'react';
import { Post } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import SaveToLibraryButton from './SaveToLibraryButton';
import { PLACEHOLDER_IMAGE_BASE64 } from '../../constants';
import {
  SparklesIcon,
  PhotoIcon,
  BookmarkSquareIcon,
  CloudIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

interface GeneratedPostCardProps {
  post: Post;
  index: number;
  loadingImages: string[];
  aspectRatio: string;
  userId: string;
  onUpdatePostField: (index: number, field: keyof Post, value: string) => void;
  onRefineImagePrompt: (index: number) => void;
  onSavePrompt: (index: number) => void;
  onGenerateImageFinal: (index: number) => void;
  onSetAspectRatio: (value: string) => void;
  onSaveToDrive: (post: Post) => void;
  onDownloadImage: (url: string, title: string) => void;
  onOpenPublishModal: (post: Post) => void;
  onPinterestShare: (post: Post) => void;
}

const GeneratedPostCard: React.FC<GeneratedPostCardProps> = ({
  post,
  index,
  loadingImages,
  aspectRatio,
  userId,
  onUpdatePostField,
  onRefineImagePrompt,
  onSavePrompt,
  onGenerateImageFinal,
  onSetAspectRatio,
  onSaveToDrive,
  onDownloadImage,
  onOpenPublishModal,
  onPinterestShare,
}) => {
  const isImgLoading = loadingImages.includes(post.id);

  return (
    <div key={post.id} className="relative group bg-[var(--background-input)] border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
      {/* Header do Card (Título) */}
      <div className="bg-black/20 p-6 border-b border-[var(--border-default)] flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Título</label>
          <Input
            id={`post-title-${index}`}
            value={post.title || ''}
            onChange={(e) => onUpdatePostField(index, 'title', e.target.value)}
            className="text-lg font-bold text-[var(--text-primary)] bg-transparent border-none focus:ring-0 p-0 w-full placeholder-[var(--text-secondary)]"
            placeholder="Título do Post"
          />
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            Post #{index + 1}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* LADO ESQUERDO: TEXTO E HASHTAGS */}
        <div className="p-6 md:p-8 space-y-6 border-r border-[var(--border-default)]">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <CodeBracketIcon className="w-4 h-4" /> Conteúdo do Post
            </label>
            <Textarea
              id={`post-content-${index}`}
              value={post.content_text}
              onChange={(e) => onUpdatePostField(index, 'content_text', e.target.value)}
              rows={10}
              className="bg-black/5 dark:bg-black/20 border border-[var(--border-default)] focus:border-primary/50 text-base leading-relaxed text-[var(--text-secondary)] placeholder-[var(--text-secondary)]/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" /> Hashtags Estratégicas
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-black/20 rounded-xl border border-white/5 min-h-[60px]">
              {(Array.isArray(post.hashtags) ? post.hashtags : []).map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-[var(--background-input)] border border-[var(--border-default)] rounded-md text-xs text-blue-400 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 text-right">4 do assunto + 2 VitrineX</p>
          </div>
        </div>

        {/* LADO DIREITO: IMAGEM E ACTIONS */}
        <div className="p-6 md:p-8 bg-black/20 flex flex-col gap-6">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <PhotoIcon className="w-4 h-4" /> Estúdio de Imagem
          </label>

          {/* Preview da Imagem */}
          <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10 group/image ${isImgLoading ? 'shimmer-effect ring-2 ring-indigo-500/50' : ''}`}>
            {isImgLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner />
                <p className="text-xs text-gray-400 animate-pulse">Renderizando pixels...</p>
              </div>
            ) : (
              <img
                src={post.image_url}
                alt="Post Visual"
                className={`w-full h-full object-cover transition-all duration-700 ${post.image_url === PLACEHOLDER_IMAGE_BASE64 ? 'opacity-30 grayscale' : 'opacity-100 hover:scale-105'}`}
              />
            )}
          </div>

          {/* Prompt Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-gray-500">Prompt de Comando</label>
              <p className="text-[10px] text-gray-600">Edite antes de gerar</p>
            </div>
            <Textarea
              id={`image-prompt-${index}`}
              value={post.image_prompt || ''}
              onChange={(e) => onUpdatePostField(index, 'image_prompt', e.target.value)}
              rows={3}
              className="text-xs font-mono bg-black/5 dark:bg-black/40 border-[var(--border-default)] text-[var(--text-secondary)]"
            />
          </div>

          {/* TOOLBAR DE 3 BOTÕES (REQ DO USUÁRIO) */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => onRefineImagePrompt(index)}
              className="text-[10px] py-2 h-auto flex flex-col items-center gap-1 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/20 text-yellow-200"
              title="Melhora o prompt com técnicas profissionais"
            >
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              1. Otimizar
            </Button>

            <Button
              onClick={() => onSavePrompt(index)}
              className="text-[10px] py-2 h-auto flex flex-col items-center gap-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 text-blue-200"
              title="Salvar prompt na biblioteca"
            >
              <BookmarkSquareIcon className="w-4 h-4 text-blue-400" />
              2. Salvar Prompt
            </Button>

            <Button
              onClick={() => onGenerateImageFinal(index)}
              className="text-[10px] py-2 h-auto flex flex-col items-center gap-1 bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-500 shadow-lg shadow-primary/20 border border-white/10"
              title="Gera a imagem final (Gasta créditos)"
              disabled={isImgLoading}
            >
              <PhotoIcon className="w-4 h-4" />
              3. GERAR IMAGEM
            </Button>
          </div>
          <div className="flex justify-end items-center gap-2">
            <label htmlFor="aspect-ratio-select" className="text-[10px] uppercase font-bold text-gray-500">Aspect Ratio:</label>
            <select
              id="aspect-ratio-select"
              value={aspectRatio}
              onChange={(e) => onSetAspectRatio(e.target.value)}
              className="bg-black/20 text-[var(--text-premium-secondary)] text-xs border border-white/10 rounded-lg px-2 py-1.5 focus:border-purple-500/30 outline-none"
            >
              <option value="1:1">Quadrado (1:1)</option>
              <option value="16:9">Paisagem (16:9)</option>
              <option value="9:16">Story (9:16)</option>
              <option value="4:3">Post (4:3)</option>
              <option value="3:4">Retrato (3:4)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-black/20 p-4 border-t border-[var(--border-default)] flex flex-wrap justify-end gap-3">
        <SaveToLibraryButton
          content={JSON.stringify(post)}
          type="post"
          userId={userId}
          initialName={`Post: ${post.title}`}
          tags={["generated", "content-generator", ...(post.hashtags || [])]}
          label="Salvar Post Completo"
          className="text-xs"
        />
        <Button onClick={() => onSaveToDrive(post)} variant="ghost" className="text-xs flex items-center gap-2">
          <CloudIcon className="w-4 h-4" /> Salvar Drive
        </Button>
        <Button onClick={() => onDownloadImage(post.image_url, post.title || 'post')} variant="ghost" className="text-xs flex items-center gap-2" disabled={post.image_url === PLACEHOLDER_IMAGE_BASE64}>
          <ArrowDownTrayIcon className="w-4 h-4" /> Baixar Imagem
        </Button>
        <Button onClick={() => onPinterestShare(post)} variant="ghost" className="text-xs flex items-center gap-2 text-red-500 hover:bg-red-500/10 border-red-500/20" disabled={post.image_url === PLACEHOLDER_IMAGE_BASE64}>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.992 5.368 18.625 0 12.017 0z" />
          </svg>
          Pinterest
        </Button>
        <Button onClick={() => onOpenPublishModal(post)} variant="primary" className="text-xs flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg shadow-purple-500/20">
          <PaperAirplaneIcon className="w-4 h-4" /> Enviar / Publicar
        </Button>
      </div>
    </div>
  );
};

export default GeneratedPostCard;
