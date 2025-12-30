import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleName } from '../../App';
import { useLanguage } from '../../contexts/LanguageContext';
import { NavItem, useNavItems } from './NavigationItems';
import {
  XMarkIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import LibraryImportModal from '../features/LibraryImportModal';
import Logo from '../ui/Logo';

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
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const handleNavigate = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] outline-none focus:outline-none">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090b]/60 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#09090b] border-r border-white/5 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <Logo className="h-8 w-8" />
                <span className="text-lg font-black tracking-tighter text-white">VitrineX<span className="text-purple-500">.AI</span></span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                aria-label="Fecar menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pt-6 px-4 no-scrollbar">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => { setIsLibraryModalOpen(true); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 group"
                >
                  <div className="p-2 rounded-full bg-purple-500/10 mb-2 group-hover:scale-110 transition-transform">
                    <ArrowDownTrayIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Importar</span>
                </button>
                <button
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 group"
                >
                  <div className="p-2 rounded-full bg-pink-500/10 mb-2 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-6 h-6 text-pink-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Persona</span>
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-8">
                {navItems.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-3">
                    <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      {t(section.section)}
                    </h3>
                    <div className="flex flex-col gap-1">
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
                  </div>
                ))}
              </div>

              <div className="h-20" /> {/* Bottom Spacing */}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-[#09090b]/80 backdrop-blur-xl">


              <div className="mt-4 flex items-center justify-center gap-2 opacity-30 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                VitrineX v4.0.1 Premium
                <span className="w-1 h-1 rounded-full bg-gray-500" />
              </div>
            </div>
          </motion.aside>
        </div>
      )}
      <LibraryImportModal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} />
    </AnimatePresence>
  );
};

export default MobileNavMenu;