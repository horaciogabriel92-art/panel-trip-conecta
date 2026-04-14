'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    // Auto-cerrar después de 4 segundos
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => toast('success', message, title), [toast]);
  const error = useCallback((message: string, title?: string) => toast('error', message, title), [toast]);
  const info = useCallback((message: string, title?: string) => toast('info', message, title), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Portal de Toasts */}
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => toasts[0] && removeToast(toasts[0].id)}
          />
          {/* Toast Card */}
          <div className="relative w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`
                  relative overflow-hidden rounded-2xl border shadow-2xl
                  ${t.type === 'success' ? 'border-green-500/30 bg-[#0f1f18]' : ''}
                  ${t.type === 'error' ? 'border-red-500/30 bg-[#1f1111]' : ''}
                  ${t.type === 'info' ? 'border-blue-500/30 bg-[#0f172a]' : ''}
                `}
              >
                {/* Barra de color superior */}
                <div
                  className={`h-1 w-full ${
                    t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                />

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        t.type === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : t.type === 'error'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {t.type === 'success' && <CheckCircle className="h-6 w-6" />}
                      {t.type === 'error' && <AlertCircle className="h-6 w-6" />}
                      {t.type === 'info' && <Info className="h-6 w-6" />}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      {t.title && (
                        <h4
                          className={`mb-1 text-lg font-bold ${
                            t.type === 'success'
                              ? 'text-green-400'
                              : t.type === 'error'
                              ? 'text-red-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {t.title}
                        </h4>
                      )}
                      <p className="text-sm leading-relaxed text-gray-200">{t.message}</p>
                    </div>

                    {/* Cerrar */}
                    <button
                      onClick={() => removeToast(t.id)}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Botón de acción / Cerrar */}
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => removeToast(t.id)}
                      className={`rounded-xl px-5 py-2 text-sm font-bold transition-colors ${
                        t.type === 'success'
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : t.type === 'error'
                          ? 'bg-red-600 text-white hover:bg-red-500'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
