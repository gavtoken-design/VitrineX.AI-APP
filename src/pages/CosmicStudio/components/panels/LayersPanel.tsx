import React from 'react';
import { Layer } from '../../engine/types';
import { Layers, Eye, EyeOff, X, GripVertical, Image as ImageIcon, Type, Sliders } from 'lucide-react';

interface LayersPanelProps {
    layers: Layer[];
    selectedLayerId: string | null;
    onSelectLayer: (id: string) => void;
    onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
    onRemoveLayer: (id: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
    layers,
    selectedLayerId,
    onSelectLayer,
    onUpdateLayer,
    onRemoveLayer
}) => {
    return (
        <div className="bg-[#111122]/90 border border-white/10 rounded-xl p-4 flex flex-col h-full max-h-[300px]">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" /> Camadas
                </h3>
                <span className="text-[10px] text-gray-500">{layers.length} camadas</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {layers.slice().reverse().map((layer) => (
                    <div
                        key={layer.id}
                        onClick={() => onSelectLayer(layer.id)}
                        className={`
              flex items-center gap-2 p-2 rounded-lg border cursor-pointer group transition-all
              ${selectedLayerId === layer.id
                                ? 'bg-purple-900/20 border-purple-500/50'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'}
            `}
                    >
                        <div className="text-gray-500 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-3 h-3" />
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdateLayer(layer.id, { visible: !layer.visible });
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 opacity-50" />}
                        </button>

                        {/* Icon based on Type */}
                        <div className="p-1 rounded bg-black/30">
                            {layer.type === 'image' && <ImageIcon className="w-3 h-3 text-blue-400" />}
                            {layer.type === 'text' && <Type className="w-3 h-3 text-green-400" />}
                            {layer.type === 'adjustment' && <Sliders className="w-3 h-3 text-yellow-400" />}
                        </div>

                        <span className="text-xs text-gray-200 flex-1 truncate select-none">
                            {layer.name}
                        </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveLayer(layer.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {layers.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">
                        Nenhuma camada
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayersPanel;
