// hooks/useNavigate.ts
import * as React from 'react';
import { useContext } from 'react';
import { ModuleName } from '../App'; // Import ModuleName type

// Define the type for the navigation context
interface NavigationContextType {
  setActiveModule: (moduleName: ModuleName) => void;
  activeModule: ModuleName;
}

// Create the actual context
export const NavigationContext = React.createContext<NavigationContextType | undefined>(undefined);

export const useNavigate = () => {
  const context = useContext(NavigationContext);

  if (context === undefined) {
    // This means the hook is being used outside of a NavigationProvider.
    console.warn('useNavigate must be used within a NavigationProvider. Returning a no-op navigate function.');
    return {
      navigateTo: (moduleName: ModuleName) => {
        console.log(`Navigation to ${moduleName} requested, but NavigationContext is not available.`);
      },
      activeModule: 'Dashboard' as ModuleName,
    };
  }

  return {
    navigateTo: context.setActiveModule,
    activeModule: context.activeModule,
  };
};