import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';


const AdminGate: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Hardcoded secure key for MVP as requested ("loguin de adm")
  // In production this should be env var or backend validated
  const ADMIN_KEY = "37390";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--text-secondary)]">
        <p>Módulo de Chat Administrativo desativado.</p>
        <p className="text-sm mt-2">O agente foi migrado para o Chat VitrineX.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <LockClosedIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Acesso Administrativo</h1>
          <p className="text-[var(--text-secondary)] text-center mt-2">
            Área restrita para manutenção e ajustes do sistema.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Chave de Acesso
            </label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[var(--background-input)] border ${error ? 'border-red-500' : 'border-[var(--border-default)]'} rounded-xl pl-10 pr-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-red-500 transition-colors`}
                placeholder="Insira a chave de segurança"
                autoFocus
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 font-medium"
              >
                Chave de acesso incorreta.
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-none"
          >
            Entrar no Painel
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminGate;
