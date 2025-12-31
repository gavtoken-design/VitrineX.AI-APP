
import React, { useState, useCallback } from 'react';
import { View, Slide } from './types';
import Editor from './components/Editor';
import CarouselCreator from './components/CarouselCreator';

interface CosmicStudioProps {
  initialView?: View;
}

const CosmicStudio: React.FC<CosmicStudioProps> = ({ initialView = 'editor' }) => {
  const [currentView, setCurrentView] = useState<View>(initialView);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const handleAddSlide = useCallback((imageUrl: string) => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      imageUrl,
      layout: 'classic',
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentView('carousel');
  }, []);

  const handleBackToEditor = useCallback(() => {
    setCurrentView('editor');
  }, []);

  return (
    <div className="w-full h-[calc(100dvh-6rem)] md:h-full md:min-h-screen flex items-center justify-center md:p-4 bg-black/90">
      <div className="w-full max-w-7xl h-full md:h-[85vh] bg-[#0d0d1a] rounded-none md:rounded-2xl overflow-hidden shadow-2xl border-x-0 border-y-0 md:border md:border-white/10 flex flex-col">
        {currentView === 'editor' ? (
          <Editor
            onAddToCarousel={handleAddSlide}
            initialImage={editorImage}
            onImageChange={setEditorImage}
          />
        ) : (
          <CarouselCreator
            slides={slides}
            onBack={handleBackToEditor}
            setSlides={setSlides}
          />
        )}
      </div>
    </div>
  );
};

export default CosmicStudio;
