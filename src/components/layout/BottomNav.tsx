import * as React from 'react';
import { ModuleName } from '../../App';
import { HomeIcon, SparklesIcon, PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, SparklesIcon as SparklesSolid, PhotoIcon as PhotoSolid, Cog6ToothIcon as CogSolid } from '@heroicons/react/24/solid';

interface BottomNavProps {
    activeModule: ModuleName;
    setActiveModule: (module: ModuleName) => void;
    onMoreClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeModule, setActiveModule, onMoreClick }) => {

    const navItems = [
        { id: 'Dashboard', label: 'Início', icon: HomeIcon, solidIcon: HomeSolid },
        { id: 'CreativeStudio', label: 'Criar', icon: SparklesIcon, solidIcon: SparklesSolid, isPrimary: true },
        { id: 'ContentLibrary', label: 'Galeria', icon: PhotoIcon, solidIcon: PhotoSolid },
        { id: 'Settings', label: 'Ajustes', icon: Cog6ToothIcon, solidIcon: CogSolid },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 liquid-glass liquid-shadow-medium border-t border-white/10 pb-safe liquid-transition">
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
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg liquid-transition icon-liquid-ultra ${isActive ? 'bg-primary text-white ring-4 ring-surface' : 'bg-primary text-white ring-4 ring-surface'}`}>
                                    <Icon className="w-7 h-7 icon-fluid-viscous" />
                                </div>
                                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-primary liquid-text-glow' : 'text-muted'}`}>
                                    {item.label}
                                </span>
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id as ModuleName)}
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 liquid-transition icon-fluid-breathe icon-fluid-squeeze ${isActive ? 'text-primary' : 'text-muted hover:text-body'
                                }`}
                        >
                            <Icon className="w-6 h-6 icon-fluid-viscous icon-fluid-glow" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
