import React from 'react';

const StrategicWorkspace: React.FC = () => {
    return (
        <div className="p-8 text-white min-h-screen bg-gray-900">
            <h1 className="text-3xl font-bold mb-4">Espaço Estratégico</h1>
            <p className="text-gray-400">Implemente suas estratégias baseadas nos dados do radar.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Planejamento</h2>
                    <p className="text-sm text-gray-500">Defina os próximos passos da sua campanha.</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">Ações</h2>
                    <p className="text-sm text-gray-500">Liste as ações táticas para execução.</p>
                </div>
            </div>
        </div>
    );
};

export default StrategicWorkspace;
