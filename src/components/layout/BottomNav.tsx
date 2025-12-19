import * as React from 'react';
import { memo } from 'react';
import { ModuleName } from '../../App';
import { HomeIcon, SparklesIcon, PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, SparklesIcon as SparklesSolid, PhotoIcon as PhotoSolid, Cog6ToothIcon as CogSolid } from '@heroicons/react/24/solid';

interface BottomNavProps {
    activeModule: ModuleName;
    setActiveModule: (module: ModuleName) => void;
    onMoreClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = memo(({ activeModule, setActiveModule, onMoreClick }) => {

    const navItems = [
        { id: 'Dashboard', label: 'Início', icon: HomeIcon, solidIcon: HomeSolid },
        { id: 'CreativeStudio', label: 'Criar', icon: SparklesIcon, solidIcon: SparklesSolid, isPrimary: true },
        { id: 'ContentLibrary', label: 'Galeria', icon: PhotoIcon, solidIcon: PhotoSolid },
        { id: 'Settings', label: 'Ajustes', icon: Cog6ToothIcon, solidIcon: CogSolid },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-surface/90 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] border-t border-white/10 pb-safe pointer-events-auto">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = activeModule === item.id;
                    const Icon = isActive ? item.solidIcon : item.icon;

                    if (item.id === 'CreativeStudio') {
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id as ModuleName)}
                                className="relative -top-5 flex flex-col items-center justify-center"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(var(--color-primary),0.5)] backdrop-blur-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-white ring-4 ring-surface/50 transition-all duration-300 active:scale-95 hover:shadow-[0_12px_40px_rgba(var(--color-primary),0.7)] ${isActive ? 'animate-pulse' : ''}`}>
                                    <Icon className="w-8 h-8 drop-shadow-lg" />
                                </div>
                                <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.8)]' : 'text-muted'}`}>
                                    {item.label}
                                </span>
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id as ModuleName)}
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-200 active:scale-95 ${isActive ? 'text-primary' : 'text-muted hover:text-body'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_6px_rgba(var(--color-primary),0.6)]' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
