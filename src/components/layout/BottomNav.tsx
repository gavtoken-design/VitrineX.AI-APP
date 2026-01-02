import * as React from 'react';
import { memo } from 'react';
import { ModuleName } from '../../App';
import { HomeIcon, PhotoIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, PhotoIcon as PhotoSolid, Bars3Icon as Bars3Solid } from '@heroicons/react/24/solid';

type BottomNavProps = {
    activeModule: ModuleName;
    setActiveModule: (module: ModuleName) => void;
    onMoreClick: () => void;
}

const BottomNav = memo(({ activeModule, setActiveModule, onMoreClick }: BottomNavProps) => {

    const navItems: Array<{
        id: string;
        label: string;
        icon?: React.ElementType;
        solidIcon?: React.ElementType;
        isCentral?: boolean;
        imageSrc?: string;
    }> = [
            { id: 'Dashboard', label: 'Início', icon: HomeIcon, solidIcon: HomeSolid },
            { id: 'AdStudio', label: 'Ads', icon: PhotoIcon, solidIcon: PhotoSolid }, // Added for balance
            // {
            //     id: 'CosmicStudio',
            //     label: '',
            //     isCentral: true,
            //     imageSrc: '/vitrinex-icon.png'
            // },
            { id: 'ContentLibrary', label: 'Galeria', icon: PhotoIcon, solidIcon: PhotoSolid },
            { id: 'Menu', label: 'Menu', icon: Bars3Icon, solidIcon: Bars3Solid },
        ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
            <div className="max-w-md mx-auto h-16 rounded-2xl bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto flex justify-around items-center px-2">
                {navItems.map((item) => {
                    const isActive = activeModule === item.id;

                    if (item.isCentral) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id as ModuleName)}
                                className="relative -top-5 flex flex-col items-center justify-center transition-transform duration-300 active:scale-95 group"
                            >
                                <div className={`relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-[2px] shadow-lg shadow-purple-500/30 ${isActive ? 'scale-110' : ''}`}>
                                    <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={item.imageSrc}
                                            alt="VitrineX"
                                            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        />
                                    </div>
                                </div>
                            </button>
                        );
                    }

                    // Standard Icon Item
                    const Icon = isActive ? item.solidIcon : item.icon;
                    // Fallback for types
                    const SafeIcon = Icon as React.ElementType;

                    return (
                        <button
                            key={item.id}
                            onClick={() => item.id === 'Menu' ? onMoreClick() : setActiveModule(item.id as ModuleName)}
                            className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-all duration-300 active:scale-90 ${isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <div className="relative">
                                {SafeIcon && <SafeIcon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />}
                                {isActive && (
                                    <div className="absolute -inset-2 bg-purple-500/20 blur-lg rounded-full animate-pulse" />
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-purple-500 animate-bounce" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
