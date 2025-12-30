
export * from './ParallaxExplosionTemplate';
export * from './QuantumTimelineTemplate';
export * from './FeatureStepsTemplate';
export * from './EarbudShowcaseTemplate';
export * from './ShootingStarsTemplate';
export * from './GradientCardTemplate';
export * from './VerticalImageStackTemplate';
export * from './BackgroundGradientTemplate';

import { ParallaxExplosionTemplate } from './ParallaxExplosionTemplate';
import { QuantumTimeline } from './QuantumTimelineTemplate';
import { FeatureSteps } from './FeatureStepsTemplate';
import EarbudShowcaseTemplate from './EarbudShowcaseTemplate';
import { ShootingStarsTemplate } from './ShootingStarsTemplate';
import { GradientCardTemplate } from './GradientCardTemplate';
import { VerticalImageStackTemplate } from './VerticalImageStackTemplate';
import { BackgroundGradientTemplate } from './BackgroundGradientTemplate';

export interface VisualTemplateMeta {
    id: string;
    name: string;
    description: string;
    component: React.ComponentType<any>;
    defaultProps?: any;
    thumbnail?: string; // We can add an image URL later
    type: 'visual_template';
}

export const VISUAL_TEMPLATES: VisualTemplateMeta[] = [
    {
        id: 'parallax-explosion',
        name: 'Explosão Parallax',
        description: 'Efeito visual com camadas flutuantes e animações explosivas.',
        component: ParallaxExplosionTemplate,
        defaultProps: {
            items: [
                {
                    id: '1',
                    title: 'Neon Genesis',
                    description: 'A cyberpunk reality where light defines form.',
                    color: 'from-pink-500 to-purple-600',
                },
                {
                    id: '2',
                    title: 'Azure Depth',
                    description: 'Plunge into the digital abyss of infinite knowledge.',
                    color: 'from-blue-400 to-cyan-500',
                },
                {
                    id: '3',
                    title: 'Solar Flare',
                    description: 'Explosive energy tailored to ignite your brand.',
                    color: 'from-orange-500 to-red-600',
                },
            ],
            title: "Template Demo",
            subtitle: "Visualização do template"
        },
        type: 'visual_template'
    },
    {
        id: 'quantum-timeline',
        name: 'Quantum Timeline',
        description: 'Linha do tempo interativa e futurista para exibir processos ou roteiros.',
        component: QuantumTimeline,
        defaultProps: {},
        type: 'visual_template'
    },
    {
        id: 'feature-steps',
        name: 'Passo a Passo com Destaque',
        description: 'Exiba etapas de um processo com imagens alternadas e autoplay.',
        component: FeatureSteps,
        defaultProps: {
            title: "Como Começar"
        },
        type: 'visual_template'
    },
    {
        id: 'earbud-showcase',
        name: 'Earbud Showcase',
        description: 'Apresentação interativa de produto com troca de lados e detalhes técnicos.',
        component: EarbudShowcaseTemplate,
        defaultProps: {},
        type: 'visual_template'
    },
    {
        id: 'shooting-stars',
        name: 'Shooting Stars',
        description: 'Fundo espacial com estrelas cadentes animadas ideal para heros.',
        component: ShootingStarsTemplate,
        defaultProps: {},
        type: 'visual_template'
    },
    {
        id: 'gradient-card',
        name: '3D Gradient Card',
        description: 'Card 3D futurista com bordas vibrantes e efeito de ruído.',
        component: GradientCardTemplate,
        defaultProps: {},
        type: 'visual_template'
    },
    {
        id: 'vertical-stack',
        name: 'Vertical Image Stack',
        description: 'Galeria vertical com empilhamento dinâmico e efeitos de scroll.',
        component: VerticalImageStackTemplate,
        defaultProps: {},
        type: 'visual_template'
    },
    {
        id: 'background-gradient',
        name: 'Neon Background Gradient',
        description: 'Fundo com gradientes de neon em movimento para destaque.',
        component: BackgroundGradientTemplate,
        defaultProps: {},
        type: 'visual_template'
    }
];
