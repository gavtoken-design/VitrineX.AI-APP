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

  const handleClick = () => {
    setActiveModule(name);
    onNavigate();
  };

  return (
    <li id={id}>
      <button
        onClick={handleClick}
        // UX UPDATE: 
        // Aplicado padding exato de 12px vertical e 16px horizontal para área de toque generosa.
        className={`flex items-center p-[12px_16px] w-full text-left transition-all duration-200 group relative rounded-xl
          ${isActive
            ? 'text-primary font-semibold bg-primary/10 shadow-sm'
            : 'text-muted hover:text-title hover:bg-gray-100 dark:hover:bg-gray-800/50 active:bg-gray-200 dark:active:bg-gray-700'
          } active:scale-[0.98]`}
        title={label}
      >
        {isActive && (
          // O indicador ativo é diferente em mobile vs desktop, mas aqui usamos a classe `md:block` para controlar.
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--color-primary),0.6)] hidden md:block"></span>
        )}
        <Icon name={icon} className={`h-6 w-6 md:h-5 md:w-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted group-hover:text-title'}`} />
        <span className="text-base md:text-sm tracking-tight font-medium">{label}</span>
      </button>
    </li>
  );
};

export const useNavItems = () => {
  const { t } = useLanguage();

  // Retorna a estrutura de navegação usando as chaves de string definidas em iconRegistry
  return [
    {
      section: 'sidebar.overview', items: [
        { id: "nav-dashboard", name: "Dashboard" as ModuleName, label: t('sidebar.dashboard'), icon: 'dashboard' as IconName },
        { id: "nav-ai-manager", name: "AIManager" as ModuleName, label: t('sidebar.ai_assistant'), icon: 'aiManager' as IconName }
      ]
    },
    {
      section: 'sidebar.creation_suite', items: [
        { id: "nav-content-gen", name: "ContentGenerator" as ModuleName, label: t('sidebar.content_gen'), icon: 'contentGen' as IconName },
        { id: "nav-ad-studio", name: "AdStudio" as ModuleName, label: t('sidebar.ad_creator'), icon: 'adStudio' as IconName },
        { name: "CreativeStudio" as ModuleName, label: t('sidebar.media_studio'), icon: 'creativeStudio' as IconName }
      ]
    },
    {
      section: 'sidebar.strategy', items: [
        { name: "CampaignBuilder" as ModuleName, label: t('sidebar.campaigns'), icon: 'campaign' as IconName },
        { id: "nav-trend-hunter", name: "TrendHunter" as ModuleName, label: t('sidebar.trends'), icon: 'trends' as IconName },
        { name: "SmartScheduler" as ModuleName, label: t('sidebar.calendar'), icon: 'calendar' as IconName }
      ]
    },
    {
      section: 'sidebar.communication', items: [
        { name: "Chatbot" as ModuleName, label: t('sidebar.ai_chat'), icon: 'chat' as IconName }
      ]
    },
    {
      section: 'sidebar.system', items: [
        { name: "ContentLibrary" as ModuleName, label: t('sidebar.library'), icon: 'library' as IconName },
        { id: "nav-settings", name: "Settings" as ModuleName, label: t('sidebar.config'), icon: 'settings' as IconName }
      ]
    }
  ];
};