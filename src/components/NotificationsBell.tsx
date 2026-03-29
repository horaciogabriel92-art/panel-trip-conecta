"use client";

import { useEffect, useState, useRef } from 'react';
import { Bell, X, Check, Trash2, ShoppingCart, FileText, CreditCard, Upload } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Notificacion {
  id: string;
  tipo: 'nueva_venta' | 'nueva_cotizacion' | 'pago_recibido' | 'comprobante_subido' | 'sistema';
  titulo: string;
  mensaje: string;
  data?: {
    venta_id?: string;
    cotizacion_id?: string;
    vendedor_nombre?: string;
    cliente_nombre?: string;
    monto?: number;
    paquete_nombre?: string;
  };
  leida: boolean;
  fecha_creacion: string;
}

const tipoConfig = {
  nueva_venta: { icon: ShoppingCart, color: 'text-green-400', bg: 'bg-green-500/20' },
  nueva_cotizacion: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  pago_recibido: { icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  comprobante_subido: { icon: Upload, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  sistema: { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

export default function NotificationsBell() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotificaciones = async () => {
    try {
      const res = await api.get('/notificaciones');
      setNotificaciones(res.data.notificaciones || []);
      setNoLeidas(res.data.no_leidas || 0);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // Poll cada 30 segundos
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const marcarLeida = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.put(`/notificaciones/${id}/leida`);
      setNotificaciones(prev => prev.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marcando notificación:', err);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.put('/notificaciones/marcar-todas-leidas');
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (err) {
      console.error('Error marcando todas:', err);
    }
  };

  const handleNotificacionClick = (notif: Notificacion) => {
    if (!notif.leida) {
      marcarLeida(notif.id);
    }
    
    // Navegar según el tipo
    if (notif.data?.venta_id) {
      router.push(`/admin/ventas/${notif.data.venta_id}`);
    } else if (notif.data?.cotizacion_id) {
      router.push(`/admin/cotizaciones/${notif.data.cotizacion_id}`);
    }
    
    setIsOpen(false);
  };

  const getTimeAgo = (fecha: string) => {
    const now = new Date();
    const notifDate = new Date(fecha);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return notifDate.toLocaleDateString('es-AR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-[var(--muted)] transition-colors"
      >
        <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 glass-card rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h3 className="font-bold text-[var(--foreground)]">Notificaciones</h3>
            {noLeidas > 0 && (
              <button 
                onClick={marcarTodasLeidas}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--muted-foreground)]">No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => {
                const config = tipoConfig[notif.tipo] || tipoConfig.sistema;
                const Icon = config.icon;
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificacionClick(notif)}
                    className={`p-4 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]/50 transition-colors ${
                      !notif.leida ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notif.leida ? 'font-bold' : 'font-medium'} text-[var(--foreground)]`}>
                            {notif.titulo}
                          </p>
                          <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                            {getTimeAgo(notif.fecha_creacion)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">
                          {notif.mensaje}
                        </p>
                        {notif.data?.monto && (
                          <p className="text-sm font-bold text-green-400 mt-1">
                            ${notif.data.monto.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {!notif.leida && (
                        <button
                          onClick={(e) => marcarLeida(notif.id, e)}
                          className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"
                          title="Marcar como leída"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)]/30">
              <button 
                onClick={() => {
                  router.push('/admin/notificaciones');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
