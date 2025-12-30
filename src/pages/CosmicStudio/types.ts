
export interface Slide {
  id: string;
  imageUrl: string;
  layout: 'classic' | 'text-image' | 'quote' | 'list';
  text?: string;
  alignment?: 'left' | 'center' | 'right';
}

export type View = 'editor' | 'carousel';

export interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  currentImage: string | null;
  activeTab: 'smart' | 'adjust';
}
