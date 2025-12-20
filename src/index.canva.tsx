// src/index.canva.tsx - Entry point para Canva Apps
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Canva SDK (registro SÍNCRONO obrigatório)
import { registerCanvaIntents } from './intents/design_editor';
import { prepareDataConnector } from '@canva/intents/data';
import dataConnector from './intents/data_connector';

/**
 * REGRA DO CANVA:
 * - intents DEVEM ser registrados
 * - de forma síncrona
 * - antes de qualquer render
 * - sem condicionais
 */
registerCanvaIntents();
prepareDataConnector(dataConnector);

// Renderização do React
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
