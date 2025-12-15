import * as React from 'react';
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
    CreditCardIcon,
    PencilIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PlanConfig {
    name: string;
    status: 'ATIVO' | 'INATIVO' | 'TRIAL';
    price: string;
    originalPrice: string;
    features: string[];
}

const DEFAULT_PLAN: PlanConfig = {
    name: 'Plano Pro (Early Adopter)',
    status: 'ATIVO',
    price: 'R$ 148,90',
    originalPrice: 'R$ 197,00',
    features: [
        'Acesso Ilimitado ao TrendHunter Deeper',
        'Geração de Vídeo (Veo) & Imagens 4K',
        'Modo "Thinking" (Raciocínio Profundo)',
    ],
};

const PlanEditor: React.FC = () => {
    const [planConfig, setPlanConfig] = useState<PlanConfig>(DEFAULT_PLAN);
    const [editing, setEditing] = useState(false);
    const [tempConfig, setTempConfig] = useState<PlanConfig>(DEFAULT_PLAN);
    const { addToast } = useToast();

    useEffect(() => {
        const stored = localStorage.getItem('vitrinex_plan_config');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPlanConfig(parsed);
                setTempConfig(parsed);
            } catch (e) {
                console.error('Failed to parse plan config:', e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('vitrinex_plan_config', JSON.stringify(tempConfig));
        setPlanConfig(tempConfig);
        setEditing(false);
        addToast({ type: 'success', message: 'Configuração de plano atualizada!' });
    };

    const handleCancel = () => {
        setTempConfig(planConfig);
        setEditing(false);
    };

    const addFeature = () => {
        setTempConfig({
            ...tempConfig,
            features: [...tempConfig.features, 'Nova funcionalidade'],
        });
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...tempConfig.features];
        newFeatures[index] = value;
        setTempConfig({ ...tempConfig, features: newFeatures });
    };

    const removeFeature = (index: number) => {
        setTempConfig({
            ...tempConfig,
            features: tempConfig.features.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <CreditCardIcon className="w-6 h-6" /> Editor de Plano/Assinatura
                    </h3>
                    <p className="text-xs text-gray-500">Configure o plano exibido para os clientes</p>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-2 rounded border border-blue-900 text-xs uppercase tracking-wider transition-colors font-bold"
                    >
                        <PencilIcon className="w-4 h-4" /> Editar
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-4">
                    {/* Nome do Plano */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Nome do Plano</label>
                        <input
                            type="text"
                            value={tempConfig.name}
                            onChange={(e) => setTempConfig({ ...tempConfig, name: e.target.value })}
                            className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Status</label>
                        <select
                            value={tempConfig.status}
                            onChange={(e) => setTempConfig({ ...tempConfig, status: e.target.value as PlanConfig['status'] })}
                            className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="ATIVO">ATIVO</option>
                            <option value="INATIVO">INATIVO</option>
                            <option value="TRIAL">TRIAL</option>
                        </select>
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Preço Atual</label>
                            <input
                                type="text"
                                value={tempConfig.price}
                                onChange={(e) => setTempConfig({ ...tempConfig, price: e.target.value })}
                                className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                placeholder="R$ 148,90"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Preço Original (De:)</label>
                            <input
                                type="text"
                                value={tempConfig.originalPrice}
                                onChange={(e) => setTempConfig({ ...tempConfig, originalPrice: e.target.value })}
                                className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                placeholder="R$ 197,00"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Funcionalidades Incluídas</label>
                        <div className="space-y-2">
                            {tempConfig.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={() => removeFeature(index)}
                                        className="px-3 py-2 bg-red-900/30 text-red-400 border border-red-900 rounded hover:bg-red-900/50 text-xs"
                                    >
                                        Remover
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addFeature}
                                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded text-xs uppercase tracking-wider transition-colors"
                            >
                                + Adicionar Funcionalidade
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 px-4 py-2 rounded border border-green-900 text-xs uppercase tracking-wider transition-colors font-bold"
                        >
                            Salvar Alterações
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded border border-gray-700 text-xs uppercase tracking-wider transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-black p-6 rounded border border-gray-700">
                    {/* Preview */}
                    <div className="mb-4">
                        <h4 className="text-lg font-bold text-white mb-1">{planConfig.name}</h4>
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${planConfig.status === 'ATIVO' ? 'bg-green-900/30 text-green-400 border border-green-900' :
                                planConfig.status === 'TRIAL' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900' :
                                    'bg-red-900/30 text-red-400 border border-red-900'
                            }`}>
                            {planConfig.status}
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{planConfig.price}</span>
                            <span className="text-sm text-gray-500">/mês</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            De: <span className="line-through">{planConfig.originalPrice}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {planConfig.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-3 rounded border border-blue-900 text-sm font-bold uppercase tracking-wider transition-colors">
                        Gerenciar Assinatura
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlanEditor;
