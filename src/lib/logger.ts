// ============================================================================
// STRUCTURED LOGGER
// Replaces console.log with structured, environment-aware logging
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    userId?: string;
    module?: string;
    action?: string;
    [key: string]: any;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    environment: string;
}

class Logger {
    private isDev: boolean;
    private isTest: boolean;

    constructor() {
        this.isDev = import.meta.env.DEV;
        this.isTest = import.meta.env.MODE === 'test';
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            environment: import.meta.env.MODE,
        };
    }

    private shouldLog(level: LogLevel): boolean {
        // Don't log in test environment
        if (this.isTest) return false;

        // In production, only log warnings and errors
        if (!this.isDev && (level === 'debug' || level === 'info')) {
            return false;
        }

        return true;
    }

    private sendToExternalService(entry: LogEntry) {
        // TODO: Send to Sentry, LogRocket, or other service
        // if (window.Sentry && entry.level === 'error') {
        //   window.Sentry.captureMessage(entry.message, {
        //     level: 'error',
        //     extra: entry.context,
        //   });
        // }
    }

    debug(message: string, context?: LogContext) {
        if (!this.shouldLog('debug')) return;

        const entry = this.formatMessage('debug', message, context);

        if (this.isDev) {
            console.debug(`🔍 [DEBUG]`, message, context || '');
        }
    }

    info(message: string, context?: LogContext) {
        if (!this.shouldLog('info')) return;

        const entry = this.formatMessage('info', message, context);

        if (this.isDev) {
            console.info(`ℹ️  [INFO]`, message, context || '');
        }
    }

    warn(message: string, context?: LogContext) {
        if (!this.shouldLog('warn')) return;

        const entry = this.formatMessage('warn', message, context);

        console.warn(`⚠️  [WARN]`, message, context || '');
        this.sendToExternalService(entry);
    }

    error(message: string, context?: LogContext) {
        if (!this.shouldLog('error')) return;

        const entry = this.formatMessage('error', message, context);

        console.error(`❌ [ERROR]`, message, context || '');
        this.sendToExternalService(entry);
    }

    // Utility methods
    group(label: string) {
        if (this.isDev) {
            console.group(label);
        }
    }

    groupEnd() {
        if (this.isDev) {
            console.groupEnd();
        }
    }

    table(data: any) {
        if (this.isDev) {
            console.table(data);
        }
    }

    time(label: string) {
        if (this.isDev) {
            console.time(label);
        }
    }

    timeEnd(label: string) {
        if (this.isDev) {
            console.timeEnd(label);
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogContext, LogLevel };
