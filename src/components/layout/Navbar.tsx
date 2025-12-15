
import * as React from 'react';
import Logo from '../ui/Logo';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SunIcon, MoonIcon, GlobeAltIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="bg-surface text-body px-4 md:px-6 py-3 shadow-sm border-b border-border z-20 transition-colors duration-200">
      <div className="flex justify-between items-center max-w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-background"
            aria-label="Abrir menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Logo className="h-9 w-9" />
        </div>

        <div className="flex items-center gap-4">

          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-background text-sm font-medium text-muted transition-colors">
              <GlobeAltIcon className="w-5 h-5" />
              <span className="uppercase">{language.split('-')[0]}</span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-24 bg-surface border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-1">
                <button
                  onClick={() => setLanguage('pt-BR')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-background ${language === 'pt-BR' ? 'text-primary font-bold' : 'text-body'}`}
                >
                  PT-BR
                </button>
                <button
                  onClick={() => setLanguage('en-US')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-background ${language === 'en-US' ? 'text-primary font-bold' : 'text-body'}`}
                >
                  EN-US
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted hover:bg-background transition-colors"
            title={theme === 'light' ? 'Mudar para o Modo Escuro' : 'Mudar para o Modo Claro'}
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 cursor-pointer">
            <span className="text-xs font-bold text-primary">US</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
