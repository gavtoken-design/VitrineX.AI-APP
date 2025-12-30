import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useDashboardData } from '../hooks/useQueries';
import Button from '../components/ui/Button';
import { useNavigate } from '../hooks/useNavigate';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useTutorial, TutorialStep } from '../contexts/TutorialContext';
import { useAuth } from '../contexts/AuthContext';
import { testGeminiConnection } from '../services/ai/gemini';
import DateTimeDisplay from '../components/ui/DateTimeDisplay';
import ClientGreeting from '../components/ui/ClientGreeting';
import SummaryCard from '../components/ui/SummaryCard';
import ActivityCard from '../components/ui/ActivityCard';
import {
  DocumentTextIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  const { data, isLoading, isError, error } = useDashboardData(userId);
  const { navigateTo } = useNavigate();
  const { t } = useLanguage();
  const { addToast } = useToast();
  // Removed duplicate useTutorial hook usage here as it is called later with completedModules
  const [testingApi, setTestingApi] = useState(false);

  const totalPosts = data?.library?.length || 0;
  const totalAds = data?.ads?.length || 0;
  const upcomingSchedule = data?.schedule?.filter(s => new Date(s.datetime) > new Date()).length || 0;
  const detectedTrends = data?.trends?.length || 0;

  // Derive Recent Activity from Library and Schedule
  const recentActivities = useMemo(() => {
    if (!data) return [];

    const libraryActivities = (data.library || []).map(item => ({
      id: item.id,
      type: 'creation',
      title: 'Item Criado: ' + (item.name || 'Sem título'),
      description: `Novo ${item.type} adicionado à biblioteca`,
      timestamp: item.createdAt,
      icon: SparklesIcon,
      gradientFrom: 'from-purple-400',
      gradientTo: 'to-pink-500'
    }));

    const scheduleActivities = (data.schedule || []).map(item => ({
      id: item.id,
      type: 'schedule',
      title: 'Agendamento: ' + item.platform,
      description: `Post agendado para ${new Date(item.datetime).toLocaleDateString()}`,
      timestamp: item.datetime,
      icon: CalendarDaysIcon,
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-indigo-600'
    }));

    return [...libraryActivities, ...scheduleActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [data]);

  const calculateGrowth = (items: any[] = [], dateField: string = 'createdAt'): string => {
    if (!items || items.length === 0) return '+0%';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let countToday = 0;
    let countYesterday = 0;

    items.forEach(item => {
      const date = new Date(item[dateField]);
      if (date >= today && date < tomorrow) {
        countToday++;
      } else if (date >= yesterday && date < today) {
        countYesterday++;
      }
    });

    if (countYesterday === 0) {
      return countToday > 0 ? `+${countToday * 100}%` : '0%';
    }

    const growth = ((countToday - countYesterday) / countYesterday) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(0)}%`;
  };

  const contentGrowth = useMemo(() => calculateGrowth(data?.library, 'createdAt'), [data?.library]);
  const adsGrowth = useMemo(() => calculateGrowth(data?.ads, 'createdAt'), [data?.ads]);
  const scheduleGrowth = useMemo(() => calculateGrowth(data?.schedule, 'datetime'), [data?.schedule]);
  const trendsGrowth = useMemo(() => calculateGrowth(data?.trends, 'createdAt'), [data?.trends]);

  const getTimeAgo = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora mesmo';
  };

  const { startTutorial, completedModules } = useTutorial();

  // ... (existing code)

  useEffect(() => {
    if (!completedModules['dashboard']) {
      const tutorialSteps: TutorialStep[] = [
        {
          targetId: 'dashboard-header',
          title: t('dashboard.title'),
          content: t('dashboard.subtitle'),
          position: 'bottom',
        },
        {
          targetId: 'dashboard-metrics',
          title: 'Métricas Principais',
          content: 'Visualize o resumo do seu desempenho em tempo real.',
          position: 'bottom',
        },
        {
          targetId: 'quick-actions-grid',
          title: t('dashboard.quick_actions'),
          content: 'Acesse as ferramentas mais importantes com um clique.',
          position: 'top',
        },
        {
          targetId: 'dashboard-activity',
          title: 'Atividade Recente',
          content: 'Acompanhe as últimas ações e atualizações do sistema.',
          position: 'top',
        },
      ];
      startTutorial('dashboard', tutorialSteps);
    }
  }, [completedModules, startTutorial, t]);

  const handleApiTest = async () => {
    setTestingApi(true);
    try {
      await testGeminiConnection();
      addToast({
        type: 'success',
        title: 'Sistema Conectado!',
        message: `O motor de criação está pronto para uso.`
      });
    } catch (e) {
      const err = e as Error;
      addToast({
        type: 'error',
        title: 'Falha na Conexão',
        message: err.message
      });
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <div className="animate-fade-in duration-700 space-y-8 pb-24 md:pb-8">

      {/* Premium Dashboard Header */}
      <div id="dashboard-header" className="relative z-20 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">System Live</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 filter drop-shadow-2xl">
            {t('dashboard.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Center</span>
          </h1>

          <div className="flex items-center gap-4 flex-wrap">
            <ClientGreeting name={user?.user_metadata?.full_name || user?.user_metadata?.name || "Visitante"} />
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <DateTimeDisplay />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApiTest} isLoading={testingApi} variant="ghost" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-full px-5 text-gray-300">
            <BoltIcon className="w-4 h-4 mr-2 text-yellow-500" />
            Status API
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-error p-4 rounded-r shadow-sm mb-6" role="alert">
          <p className="font-bold text-error">{t('gen.error')}</p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : 'Failed to load dashboard data.'}
          </p>
        </div>
      ) : (
        <div id="dashboard-metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <SummaryCard
            title={t('dashboard.total_content')}
            value={totalPosts}
            description={t('dashboard.total_content_desc')}
            icon={DocumentTextIcon}
            isLoading={isLoading}
            growth={contentGrowth}
          />
          <SummaryCard
            title={t('dashboard.campaigns_card')}
            value={totalAds}
            description={t('dashboard.campaigns_desc')}
            icon={MegaphoneIcon}
            isLoading={isLoading}
            growth={adsGrowth}
          />
          <SummaryCard
            title={t('dashboard.scheduled')}
            value={upcomingSchedule}
            description={t('dashboard.scheduled_desc')}
            icon={CalendarDaysIcon}
            isLoading={isLoading}
            growth={scheduleGrowth}
          />
          <SummaryCard
            title={t('dashboard.trends_card')}
            value={detectedTrends}
            description={t('dashboard.trends_desc')}
            icon={ChartBarIcon}
            isLoading={isLoading}
            growth={trendsGrowth}
          />
        </div>
      )}

      {/* Mobile Fix: Responsive Padding p-4 md:p-8 */}
      <LiquidGlassCard
        className="p-4 md:p-8 mb-8"
        blurIntensity="xl"
        glowIntensity="md"
        shadowIntensity="lg"
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {t('dashboard.quick_actions')}
        </h3>
        <div id="quick-actions-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Button onClick={handleApiTest} isLoading={testingApi} variant="liquid" size="lg" className="w-full justify-start group border-none shadow-xl">
            <span className="flex items-center gap-2 font-bold">
              <BoltIcon className="w-5 h-5 text-yellow-300 group-hover:animate-pulse" />
              Verificar Conexão
            </span>
          </Button>

          <Button onClick={() => navigateTo('ContentGenerator')} variant="liquid" size="lg" className="w-full justify-between group border-none shadow-xl">
            <span>{t('dashboard.btn_generate')}</span>
            <DocumentTextIcon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          </Button>
          <Button onClick={() => navigateTo('AdStudio')} variant="secondary" size="lg" className="w-full justify-between group hover:bg-white/10 hover:border-white/20 transition-all">
            <span>{t('dashboard.btn_ad')}</span>
            <MegaphoneIcon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          </Button>
          <Button onClick={() => navigateTo('TrendHunter')} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all">
            {t('dashboard.btn_market')}
          </Button>

          <Button onClick={() => navigateTo('SmartScheduler')} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-green-500/50 hover:bg-green-500/10 transition-all">
            {t('dashboard.btn_schedule')}
          </Button>
        </div>
      </LiquidGlassCard>

      <section id="dashboard-activity" className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('dashboard.recent_activity')}</h3>
          <button
            onClick={() => navigateTo('CalendarManager')}
            className="text-blue-400 text-sm font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            {t('dashboard.view_all')}
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                icon={activity.icon}
                title={activity.title}
                description={activity.description}
                timestamp={getTimeAgo(activity.timestamp)}
                gradientFrom={activity.gradientFrom}
                gradientTo={activity.gradientTo}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p>{t('dashboard.no_activity')}</p>
              <Button onClick={() => navigateTo('ContentGenerator')} variant="ghost" size="sm" className="mt-2 text-cyan-400">
                {t('dashboard.start_creating')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
