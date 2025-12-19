import * as React from 'react';
import { useState, memo } from 'react';
import { ModuleName } from '../../App';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavItems } from './NavigationItems';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '../../lib/utils';

import Icon from '../ui/Icon';

import Logo3D from '../ui/Logo3D';

interface SidebarProps {
  activeModule: ModuleName;
  setActiveModule: (moduleName: ModuleName) => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ activeModule, setActiveModule }) => {
  const navItems = useNavItems();
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Desktop Sidebar com animação */}
      <motion.aside
        className="hidden md:flex flex-col h-full bg-surface border-r border-border relative z-10 flex-shrink-0"
        animate={{
          width: open ? '256px' : '80px',
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo Section */}
        <div className={cn(
          "h-20 flex items-center border-b border-border/50",
          open ? "px-6 justify-start" : "px-0 justify-center"
        )}>
          <Logo3D
            collapsed={!open}
            onClick={() => setActiveModule('Dashboard')}
            title="Ir para Dashboard" // Tooltip for Logo
          />
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto pt-4 md:pt-6 pb-20 md:pb-24 px-2 md:px-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          <ul className="flex flex-col">
            {navItems.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <motion.div
                  className={cn(
                    "px-3 md:px-4 pb-2 text-[10px] md:text-[11px] font-bold text-muted uppercase tracking-widest opacity-80",
                    sectionIndex === 0 ? 'pt-2' : 'pt-4 md:pt-6'
                  )}
                  animate={{
                    opacity: open ? 0.8 : 0,
                    display: open ? 'block' : 'none',
                  }}
                >
                  {t(section.section)}
                </motion.div>

                <div className="flex flex-col gap-2 md:gap-[10px]">
                  {section.items.map(item => {
                    const isActive = activeModule === item.name;

                    return (
                      <button
                        key={item.name}
                        id={item.id}
                        onClick={() => setActiveModule(item.name as ModuleName)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-body hover:bg-surface-hover hover:text-title"
                        )}
                        title={!open ? t(item.label) : undefined} // Tooltip only when collapsed
                      >
                        <Icon
                          name={item.icon}
                          className={cn(
                            "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                            isActive ? "text-primary" : "text-muted"
                          )}
                        />
                        <motion.span
                          animate={{
                            opacity: open ? 1 : 0,
                            width: open ? 'auto' : 0,
                            display: open ? 'inline-block' : 'none',
                          }}
                          transition={{ duration: 0.2 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {t(item.label)}
                        </motion.span>

                        {isActive && (
                          <motion.div
                            layoutId="activePill"
                            className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </motion.aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;