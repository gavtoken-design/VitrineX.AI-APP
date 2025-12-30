import React from 'react';
import { AdjustmentLayer, LevelValues, HSLValues } from '../../engine/types';
import { Sliders, Sun, Contrast, Droplets, MoveHorizontal, Waves, Eye, Activity, BarChart, Palette } from 'lucide-react';

interface AdjustmentPanelProps {
    layer: AdjustmentLayer;
    onUpdate: (updates: Partial<AdjustmentLayer>) => void;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ layer, onUpdate }) => {

    const getIcon = () => {
        switch (layer.adjustmentType) {
            case 'brightness': return <Sun className="w-4 h-4 text-yellow-400" />;
            case 'contrast': return <Contrast className="w-4 h-4 text-gray-400" />;
            case 'saturation': return <Droplets className="w-4 h-4 text-blue-400" />;
            case 'hue': return <MoveHorizontal className="w-4 h-4 text-purple-400" />;
            case 'blur': return <Waves className="w-4 h-4 text-white" />;
            default: return <Sliders className="w-4 h-4" />;
        }
    };

    const getLabel = () => {
        switch (layer.adjustmentType) {
            case 'brightness': return 'Brilho';
            case 'contrast': return 'Contraste';
            case 'saturation': return 'Saturação';
            case 'hue': return 'Matiz (Hue)';
            case 'blur': return 'Desfoque';
            case 'sepia': return 'Sépia';
            case 'grayscale': return 'Preto & Branco';
            case 'levels': return 'Níveis (Levels)';
            case 'curves': return 'Curvas';
            default: return layer.adjustmentType;
        }
    };

    const getRange = () => {
        // Return min, max, default
        switch (layer.adjustmentType) {
            case 'hue': return { min: 0, max: 360, step: 1 };
            case 'blur': return { min: 0, max: 20, step: 0.5 };
            case 'brightness':
            case 'contrast':
            case 'saturation':
                return { min: 0, max: 200, step: 1 }; // %
            default: return { min: 0, max: 100, step: 1 };
        }
    };

    const range = getRange();

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                {getIcon()}
                <span className="font-semibold text-sm text-gray-200">{getLabel()}</span>
            </div>

            <div>
                {layer.adjustmentType === 'levels' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-gray-500">Entrada (Preto / Branco)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={(layer.value as LevelValues).inputShadow}
                                    onChange={(e) => onUpdate({ value: { ...(layer.value as LevelValues), inputShadow: Number(e.target.value) } })}
                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-center text-white outline-none focus:border-purple-500"
                                    placeholder="0"
                                />
                                <input
                                    type="number"
                                    value={(layer.value as LevelValues).inputHighlight}
                                    onChange={(e) => onUpdate({ value: { ...(layer.value as LevelValues), inputHighlight: Number(e.target.value) } })}
                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-center text-white outline-none focus:border-purple-500"
                                    placeholder="255"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Gamma (Midtone)</span>
                                <span>{(layer.value as LevelValues).midtone.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="0.1" max="3.0" step="0.1"
                                value={(layer.value as LevelValues).midtone}
                                onChange={(e) => onUpdate({ value: { ...(layer.value as LevelValues), midtone: Number(e.target.value) } })}
                                className="w-full accent-green-500"
                            />
                        </div>
                    </div>
                ) : layer.adjustmentType === 'hsl' ? (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Matiz (Hue)</span>
                                <span>{(layer.value as HSLValues).hue}°</span>
                            </div>
                            <input
                                type="range" min="0" max="360" step="1"
                                value={(layer.value as HSLValues).hue}
                                onChange={(e) => onUpdate({ value: { ...(layer.value as HSLValues), hue: Number(e.target.value) } })}
                                className="w-full h-1 appearance-none rounded cursor-pointer"
                                style={{ background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Saturação</span>
                                <span>{(layer.value as HSLValues).saturation.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="0" max="2" step="0.05"
                                value={(layer.value as HSLValues).saturation}
                                onChange={(e) => onUpdate({ value: { ...(layer.value as HSLValues), saturation: Number(e.target.value) } })}
                                className="w-full accent-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Luminosidade</span>
                                <span>{(layer.value as HSLValues).lightness.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="0" max="2" step="0.05"
                                value={(layer.value as HSLValues).lightness}
                                onChange={(e) => onUpdate({ value: { ...(layer.value as HSLValues), lightness: Number(e.target.value) } })}
                                className="w-full accent-white"
                            />
                        </div>
                    </div>
                ) : layer.adjustmentType === 'curves' ? (
                    <div className="text-xs text-gray-500 p-2 bg-white/5 rounded">
                        ℹ️ Editor de Curvas com pontos de controle será implementado na v2.
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Intensidade</span>
                            <span>{layer.value as number}</span>
                        </div>
                        <input
                            type="range"
                            min={range.min}
                            max={range.max}
                            step={range.step}
                            value={layer.value as number}
                            onChange={(e) => onUpdate({ value: Number(e.target.value) })}
                            className="w-full accent-purple-500"
                        />
                    </>
                )}
            </div>

            <div className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                Esta camada de ajuste afeta todas as camadas abaixo dela (simulação visual).
            </div>
        </div>
    );
};

export default AdjustmentPanel;
