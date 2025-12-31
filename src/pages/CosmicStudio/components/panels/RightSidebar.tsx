import React, { useState } from 'react';
import { Layers, Sliders, Wand2, Settings2, Plus, BarChart, Activity, Palette } from 'lucide-react';
import { Layer, AdjustmentLayer, LevelValues, HSLValues, TextLayer, CurvesValues } from '../../engine/types';
import { CosmicEngineContext } from '../../hooks/useCosmicEngine';

// Child Panels
import LayersPanel from './LayersPanel';
import AdjustmentPanel from './AdjustmentPanel';
import FiltersPanel from './FiltersPanel';

interface RightSidebarProps {
    engine: CosmicEngineContext;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ engine }) => {
    const [activeTab, setActiveTab] = useState<'layers' | 'properties' | 'filters'>('layers');

    const selectedLayer = engine.layers.find((l: Layer) => l.id === engine.selectedLayerId);

    const handleApplyFilter = (type: string, value: number) => {
        // Helper to add adjustment
        const newLayer: AdjustmentLayer = {
            id: Date.now().toString(),
            type: 'adjustment',
            name: `Filtro: ${type}`,
            visible: true,
            opacity: 1,
            adjustmentType: type as AdjustmentLayer['adjustmentType'],
            value: value
        };
        engine.addLayer(newLayer);
        setActiveTab('layers'); // Switch to layers to show it happened
    };

    const handleAddAdjustment = (type: 'levels' | 'curves' | 'hsl') => {
        let val: LevelValues | CurvesValues | HSLValues | number = 0;
        if (type === 'levels') {
            val = {
                inputShadow: 0,
                inputHighlight: 255,
                midtone: 1.0,
                outputShadow: 0,
                outputHighlight: 255,
                channel: 'RGB'
            } as LevelValues;
        } else if (type === 'curves') {
            val = { points: [], channel: 'RGB' } as CurvesValues;
        } else if (type === 'hsl') {
            val = {
                hue: 0,
                saturation: 1,
                lightness: 1
            } as HSLValues;
        }

        const newLayer: AdjustmentLayer = {
            id: Date.now().toString(),
            type: 'adjustment',
            name: type === 'levels' ? 'Níveis' : type === 'hsl' ? 'Cor HSL' : 'Curvas',
            visible: true,
            opacity: 1,
            adjustmentType: type,
            value: val
        };
        engine.addLayer(newLayer);
        // Force switch to properties to edit it immediately
        setTimeout(() => setActiveTab('properties'), 100);
    };

    return (
        <div className="w-full border-l border-white/10 bg-[#111122] flex flex-col h-full">
            {/* Tab Header */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 hover:bg-white/5 transition-colors relative ${activeTab === 'layers' ? 'text-white' : 'text-gray-500'}`}
                >
                    <Layers size={14} /> Camadas
                    {activeTab === 'layers' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('filters')}
                    className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 hover:bg-white/5 transition-colors relative ${activeTab === 'filters' ? 'text-white' : 'text-gray-500'}`}
                >
                    <Wand2 size={14} /> Filtros
                    {activeTab === 'filters' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 hover:bg-white/5 transition-colors relative ${activeTab === 'properties' ? 'text-white' : 'text-gray-500'}`}
                >
                    <Settings2 size={14} /> Ajustes
                    {activeTab === 'properties' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden p-4 relative">

                {activeTab === 'layers' && (
                    <div className="flex flex-col h-full">
                        <div className="px-4 py-3 border-b border-white/5 grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleAddAdjustment('levels')}
                                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <BarChart size={12} className="text-green-400" /> Níveis
                            </button>
                            <button
                                onClick={() => handleAddAdjustment('hsl')}
                                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <Palette size={12} className="text-orange-400" /> HSL
                            </button>
                            <button
                                onClick={() => handleAddAdjustment('curves')}
                                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <Activity size={12} className="text-pink-400" /> Curvas
                            </button>
                        </div>
                        <LayersPanel
                            layers={engine.layers}
                            selectedLayerId={engine.selectedLayerId}
                            onSelectLayer={(id) => {
                                engine.updateState({ selectedLayerId: id });
                                // Auto switch to properties if an adjustment or text is clicked
                                const layer = engine.layers.find((l: Layer) => l.id === id);
                                if (layer && (layer.type === 'adjustment' || layer.type === 'text')) {
                                    setActiveTab('properties');
                                }
                            }}
                            onUpdateLayer={engine.updateLayer}
                            onRemoveLayer={engine.removeLayer}
                        />
                    </div>
                )}

                {activeTab === 'filters' && (
                    <FiltersPanel onApplyFilter={handleApplyFilter} />
                )}

                {activeTab === 'properties' && (
                    <div className="h-full bg-black/20 rounded-xl border border-white/5 p-4 overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sliders size={12} /> Propriedades da Camada
                        </h3>

                        {(() => {
                            if (!selectedLayer) return <div className="text-xs text-gray-600 text-center py-10">Selecione uma camada para ver propriedades</div>;

                            if (selectedLayer.type === 'adjustment') {
                                return (
                                    <AdjustmentPanel
                                        layer={selectedLayer as AdjustmentLayer}
                                        onUpdate={(u) => engine.updateLayer(selectedLayer.id, u)}
                                    />
                                );
                            }
                            if (selectedLayer.type === 'text') {
                                return (
                                    <div className="space-y-4">
                                        <span className="text-sm text-white font-medium">Editar Texto</span>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Conteúdo</label>
                                            <input
                                                type="text"
                                                value={(selectedLayer as TextLayer).text}
                                                onChange={(e) => engine.updateLayer(selectedLayer.id, { text: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Cor</label>
                                                <input
                                                    type="color"
                                                    value={(selectedLayer as TextLayer).color}
                                                    onChange={(e) => engine.updateLayer(selectedLayer.id, { color: e.target.value })}
                                                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/10"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Tam. Fonte</label>
                                                <input
                                                    type="number"
                                                    value={(selectedLayer as TextLayer).fontSize}
                                                    onChange={(e) => engine.updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            // Image Properties - Opacity
                            return (
                                <div className="space-y-4">
                                    <span className="text-sm text-white font-medium">{selectedLayer.name}</span>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase block mb-1">Opacidade</label>
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            value={selectedLayer.opacity}
                                            onChange={(e) => engine.updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                                            className="w-full accent-purple-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                            <span>0%</span>
                                            <span>{Math.round(selectedLayer.opacity * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

            </div>
        </div>
    );
};

export default RightSidebar;
