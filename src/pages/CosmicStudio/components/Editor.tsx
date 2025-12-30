import React, { useState, useRef, useEffect } from 'react';
import { Undo, Save, Loader2, Plus, Download, Redo, ZoomIn, ZoomOut, Move, Maximize, Trash2, Settings2 } from 'lucide-react';
import { generateImageFromAI } from '../services/geminiService';
import html2canvas from 'html2canvas';

// Engine & Types
import { useCosmicEngine } from '../hooks/useCosmicEngine';
import { Layer, ImageLayer, TextLayer, AdjustmentLayer } from '../engine/types';

// Panels
import RightSidebar from './panels/RightSidebar';
import { FilterDefinitions } from '../engine/SVGFilters';

interface EditorProps {
  onAddToCarousel: (imageUrl: string) => void;
  initialImage: string | null;
  onImageChange: (img: string | null) => void;
}

const Editor: React.FC<EditorProps> = ({ onAddToCarousel, initialImage, onImageChange }) => {
  const engine = useCosmicEngine();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with base image layer if fresh
  useEffect(() => {
    if (initialImage && engine.layers.length === 0) {
      const baseLayer: ImageLayer = {
        id: 'base-bg',
        type: 'image',
        name: 'Plano de Fundo',
        visible: true,
        opacity: 1,
        src: initialImage,
        x: 0,
        y: 0
      };
      engine.addLayer(baseLayer);
    }
  }, [initialImage, engine.layers.length]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result;
        if (typeof res !== 'string') return;
        // If it's the first image, treat as base
        if (engine.layers.length === 0) {
          onImageChange(res);
        } else {
          // Add as new layer
          const newLayer: ImageLayer = {
            id: Date.now().toString(),
            type: 'image',
            name: 'Imagem Importada',
            visible: true,
            opacity: 1,
            src: res,

            x: 0,
            y: 0
          };
          engine.addLayer(newLayer);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      type: 'text',
      name: 'Novo Texto',
      visible: true,
      opacity: 1,
      text: 'Edite-me',
      x: 0,
      y: 0,
      fontSize: 24,
      color: '#ffffff'
    };
    engine.addLayer(newLayer);
  };

  const handleSave = async () => {
    if (!containerRef.current) return;

    // Quick Reset Zoom for capture 
    // real implementation should likely draw to a hidden canvas at full resolution
    const prevZoom = engine.state.zoom;
    const prevPan = engine.state.pan;
    engine.setZoom(1);
    engine.setPan({ x: 0, y: 0 });

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(containerRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 3, // Higher quality
      logging: false,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    });

    engine.setZoom(prevZoom);
    engine.setPan(prevPan);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `cosmic-creation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mobile & Layout State
  const [isMobile, setIsMobile] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setShowRightSidebar(false);
      } else {
        setShowRightSidebar(true);
      }
    };

    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Render logic for layers on the "Canvas"
  // In a real WebGL implementation, this would be passed to a WebGLRenderer component
  // For now, we render DOM elements with CSS transforms
  const renderLayer = (layer: Layer) => {
    if (!layer.visible) return null;
    const isSelected = engine.state.selectedLayerId === layer.id;

    switch (layer.type) {
      case 'image':
        return (
          <img
            key={layer.id}
            src={(layer as ImageLayer).src}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${(layer as ImageLayer).x}px, ${(layer as ImageLayer).y}px)`,
              opacity: layer.opacity,
              zIndex: 10,
              cursor: 'move',
              pointerEvents: 'auto',
              border: isSelected ? '2px solid #a855f7' : '2px solid transparent'
            }}
            alt={layer.name}
            className="max-w-none hover:border-white/20 transition-all select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              engine.updateState({ selectedLayerId: layer.id });

              const startX = e.clientX;
              const startY = e.clientY;
              const initX = (layer as ImageLayer).x;
              const initY = (layer as ImageLayer).y;
              const zoom = engine.state.zoom;

              const onMove = (mv: MouseEvent) => {
                const dx = (mv.clientX - startX) / zoom;
                const dy = (mv.clientY - startY) / zoom;
                engine.updateLayer(layer.id, { x: initX + dx, y: initY + dy });
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          />
        );
      case 'text':
        return (
          <div
            key={layer.id}
            className={`absolute cursor-move border border-transparent hover:border-white/20 p-2 ${isSelected ? 'border-purple-500' : ''}`}
            style={{
              left: (layer as TextLayer).x,
              top: (layer as TextLayer).y,
              color: (layer as TextLayer).color,
              fontSize: (layer as TextLayer).fontSize,
              zIndex: 20
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              engine.updateState({ selectedLayerId: layer.id });

              // Only drag if NOT clicking the input
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT') return;

              // Drag logic...
              const startX = e.clientX;
              const startY = e.clientY;
              const initX = (layer as TextLayer).x;
              const initY = (layer as TextLayer).y;
              const zoom = engine.state.zoom;

              const onMove = (mv: MouseEvent) => {
                const dx = (mv.clientX - startX) / zoom;
                const dy = (mv.clientY - startY) / zoom;
                engine.updateLayer(layer.id, { x: initX + dx, y: initY + dy });
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <input
              value={(layer as TextLayer).text}
              onChange={(e) => engine.updateLayer(layer.id, { text: e.target.value })}
              className="bg-transparent outline-none min-w-[50px] text-center cursor-text"
              style={{ color: 'inherit', fontSize: 'inherit' }}
            />
          </div>
        );
      case 'adjustment':
        const style: React.CSSProperties = {
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 15,
          pointerEvents: 'none',
        };

        const adj = layer as AdjustmentLayer;
        const val = adj.value;
        let filterString = '';

        // Standard CSS Filters
        if (typeof val === 'number') {
          switch (adj.adjustmentType) {
            case 'brightness': filterString = `brightness(${val}%)`; break;
            case 'contrast': filterString = `contrast(${val}%)`; break;
            case 'saturation': filterString = `saturate(${val}%)`; break;
            case 'hue': filterString = `hue-rotate(${val}deg)`; break;
            case 'blur': filterString = `blur(${val}px)`; break;
            case 'sepia': filterString = `sepia(${val}%)`; break;
            case 'grayscale': filterString = `grayscale(${val}%)`; break;
          }
        }
        // SVG Filters (Levels, Curves, HSL)
        else if (adj.adjustmentType === 'levels' || adj.adjustmentType === 'curves' || adj.adjustmentType === 'hsl') {
          filterString = `url(#filter-${adj.id})`;
        }

        return (
          <div
            key={layer.id}
            style={{
              ...style,
              backdropFilter: filterString,
              WebkitBackdropFilter: filterString, // Safari support
            }}
            className={isSelected ? 'border-2 border-purple-500/50' : ''}
          />
        );
      default:
        return null;
    }
  };

  const canvasStyle = {
    transform: `scale(${engine.state.zoom}) translate(${engine.state.pan.x / engine.state.zoom}px, ${engine.state.pan.y / engine.state.zoom}px)`,
    transformOrigin: 'center center',
    width: '100%',
    height: '100%'
  };

  return (
    <div className="flex flex-col h-full bg-black/95 text-white overflow-hidden">
      {/* SVG Definitions */}
      <FilterDefinitions layers={engine.layers.filter(l => l.type === 'adjustment') as AdjustmentLayer[]} />

      {/* Header / Top Bar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0d0d1a]">
        <h1 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
          <span className="hidden sm:inline">Cosmic Studio</span>
          <span className="sm:hidden">Cosmic</span>
          <span className="text-[10px] text-purple-300 border border-purple-500/30 px-1 rounded">PRO</span>
        </h1>

        <div className="flex items-center gap-2">
          <button onClick={engine.undo} disabled={!engine.canUndo} className="p-2 hover:bg-white/10 rounded disabled:opacity-30 hidden sm:block"><Undo size={16} /></button>
          <button onClick={engine.redo} disabled={!engine.canRedo} className="p-2 hover:bg-white/10 rounded disabled:opacity-30 hidden sm:block"><Redo size={16} /></button>
          <div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block" />

          <button
            onClick={async () => {
              // Capture logic similar to save but passes URL up
              if (!containerRef.current) return;
              const prevZoom = engine.state.zoom;
              const prevPan = engine.state.pan;
              const prevSelection = engine.state.selectedLayerId; // Deselect for clean capture

              engine.setZoom(1);
              engine.setPan({ x: 0, y: 0 });
              engine.updateState({ selectedLayerId: null });

              await new Promise(resolve => setTimeout(resolve, 150)); // Slightly longer wait

              const canvas = await html2canvas(containerRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 3,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0
              });

              engine.setZoom(prevZoom);
              engine.setPan(prevPan);
              engine.updateState({ selectedLayerId: prevSelection });

              onAddToCarousel(canvas.toDataURL('image/png'));
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold mr-2"
            title="Usar no Criador de Carrossel"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Add ao Carrossel</span>
          </button>

          <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-bold">
            <Save size={14} /> <span className="hidden sm:inline">Salvar</span>
          </button>

          {isMobile && (
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`p-2 rounded ml-2 transition-colors ${showRightSidebar ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-white/10 text-gray-400'}`}
            >
              <Settings2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-4 bg-[#111122] z-10">
          <button
            onClick={() => handleAddText()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all group relative"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all"
            title="Importar Imagem"
          >
            <Download size={20} />
          </button>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-[#050510] relative overflow-hidden flex flex-col items-center justify-center">
          {/* Floating Zoom Controls - Position adjusted for mobile */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-black/50 backdrop-blur rounded-lg p-1 border border-white/10">
            <button onClick={() => engine.setZoom(Math.max(0.1, engine.state.zoom - 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomOut size={14} /></button>
            <span className="text-xs w-8 sm:w-12 text-center">{Math.round(engine.state.zoom * 100)}%</span>
            <button onClick={() => engine.setZoom(Math.min(5, engine.state.zoom + 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomIn size={14} /></button>
            <button onClick={() => { engine.setZoom(1); engine.setPan({ x: 0, y: 0 }); }} className="p-1 hover:bg-white/10 rounded ml-1"><Maximize size={14} /></button>
          </div>

          <div
            className="w-full flex-1 flex items-center justify-center p-4 sm:p-20"
            onWheel={(e) => {
              if (e.ctrlKey) {
                e.preventDefault();
                const d = -Math.sign(e.deltaY) * 0.1;
                engine.setZoom(Math.max(0.1, Math.min(5, engine.state.zoom + d)));
              }
            }}
            onTouchStart={(e) => {
              // Simple touch handling could be added here for pinch-zoom
            }}
          >
            <div ref={containerRef} style={canvasStyle} className="relative shadow-2xl transition-transform duration-75">
              {engine.layers.length > 0 ? (
                engine.layers.map(renderLayer)
              ) : (
                <div className="flex flex-col items-center text-gray-500 text-center px-4">
                  <p className="text-sm sm:text-base">Arraste uma imagem ou importe para começar</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Bar (Restored) */}
          <div className="w-full p-3 sm:p-4 bg-[#0d0d1a] border-t border-white/10 z-30">
            <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o que criar..."
                className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-purple-500/50 outline-none transition-all"
              />
              <button
                onClick={async () => {
                  if (!prompt.trim()) return;
                  setIsProcessing(true);
                  const result = await generateImageFromAI(prompt);
                  if (result) {
                    if (engine.layers.length === 0) {
                      onImageChange(result);
                    } else {
                      const newLayer: ImageLayer = {
                        id: Date.now().toString(),
                        type: 'image',
                        name: `Gerado: ${prompt.slice(0, 15)}...`,
                        visible: true,
                        opacity: 1,
                        src: result,
                        x: 0,
                        y: 0
                      };
                      engine.addLayer(newLayer);
                    }
                  }
                  setIsProcessing(false);
                  setPrompt('');
                }}
                disabled={!prompt || isProcessing}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 sm:px-6 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span className="hidden sm:inline">Gerar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel (Layers & Properties & Filters) */}
        <div
          className={`
                h-full border-l border-white/10 bg-[#111122]
                ${isMobile ? 'absolute top-0 right-0 z-40 shadow-2xl w-72 sm:w-80 transition-transform duration-300' : 'relative w-80'}
                ${isMobile && !showRightSidebar ? 'translate-x-full' : 'translate-x-0'}
            `}
        >
          <RightSidebar engine={engine} />
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept="image/*" />
    </div>
  );
};

export default Editor;
