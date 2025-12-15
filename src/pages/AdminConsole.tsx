
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin';
import { AdminLog, UserProfile, AdminConfig } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
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
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

const AdminConsole: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'vault' | 'logs'>('system');

  // Data States
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
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
        <main className="flex-1 overflow-y-auto bg-black p-8">
          {loadingData ? (
            <div className="flex items-center justify-center h-full text-green-500">
              <LoadingSpinner className="w-8 h-8 mr-2" /> Carregando dados da nave...
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

              {/* SYSTEM TAB */}
              {activeTab === 'system' && config && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-sm uppercase font-bold text-gray-400 mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
                        <PowerIcon className="w-4 h-4" /> Controle de Módulos (Runtime Override)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(config.modules).map(([key, isEnabled]) => (
                          <div key={key} className="flex items-center justify-between bg-black p-4 rounded border border-gray-800 hover:border-gray-700 transition-colors">
                            <span className="text-sm font-medium text-gray-300">{key}</span>
                            <button
                              onClick={() => toggleModule(key)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-green-600' : 'bg-gray-700'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

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
                      <h3 className="text-xl font-bold text-white mb-1">Cofre de Credenciais</h3>
                      <p className="text-xs text-gray-500">Chaves são criptografadas (AES-256) e nunca exibidas em texto plano.</p>
                    </div>
                    <div className="bg-green-900/20 text-green-400 px-3 py-1 rounded text-xs border border-green-900">
                      Criptografia Ativa
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Google Gemini API (Master)', status: 'active', lastSync: '2 min ago' },
                      { name: 'External Auth Service', status: 'active', lastSync: '1 hour ago' },
                      { name: 'SendGrid Email API', status: 'inactive', lastSync: 'never' }
                    ].map((cred, idx) => (
                      <div key={idx} className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between group hover:border-gray-600 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${cred.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_lime]' : 'bg-gray-600'}`}></div>
                          <div>
                            <p className="font-bold text-sm text-gray-200">{cred.name}</p>
                            <p className="text-[10px] text-gray-600 font-mono">HASH: ************a8f9 • Sync: {cred.lastSync}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1 bg-gray-800 text-xs text-white rounded hover:bg-gray-700">Testar</button>
                          <button className="px-3 py-1 bg-gray-800 text-xs text-white rounded hover:bg-gray-700">Rotacionar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black text-gray-500 uppercase text-xs font-bold">
                      <tr>
                        <th className="px-6 py-4">Usuário</th>
                        <th className="px-6 py-4">Plano</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações de Segurança</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-xs text-gray-600">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${user.plan === 'premium' ? 'border-purple-900 text-purple-400 bg-purple-900/10' : 'border-gray-700 text-gray-500'}`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-xs ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleForceLogout(user.id, user.email)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-900/10 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded transition-colors text-xs"
                                title="Forçar Logout / Desconectar"
                              >
                                <ArrowRightStartOnRectangleIcon className="w-4 h-4" /> Desconectar
                              </button>

                              <button
                                onClick={() => handleBlockUser(user.id, user.status)}
                                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs border ${user.status === 'blocked' ? 'bg-green-900/10 hover:bg-green-900/30 text-green-400 border-green-900/30' : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700'}`}
                                title={user.status === 'blocked' ? "Desbloquear Acesso" : "Bloquear Acesso"}
                              >
                                {user.status === 'blocked' ? (
                                  <> <HandRaisedIcon className="w-4 h-4" /> Desbloquear </>
                                ) : (
                                  <> <NoSymbolIcon className="w-4 h-4" /> Bloquear </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminConsole;
