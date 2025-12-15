import React from 'react';
import {
    FolderIcon,
    CodeBracketIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface FolderAudit {
    name: string;
    function: string;
    language: string;
    health: 'Execelente' | 'Bom' | 'Regular' | 'Crítico';
    details: string;
}

const auditData: FolderAudit[] = [
    {
        name: 'src/components',
        function: 'Biblioteca de UI e Features modulares',
        language: 'TypeScript (React)',
        health: 'Bom',
        details: 'Estrutura sólida dividida em "ui" (atomos), "layout" (estruturas) e "features" (funcionalidades). Recomendação: Manter "ui" puramente visual sem lógica de negócio.'
    },
    {
        name: 'src/pages',
        function: 'Controladores de Rota e Visões Principais',
        language: 'TypeScript (React)',
        health: 'Regular',
        details: 'Arquivos como "Chatbot.tsx" e "Settings.tsx" estão grandes (God Components). Recomendação: Extrair lógicas complexas para custom hooks e sub-componentes em "components/features".'
    },
    {
        name: 'src/services',
        function: 'Camada de Integração e Regras de Negócio',
        language: 'TypeScript',
        health: 'Execelente',
        details: 'Muito bem modularizado (ai, core, media). Separação clara entre chamadas de API e UI. A remoção do módulo "admin" limpou dependências legadas.'
    },
    {
        name: 'src/hooks',
        function: 'Lógica React Reutilizável',
        language: 'TypeScript',
        health: 'Bom',
        details: 'Hooks úteis e bem tipados. Poderia receber mais lógicas extraídas das Pages para melhorar a testabilidade.'
    },
    {
        name: 'src/contexts',
        function: 'Gerenciamento de Estado Global',
        language: 'TypeScript (React)',
        health: 'Bom',
        details: 'Uso correto da API de Contexto para Temas, Toast e Notificações. Evita Prop Drilling.'
    },
    {
        name: 'src/types',
        function: 'Definições de Tipos TypeScript',
        language: 'TypeScript',
        health: 'Regular',
        details: 'Centralizado em um único arquivo (types.ts). À medida que o app cresce, recomenda-se dividir em arquivos por domínio (ex: types/chat.ts, types/user.ts).'
    },
    {
        name: 'src/utils',
        function: 'Funções Auxiliares Puras',
        language: 'TypeScript',
        health: 'Bom',
        details: 'Helpers focados e sem efeitos colaterais. "secureStorage.ts" é uma boa prática para dados sensíveis locais.'
    },
    {
        name: 'src/constants',
        function: 'Constantes e Configurações',
        language: 'TypeScript',
        health: 'Bom',
        details: 'Centraliza magic numbers e strings. Considere dividir se a lista de prompts ou modelos de IA crescer muito.'
    }
];

const CodeAudit: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <CpuChipIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-title">Auditoria de Código do Sistema</h1>
                    <p className="text-muted">Relatório gerado automaticamente pela IA de análise.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auditData.map((item, idx) => (
                    <div key={idx} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-primary font-mono text-sm bg-primary/5 px-2 py-1 rounded">
                                <FolderIcon className="w-4 h-4" />
                                {item.name}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.health === 'Execelente' ? 'bg-green-100 text-green-700' :
                                item.health === 'Bom' ? 'bg-blue-100 text-blue-700' :
                                    item.health === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {item.health}
                            </span>
                        </div>

                        <h3 className="font-semibold text-title mb-2 flex items-center gap-2">
                            <CodeBracketIcon className="w-4 h-4 text-muted" />
                            {item.language}
                        </h3>

                        <p className="text-sm text-body mb-4 h-11 overflow-hidden">
                            {item.function}
                        </p>

                        <div className={`p-3 rounded-lg text-xs leading-relaxed ${item.health === 'Crítico' ? 'bg-red-50 text-red-800' :
                            'bg-background text-muted'
                            }`}>
                            <strong>Análise:</strong> {item.details}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CodeAudit;
