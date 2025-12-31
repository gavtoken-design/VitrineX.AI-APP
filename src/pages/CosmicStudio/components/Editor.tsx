import React, { useState, useRef, useEffect } from 'react';
import { Undo, Save, Loader2, Plus, Download, Redo, ZoomIn, ZoomOut, Maximize, Trash2, Settings2, Sparkles, Wand2, X } from 'lucide-react';
import { generateImageFromAI } from '../services/geminiService';
import html2canvas from 'html2canvas';

// Engine & Types
import { useCosmicEngine } from '../hooks/useCosmicEngine';
import { Layer, ImageLayer, TextLayer, AdjustmentLayer } from '../engine/types';

// Panels & Components
import RightSidebar from './panels/RightSidebar';
import Transformer from './Transformer';
import MaskTransformer from './MaskTransformer';
import { MousePointer2, Crop } from 'lucide-react';
import { FilterDefinitions } from '../engine/SVGFilters';

interface EditorProps {
  onAddToCarousel: (imageUrl: string) => void;
  initialImage: string | null;
  onImageChange: (img: string | null) => void;
}

const STYLES = [
  { id: 'none', label: 'Sem Estilo' },
  { id: 'photorealistic', label: 'Fotorealista', prompt: 'photorealistic, 8k, highly detailed, realistic lighting' },
  { id: 'cinematic', label: 'Cinemático', prompt: 'cinematic lighting, movie scene, dramatic, color grade, 8k' },
  { id: '3d-render', label: '3D Render', prompt: '3d render, unreal engine 5, octane render, ray tracing' },
  { id: 'anime', label: 'Anime', prompt: 'anime style, studio ghibli, vibrant colors, cellular shading' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk, neon lights, futuristic, high tech, night city' },
  { id: 'oil-painting', label: 'Pintura a Óleo', prompt: 'oil painting, textured, classic art style, masterpiece' },
];

const RATIOS = [
  { id: '1:1', label: 'Quadrado (1:1)', w: 1024, h: 1024 },
  { id: '16:9', label: 'Paisagem (16:9)', w: 1280, h: 720 },
  { id: '9:16', label: 'Retrato (9:16)', w: 720, h: 1280 },
];

const Editor: React.FC<EditorProps> = ({ onAddToCarousel, initialImage, onImageChange }) => {
  const engine = useCosmicEngine();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Gen Settings
  const [showGenSettings, setShowGenSettings] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);

  // Masking State
  const [maskMode, setMaskMode] = useState(false);
  const [maskRegion, setMaskRegion] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  // Mobile State
  const [isMobile, setIsMobile] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

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
        y: 0,
        rotation: 0,
        width: 800, // Default base width
        height: 800
      };
      engine.addLayer(baseLayer);
    }
  }, [initialImage, engine.layers.length]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setShowRightSidebar(false);
      else setShowRightSidebar(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result;
        if (typeof res !== 'string') return;

        const img = new Image();
        img.onload = () => {
          const newLayer: ImageLayer = {
            id: Date.now().toString(),
            type: 'image',
            name: file.name,
            visible: true,
            opacity: 1,
            src: res,
            x: 0,
            y: 0,
            rotation: 0,
            width: img.width > 500 ? 500 : img.width, // Limit initial size
            height: img.width > 500 ? (500 * img.height / img.width) : img.height
          };
          engine.addLayer(newLayer);
        };
        img.src = res;
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
      text: 'Toque para editar',
      x: 0,
      y: 0,
      rotation: 0,
      fontSize: 32,
      color: '#ffffff'
    };
    engine.addLayer(newLayer);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setShowGenSettings(false);

    // Build enhanced prompt
    let finalPrompt = prompt;
    if (selectedStyle.id !== 'none') {
      finalPrompt += `, ${selectedStyle.prompt}`;
    }

    const result = await generateImageFromAI(finalPrompt);
    if (result) {
      // Calculate best fit scale
      const viewportW = containerRef.current?.clientWidth || 800;
      const viewportH = containerRef.current?.clientHeight || 600;
      const targetSize = Math.min(viewportW, viewportH) * 0.8;

      const newLayer: ImageLayer = {
        id: Date.now().toString(),
        type: 'image',
        name: `Gerado: ${prompt.slice(0, 10)}...`,
        visible: true,
        opacity: 1,
        src: result,
        x: 0,
        y: 0,
        rotation: 0,
        width: targetSize,
        height: targetSize // Assume square initially, or load image to check aspect
      };

      // If we selected a ratio, use it
      if (selectedRatio) {
        if (selectedRatio.id === '16:9') {
          newLayer.width = targetSize;
          newLayer.height = targetSize * (9 / 16);
        } else if (selectedRatio.id === '9:16') {
          newLayer.width = targetSize * (9 / 16);
          newLayer.height = targetSize;
        }
      }

      engine.addLayer(newLayer);
    }
    setIsProcessing(false);
    setPrompt('');
  };

  const handleSave = async () => {
    if (!containerRef.current || engine.layers.length === 0) return;

    const prevZoom = engine.state.zoom;
    const prevPan = engine.state.pan;
    const prevSel = engine.state.selectedLayerId;

    // 1. Calculate Content Bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    engine.layers.forEach(layer => {
      if (!layer.visible) return;
      let lMinX = 0, lMinY = 0, lMaxX = 0, lMaxY = 0;

      if (layer.type === 'image') {
        const l = layer as ImageLayer;
        const w = l.width || 100;
        const h = l.height || 100;
        // Simplified bounds (ignoring rotation for bounding box expansion/contraction for now, assuming squareish)
        lMinX = l.x - w / 2;
        lMaxX = l.x + w / 2;
        lMinY = l.y - h / 2;
        lMaxY = l.y + h / 2;
      } else if (layer.type === 'text') {
        const l = layer as TextLayer;
        // Estimate text size roughly if not measuring DOM
        const approxW = (l.text.length * (l.fontSize || 16)) * 0.6;
        const approxH = (l.fontSize || 16) * 1.2;
        lMinX = l.x - approxW / 2;
        lMaxX = l.x + approxW / 2;
        lMinY = l.y - approxH / 2;
        lMaxY = l.y + approxH / 2;
      }

      if (lMinX < minX) minX = lMinX;
      if (lMaxX > maxX) maxX = lMaxX;
      if (lMinY < minY) minY = lMinY;
      if (lMaxY > maxY) maxY = lMaxY;
    });

    if (minX === Infinity) { minX = -400; maxX = 400; minY = -400; maxY = 400; } // Fallback

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const margin = 50; // Add some breathing room

    // 2. Prepare View for Capture
    // We want to center the content exactly in the view
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Center content by panning opposite to its center
    engine.setPan({ x: -centerX, y: -centerY });
    engine.setZoom(1);
    engine.updateState({ selectedLayerId: null });

    // Force container size to match content
    const originalWidth = containerRef.current.style.width;
    const originalHeight = containerRef.current.style.height;

    containerRef.current.style.width = `${contentWidth + margin * 2}px`;
    containerRef.current.style.height = `${contentHeight + margin * 2}px`;

    // Wait for state/DOM update
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 3, // High quality
        logging: false,
        width: contentWidth + margin * 2,
        height: contentHeight + margin * 2,
        x: 0,
        y: 0
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `cosmic-creation-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Save failed", e);
      alert("Erro ao salvar imagem.");
    } finally {
      // 3. Restore State
      containerRef.current.style.width = originalWidth;
      containerRef.current.style.height = originalHeight;
      engine.setZoom(prevZoom);
      engine.setPan(prevPan);
      engine.updateState({ selectedLayerId: prevSel });
    }
  };

  const renderLayer = (layer: Layer) => {
    if (!layer.visible) return null;
    const isSelected = engine.state.selectedLayerId === layer.id;

    switch (layer.type) {
      case 'image':
        const imgLayer = layer as ImageLayer;
        return (
          <div
            key={layer.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${imgLayer.x}px, ${imgLayer.y}px) rotate(${imgLayer.rotation || 0}deg)`,
              width: imgLayer.width,
              height: imgLayer.height,
              zIndex: 10,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              engine.updateState({ selectedLayerId: layer.id });

              // Drag Logic
              const startX = e.clientX;
              const startY = e.clientY;
              const initX = imgLayer.x;
              const initY = imgLayer.y;
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
            <img
              src={imgLayer.src}
              alt={layer.name}
              className="w-full h-full object-fill select-none pointer-events-none"
              style={{ opacity: layer.opacity }}
            />
            {isSelected && !maskMode && <Transformer layer={layer} zoom={engine.state.zoom} onUpdate={engine.updateLayer} />}
            {isSelected && maskMode && maskRegion && (
              <MaskTransformer
                layer={imgLayer}
                maskRegion={maskRegion}
                zoom={engine.state.zoom}
                onUpdateMask={setMaskRegion}
              />
            )}
          </div>
        );
      case 'text':
        const txtLayer = layer as TextLayer;
        // Text is tricky because width/height is dynamic usually, unless we box it.
        // For simplicity, we wrap it in a div that acts as the transform target
        return (
          <div
            key={layer.id}
            className={`absolute cursor-move group`}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${txtLayer.x}px, ${txtLayer.y}px) rotate(${txtLayer.rotation || 0}deg)`,
              zIndex: 20
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              engine.updateState({ selectedLayerId: layer.id });

              if ((e.target as HTMLElement).tagName === 'INPUT') return;

              const startX = e.clientX;
              const startY = e.clientY;
              const initX = txtLayer.x;
              const initY = txtLayer.y;
              const zoom = engine.state.zoom;

              const onMove = (mv: MouseEvent) => {
                const dx = (mv.clientX - startX) / zoom;
                const dy = (mv.clientY - startY) / zoom;
                engine.updateLayer(layer.id, { x: initX + dx, y: initY + dy });
              };
              const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <div className={`relative p-2 border ${isSelected ? 'border-transparent' : 'border-transparent hover:border-white/20'}`}>
              <input
                value={txtLayer.text}
                onChange={(e) => engine.updateLayer(layer.id, { text: e.target.value })}
                className="bg-transparent outline-none min-w-[50px] text-center"
                style={{
                  color: txtLayer.color,
                  fontSize: txtLayer.fontSize,
                  fontFamily: txtLayer.fontFamily || 'sans-serif'
                }}
              />
              {isSelected && (
                // Custom Transformer for text (simplified, no resize for now, just rotate)
                <Transformer layer={layer} zoom={engine.state.zoom} onUpdate={engine.updateLayer} />
              )}
            </div>
          </div>
        );
      case 'adjustment':
        // ... (Adjustment layer rendering remains same)
        const style: React.CSSProperties = {
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 15, pointerEvents: 'none',
        };
        const adj = layer as AdjustmentLayer;
        const val = adj.value;
        let filterString = '';
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
        } else if (['levels', 'curves', 'hsl'].includes(adj.adjustmentType)) {
          filterString = `url(#filter-${adj.id})`;
        }
        return (
          <div key={layer.id} style={{ ...style, backdropFilter: filterString }} />
        );
      default: return null;
    }
  };

  const canvasStyle = {
    transform: `scale(${engine.state.zoom}) translate(${engine.state.pan.x / engine.state.zoom}px, ${engine.state.pan.y / engine.state.zoom}px)`,
    transformOrigin: 'center center',
    width: '100%', height: '100%'
  };

  return (
    <div className="flex flex-col h-full bg-black/95 text-white overflow-hidden">
      <FilterDefinitions layers={engine.layers.filter(l => l.type === 'adjustment') as AdjustmentLayer[]} />

      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0d0d1a] relative z-20">
        <h1 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
          <Sparkles className="text-purple-400 w-5 h-5 fill-purple-400/20" />
          <span className="hidden sm:inline">Cosmic Studio</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={engine.undo} disabled={!engine.canUndo} className="p-2 hover:bg-white/10 rounded disabled:opacity-30"><Undo size={16} /></button>
          <button onClick={engine.redo} disabled={!engine.canRedo} className="p-2 hover:bg-white/10 rounded disabled:opacity-30"><Redo size={16} /></button>
          <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-bold ml-2">
            <Save size={14} /> <span className="hidden sm:inline">Salvar</span>
          </button>
          {isMobile && (
            <button onClick={() => setShowRightSidebar(!showRightSidebar)} className="p-2 ml-2 rounded bg-white/5"><Settings2 size={18} /></button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-4 bg-[#111122] z-10">
          <button onClick={handleAddText} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-all hover:text-white" title="Adicionar Texto"><span className="font-serif text-xl font-bold">T</span></button>
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-all hover:text-white" title="Importar Imagem"><Download size={20} /></button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#050510] relative overflow-hidden flex flex-col items-center justify-center">
          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-black/50 backdrop-blur rounded-lg p-1 border border-white/10">
            <button onClick={() => engine.setZoom(Math.max(0.1, engine.state.zoom - 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomOut size={14} /></button>
            <span className="text-xs w-8 text-center">{Math.round(engine.state.zoom * 100)}%</span>
            <button onClick={() => engine.setZoom(Math.min(5, engine.state.zoom + 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomIn size={14} /></button>
            <button onClick={() => { engine.setZoom(1); engine.setPan({ x: 0, y: 0 }); }} className="p-1 hover:bg-white/10 rounded ml-1"><Maximize size={14} /></button>
          </div>

          <div className="w-full flex-1 touch-none overflow-hidden relative" onWheel={(e) => {
            if (e.ctrlKey) {
              e.preventDefault();
              const d = -Math.sign(e.deltaY) * 0.1;
              engine.setZoom(Math.max(0.1, Math.min(5, engine.state.zoom + d)));
            }
          }}>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div ref={containerRef} style={canvasStyle} className="relative transition-transform duration-75">
                {engine.layers.length > 0 ? engine.layers.map(renderLayer) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 opacity-50">
                    <Download size={48} />
                    <p>Arraste uma imagem ou gere com IA</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prompt Bar & Creative Console */}
          <div className="w-full bg-[#0d0d1a] border-t border-white/10 z-30 relative transition-all">

            {/* Tab Switcher */}
            <div className="flex justify-center -mt-5">
              <div className="bg-[#1a1a2e] p-1 rounded-full border border-white/10 flex shadow-lg">
                <button
                  onClick={() => engine.updateState({ selectedLayerId: null })} // Deselect to switch to create implied? No, just mode.
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!engine.state.selectedLayerId ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Criar (Novo)
                </button>
                <button
                  onClick={() => {
                    if (engine.layers.length > 0 && !engine.state.selectedLayerId) {
                      // Select top layer if none
                      engine.updateState({ selectedLayerId: engine.layers[engine.layers.length - 1].id });
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${engine.state.selectedLayerId ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                  disabled={engine.layers.length === 0}
                >
                  Editar (Selecionado)
                </button>
              </div>
            </div>

            <div className="p-2 sm:p-3 max-w-5xl mx-auto">
              {engine.state.selectedLayerId && engine.layers.find(l => l.id === engine.state.selectedLayerId)?.type === 'image' ? (
                // EDIT MODE
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1"><Wand2 size={10} /> O que ajustar?</label>
                        <input
                          type="text"
                          placeholder="Ex: Mudar cenário para praia, mover avatar para esquerda..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="w-full bg-[#111122] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><X size={10} /> O que MANTER?</label>
                        <input
                          type="text"
                          placeholder="Ex: Manter as cores da marca..."
                          id="preservation-input"
                          className="w-full bg-[#111122] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:border-emerald-500/30 outline-none"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/4 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1"><Sparkles size={10} /> Ref.</label>
                      <div className="w-full h-[74px] border border-dashed border-white/20 rounded-lg bg-[#111122] hover:bg-white/5 transition-all flex items-center justify-center relative overflow-hidden group">
                        {/* Add hidden input for reference */}
                        <input
                          type="file"
                          id="ref-upload"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onload = (ev) => {
                                const img = document.getElementById('ref-preview') as HTMLImageElement;
                                img.src = ev.target?.result as string;
                                img.classList.remove('hidden');
                                document.getElementById('ref-placeholder')?.classList.add('hidden');
                              };
                              r.readAsDataURL(f);
                            }
                          }}
                        />
                        <div id="ref-placeholder" className="text-center p-1">
                          <Plus size={16} className="mx-auto text-gray-400 mb-0.5" />
                          <span className="text-[9px] text-gray-500 block leading-tight">Ref.</span>
                        </div>
                        <img id="ref-preview" className="absolute inset-0 w-full h-full object-cover hidden" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const img = document.getElementById('ref-preview') as HTMLImageElement;
                            img.src = '';
                            img.classList.add('hidden');
                            document.getElementById('ref-placeholder')?.classList.remove('hidden');
                            (document.getElementById('ref-upload') as HTMLInputElement).value = '';
                          }}
                          className="absolute top-1 right-1 bg-black/50 p-1 rounded-full hover:bg-red-500 hidden group-hover:block"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  </div>


                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        const newMode = !maskMode;
                        setMaskMode(newMode);
                        if (newMode && !maskRegion) {
                          // Default mask in center, 50% size
                          const l = engine.layers.find(l => l.id === engine.state.selectedLayerId) as ImageLayer;
                          if (l) {
                            const w = l.width || 100;
                            const h = l.height || 100;
                            setMaskRegion({ x: w * 0.25, y: h * 0.25, width: w * 0.5, height: h * 0.5 });
                          }
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${maskMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-[#1a1a2e] border-white/10 text-gray-400 hover:text-white'}`}
                    >
                      <Crop size={14} />
                      {maskMode ? 'Área definida' : 'Definir Área'}
                    </button>
                    {maskMode && <span className="text-[10px] text-gray-500">Ajuste a caixa verde na imagem</span>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!engine.state.selectedLayerId) return;
                        const selectedLayer = engine.layers.find(l => l.id === engine.state.selectedLayerId) as ImageLayer;
                        if (!selectedLayer || selectedLayer.type !== 'image') return;

                        if (!maskMode || !maskRegion) {
                          alert("Por favor, defina a área do personagem para protegê-lo.");
                          setMaskMode(true);
                          // Set default mask if not set
                          if (!maskRegion) {
                            const w = selectedLayer.width || 100;
                            const h = selectedLayer.height || 100;
                            setMaskRegion({ x: w * 0.25, y: h * 0.25, width: w * 0.5, height: h * 0.5 });
                          }
                          return;
                        }

                        setIsProcessing(true);

                        // Resize target image to match editor/mask dimensions
                        const tempImg = new Image();
                        await new Promise((resolve, reject) => {
                          tempImg.onload = resolve;
                          tempImg.onerror = reject;
                          tempImg.src = selectedLayer.src;
                        });

                        const w = selectedLayer.width || 100;
                        const h = selectedLayer.height || 100;

                        const imgCvs = document.createElement('canvas');
                        imgCvs.width = w;
                        imgCvs.height = h;
                        const imgCtx = imgCvs.getContext('2d');
                        if (!imgCtx) return;
                        imgCtx.drawImage(tempImg, 0, 0, w, h);
                        const resizedTargetBase64 = imgCvs.toDataURL('image/png');

                        // Inverted Mask Generation (Black INSIDE box, White OUTSIDE)
                        let maskBase64 = null;
                        const cvs = document.createElement('canvas');
                        cvs.width = w;
                        cvs.height = h;
                        const ctx = cvs.getContext('2d');
                        if (ctx) {
                          // 1. Fill everything WHITE (Editable)
                          ctx.fillStyle = 'white';
                          ctx.fillRect(0, 0, cvs.width, cvs.height);

                          // 2. Fill selection BLACK (Protected)
                          ctx.fillStyle = 'black';
                          ctx.fillRect(maskRegion.x, maskRegion.y, maskRegion.width, maskRegion.height);

                          maskBase64 = cvs.toDataURL('image/png');
                        }

                        const { editImageAdvanced } = await import('../services/geminiService');

                        // Fixed prompt for background removal/cleaning
                        const bgPrompt = "Remove the background completely. Replace with a clean, empty, or simple studio background. Keep the protected subject EXACTLY as is.";
                        const preservation = "STRICTLY preserve the black masked area (the character). Do not modify the character.";

                        const result = await editImageAdvanced(
                          resizedTargetBase64,
                          maskBase64,
                          null, // No reference needed for cleaning usually, or could allow user to add one for new bg
                          bgPrompt,
                          preservation
                        );

                        if (result) {
                          const newLayer: ImageLayer = {
                            ...selectedLayer,
                            id: Date.now().toString(),
                            name: `Fundo Removido`,
                            src: result,
                            x: selectedLayer.x + 20,
                            y: selectedLayer.y + 20
                          };
                          engine.addLayer(newLayer);
                          setMaskMode(false);
                        } else {
                          alert("Falha ao remover fundo. Tente novamente.");
                        }
                        setIsProcessing(false);
                      }}
                      className="flex-1 py-2 bg-[#1a1a2e] border border-white/10 hover:border-white/30 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-[10px] text-gray-300 hover:text-white"
                      disabled={isProcessing}
                      title="Proteja o personagem com a caixa e clique aqui"
                    >
                      <div className="relative">
                        <span className="absolute inset-0 bg-red-500/20 blur-sm rounded-full"></span>
                        <Crop size={12} className="relative z-10" />
                      </div>
                      Limpar Fundo
                    </button>

                    <button
                      onClick={async () => {
                        if (!prompt.trim() || !engine.state.selectedLayerId) return;
                        const selectedLayer = engine.layers.find(l => l.id === engine.state.selectedLayerId) as ImageLayer;
                        if (!selectedLayer || selectedLayer.type !== 'image') return;

                        setIsProcessing(true);
                        try {
                          const preservation = (document.getElementById('preservation-input') as HTMLInputElement).value;
                          const refImg = (document.getElementById('ref-preview') as HTMLImageElement).src;
                          const hasRef = refImg && refImg.startsWith('data:');
                          const { editImageAdvanced } = await import('../services/geminiService');

                          const tempImg = new Image();
                          await new Promise((resolve, reject) => {
                            tempImg.onload = resolve;
                            tempImg.onerror = reject;
                            tempImg.src = selectedLayer.src;
                          });

                          const w = selectedLayer.width || 100;
                          const h = selectedLayer.height || 100;

                          // Resize target image to match editor dimensions (and mask dimensions)
                          const imgCvs = document.createElement('canvas');
                          imgCvs.width = w;
                          imgCvs.height = h;
                          const imgCtx = imgCvs.getContext('2d');
                          if (!imgCtx) return;
                          imgCtx.drawImage(tempImg, 0, 0, w, h);
                          const resizedTargetBase64 = imgCvs.toDataURL('image/png');

                          let maskBase64 = null;
                          if (maskMode && maskRegion) {
                            const cvs = document.createElement('canvas');
                            cvs.width = w;
                            cvs.height = h;
                            const ctx = cvs.getContext('2d');
                            if (ctx) {
                              ctx.fillStyle = 'black';
                              ctx.fillRect(0, 0, cvs.width, cvs.height);
                              ctx.fillStyle = 'white';
                              ctx.fillRect(maskRegion.x, maskRegion.y, maskRegion.width, maskRegion.height);
                              maskBase64 = cvs.toDataURL('image/png');
                            }
                          }

                          const result = await editImageAdvanced(
                            resizedTargetBase64, // Use resized image
                            maskBase64,
                            hasRef ? refImg : null,
                            prompt,
                            preservation
                          );

                          if (result) {
                            const newLayer: ImageLayer = {
                              ...selectedLayer,
                              id: Date.now().toString(),
                              name: `Editado: ${prompt.slice(0, 10)}`,
                              src: result,
                              x: selectedLayer.x + 20,
                              y: selectedLayer.y + 20
                            };
                            engine.addLayer(newLayer);
                            setMaskMode(false); // Exit mask mode after success
                          } else {
                            alert("Não foi possível realizar a edição. Tente simplificar o prompt ou ajustar a área de seleção.");
                          }
                        } catch (err) {
                          console.error("Erro ao aplicar ajustes:", err);
                          alert("Ocorreu um erro ao processar a imagem. Verifique se a imagem é válida.");
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={!prompt || isProcessing}
                      className="flex-[2] py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all text-xs"
                    >
                      {isProcessing ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                      Aplicar Ajustes
                    </button>
                  </div>
                </div>
              ) : (
                // CREATE MODE
                <div className="flex gap-2 relative animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={() => setShowGenSettings(!showGenSettings)}
                    className={`p-3 rounded-xl border transition-all ${showGenSettings ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-[#1a1a2e] border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    <Wand2 size={20} />
                  </button>

                  {/* Settings Popover */}
                  {showGenSettings && (
                    <div className="absolute bottom-full left-0 mb-4 bg-[#111122] border border-white/10 rounded-2xl p-4 shadow-2xl w-80 animate-in slide-in-from-bottom-5 z-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-white">Configurações Mágicas</h3>
                        <button onClick={() => setShowGenSettings(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Estilo Artístico</label>
                          <div className="grid grid-cols-2 gap-2">
                            {STYLES.map(s => (
                              <button
                                key={s.id}
                                onClick={() => setSelectedStyle(s)}
                                className={`text-xs text-left px-2 py-1.5 rounded border transition-all ${selectedStyle.id === s.id ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Formato</label>
                          <div className="flex gap-2">
                            {RATIOS.map(r => (
                              <button
                                key={r.id}
                                onClick={() => setSelectedRatio(r)}
                                className={`flex-1 text-xs py-1.5 rounded border transition-all ${selectedRatio.id === r.id ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}
                              >
                                {r.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Descreva sua imaginação..."
                      className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg pl-3 pr-24 py-2 text-xs text-white focus:border-purple-500/50 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <div className="absolute right-1 top-1 bottom-1">
                      <button
                        onClick={handleGenerate}
                        disabled={!prompt || isProcessing}
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 rounded-md font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all text-xs"
                      >
                        {isProcessing ? <Loader2 className="animate-spin w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span className="hidden sm:inline">Gerar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`h-full border-l border-white/10 bg-[#111122] ${isMobile ? 'absolute top-0 right-0 z-40 shadow-2xl w-80 transition-transform duration-300' : 'relative w-80'} ${isMobile && !showRightSidebar ? 'translate-x-full' : 'translate-x-0'}`}>
          <RightSidebar engine={engine} />
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept="image/*" />
    </div >
  );
};

export default Editor;
