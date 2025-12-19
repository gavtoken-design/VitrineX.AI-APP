import * as React from 'react';
import { useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { LiquidGlassCard } from './LiquidGlassCard';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <XCircleIcon className="w-6 h-6 text-red-500" />,
  warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
};

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className="pointer-events-auto">
      <LiquidGlassCard
        className="w-full max-w-sm pointer-events-auto overflow-hidden bg-white/40 dark:bg-black/40"
        borderRadius="16px"
        blurIntensity="lg"
        glowIntensity="sm"
        shadowIntensity="sm"
        draggable={true}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {icons[type]}
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>}
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => onClose(id)}
              >
                <span className="sr-only">Fechar</span>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div aria-live="assertive" className="fixed top-0 right-0 z-[100] flex flex-col items-end p-4 sm:p-6 pointer-events-none gap-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default Toast;
