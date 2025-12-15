import * as React from 'react';
import { ModuleName } from '../../App';
import { useLanguage } from '../../contexts/LanguageContext';
import { NavItem, useNavItems } from './NavigationItems';

interface SidebarProps {
  activeModule: ModuleName;
  setActiveModule: (moduleName: ModuleName) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const navItems = useNavItems();
  const { t } = useLanguage();

  return (
    // Adicionado h-full para garantir que o aside ocupe toda a altura disponível no pai
    <aside className="hidden md:flex flex-col w-64 h-full bg-surface border-r border-border relative z-10 flex-shrink-0">
      {/* 
         Alterado de h-full para flex-1 min-h-0.
         Isso garante que o nav ocupe apenas o espaço restante e role se o conteúdo exceder esse espaço.
      */}
      <nav className="flex-1 min-h-0 overflow-y-auto pt-6 pb-24 px-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">

        <ul className="flex flex-col">
          {navItems.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <div className={`px-4 pb-2 text-[11px] font-bold text-muted uppercase tracking-widest opacity-80 ${sectionIndex === 0 ? 'pt-2' : 'pt-6'}`}>
                {t(section.section)}
              </div>

              <div className="flex flex-col gap-[10px]">
                {section.items.map(item => (
                  <NavItem
                    key={item.name}
                    id={item.id}
                    name={item.name as ModuleName}
                    label={item.label}
                    icon={item.icon}
                    activeModule={activeModule}
                    setActiveModule={setActiveModule}
                    onNavigate={() => { }} // Nenhuma ação necessária no desktop
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;