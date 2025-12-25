import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background text-body p-6 text-center animate-fade-in">
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md shadow-lg">
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Algo deu errado</h2>
                        <p className="mb-4 text-sm text-muted">Ocorreu um erro inesperado na aplicação.</p>
                        <div className="bg-black/10 dark:bg-black/30 p-4 rounded-lg text-left overflow-auto max-h-40 mb-6 border border-black/5">
                            <code className="text-xs font-mono text-red-600 dark:text-red-300">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                            onClick={() => window.location.reload()}
                        >
                            Recarregar Aplicação
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
