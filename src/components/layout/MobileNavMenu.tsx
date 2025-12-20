import * as React from 'react';
import { ModuleName } from '../../App';
import { useLanguage } from '../../contexts/LanguageContext';
import { NavItem, useNavItems } from './NavigationItems';
import { XMarkIcon, ArrowPathIcon, CreditCardIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ModuleName;
  setActiveModule: (moduleName: ModuleName) => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen, onClose, activeModule, setActiveModule }) => {
  const navItems = useNavItems();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleNavigate = () => {
    onClose();
  };

  return (
    <div className="md:hidden">
      {/* Overlay com vidro translúcido */}
      {isOpen && (
        <div
          className="fixed inset-0 liquid-overlay z-30 liquid-transition"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Painel Deslizante Líquido */}
      <aside className={`fixed top-0 left-0 h-full w-72 liquid-glass-heavy liquid-shadow-deep border-r border-white/10 z-40
        transform liquid-transition-slow shadow-2xl flex flex-col liquid-emerge
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Cabeçalho fixo no topo */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0 liquid-light-gradient">
          <span className="font-bold text-lg text-title ml-2 liquid-text-glow">Menu</span>
          <div className="flex items-center">
            {/* Refresh button */}
            <button onClick={() => window.location.reload()} className="p-2 text-muted hover:text-title hover:bg-primary/20 rounded-full liquid-transition icon-fluid-breathe icon-fluid-squeeze">
              <ArrowPathIcon className="w-6 h-6 icon-fluid-viscous" />
            </button>
            <button onClick={onClose} className="p-2 text-muted hover:text-title hover:bg-primary/20 rounded-full liquid-transition icon-fluid-breathe icon-fluid-squeeze ml-2">
              <XMarkIcon className="w-6 h-6 icon-fluid-viscous" />
            </button>
          </div>
        </div>

        {/* Área de navegação rolável - Usa flex-1 para ocupar o espaço restante */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-6 px-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          <ul className="flex flex-col">
            {navItems.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <div className={`px-4 pb-2 text-[11px] font-bold text-muted uppercase tracking-widest opacity-80 ${sectionIndex === 0 ? 'pt-2' : 'pt-8'}`}>
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
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </React.Fragment>
            ))}
            {/* Espaço extra no final para rolagem */}
            <div className="h-4 flex-shrink-0"></div>
          </ul>
        </nav>

        {/* Footer com Toggle de Tema */}
        <div className="p-4 border-t border-white/10 mt-auto bg-surface/30 backdrop-blur-md pb-safe">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group"
          >
            {theme === 'light' ? (
              <>
                <MoonIcon className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-bold text-body">Ativar Modo Escuro</span>
              </>
            ) : (
              <>
                <SunIcon className="w-5 h-5 text-yellow-400 group-hover:rotate-90 transition-transform" />
                <span className="text-sm font-bold text-body">Ativar Modo Claro</span>
              </>
            )}
          </button>
        </div>
      </aside >
    </div >
  );
};

export default MobileNavMenu;