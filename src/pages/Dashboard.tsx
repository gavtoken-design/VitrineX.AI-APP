

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
import DateTimeDisplay from '../components/ui/DateTimeDisplay';
import ClientGreeting from '../components/ui/ClientGreeting';
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

import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  isLoading?: boolean;
  growth?: string;
  isPositive?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, description, icon: Icon, isLoading, growth, isPositive = true }) => (
  <LiquidGlassCard
    className="p-6 transition-all duration-300 hover:scale-105"
    blurIntensity="lg"
    shadowIntensity="md"
    glowIntensity="sm"
    borderRadius="24px"
  >
    <div className="flex justify-between items-start mb-4 relative z-40">
      <div className="glass-icon-bg p-3 bg-white/10 rounded-xl backdrop-blur-md">
        <Icon className="w-5 h-5 text-cyan-300" />
      </div>
      <span className={`growth-badge px-2 py-1 rounded-full text-xs font-bold border ${growth && growth.includes('+') ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-white/10 text-gray-300 border-white/20'}`}>
        {growth || '+0%'}
      </span>
    </div>
    <div className="relative z-40">
      {isLoading ? (
        <>
          <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
          <Skeleton className="h-9 w-16 bg-white/10" />
        </>
      ) : (
        <>
          <p className="text-sm text-gray-300 mb-1 font-medium tracking-wide opacity-80">{title}</p>
          <p className="text-4xl font-bold text-white tracking-tight drop-shadow-sm">{value}</p>
        </>
      )}
    </div>
  </LiquidGlassCard>
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
  const userId = user?.id || 'anonymous'; // Fallback if somehow null but should be handled by App.tsx
  const { data, isLoading, isError, error } = useDashboardData(userId);
  const { navigateTo } = useNavigate();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial(); // Use Tutorial Hook
  const [testingApi, setTestingApi] = useState(false);

  const totalPosts = data?.library?.length || 0; // Use Library count for Total Content
  const totalAds = data?.ads?.length || 0;
  const upcomingSchedule = data?.schedule?.filter(s => new Date(s.datetime) > new Date()).length || 0;
  const detectedTrends = data?.trends?.length || 0;

  // Derive Recent Activity from Library and Schedule
  const recentActivities = React.useMemo(() => {
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
      timestamp: item.datetime, // Use datetime for sorting
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

  const contentGrowth = React.useMemo(() => calculateGrowth(data?.library, 'createdAt'), [data?.library]);
  const adsGrowth = React.useMemo(() => calculateGrowth(data?.ads, 'createdAt'), [data?.ads]);
  const scheduleGrowth = React.useMemo(() => calculateGrowth(data?.schedule, 'datetime'), [data?.schedule]);
  const trendsGrowth = React.useMemo(() => calculateGrowth(data?.trends, 'createdAt'), [data?.trends]);

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
    <div className="animate-fade-in duration-500">
      <div id="dashboard-header" className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-title">Visão Executiva</h2>
          <p className="text-muted mt-1">Bem-vindo de volta. Aqui está o resumo da atividade da plataforma.</p>
        </div>
        <div className="flex items-center gap-4">
          <ClientGreeting name={user?.user_metadata?.full_name || user?.user_metadata?.name || "Visitante"} />
          <DateTimeDisplay />
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
            title="Conteúdo Total"
            value={totalPosts}
            description="Total de itens na biblioteca"
            icon={DocumentTextIcon}
            isLoading={isLoading}
            growth={contentGrowth}
          />
          <SummaryCard
            title="Campanhas de Anúncios"
            value={totalAds}
            description="Campanhas ativas e rascunhos"
            icon={MegaphoneIcon}
            isLoading={isLoading}
            growth={adsGrowth}
          />
          <SummaryCard
            title="Eventos Agendados"
            value={upcomingSchedule}
            description="Posts programados para o futuro"
            icon={CalendarDaysIcon}
            isLoading={isLoading}
            growth={scheduleGrowth}
          />
          <SummaryCard
            title="Tendências de Mercado"
            value={detectedTrends}
            description="Tendências identificadas recentemente"
            icon={ChartBarIcon}
            isLoading={isLoading}
            growth={trendsGrowth}
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
          <Button onClick={() => navigateTo('SmartScheduler')} variant="ghost" size="lg" className="w-full justify-start border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
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
              <div className="text-center py-8 text-muted">
                <p>Nenhuma atividade recente registrada.</p>
                <Button onClick={() => navigateTo('ContentGenerator')} variant="ghost" size="sm" className="mt-2">
                  Começar a Criar
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
