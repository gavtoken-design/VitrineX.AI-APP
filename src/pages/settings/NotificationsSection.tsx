
import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationsSection: React.FC = () => {
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState({
        email: true,
        marketing: false,
        browser: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('vitrinex_notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse notifications settings");
            }
        }
    }, []);

    const handleSavePreferences = () => {
        localStorage.setItem('vitrinex_notifications', JSON.stringify(notifications));
        addToast({
            type: 'success',
            message: 'Preferências de notificação salvas.'
        });
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <section id="notifications-section" className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
                <BellIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Notificações</h2>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--background-input)] transition-colors">
                    <div>
                        <h3 className="font-medium text-[var(--text-primary)]">Notificações por E-mail</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Receba resumos semanais e alertas de conta.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={() => toggleNotification('email')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--background-input)] transition-colors">
                    <div>
                        <h3 className="font-medium text-[var(--text-primary)]">Novidades e Marketing</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Fique por dentro das atualizações da VitrineX.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications.marketing}
                            onChange={() => toggleNotification('marketing')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--background-input)] transition-colors">
                    <div>
                        <h3 className="font-medium text-[var(--text-primary)]">Alertas no Navegador</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Receba notificações push enquanto usa o app.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications.browser}
                            onChange={() => toggleNotification('browser')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="pt-4">
                    <Button variant="outline" onClick={handleSavePreferences}>
                        Salvar Preferências
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default NotificationsSection;
