import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { AppUiProvider } from "@canva/app-ui-kit";
import "@canva/app-ui-kit/styles.css";
import SmartScheduler from "../../pages/SmartScheduler";
import { ToastProvider } from "../../contexts/ToastContext";
import "../../index.css";

const SmartSchedulerApp: React.FC = () => {
    return (
        <AppUiProvider>
            <ToastProvider>
                <div className="min-h-screen bg-background p-6">
                    <SmartScheduler />
                </div>
            </ToastProvider>
        </AppUiProvider>
    );
};

export const smartScheduler = {
    render: async () => {
        const rootElement = document.getElementById('root');
        if (rootElement) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(
                <StrictMode>
                    <SmartSchedulerApp />
                </StrictMode>
            );
        }
    },
};
