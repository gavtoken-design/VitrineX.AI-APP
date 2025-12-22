
import * as React from 'react';
import { memo, useState } from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SunIcon, MoonIcon, GlobeAltIcon, Bars3Icon, UserGroupIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from '../features/NotificationDropdown';

import { useAuth } from '../../contexts/AuthContext';
import ClientGreeting from '../ui/ClientGreeting';
import SocialConnectButton from '../SocialConnectButton';
import SocialPublish from '../SocialPublish';
import LibraryImportModal from '../features/LibraryImportModal';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = memo(({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-surface text-body px-4 md:px-6 py-3 shadow-sm border-b border-border z-20 transition-colors duration-200 sticky top-0">
        <div className="flex justify-between items-center max-w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-background bounce-on-click"
              aria-label="Abrir menu"
            >
              <Bars3Icon className="w-6 h-6 wiggle-on-hover" />
            </button>
            <Logo className="h-8 w-8 md:hidden" />
            {/* Client Greeting on Mobile Navbar */}
            <div className="md:hidden ml-2 scalefade-enter">
              <ClientGreeting name={user?.user_metadata?.name || "Visitante"} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Import Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2 border-primary/30 hover:bg-primary/10 text-primary"
              onClick={() => setIsLibraryModalOpen(true)}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="hidden xl:inline">Importar</span>
            </Button>

            {/* Persona Switcher - New Action Button */}
            <Button
              variant="liquid"
              size="sm"
              className="hidden lg:flex items-center gap-2 mr-2 bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-purple-500/20"
              onClick={() => alert("Funcionalidade em desenvolvimento: Troca de Personagem/Avatar")}
            >
              <UserGroupIcon className="w-4 h-4" />
              <span className="hidden xl:inline">Mudar Personagem</span>
            </Button>

            <NotificationDropdown />
            <SocialConnectButton />
            <SocialPublish />

            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-background text-sm font-medium text-muted transition-colors pop-on-hover">
                <GlobeAltIcon className="w-5 h-5 rotate-on-hover" />
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
              className="p-2 rounded-full text-muted hover:bg-background transition-colors spin-on-click"
              title={theme === 'light' ? 'Mudar para o Modo Escuro' : 'Mudar para o Modo Claro'}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 rotate-on-hover" />
              ) : (
                <SunIcon className="w-5 h-5 rotate-on-hover" />
              )}
            </button>

            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 cursor-pointer heartbeat hidden sm:flex">
              <span className="text-xs font-bold text-primary">US</span>
            </div>
          </div>
        </div>
      </nav>
      <LibraryImportModal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} />
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
