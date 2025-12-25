// src/index.tsx
// Entry point principal - usa index.standalone para dev local
// Para build Canva, usar: npm run build:canva

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Renderização do React (modo standalone para desenvolvimento)
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
