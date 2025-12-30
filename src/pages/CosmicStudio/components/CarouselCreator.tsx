
import React, { useState } from 'react';
import { ChevronLeft, Plus, X, Settings, AlignLeft, AlignCenter, AlignRight, Instagram, Facebook, Cloud, MoreHorizontal, Download, FileText, Image as ImageIcon, Sparkles, Layout, GripVertical, Clock, Check } from 'lucide-react';
import { Slide } from '../types';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import LibraryImportModal from '../../../components/features/LibraryImportModal';

interface CarouselCreatorProps {
  slides: Slide[];
  onBack: () => void;
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
}

const CarouselCreator: React.FC<CarouselCreatorProps> = ({ slides, onBack, setSlides }) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'transition' | 'export'>('layout');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(slides[0]?.id || null);
  const [isExporting, setIsExporting] = useState(false);

  // Transition Settings
  const [transition, setTransition] = useState<'smooth' | 'fade' | 'zoom'>('smooth');
  const [transitionDuration, setTransitionDuration] = useState(0.5); // seconds

  // UI States
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  // Drag & Drop State
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);

  const selectedSlideIndex = slides.findIndex(s => s.id === selectedSlideId);
  const selectedSlide = slides[selectedSlideIndex];

  // Update handlers
  const textUpdate = (text: string) => {
    if (!selectedSlide) return;
    const newSlides = [...slides];
    newSlides[selectedSlideIndex] = { ...selectedSlide, text };
    setSlides(newSlides);
  };

  const layoutUpdate = (layout: Slide['layout']) => {
    if (!selectedSlide) return;
    const newSlides = [...slides];
    newSlides[selectedSlideIndex] = { ...selectedSlide, layout };
    setSlides(newSlides);
  };

  const alignmentUpdate = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedSlide) return;
    const newSlides = [...slides];
    newSlides[selectedSlideIndex] = { ...selectedSlide, alignment };
    setSlides(newSlides);
  }

  const handleAddSlideOption = (type: 'editor' | 'gallery' | 'blank') => {
    setShowAddMenu(false);
    if (type === 'editor') {
      onBack(); // Go back to editor
    } else if (type === 'blank') {
      const newSlide: Slide = {
        id: Date.now().toString(),
        imageUrl: '', // Blank placeholder
        layout: 'classic',
        text: 'Novo Slide',
        alignment: 'center'
      };
      setSlides(s => [...s, newSlide]);
    } else {
      setShowLibraryModal(true);
    }
  };

  const handleLibrarySelect = (url: string) => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      imageUrl: url,
      layout: 'classic',
      text: '',
      alignment: 'center'
    };
    setSlides(s => [...s, newSlide]);
    setShowLibraryModal(false);
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSlideIndex === null || draggedSlideIndex === index) return;
    const newSlides = [...slides];
    const draggedItem = newSlides[draggedSlideIndex];
    newSlides.splice(draggedSlideIndex, 1);
    newSlides.splice(index, 0, draggedItem);
    setSlides(newSlides);
    setDraggedSlideIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedSlideIndex(null);
  };

  const handleCancel = () => {
    if (confirm("Você tem certeza? Alterações não salvas serão perdidas.")) {
      setSlides([]); // Or logic to exit completely
      onBack();
    }
  };

  // Export Logic
  const handleExport = async (format: 'pdf' | 'zip') => {
    if (slides.length === 0) return;
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1080, 1080] });
        for (let i = 0; i < slides.length; i++) {
          if (i > 0) doc.addPage();
          if (slides[i].imageUrl) {
            doc.addImage(slides[i].imageUrl, 'PNG', 0, 0, 1080, 1080);
          } else {
            doc.setFillColor(20, 20, 40);
            doc.rect(0, 0, 1080, 1080, 'F');
          }

          if (slides[i].text) {
            doc.setFontSize(40);
            doc.setTextColor(255, 255, 255);
            // Simple positioning based on alignment
            const x = slides[i].alignment === 'center' ? 540 : slides[i].alignment === 'right' ? 1000 : 80;
            const align = slides[i].alignment || 'left';
            doc.text(slides[i].text || '', x, 540, { align });
          }
        }
        doc.save('my-cosmic-carousel.pdf');
      } else if (format === 'zip') {
        const zip = new JSZip();
        // ... (Zip logic same as before)
        const promises = slides.map(async (slide, i) => {
          if (!slide.imageUrl) return; // Skip blank if no image
          const response = await fetch(slide.imageUrl);
          const blob = await response.blob();
          zip.file(`slide-${i + 1}.png`, blob);
        });
        await Promise.all(promises);
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "cosmic-carousel.zip";
        a.click();
      }
    } catch (e) {
      console.error(e);
      alert("Erro na exportação.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-h-screen bg-[#050510] text-white">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Header */}
      <div className="w-full flex justify-between items-center py-6 px-8 flex-shrink-0">

        <button onClick={onBack} className="flex items-center text-blue-400 font-medium hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Voltar</span>
        </button>
        <h1 className="text-xl font-medium tracking-wide">Criador de Carrossel</h1>
        <button onClick={handleCancel} className="text-blue-400 font-medium hover:text-white transition-colors">Cancelar</button>
      </div>

      {/* Slide Reel (Top) */}
      <div className="w-full overflow-x-auto px-8 pb-8 pt-2 custom-scrollbar flex-shrink-0">
        <div className="flex items-center gap-4 mx-auto w-max">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex flex-col items-center gap-3 group relative"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div
                onClick={() => setSelectedSlideId(slide.id)}
                className={`w-32 aspect-square rounded-2xl bg-[#1a1a2e] border-2 transition-all cursor-pointer relative overflow-hidden ${selectedSlideId === slide.id ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/10 hover:border-white/30'}`}
              >
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#111122]"><span className="text-xs text-gray-500">Vazio</span></div>
                )}

                {/* Mini Layout Preview Overlay */}
                {slide.layout === 'text-image' && <div className="absolute inset-0 bg-black/50 flex items-end p-2"><div className="w-full h-2 bg-white/30 rounded"></div></div>}

                <button
                  onClick={(e) => { e.stopPropagation(); const n = [...slides]; n.splice(index, 1); setSlides(n); }}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-10"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Reorder Handle & Label */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">Slide {index + 1}</span>
                <GripVertical className="w-3 h-3 text-gray-600 cursor-move" />
              </div>
            </div>
          ))}

          {/* Add Slide Card */}
          <div className="flex flex-col items-center gap-3 relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-32 aspect-square rounded-2xl bg-[#111122] border border-white/10 hover:border-blue-500/50 hover:bg-white/5 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full group-hover:scale-110 transition-transform shadow-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-blue-400 font-medium">Adicionar Slide</span>
            </button>

            {showAddMenu && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-[#111122] border border-white/10 rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button onClick={() => handleAddSlideOption('editor')} className="px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Usar IA (Editor)</button>
                <button onClick={() => handleAddSlideOption('gallery')} className="px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-blue-400" /> Importar Galeria</button>
                <button onClick={() => handleAddSlideOption('blank')} className="px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Slide em Branco</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 bg-[#0a0a16] border-t border-white/5 p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto custom-scrollbar pb-40">

        {/* Left Column: Layouts */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#111122] p-1 rounded-xl w-max">
            <button onClick={() => setActiveTab('layout')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'layout' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Layouts de Slide</button>
            <button onClick={() => setActiveTab('transition')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'transition' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Transições</button>
            <button onClick={() => setActiveTab('export')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'export' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Exportar</button>
          </div>

          {activeTab === 'layout' ? (
            <>
              {/* Layout Grid */}
              <div className="grid grid-cols-4 gap-4">
                {/* Classic */}
                <button
                  onClick={() => layoutUpdate('classic')}
                  className={`flex flex-col gap-2 group ${selectedSlide?.layout === 'classic' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`aspect-video w-full rounded-xl bg-[#1a1a2e] border-2 flex items-center justify-center p-3 ${selectedSlide?.layout === 'classic' ? 'border-blue-500' : 'border-white/10'}`}>
                    <div className="w-full h-full bg-white/5 rounded border border-white/10"></div>
                  </div>
                  <span className="text-[10px] text-center text-gray-400">Modelo Clássico</span>
                </button>

                {/* Text & Image */}
                <button
                  onClick={() => layoutUpdate('text-image')}
                  className={`flex flex-col gap-2 group ${selectedSlide?.layout === 'text-image' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`aspect-video w-full rounded-xl bg-[#1a1a2e] border-2 flex p-2 gap-2 ${selectedSlide?.layout === 'text-image' ? 'border-blue-500' : 'border-white/10'}`}>
                    <div className="w-1/2 h-full bg-white/5 rounded"></div>
                    <div className="w-1/2 flex flex-col gap-1">
                      <div className="w-full h-2 bg-white/20 rounded"></div>
                      <div className="w-2/3 h-2 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-center text-gray-400">Texto e Imagem</span>
                </button>

                {/* Quote */}
                <button
                  onClick={() => layoutUpdate('quote')}
                  className={`flex flex-col gap-2 group ${selectedSlide?.layout === 'quote' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`aspect-video w-full rounded-xl bg-[#1a1a2e] border-2 flex flex-col items-center justify-center p-2 ${selectedSlide?.layout === 'quote' ? 'border-blue-500' : 'border-white/10'}`}>
                    <span className="text-white/20 text-xl font-serif">"</span>
                    <div className="w-3/4 h-1 bg-white/20 rounded mt-1"></div>
                  </div>
                  <span className="text-[10px] text-center text-gray-400">Citação</span>
                </button>

                {/* List */}
                <button
                  onClick={() => layoutUpdate('list')}
                  className={`flex flex-col gap-2 group ${selectedSlide?.layout === 'list' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`aspect-video w-full rounded-xl bg-[#1a1a2e] border-2 flex flex-col justify-center p-3 gap-1.5 ${selectedSlide?.layout === 'list' ? 'border-blue-500' : 'border-white/10'}`}>
                    {[1, 2].map(i => <div key={i} className="w-full h-1.5 bg-white/10 rounded"></div>)}
                  </div>
                  <span className="text-[10px] text-center text-gray-400">Lista</span>
                </button>
              </div>

              {/* Controls */}
              <div className="flex gap-4 items-center mt-4">
                <div className="flex bg-[#111122] rounded-lg p-1 border border-white/5">
                  <button onClick={() => alignmentUpdate('left')} className={`p-2 rounded hover:text-white transition-all ${selectedSlide?.alignment === 'left' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}><AlignLeft className="w-4 h-4" /></button>
                  <button onClick={() => alignmentUpdate('center')} className={`p-2 rounded hover:text-white transition-all ${!selectedSlide?.alignment || selectedSlide?.alignment === 'center' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}><AlignCenter className="w-4 h-4" /></button>
                  <button onClick={() => alignmentUpdate('right')} className={`p-2 rounded hover:text-white transition-all ${selectedSlide?.alignment === 'right' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}><AlignRight className="w-4 h-4" /></button>
                </div>

                <button
                  onClick={() => setShowTextEditor(true)}
                  className="flex-1 py-3 rounded-xl border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Personalizar
                </button>
              </div>
            </>
          ) : activeTab === 'transition' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Transições Entre Slides</h3>
                <button className="text-xs text-purple-400 flex items-center gap-1"><Settings className="w-3 h-3" /> Configurações</button>
              </div>
              <div className="flex gap-3">
                {['smooth', 'fade', 'zoom'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTransition(t as any)}
                    className={`flex-1 py-4 rounded-xl border text-sm font-medium capitalize transition-all ${transition === t ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/10 bg-[#111122] text-gray-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="bg-[#111122] p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Duração</span>
                  <span>{transitionDuration}s</span>
                </div>
                <input
                  type="range"
                  min="0.1" max="2.0" step="0.1"
                  value={transitionDuration}
                  onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Exportar Projeto</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleExport('zip')} className="flex items-center gap-3 p-4 bg-[#111122] border border-white/10 rounded-2xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group">
                  <Instagram className="w-6 h-6 text-pink-500" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white">Instagram</span>
                </button>
                <button onClick={() => handleExport('zip')} className="flex items-center gap-3 p-4 bg-[#111122] border border-white/10 rounded-2xl hover:border-blue-600/50 hover:bg-blue-600/5 transition-all group">
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white">Facebook</span>
                </button>
                <button onClick={() => handleExport('pdf')} className="flex items-center gap-3 p-4 bg-[#111122] border border-white/10 rounded-2xl hover:border-blue-400/50 hover:bg-blue-400/5 transition-all group">
                  <Cloud className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white">Google Drive</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-4 bg-[#111122] border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                  <span className="text-xs font-medium">Mais Opções</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Preview */}
        <div className="bg-[#111122] rounded-3xl border border-white/5 p-8 flex items-center justify-center relative overflow-hidden shadow-2xl">
          {selectedSlide ? (
            <div
              className="aspect-square h-full max-h-[500px] bg-black shadow-2xl relative overflow-hidden group"
              style={{
                textAlign: selectedSlide.alignment || 'left' // Apply alignment
              }}
            >
              {selectedSlide.imageUrl ? (
                <img src={selectedSlide.imageUrl} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}

              {/* Layout Rendering Logic */}
              {selectedSlide.layout === 'text-image' && (
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent">
                  <h2 className="text-4xl font-bold text-white mb-4">{selectedSlide.text || 'Seu Texto Aqui'}</h2>
                </div>
              )}

              {selectedSlide.layout === 'quote' && (
                <div className="absolute inset-0 p-12 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="text-center">
                    <span className="text-6xl font-serif text-white/40">"</span>
                    <p className="text-3xl font-serif italic text-white my-4 leading-relaxed">{selectedSlide.text || 'Citação inspiradora...'}</p>
                  </div>
                </div>
              )}

              {selectedSlide.layout === 'list' && (
                <div className="absolute inset-0 p-8 flex items-center bg-black/40 backdrop-blur-sm">
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">1</div>
                      <div className="h-4 bg-white/20 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">2</div>
                      <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              )}

              {selectedSlide.layout === 'classic' && selectedSlide.text && (
                <div className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-md p-6 rounded-xl border border-white/10">
                  <p className="text-xl text-white font-medium">{selectedSlide.text}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Selecione um slide</div>
          )}
        </div>

      </div>

      {/* Bottom Save Button */}
      <div className="p-6 pb-24 md:pb-6 flex justify-center bg-[#050510] border-t border-white/5 flex-shrink-0">
        <button onClick={() => alert("Projeto Salvo!")} className="w-full max-w-sm py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] transition-all transform hover:scale-105">
          Salvar Projeto
        </button>
      </div>

      <LibraryImportModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelect={handleLibrarySelect}
        initialFilter="image"
      />

      {/* Simple Text Editor Modal */}
      {showTextEditor && selectedSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#111122] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Editar Texto do Slide</h3>
              <button onClick={() => setShowTextEditor(false)}><X className="w-5 h-5" /></button>
            </div>
            <textarea
              value={selectedSlide.text || ''}
              onChange={(e) => textUpdate(e.target.value)}
              className="w-full h-40 bg-[#0d0d1a] rounded-xl p-4 text-white resize-none outline-none focus:ring-2 ring-blue-500 border border-white/5"
              placeholder="Digite seu texto aqui..."
              autoFocus
            />
            <button
              onClick={() => setShowTextEditor(false)}
              className="w-full mt-4 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselCreator;
