import * as React from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
  error: <XCircleIcon className="w-6 h-6 text-red-400" />,
  warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />,
  info: <InformationCircleIcon className="w-6 h-6 text-cyan-400" />,
};

const accents = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-cyan-500',
};

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
      className="pointer-events-auto w-80 md:w-96"
    >
      <LiquidGlassCard
        className="w-full relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 group"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="sm"
        shadowIntensity="md"
        draggable={false}
      >
        {/* Type Accent Line */}
        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${accents[type]} shadow-[0_0_15px_rgba(0,0,0,0.3)] z-40 transition-all duration-300 group-hover:w-2`} />

        <div className="p-4 pl-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {icons[type]}
              </div>
            </div>
            <div className="ml-4 w-0 flex-1">
              {title && (
                <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  {title}
                </p>
              )}
              <p className="text-sm text-white/70 font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex pt-0.5">
              <button
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all duration-200"
                onClick={() => onClose(id)}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar background */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`h-full ${accents[type]} opacity-50`}
          />
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div aria-live="assertive" className="fixed top-6 right-6 z-[9999] flex flex-col items-end pointer-events-none gap-4 overflow-hidden p-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
