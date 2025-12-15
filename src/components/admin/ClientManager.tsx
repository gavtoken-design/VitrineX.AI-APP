
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { UserProfile } from '../../types';
import {
    UserPlusIcon,
    UsersIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ClientManagerProps {
    users: UserProfile[];
    setUsers: (users: UserProfile[]) => void;
}

function ClientManager({ users, setUsers }: ClientManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const { addToast } = useToast();

    // 2.5 Inicialização via localStorage
    useEffect(() => {
        const storedUsers = localStorage.getItem('vitrinex_users_mock');
        if (storedUsers && (!users || users.length === 0)) {
            try {
                setUsers(JSON.parse(storedUsers));
            } catch (e) {
                console.error('Falha ao carregar usuários localmente', e);
            }
        }
    }, []); // Executa apenas uma vez no mount

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        plan: 'free',
        status: 'active'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            addToast({ type: 'error', message: 'Nome e Email são obrigatórios.' });
            return;
        }



        const planType = formData.plan as 'free' | 'premium' | 'enterprise';


        const newUser: UserProfile = {
            id: `client-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone, // 2.2 Persistência do phone
            plan: planType,
            status: formData.status as 'active' | 'blocked',
            businessProfile: { // Mock business profile
                name: formData.name,
                industry: 'General',
                targetAudience: 'General',
                visualStyle: 'Modern'
            },

        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);

        // Save to localStorage
        localStorage.setItem('vitrinex_users_mock', JSON.stringify(updatedUsers));

        addToast({ type: 'success', message: 'Cliente cadastrado com sucesso!' });
        setIsAdding(false);
        setFormData({ name: '', email: '', phone: '', plan: 'free', status: 'active' });
    }

    const requestDelete = (id: string) => {
        setDeleteConfirmId(id);
        setTimeout(() => setDeleteConfirmId(null), 3000); // Auto cancel after 3s
    };

    const confirmDelete = (id: string) => {
        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem('vitrinex_users_mock', JSON.stringify(updatedUsers));
        addToast({ type: 'info', message: 'Cliente removido.' });
        setDeleteConfirmId(null);
    };

    // 2.6 Otimização de Performance no Filtro com useMemo
    const filteredUsers = React.useMemo(() => {
        return users.filter(user =>
            (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    // 2.7 Normalização de Rótulos
    const planLabels: Record<string, string> = {
        free: 'Gratuito',
        premium: 'Premium',
        enterprise: 'Enterprise'
    };

    const planColors: Record<string, string> = {
        free: 'border-gray-700 text-gray-500',
        premium: 'border-purple-900 text-purple-400 bg-purple-900/10',
        enterprise: 'border-blue-900 text-blue-400 bg-blue-900/10'
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6" /> Gestão de Clientes
                    </h3>
                    <p className="text-xs text-gray-500">Cadastre e gerencie os usuários da plataforma.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 px-4 py-3 md:py-2 rounded border border-green-900 text-xs uppercase tracking-wider transition-colors font-bold"
                    >
                        <UserPlusIcon className="w-4 h-4" /> Cadastrar Cliente
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="bg-black p-6 rounded border border-gray-700 animate-fade-in">
                    <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wide">Novo Cliente</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                    placeholder="Ex: João Silva" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                    placeholder="joao@exemplo.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Plano Inicial</label>
                                <select
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                >
                                    <option value="free">Gratuito</option>
                                    <option value="premium">Premium (Pro)</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Telefone (Opcional)</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                    placeholder="(11) 99999-9999" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-800">
                            <button
                                type="submit"
                                className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 px-4 py-2 rounded border border-green-900 text-xs uppercase tracking-wider transition-colors font-bold"
                            >
                                Salvar Cliente
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded border border-gray-700 text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="mb-4 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white pl-9 pr-4 py-2 text-sm rounded focus:outline-none focus:border-blue-500" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Dados</th>
                                    <th className="px-4 py-3">Plano</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-600">
                                            Nenhum cliente encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-600">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.phone ? (
                                                    <span className="text-xs text-gray-500">{user.phone}</span>
                                                ) : <span className="text-xs text-gray-700">-</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${planColors[user.plan] || planColors.free}`}>
                                                    {planLabels[user.plan] || user.plan}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1.5 text-xs ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                    {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {deleteConfirmId === user.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => confirmDelete(user.id)}
                                                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                                        >
                                                            Confirmar
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => requestDelete(user.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-900/20 rounded transition-colors"
                                                        title="Remover"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ClientManager;
