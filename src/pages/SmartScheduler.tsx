
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const SmartScheduler: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in text-gray-800 dark:text-gray-100">
            <div className="bg-surface rounded-full p-6 mb-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <CalendarDaysIcon className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-title">{t('common.comingSoon') || 'Agendamento Inteligente'}</h1>
            <p className="max-w-md text-muted mb-8">
                Estamos otimizando nosso novo sistema de agendamento automático.
                Em breve você poderá planejar semanas de conteúdo em minutos.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                <span className="text-sm font-medium">Em Desenvolvimento</span>
            </div>
        </div>
    );
};

export default SmartScheduler;
