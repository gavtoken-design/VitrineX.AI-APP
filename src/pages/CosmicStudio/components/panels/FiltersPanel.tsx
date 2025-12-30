import React from 'react';
import { Wand2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface FilterPreset {
    name: string;
    previewColor: string;
    apply: () => void;
}

interface FiltersPanelProps {
    onApplyFilter: (type: string, value: number) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onApplyFilter }) => {

    const presets: FilterPreset[] = [
        {
            name: 'Preto & Branco',
            previewColor: '#333',
            apply: () => onApplyFilter('grayscale', 100)
        },
        {
            name: 'Sépia (Vintage)',
            previewColor: '#704214',
            apply: () => onApplyFilter('sepia', 80)
        },
        {
            name: 'Alta Saturação',
            previewColor: '#ff0055',
            apply: () => onApplyFilter('saturation', 180)
        },
        {
            name: 'Desbotado',
            previewColor: '#8899aa',
            apply: () => onApplyFilter('saturation', 60)
        },
        {
            name: 'Cyberpunk',
            previewColor: '#00ffcc',
            apply: () => {
                onApplyFilter('hue', 180);
                onApplyFilter('contrast', 120);
            }
        },
        {
            name: 'Drama',
            previewColor: '#000022',
            apply: () => {
                onApplyFilter('contrast', 150);
                onApplyFilter('brightness', 90);
            }
        },
        {
            name: 'Blur Suave',
            previewColor: '#ffffff44',
            apply: () => onApplyFilter('blur', 2)
        },
    ];

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2 mb-2 text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Filtros & Presets</span>
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-20">
                {presets.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={preset.apply}
                        className="group relative h-20 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500 transition-all text-left"
                    >
                        <div
                            className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
                            style={{ backgroundColor: preset.previewColor }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="text-xs font-medium text-white shadow-sm">{preset.name}</span>
                        </div>

                        {/* Hover Effect Icon */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Wand2 className="w-3 h-3 text-white" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                <p>Dica: Os filtros são adicionados como <strong>Camadas de Ajuste</strong>. Você pode combinar vários e editar a intensidade de cada um no painel de Camadas.</p>
            </div>
        </div>
    );
};

export default FiltersPanel;
