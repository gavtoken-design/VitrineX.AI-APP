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
        // Mobile: larger padding (16px), Desktop: standard (12px)
        className={`flex items-center p-4 md:p-[12px_16px] w-full text-left transition-all duration-200 group relative rounded-xl
          ${isActive
            ? 'text-primary font-semibold bg-primary/10 shadow-sm'
            : 'text-muted hover:text-title hover:bg-gray-100 dark:hover:bg-gray-800/50 active:bg-gray-200 dark:active:bg-gray-700'
          } active:scale-[0.98]`}
        title={label}
      >
        {isActive && (
          // Mobile: full left border, Desktop: small indicator
          <span className="absolute left-0 top-0 bottom-0 w-1 md:top-1/2 md:-translate-y-1/2 md:h-6 md:w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--color-primary),0.6)]"></span>
        )}
        <Icon name={icon} className={`h-6 w-6 md:h-5 md:w-5 mr-3 md:mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted group-hover:text-title'}`} />
        <span className="text-base md:text-sm tracking-tight font-medium">{label}</span>
      </button>
    </li>
  );
};

export const useNavItems = () => {
  const { t } = useLanguage();

  return [
    {
      section: 'sidebar.overview', items: [
        { id: "nav-trend-hunter", name: "TrendHunter" as ModuleName, label: 'Tendência', icon: 'trends' as IconName }
      ]
    },
    {
      section: 'sidebar.creation_suite', items: [
        { id: "nav-content-gen", name: "ContentGenerator" as ModuleName, label: 'Gerador de Conteúdo', icon: 'contentGen' as IconName },
        { name: "CreativeStudio" as ModuleName, label: 'Estúdio Criativo', icon: 'creativeStudio' as IconName },
        { id: "nav-ad-studio", name: "AdStudio" as ModuleName, label: 'Criar Anúncio', icon: 'adStudio' as IconName },
        { name: "CampaignBuilder" as ModuleName, label: 'Campanha', icon: 'campaign' as IconName }
      ]
    },
    {
      section: 'sidebar.tools', items: [
        { name: "SmartScheduler" as ModuleName, label: 'Agendamento', icon: 'calendarAlt' as IconName }
      ]
    },
    {
      section: 'sidebar.system', items: [
        { name: "ContentLibrary" as ModuleName, label: 'Biblioteca', icon: 'library' as IconName },
        { id: "nav-settings", name: "Settings" as ModuleName, label: 'Configurações', icon: 'settings' as IconName }
      ]
    }
  ];
};