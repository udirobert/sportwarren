"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastTone = 'info' | 'success' | 'warning' | 'error';

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  tone: ToastTone;
  duration: number;
}

interface ToastContextValue {
  addToast: (toast: { title?: string; message: string; tone?: ToastTone; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneStyles: Record<ToastTone, { border: string; bg: string; text: string }> = {
  info: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-900' },
  success: { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-900' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-900' },
  error: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-900' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback((toast: { title?: string; message: string; tone?: ToastTone; duration?: number }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const next: ToastItem = {
      id,
      title: toast.title,
      message: toast.message,
      tone: toast.tone ?? 'info',
      duration: toast.duration ?? 4200,
    };
    setToasts(prev => [...prev, next]);
    if (next.duration > 0) {
      const timer = window.setTimeout(() => removeToast(id), next.duration);
      timers.current.set(id, timer);
    }
  }, [removeToast]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-6 z-[120] flex flex-col items-end gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = toneStyles[toast.tone];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`pointer-events-auto w-80 max-w-[90vw] rounded-2xl border shadow-xl ${style.border} ${style.bg}`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1">
                    {toast.title && (
                      <div className={`text-xs font-black uppercase tracking-widest ${style.text}`}>{toast.title}</div>
                    )}
                    <div className="text-sm text-gray-700">{toast.message}</div>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
