'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SESSION_EXPIRED_EVENT } from '@/lib/sessionEvents';

export function SessionExpiredHandler({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { custom } = useToast();

  const handleSessionExpired = useCallback(() => {
    custom(
      'error',
      'Tu sesión expiró o el token ya no es válido. Por favor, iniciá sesión nuevamente.',
      {
        label: 'Loguearme nuevamente',
        onClick: logout,
      },
      'Sesión expirada'
    );
  }, [custom, logout]);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [handleSessionExpired]);

  return <>{children}</>;
}
