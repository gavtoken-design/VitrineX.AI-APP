// src/index.standalone.tsx - Entry point para Web App standalone
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Renderização do React (sem Canva SDK)
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
