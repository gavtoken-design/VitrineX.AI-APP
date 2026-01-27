
import * as React from 'react';
import { memo, useState } from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SunIcon, MoonIcon, GlobeAltIcon, Bars3Icon, UserGroupIcon, ArrowDownTrayIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from '../features/NotificationDropdown';
import { useNavigate } from '../../hooks/useNavigate';

import { useAuth } from '../../contexts/AuthContext';
import ClientGreeting from '../ui/ClientGreeting';

import LibraryImportModal from '../features/LibraryImportModal';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = memo(({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, profile } = useAuth();
  const { navigateTo } = useNavigate();
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  return (
    <>
      <nav className="absolute top-0 left-0 w-full z-[60] px-4 py-3 md:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto h-14 rounded-2xl md:rounded-full bg-[#09090b]/40 backdrop-blur-xl border border-white/5 shadow-2xl pointer-events-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              aria-label="Abrir menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Logo className="h-7 w-7 md:h-8 md:w-8" />
            <div className="md:hidden ml-2">
              <ClientGreeting name={user?.user_metadata?.name || "User"} />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex items-center gap-2 border-white/10 hover:bg-white/5 text-gray-300 hover:text-white rounded-full px-4"
              onClick={() => setShowLibraryModal(true)}
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>Biblioteca</span>
            </Button>

            {/* Credits Display */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">{profile?.credits ?? 0}</span>
              <span className="text-[10px] text-amber-200/60 uppercase tracking-widest font-semibold ml-1">Créditos</span>
            </div>

            <NotificationDropdown />

            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest">
                <GlobeAltIcon className="w-4 h-4" />
                <span>{language.split('-')[0]}</span>
              </button>

              <div className="absolute right-0 top-full mt-2 w-32 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[70] p-1">
                <button
                  onClick={() => setLanguage('pt-BR')}
                  className={`flex w-full items-center px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/5 ${language === 'pt-BR' ? 'text-purple-400 bg-purple-500/5' : 'text-gray-400'}`}
                >
                  Português (BR)
                </button>
                <button
                  onClick={() => setLanguage('en-US')}
                  className={`flex w-full items-center px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/5 ${language === 'en-US' ? 'text-purple-400 bg-purple-500/5' : 'text-gray-400'}`}
                >
                  English (US)
                </button>
              </div>
            </div>



            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg hidden sm:flex">
              <span className="text-[10px] font-black text-white uppercase">{user?.user_metadata?.name?.substring(0, 2) || 'VX'}</span>
            </div>
          </div>
        </div>
      </nav>

      <LibraryImportModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      // No onSelect prop => activates "Copy to Clipboard" mode automatically 
      />
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
