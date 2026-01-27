import * as React from 'react';
import { ModuleName } from '../../App';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon, { IconName } from '../ui/Icon';

interface NavItemProps {
  name: ModuleName;
  label: string;
  icon: IconName; // Alterado de React.ElementType para IconName (string)
  activeModule: ModuleName;
  setActiveModule: (moduleName: ModuleName) => void;
  onNavigate: () => void;
  id?: string;
}

export const NavItem: React.FC<NavItemProps> = ({ name, label, icon, activeModule, setActiveModule, onNavigate, id }) => {
  const isActive = activeModule === name;
  const { t } = useLanguage();

  const handleClick = () => {
    setActiveModule(name);
    onNavigate();
  };

  return (
    <li id={id}>
      <button
        onClick={handleClick}
        // Mobile: larger padding (16px), Desktop: standard (12px)
        className={`flex items-center p-4 md:p-[12px_16px] w-full text-left transition-all duration-200 group relative rounded-xl
          ${isActive
            ? 'text-primary font-semibold bg-primary/10 shadow-sm'
            : 'text-muted hover:text-title hover:bg-gray-100 dark:hover:bg-gray-800/50 active:bg-gray-200 dark:active:bg-gray-700'
          } active:scale-[0.98]`}
        title={t(label)}
      >
        {isActive && (
          // Mobile: full left border, Desktop: small indicator
          <span className="absolute left-0 top-0 bottom-0 w-1 md:top-1/2 md:-translate-y-1/2 md:h-6 md:w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--color-primary),0.6)]"></span>
        )}
        <Icon name={icon} className={`h-6 w-6 md:h-5 md:w-5 mr-3 md:mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted group-hover:text-title'}`} />
        <span className="text-base md:text-sm tracking-tight font-medium">{t(label)}</span>
      </button>
    </li>
  );
};

export const useNavItems = () => {
  const { t } = useLanguage();

  return [
    {
      section: 'sidebar.current_status', items: [
        { id: "nav-dashboard", name: "Dashboard" as ModuleName, label: 'sidebar.dashboard', icon: 'dashboard' as IconName },
      ]
    },
    {
      section: 'sidebar.opportunities', items: [
        { id: "nav-market-radar", name: "MarketRadar" as ModuleName, label: 'sidebar.market_radar', icon: 'analytics' as IconName },
        { id: "nav-trend-hunter", name: "TrendHunter" as ModuleName, label: 'sidebar.trends', icon: 'trends' as IconName },
      ]
    },
    {
      section: 'sidebar.strategies', items: [
        { name: "CampaignBuilder" as ModuleName, label: 'sidebar.campaigns', icon: 'campaign' as IconName },
        // { id: "nav-chat-vitrinex", name: "ChatVitrineX" as ModuleName, label: 'sidebar.chat_vitrinex', icon: 'chat' as IconName },
      ]
    },
    {
      section: 'sidebar.execution', items: [
        { id: "nav-content-gen", name: "ContentGenerator" as ModuleName, label: 'sidebar.content_gen', icon: 'contentGen' as IconName },
        // { id: "nav-smart-scheduler", name: "SmartScheduler" as ModuleName, label: 'sidebar.smart_scheduler', icon: 'calendar' as IconName },
        { id: "nav-ad-studio", name: "AdStudio" as ModuleName, label: 'sidebar.ad_creator', icon: 'adStudio' as IconName },
        // { name: "CalendarManager" as ModuleName, label: 'sidebar.calendar_manager', icon: 'calendar' as IconName },
        { name: "AnimationShowcase" as ModuleName, label: 'Vitrine de Animações', icon: 'animation' as IconName },
        { name: "CodePlayground" as ModuleName, label: 'sidebar.code_playground', icon: 'code' as IconName },
      ]
    },
    {
      section: 'sidebar.system', items: [
        { name: "ContentLibrary" as ModuleName, label: 'sidebar.library', icon: 'library' as IconName },
        { name: "SocialNetworks" as ModuleName, label: 'sidebar.social_networks', icon: 'share' as IconName },
        { name: "Indications" as ModuleName, label: 'sidebar.referrals', icon: 'gift' as IconName },
        { id: "nav-settings", name: "Settings" as ModuleName, label: 'sidebar.config', icon: 'settings' as IconName },
        { name: "Admin" as ModuleName, label: 'sidebar.admin', icon: 'server' as IconName }
      ]
    }
  ];
};