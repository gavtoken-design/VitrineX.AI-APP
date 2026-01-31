
import {
    CodeBracketIcon,
    PaintBrushIcon,
    SparklesIcon,
    GlobeAltIcon,
    BookOpenIcon,
    CubeTransparentIcon
} from '@heroicons/react/24/outline';

export interface ResourceLink {
    id: string;
    title: string;
    description: string;
    url: string;
    category: 'design' | 'ai' | 'code' | 'marketing';
    icon: any; // HeroIcon or string
    tags: string[];
}

export interface LibraryTemplate {
    id: string;
    title: string;
    description: string;
    content: string; // Code or Prompt or Text
    type: 'prompt' | 'code' | 'structure';
    category: string;
    tags: string[];
}

export const EXTERNAL_RESOURCES: ResourceLink[] = [
    {
        id: 'res-21st',
        title: '21st.dev',
        description: 'A maior biblioteca de componentes React modernos e animações. Ótimo para inspirar novas UI.',
        url: 'https://21st.dev',
        category: 'code',
        icon: CodeBracketIcon,
        tags: ['react', 'ui', 'components', 'tailwind']
    },
    {
        id: 'res-nano-banana',
        title: 'Nano Banana Pro Prompts',
        description: 'Coleção premium de prompts para Google Imagen e Midjourney. Focada em realismo e design.',
        url: 'https://youmind.com/pt-BR/nano-banana-pro-prompts',
        category: 'ai',
        icon: SparklesIcon,
        tags: ['prompts', 'ai', 'imagen', 'midjourney']
    },
    {
        id: 'res-lucide',
        title: 'Lucide Icons',
        description: 'Conjunto de ícones vetoriais modernos e consistentes. A evolução do Feather Icons.',
        url: 'https://lucide.dev',
        category: 'design',
        icon: CubeTransparentIcon,
        tags: ['icons', 'svg', 'design']
    },
    {
        id: 'res-shadcn',
        title: 'shadcn/ui',
        description: 'Componentes reusáveis construídos com Radix UI e Tailwind CSS. O padrão moderno de desenvolvimento.',
        url: 'https://ui.shadcn.com',
        category: 'code',
        icon: CubeTransparentIcon,
        tags: ['components', 'radix', 'accessibility']
    },
    {
        id: 'res-magic-ui',
        title: 'Magic UI',
        description: 'Componentes animados de alta performance para React. Efeitos de brilho, bordas e texto.',
        url: 'https://magicui.design',
        category: 'design',
        icon: PaintBrushIcon,
        tags: ['animation', 'framer-motion', 'effects']
    },
    {
        id: 'res-marketing-examples',
        title: 'Marketing Examples',
        description: 'Estudos de caso reais de copywriting e táticas de marketing que funcionaram.',
        url: 'https://marketingexamples.com',
        category: 'marketing',
        icon: BookOpenIcon,
        tags: ['copywriting', 'growth', 'case-studies']
    }
];

export const CORE_TEMPLATES: LibraryTemplate[] = [
    {
        id: 'tmpl-landing-page-structure',
        title: 'Estrutura Landing Page Alta Conversão',
        description: 'Script base para LP focado em AIDA (Atenção, Interesse, Desejo, Ação).',
        type: 'structure',
        category: 'Marketing',
        tags: ['landing-page', 'copywriting', 'structure'],
        content: `
# Estrutura de Landing Page Vencedora

1. **Hero Section (Atenção)**
   - Headline: [Promessa Principal Clara e Ousada]
   - Sub-headline: [Como funciona + Benefício Chave]
   - CTA (Call to Action): [Botão de Contraste Alto]
   - Prova Social: "Usado por X empresas" ou logos.

2. **Problema/Agitação (Interesse)**
   - "Você está cansado de [Problema]?"
   - Mostre que entende a dor do cliente.

3. **Solução (Desejo)**
   - Apresente seu produto como a única solução viável.
   - Benefícios > Funcionalidades (Ex: "Ganhe tempo" vs "Processador rápido").

4. **Autoridade & Prova Social**
   - Depoimentos reais.
   - Casos de sucesso.
   - Números impactantes.

5. **Oferta Irresistível**
   - O que está incluso?
   - Bônus exclusivo.
   - Garantia de risco zero.

6. **FAQ (Quebra de Objeções)**
   - Responda as 5 principais dúvidas que impedem a compra.

7. **CTA Final**
   - Relembre a urgência e a oferta.
`
    },
    {
        id: 'tmpl-cold-mail',
        title: 'Cold Mail B2B',
        description: 'Template de email para prospecção fria que gera respostas.',
        type: 'prompt',
        category: 'Vendas',
        tags: ['email', 'vendas', 'b2b'],
        content: `
Assunto: Ideia rápida para a [Empresa do Lead]

Olá [Nome do Lead],

Vi que vocês estão focados em [Objetivo Recente da Empresa/Notícia].

Estou entrando em contato porque ajudamos empresas como a [Concorrente/Empresa Similar] a resolver [Problema Específico] usando [Sua Solução], o que resultou em [Resultado Quantitativo].

Vocês estariam abertos a uma conversa de 10 minutos na próxima terça-feira para ver se conseguimos replicar esse resultado para a [Empresa do Lead]?

Abs,
[Seu Nome]
`
    }
];
