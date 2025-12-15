import * as React from 'react';
import { AdminConfig } from '../../types';
import {
    PhotoIcon,
    VideoCameraIcon,
    SpeakerWaveIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    SparklesIcon,
    MegaphoneIcon,
    CalendarIcon,
    CircleStackIcon,
    MicrophoneIcon,
    PaperClipIcon,
    PaintBrushIcon
} from '@heroicons/react/24/outline';

interface FeatureControlPanelProps {
    config: AdminConfig;
    onToggle: (feature: keyof AdminConfig['features']) => void;
}

const FeatureControlPanel: React.FC<FeatureControlPanelProps> = ({ config, onToggle }) => {

    const featureGroups = [
        {
            title: 'Geração de IA',
            icon: SparklesIcon,
            features: [
                { key: 'imageGenerationEnabled' as const, label: 'Geração de Imagem', desc: 'Imagen 3 & Flash', icon: PhotoIcon },
                { key: 'videoGenerationEnabled' as const, label: 'Geração de Vídeo', desc: 'Veo 2 (Premium)', icon: VideoCameraIcon },
                { key: 'audioGenerationEnabled' as const, label: 'Geração de Áudio', desc: 'TTS Gemini', icon: SpeakerWaveIcon },
                { key: 'textGenerationEnabled' as const, label: 'Geração de Texto', desc: 'Gemini 2.5', icon: DocumentTextIcon },
            ]
        },
        {
            title: 'Ferramentas & Módulos',
            icon: MegaphoneIcon,
            features: [
                { key: 'trendHunterEnabled' as const, label: 'Caçador de Tendências', desc: 'Google Search Grounding', icon: MagnifyingGlassIcon },
                { key: 'chatbotEnabled' as const, label: 'Chat IA', desc: 'Assistente conversacional', icon: ChatBubbleLeftRightIcon },
                { key: 'creativeStudioEnabled' as const, label: 'Estúdio Criativo', desc: 'Editor multimodal', icon: SparklesIcon },
                { key: 'adStudioEnabled' as const, label: 'Estúdio de Anúncios', desc: 'Criação de ads', icon: MegaphoneIcon },
                { key: 'smartSchedulerEnabled' as const, label: 'Agenda Inteligente', desc: 'Calendário visual', icon: CalendarIcon },
            ]
        },
        {
            title: 'Features Avançadas',
            icon: CircleStackIcon,
            features: [
                { key: 'ragKnowledgeBaseEnabled' as const, label: 'RAG (Base de Conhecimento)', desc: 'Consulta de dados vectorizados', icon: CircleStackIcon },
                { key: 'voiceInputEnabled' as const, label: 'Entrada de Voz', desc: 'Microfone para chat', icon: MicrophoneIcon },
                { key: 'multimodalChatEnabled' as const, label: 'Chat Multimodal', desc: 'Anexar imagens', icon: PaperClipIcon },
                { key: 'brandLogoManagerEnabled' as const, label: 'Gerenciador de Logo', desc: 'Watermark automático', icon: PaintBrushIcon },
            ]
        },
    ];

    return (
        <div className="space-y-6">
            {featureGroups.map((group, idx) => {
                const GroupIcon = group.icon;
                return (
                    <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center gap-2">
                            <GroupIcon className="w-4 h-4" /> {group.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.features.map((feature) => {
                                const FeatureIcon = feature.icon;
                                const isEnabled = config.features[feature.key];
                                return (
                                    <div
                                        key={feature.key}
                                        className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between group hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <FeatureIcon className={`w-5 h-5 ${isEnabled ? 'text-green-400' : 'text-gray-600'}`} />
                                            <div>
                                                <span className="text-sm font-medium text-gray-300 block">{feature.label}</span>
                                                <span className="text-xs text-gray-600">{feature.desc}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onToggle(feature.key)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-green-600' : 'bg-gray-700'
                                                }`}
                                            title={isEnabled ? 'Clique para desativar' : 'Clique para ativar'}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FeatureControlPanel;
