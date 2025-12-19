

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDashboardData } from '../hooks/useQueries';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useNavigate } from '../hooks/useNavigate';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useTutorial, TutorialStep } from '../contexts/TutorialContext'; // Import Tutorial Hook
import { useAuth } from '../contexts/AuthContext';
import { testGeminiConnection } from '../services/ai/gemini';
import {
  DocumentTextIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  isLoading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, description, icon: Icon, isLoading }) => (
  <div className="glass-card p-6 transition-all duration-300 hover:scale-105">
    <div className="flex justify-between items-start mb-4">
      <div className="glass-icon-bg p-3">
        <Icon className="w-5 h-5 text-cyan-300" />
      </div>
      <span className="growth-badge">+15%</span>
    </div>
    <div>
      {isLoading ? (
        <>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-9 w-16" />
        </>
      ) : (
        <>
          <p className="text-sm text-gray-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </>
      )}
    </div>
  </div>
);

interface ActivityCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  timestamp: string;
  gradientFrom: string;
  gradientTo: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  icon: Icon,
  title,
  description,
  timestamp,
  gradientFrom,
  gradientTo
}) => (
  <div className="glass-card p-3 flex items-center justify-between hover:scale-[1.02] transition-transform duration-200">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <span className="text-xs text-gray-400">{timestamp}</span>
  </div>
);


const Dashboard: React.FC = () => {
  const { user } = useAuth(); // Use real user
  const userId = user?.id || 'mock-user-123'; // Fallback if somehow null but should be handled by App.tsx
  const { data, isLoading, isError, error } = useDashboardData(userId);
  const { navigateTo } = useNavigate();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial(); // Use Tutorial Hook
  const [testingApi, setTestingApi] = useState(false);

  const totalPosts = data?.posts.length || 0;
  const totalAds = data?.ads.length || 0;
  const upcomingSchedule = data?.schedule.filter(s => new Date(s.datetime) > new Date()).length || 0;
  const detectedTrends = data?.trends.length || 0;

  useEffect(() => {
    if (!hasSeenTutorial) {
      const tutorialSteps: TutorialStep[] = [
        {
          targetId: 'dashboard-header',
          title: 'Bem-vindo ao VitrineX AI! 🚀',
          content: 'Este é o seu painel de controle. Aqui você tem uma visão geral de toda a sua operação de marketing automatizada.',
          position: 'bottom',
        },
        {
          targetId: 'quick-actions-grid',
          title: 'Ações Rápidas ⚡',
          content: 'Acesse as ferramentas mais importantes com um clique. Gere conteúdo, crie anúncios ou analise estratégias instantaneamente.',
          position: 'top',
        },
        {
          targetId: 'nav-content-gen',
          title: 'Gerador de Conteúdo 📝',
          content: 'Crie posts, legendas e textos para blog em segundos usando IA avançada.',
          position: 'right',
        },
        {
          targetId: 'nav-ad-studio',
          title: 'Estúdio de Anúncios 📢',
          content: 'Desenvolva criativos e copys persuasivas para campanhas de alta conversão.',
          position: 'right',
        },
        {
          targetId: 'nav-trend-hunter',
          title: 'Caçador de Tendências 📈',
          content: 'Descubra o que está em alta no seu nicho e crie conteúdo viral antes da concorrência.',
          position: 'right',
        },
        {
          targetId: 'nav-settings',
          title: 'Configurações ⚙️',
          content: 'Gerencie suas chaves de API, perfil da empresa e preferências do sistema aqui.',
          position: 'right',
        },
      ];
      startTutorial(tutorialSteps);
    }
  }, [hasSeenTutorial, startTutorial]);

  const handleApiTest = async () => {
    setTestingApi(true);
    try {
      const response = await testGeminiConnection();
      addToast({
        type: 'success',
        title: 'Sistema Conectado!',
        message: `O motor de criação está pronto para uso.`
      });
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Falha na Conexão',
        message: e.message
      });
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <div className="animate-fade-in duration-500">
      <div id="dashboard-header" className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-title">{t('dashboard.title')}</h2>
          <p className="text-muted mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="text-sm text-muted font-medium bg-surface px-3 py-1 rounded-md border border-gray-200 dark:border-gray-800">
          {new Date().toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {isError ? (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-error p-4 rounded-r shadow-sm mb-6" role="alert">
          <p className="font-bold text-error">System Alert</p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : 'Failed to load dashboard data.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title={t('dashboard.total_content')}
            value={totalPosts}
            description={t('dashboard.total_content_desc')}
            icon={DocumentTextIcon}
            isLoading={isLoading}
          />
          <SummaryCard
            title={t('dashboard.campaigns_card')}
            value={totalAds}
            description={t('dashboard.campaigns_desc')}
            icon={MegaphoneIcon}
            isLoading={isLoading}
          />
          <SummaryCard
            title={t('dashboard.scheduled')}
            value={upcomingSchedule}
            description={t('dashboard.scheduled_desc')}
            icon={CalendarDaysIcon}
            isLoading={isLoading}
          />
          <SummaryCard
            title={t('dashboard.trends_card')}
            value={detectedTrends}
            description={t('dashboard.trends_desc')}
            icon={ChartBarIcon}
            isLoading={isLoading}
          />
        </div>
      )}

      <section className="bg-surface rounded-xl shadow-card border border-gray-100 dark:border-gray-800 p-8">
        <h3 className="text-lg font-bold text-title mb-6">{t('dashboard.quick_actions')}</h3>
        <div id="quick-actions-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Moved to Top Position and added w-full for mobile framing */}
          <Button onClick={handleApiTest} isLoading={testingApi} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 group">
            <span className="flex items-center gap-2 font-bold text-primary">
              <BoltIcon className="w-5 h-5 text-primary group-hover:text-primary/80 animate-pulse" />
              Verificar Conexão do Sistema
            </span>
          </Button>

          <Button onClick={() => navigateTo('ContentGenerator')} variant="primary" size="lg" className="w-full justify-between group">
            <span>{t('dashboard.btn_generate')}</span>
            <DocumentTextIcon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          </Button>
          <Button onClick={() => navigateTo('AdStudio')} variant="outline" size="lg" className="w-full justify-between group">
            <span>{t('dashboard.btn_ad')}</span>
            <MegaphoneIcon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          </Button>
          <Button onClick={() => navigateTo('TrendHunter')} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            {t('dashboard.btn_market')}
          </Button>
          <Button onClick={() => navigateTo('CreativeStudio')} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            {t('dashboard.btn_media')}
          </Button>
          <Button onClick={() => navigateTo('CalendarManager')} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            {t('dashboard.btn_schedule')}
          </Button>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Atividades Recentes</h3>
          <a className="text-blue-400 text-sm font-semibold hover:underline cursor-pointer">
            Ver Todas
          </a>
        </div>
        <div className="space-y-3">
          <ActivityCard
            icon={BoltIcon}
            title="API Conectada"
            description="Sincronização do sistema concluída com sucesso"
            timestamp="2m"
            gradientFrom="from-blue-400"
            gradientTo="to-indigo-600"
          />
          <ActivityCard
            icon={SparklesIcon}
            title="Conteúdo Gerado"
            description="Novo lote de campanha pronto para revisão"
            timestamp="1h"
            gradientFrom="from-purple-400"
            gradientTo="to-pink-500"
          />
          <ActivityCard
            icon={ExclamationTriangleIcon}
            title="Alerta de Orçamento"
            description="Campanha #4 próxima do limite diário"
            timestamp="3h"
            gradientFrom="from-yellow-400"
            gradientTo="to-orange-500"
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
