
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const SecuritySection: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

    const handleResetPassword = () => {
        if (user?.email) {
            supabase.auth.resetPasswordForEmail(user.email);
            addToast({
                type: 'success',
                title: 'E-mail enviado',
                message: 'Verifique sua caixa de entrada para redefinir a senha.'
            });
        }
    };

    return (
        <section id="security-section" className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Segurança</h2>
            </div>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[var(--background-input)] rounded-xl border border-[var(--border-default)]">
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">Senha de Acesso</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Última alteração: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Desconhecido'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleResetPassword}>
                        Redefinir Senha
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default SecuritySection;
