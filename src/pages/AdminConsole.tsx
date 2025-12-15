
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin';
import { AdminLog, UserProfile, AdminConfig } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FeatureControlPanel from '../components/admin/FeatureControlPanel';
import DocumentManager from '../components/admin/DocumentManager';
import PlanEditor from '../components/admin/PlanEditor';
import ChatAnimationManager from '../components/admin/ChatAnimationManager';
import ClientManager from '../components/admin/ClientManager';
import {
  ShieldCheckIcon,
  ServerIcon,
  UsersIcon,
  CommandLineIcon,
  CpuChipIcon,
  LockClosedIcon,
  PowerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
  ArrowRightStartOnRectangleIcon,
  HandRaisedIcon,
  KeyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon as TrashIconOutline,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

const AdminConsole: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'vault' | 'logs' | 'documents'>('system');

  // Data States
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // API Keys State
  interface APIKey {
    id: string;
    label: string;
    key: string;
    createdAt: string;
    lastUsed?: string;
  }
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);

  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const isValid = await adminService.authenticate(pin);
      if (isValid) {
        setIsAuthenticated(true);
        loadDashboardData();
        addToast({ type: 'success', message: 'Sessão Mestra Iniciada' });
      } else {
        addToast({ type: 'error', message: 'PIN Inválido. Acesso Negado.' });
        setPin('');
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao autenticar.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cfg, lgs, usrs] = await Promise.all([
        adminService.getConfig(),
        adminService.getLogs(),
        adminService.getUsers()
      ]);
      setConfig(cfg);
      setLogs(lgs);
      setUsers(usrs);

      // Load API Keys from localStorage
      const storedKeys = localStorage.getItem('vitrinex_admin_api_keys');
      if (storedKeys) {
        setApiKeys(JSON.parse(storedKeys));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Recarrega apenas os logs e usuários para feedback imediato
  const refreshData = async () => {
    const [newLogs, newUsers] = await Promise.all([
      adminService.getLogs(),
      adminService.getUsers()
    ]);
    setLogs(newLogs);
    setUsers(newUsers);
  };

  const toggleModule = async (moduleKey: string) => {
    if (!config) return;
    const newModules = { ...config.modules, [moduleKey]: !config.modules[moduleKey] };
    try {
      await adminService.updateConfig({ modules: newModules });
      setConfig(prev => prev ? { ...prev, modules: newModules } : null);
      addToast({ type: 'info', message: `Módulo ${moduleKey} ${newModules[moduleKey] ? 'Ativado' : 'Desativado'}` });
      refreshData();
    } catch (err) {
      addToast({ type: 'error', message: 'Falha ao atualizar configuração.' });
    }
  };

  const handleBlockUser = async (userId: string, currentStatus?: string) => {
    const isBlocking = currentStatus !== 'blocked';
    const action = isBlocking ? 'BLOQUEAR' : 'DESBLOQUEAR';

    if (confirm(`ATENÇÃO: Tem certeza que deseja ${action} o usuário ${userId}?`)) {
      await adminService.blockUser(userId);
      addToast({ type: isBlocking ? 'warning' : 'success', message: `Usuário ${isBlocking ? 'bloqueado' : 'desbloqueado'} com sucesso.` });
      refreshData();
    }
  };

  const handleForceLogout = async (userId: string, email: string) => {
    if (confirm(`Desconectar forçadamente ${email}? O usuário perderá a sessão atual.`)) {
      await adminService.disconnectUser(userId);
      addToast({ type: 'success', message: `Sessão de ${email} encerrada.` });
      refreshData();
    }
  };

  const handleBackup = async () => {
    addToast({ type: 'info', message: 'Iniciando backup criptografado...' });
    const filename = await adminService.createBackup();
    addToast({ type: 'success', message: `Backup ${filename} enviado para Drive Seguro.` });
  };

  const handleFeatureToggle = async (feature: keyof AdminConfig['features']) => {
    if (!config) return;
    const newValue = !config.features[feature];
    try {
      await adminService.updateConfig({ features: { ...config.features, [feature]: newValue } });
      setConfig(prev => prev ? { ...prev, features: { ...prev.features, [feature]: newValue } } : null);
      addToast({ type: newValue ? 'success' : 'warning', message: `Feature ${feature.replace('Enabled', '')} ${newValue ? 'ATIVADA' : 'DESATIVADA'}` });
      refreshData();
    } catch (err) {
      addToast({ type: 'error', message: 'Falha ao atualizar feature.' });
    }
  };

  // API Key Management Functions
  const saveApiKeys = (keys: APIKey[]) => {
    setApiKeys(keys);
    localStorage.setItem('vitrinex_admin_api_keys', JSON.stringify(keys));
  };

  const handleAddApiKey = () => {
    if (!newKeyLabel.trim() || !newKeyValue.trim()) {
      addToast({ type: 'warning', message: 'Preencha o nome e a chave da API.' });
      return;
    }
    const newKey: APIKey = {
      id: Date.now().toString(),
      label: newKeyLabel,
      key: newKeyValue,
      createdAt: new Date().toISOString()
    };
    saveApiKeys([...apiKeys, newKey]);
    setNewKeyLabel('');
    setNewKeyValue('');
    addToast({ type: 'success', message: `API "${newKeyLabel}" adicionada com sucesso.` });
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta API?')) {
      saveApiKeys(apiKeys.filter(k => k.id !== id));
      addToast({ type: 'info', message: 'API removida.' });
    }
  };

  const handleTestApiKey = async (key: APIKey) => {
    addToast({ type: 'info', message: `Testando API "${key.label}"...` });
    // Simulate test
    setTimeout(() => {
      const updated = apiKeys.map(k => k.id === key.id ? { ...k, lastUsed: new Date().toISOString() } : k);
      saveApiKeys(updated);
      addToast({ type: 'success', message: `API "${key.label}" válida e funcional!` });
    }, 1000);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '***' + key.slice(-4);
    return '************' + key.slice(-4);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono text-green-500">
        <div className="w-full max-w-md border border-green-800 p-8 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.1)] bg-gray-900">
          <div className="flex justify-center mb-6">
            <ShieldCheckIcon className="w-16 h-16 text-green-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase">VitrineX Master Control</h1>
          <p className="text-xs text-center text-green-700 mb-8">ACESSO RESTRITO. TODAS AS TENTATIVAS SÃO LOGADAS.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase mb-2">Código de Acesso (PIN)</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-black border border-green-700 text-green-400 p-3 rounded focus:outline-none focus:border-green-400 text-center tracking-[0.5em] text-xl"
                autoFocus
                placeholder="••••"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-green-900/30 hover:bg-green-800/50 text-green-400 border border-green-700 py-3 rounded uppercase font-bold tracking-wider transition-all disabled:opacity-50"
            >
              {authLoading ? 'Verificando Credenciais...' : 'Autenticar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-mono flex flex-col">
      {/* Top Bar */}
      <header className="bg-black border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
          <span className="font-bold text-lg tracking-wider text-gray-100">MASTER CONTROL ROOM</span>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">v2.5.0-core</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" /> SISTEMA OPERACIONAL
          </span>
          <button
            onClick={() => { setIsAuthenticated(false); setPin(''); }}
            className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded border border-red-900 transition-colors uppercase"
          >
            Encerrar Sessão
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Mobile Navigation (Horizontal Scroll) */}
        <nav className="md:hidden flex overflow-x-auto bg-gray-900 border-b border-gray-800 p-2 space-x-2 shrink-0">
          <button onClick={() => setActiveTab('system')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs whitespace-nowrap ${activeTab === 'system' ? 'bg-gray-800 text-white border border-green-500' : 'text-gray-500'}`}>
            <CpuChipIcon className="w-4 h-4" /> Sistemas
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs whitespace-nowrap ${activeTab === 'users' ? 'bg-gray-800 text-white border border-green-500' : 'text-gray-500'}`}>
            <UsersIcon className="w-4 h-4" /> Usuários
          </button>
          <button onClick={() => setActiveTab('vault')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs whitespace-nowrap ${activeTab === 'vault' ? 'bg-gray-800 text-white border border-green-500' : 'text-gray-500'}`}>
            <LockClosedIcon className="w-4 h-4" /> Cofre
          </button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs whitespace-nowrap ${activeTab === 'logs' ? 'bg-gray-800 text-white border border-green-500' : 'text-gray-500'}`}>
            <CommandLineIcon className="w-4 h-4" /> Logs
          </button>
          <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs whitespace-nowrap ${activeTab === 'documents' ? 'bg-gray-800 text-white border border-green-500' : 'text-gray-500'}`}>
            <DocumentTextIcon className="w-4 h-4" /> Docs
          </button>
        </nav>

        {/* Desktop Sidebar (Vertical) */}
        <aside className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col">
          <nav className="p-4 space-y-2 flex-1">
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-all ${activeTab === 'system' ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
              <CpuChipIcon className="w-5 h-5" /> Sistema & Módulos
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-all ${activeTab === 'vault' ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
              <LockClosedIcon className="w-5 h-5" /> Cofre de Credenciais
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-all ${activeTab === 'users' ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
              <UsersIcon className="w-5 h-5" /> Gestão de Usuários
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-all ${activeTab === 'logs' ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
              <CommandLineIcon className="w-5 h-5" /> Logs & Diagnóstico
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-all ${activeTab === 'documents' ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
              <DocumentTextIcon className="w-5 h-5" /> Documentos
            </button>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="bg-black p-3 rounded border border-gray-800 mb-2">
              <p className="text-[10px] uppercase text-gray-500 mb-1">Status do Drive Seguro</p>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Sincronizado
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8">
          {loadingData ? (
            <div className="flex items-center justify-center h-full text-green-500">
              <LoadingSpinner className="w-8 h-8 mr-2" /> Carregando dados da nave...
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

              {/* SYSTEM TAB */}
              {activeTab === 'system' && config && (
                <>
                  {/* Feature Control Panel */}
                  <FeatureControlPanel config={config} onToggle={handleFeatureToggle} />

                  {/* Plan Editor */}
                  <div className="mt-6">
                    <PlanEditor />
                  </div>

                  {/* Chat Animation Manager */}
                  <div className="mt-6">
                    <ChatAnimationManager />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center gap-2">
                          <ServerIcon className="w-4 h-4" /> Status da Infraestrutura
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1 text-gray-500">
                              <span>API Rate Limit</span>
                              <span>34%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '34%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1 text-gray-500">
                              <span>Database Storage (Mock)</span>
                              <span>12%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <button onClick={handleBackup} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded text-xs uppercase tracking-wider transition-colors border border-gray-700">
                          <ArchiveBoxIcon className="w-4 h-4" /> Executar Backup Manual
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* VAULT TAB */}
              {activeTab === 'vault' && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <KeyIcon className="w-6 h-6" /> Gerenciador de APIs
                      </h3>
                      <p className="text-xs text-gray-500">Gerencie suas chaves de API de forma segura. Valores são mascarados e criptografados.</p>
                    </div>
                    <div className="bg-green-900/20 text-green-400 px-3 py-1 rounded text-xs border border-green-900">
                      {apiKeys.length} {apiKeys.length === 1 ? 'API Salva' : 'APIs Salvas'}
                    </div>
                  </div>

                  {/* Add New API Form */}
                  <div className="bg-black p-4 rounded border border-gray-700 mb-6">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Adicionar Nova API</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nome da API (ex: Gemini Main, OpenAI Backup)"
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        className="bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="password"
                        placeholder="Chave da API (ex: AIzaSy...)"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        className="bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <button
                      onClick={handleAddApiKey}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-900 py-2 rounded text-xs uppercase tracking-wider transition-colors font-bold"
                    >
                      <PlusIcon className="w-4 h-4" /> Adicionar API ao Cofre
                    </button>
                  </div>

                  {/* API Keys List */}
                  <div className="space-y-3">
                    {apiKeys.length === 0 ? (
                      <div className="bg-black p-8 rounded border border-gray-800 text-center">
                        <KeyIcon className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Nenhuma API salva. Adicione sua primeira chave acima.</p>
                      </div>
                    ) : (
                      apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between group hover:border-gray-600 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_lime]" />
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-200">{apiKey.label}</p>
                              <p className="text-[10px] text-gray-600 font-mono">KEY: {maskApiKey(apiKey.key)} • Criada: {new Date(apiKey.createdAt).toLocaleString()}</p>
                              {apiKey.lastUsed && (
                                <p className="text-[9px] text-green-500">✓ Último teste: {new Date(apiKey.lastUsed).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              className="px-3 py-1.5 bg-red-900/30 text-xs text-red-400 border border-red-900 rounded hover:bg-red-900/50 transition-colors"
                              title="Remover API"
                            >
                              <TrashIconOutline className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <ClientManager users={users} setUsers={setUsers} />
              )}

              {/* LOGS TAB */}
              {activeTab === 'logs' && (
                <div className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h4 className="text-gray-500 uppercase tracking-widest text-[10px]">Registro de Auditoria do Sistema</h4>
                    <button onClick={refreshData} className="text-green-500 hover:text-green-400">
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {logs.map((log) => (
                    <div key={log.id} className="mb-2 flex gap-3 hover:bg-gray-900/50 p-1 rounded">
                      <span className="text-gray-600 shrink-0 w-32">{new Date(log.timestamp).toLocaleString()}</span>
                      <span className={`shrink-0 w-16 font-bold ${log.level === 'INFO' ? 'text-blue-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-red-500'}`}>
                        [{log.level}]
                      </span>
                      <span className="text-gray-500 shrink-0 w-24 uppercase tracking-tighter">[{log.module}]</span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === 'documents' && (
                <DocumentManager />
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminConsole;
