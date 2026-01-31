
import { CloudIcon, CodeBracketIcon, BookOpenIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { ResourceLink } from '../resourceLibrary';

export const GOOGLE_API_RESOURCES: ResourceLink[] = [
    {
        id: 'google-ai-gemini-docs',
        title: 'Documentação Gemini API',
        description: 'Guia oficial completo da API Google Gemini. Tutoriais, referência de API e guias de início rápido.',
        url: 'https://ai.google.dev/gemini-api/docs?hl=pt-br',
        category: 'ai',
        icon: BookOpenIcon,
        tags: ['google', 'api', 'gemini', 'docs']
    },
    {
        id: 'google-ai-studio',
        title: 'Google AI Studio',
        description: 'Prototipagem rápida com modelos Gemini. Crie prompts, teste modelos e gere chaves de API.',
        url: 'https://aistudio.google.com/',
        category: 'ai',
        icon: CpuChipIcon,
        tags: ['google', 'studio', 'prototyping']
    },
    {
        id: 'google-cloud-console',
        title: 'Google Cloud Console',
        description: 'Gerencie seus projetos, faturamento e cotas da API.',
        url: 'https://console.cloud.google.com/',
        category: 'code',
        icon: CloudIcon,
        tags: ['google', 'cloud', 'console']
    },
    {
        id: 'google-genai-sdk-js',
        title: 'Google GenAI SDK (Node/Web)',
        description: 'Repositório oficial do SDK JavaScript para integração com Gemini.',
        url: 'https://www.npmjs.com/package/@google/generative-ai',
        category: 'code',
        icon: CodeBracketIcon,
        tags: ['google', 'sdk', 'javascript']
    }
];
