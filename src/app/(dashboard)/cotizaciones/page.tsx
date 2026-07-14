"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { 
  FileText, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign,
  Send,
  RotateCcw,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { NuevaCotizacionModal } from '@/components/cotizaciones/NuevaCotizacionModal';
import { useToast } from '@/context/ToastContext';

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  paquete_nombre: string;
  precio_total: number;
  estado: 'nueva' | 'enviada' | 'vendida' | 'perdida';
  fecha_creacion: string;
  fecha_envio?: string;
  fecha_vencimiento?: string;
  num_pasajeros: number;
  notas?: string;
  tipo_cotizacion?: 'paquete' | 'manual';
  vuelos?: any[];
  hospedaje?: any[];
}

export default function CotizacionesCRM() {
  const t = useTranslations('cotizaciones');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { error: toastError } = useToast();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPerdidaModal, setShowPerdidaModal] = useState(false);
  const [cotizacionPerdida, setCotizacionPerdida] = useState<Cotizacion | null>(null);
  const [motivoPerdida, setMotivoPerdida] = useState('');
  
  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] = useState<Cotizacion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columnas = [
    { id: 'nueva', color: 'bg-slate-500/10 border-slate-500/20', icon: FileText },
    { id: 'enviada', color: 'bg-blue-500/10 border-blue-500/20', icon: Send },
    { id: 'vendida', color: 'bg-green-500/10 border-green-500/20', icon: DollarSign },
    { id: 'perdida', color: 'bg-red-500/10 border-red-500/20', icon: XCircle }
  ];

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const fetchCotizaciones = async () => {
    try {
      const res = await api.get('/cotizaciones');
      setCotizaciones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ya no necesita mapeo - el estado viene directo de la DB
  const getColumnaCotizacion = (c: Cotizacion) => c.estado;

  const marcarComoEnviada = async (id: string) => {
    try {
      await api.put(`/cotizaciones/${id}/enviar`);
      fetchCotizaciones();
    } catch (err: any) {
      console.error('Error al marcar como enviada:', err);
      toastError(t('errors.markAsSent') + ': ' + (err.response?.data?.error || err.message), tCommon('error'));
    }
  };

  const abrirModalPerdida = (c: Cotizacion) => {
    setCotizacionPerdida(c);
    setMotivoPerdida('');
    setShowPerdidaModal(true);
  };

  const marcarComoPerdida = async () => {
    if (!cotizacionPerdida) return;
    
    try {
      await api.put(`/cotizaciones/${cotizacionPerdida.id}`, { 
        estado: 'perdida',
        notas: `VENTA PERDIDA - Motivo: ${motivoPerdida}\n\nNotas anteriores:\n${cotizacionPerdida.notas || ''}`
      });
      setShowPerdidaModal(false);
      setCotizacionPerdida(null);
      setMotivoPerdida('');
      fetchCotizaciones();
    } catch (err) {
      toastError(t('errors.markAsLost'), tCommon('error'));
    }
  };

  // Funciones para eliminar cotización
  const abrirModalEliminar = (c: Cotizacion) => {
    setCotizacionToDelete(c);
    setShowDeleteModal(true);
  };

  const eliminarCotizacion = async () => {
    if (!cotizacionToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/cotizaciones/${cotizacionToDelete.id}`);
      setShowDeleteModal(false);
      setCotizacionToDelete(null);
      fetchCotizaciones();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || t('errors.delete');
      toastError(errorMsg, tCommon('error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const getDiasRestantes = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return null;
    const dias = Math.ceil((new Date(fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      {/* Modal Nueva Cotización */}
      <NuevaCotizacionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">{t('title')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('newQuote')}
        </button>
      </div>

      {/* Kanban Board - 4 columnas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {columnas.map((columna) => {
          const cotizacionesColumna = cotizaciones.filter(
            c => getColumnaCotizacion(c) === columna.id
          );
          const Icon = columna.icon;

          return (
            <div 
              key={columna.id} 
              className={cn(
                "glass-card rounded-2xl flex flex-col overflow-hidden",
                columna.color
              )}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 mb-1 min-w-0">
                  <Icon className="w-4 h-4 text-[var(--foreground)] shrink-0" />
                  <h3 className="font-bold text-[var(--foreground)] text-sm truncate">{t(`columns.${columna.id}.label`)}</h3>
                  <span className="ml-auto px-2 py-0.5 bg-[var(--muted)] rounded text-xs font-bold text-[var(--foreground)]">
                    {cotizacionesColumna.length}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)]">{t(`columns.${columna.id}.description`)}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {cotizacionesColumna.map((c) => {
                  const diasRestantes = getDiasRestantes(c.fecha_vencimiento);
                  
                  return (
                    <div 
                      key={c.id} 
                      className="bg-[var(--card)] rounded-xl p-3 space-y-2 hover:shadow-md transition-all cursor-pointer group shadow-sm border border-[var(--border)]"
                    >
                      {/* Header de la card */}
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                          {c.codigo}
                        </span>
                        <span className="text-base font-black text-[var(--foreground)]">
                          ${formatCurrency(c.precio_total)}
                        </span>
                      </div>

                      {/* Info del cliente */}
                      <div>
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="font-bold text-[var(--foreground)] text-sm truncate">{c.cliente_nombre}</h4>
                          {c.tipo_cotizacion === 'manual' && (
                            <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-[9px] font-bold rounded">
                              {t('manual')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                          {c.tipo_cotizacion === 'manual' 
                            ? t('flightsHotels', { flights: c.vuelos?.length || 0, hotels: c.hospedaje?.length || 0 })
                            : c.paquete_nombre
                          }
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                        <span>{c.num_pasajeros} {t('passengers')}</span>
                        {diasRestantes !== null && (
                          <span className={diasRestantes < 0 ? 'text-red-400' : diasRestantes <= 2 ? 'text-orange-400' : 'text-green-400'}>
                            {diasRestantes < 0 ? t('overdue') : t('daysRemaining', { days: diasRestantes })}
                          </span>
                        )}
                      </div>

                      {/* Fechas */}
                      <div className="text-[10px] text-[var(--muted-foreground)] space-y-0.5">
                        <div>{t('created')} {formatDate(c.fecha_creacion)}</div>
                        {c.fecha_envio && (
                          <div>{t('sent')} {formatDate(c.fecha_envio)}</div>
                        )}
                      </div>

                      {/* Acciones según columna */}
                      <div className="pt-2 border-t border-[var(--border)] space-y-2">
                        {/* COLUMNA NUEVA: Botón Enviar */}
                        {columna.id === 'nueva' && (
                          <button
                            onClick={() => marcarComoEnviada(c.id)}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {t('actions.markAsSent')}
                          </button>
                        )}
                        
                        {/* COLUMNA ENVIADA: Botones Cerrar Venta y Venta Perdida */}
                        {columna.id === 'enviada' && (
                          <>
                            <Link
                              href={`/cotizaciones/${c.id}?accion=cerrar`}
                              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              {t('actions.closeSale')}
                            </Link>
                            <button
                              onClick={() => abrirModalPerdida(c)}
                              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {t('actions.lostSale')}
                            </button>
                          </>
                        )}

                        {/* COLUMNA VENDIDA: Link a venta */}
                        {columna.id === 'vendida' && (
                          <Link
                            href="/mis-ventas"
                            className="w-full py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('actions.viewInSales')}
                          </Link>
                        )}

                        {/* COLUMNA PERDIDA: Info */}
                        {columna.id === 'perdida' && (
                          <div className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold text-center">
                            {t('actions.notCompleted')}
                          </div>
                        )}

                        {/* Botón Eliminar - disponible para cotizaciones no vendidas */}
                        {columna.id !== 'vendida' && (
                          <button
                            onClick={() => abrirModalEliminar(c)}
                            className="w-full py-2 bg-[var(--muted)] hover:bg-red-500/10 text-[var(--muted-foreground)] hover:text-red-500 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('actions.delete')}
                          </button>
                        )}

                        {/* Ver detalle siempre disponible */}
                        <Link
                          href={`/cotizaciones/${c.id}`}
                          className="w-full py-1.5 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {t('actions.viewDetail')}
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {cotizacionesColumna.length === 0 && (
                  <div className="text-center py-6 text-[var(--muted-foreground)]">
                    <Icon className="w-6 h-6 mx-auto mb-1 opacity-20" />
                    <p className="text-xs">{t('emptyColumn')}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Venta Perdida */}
      {showPerdidaModal && cotizacionPerdida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)]">{t('lostSaleModal.title')}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{cotizacionPerdida.codigo}</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-sm text-[var(--foreground)]">
                <strong>{t('lostSaleModal.client')}</strong> {cotizacionPerdida.cliente_nombre}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <strong>{t('lostSaleModal.total')}</strong> ${formatCurrency(cotizacionPerdida.precio_total)}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-[var(--muted-foreground)] block">
                {t('lostSaleModal.reasonLabel')}
              </label>
              <textarea
                rows={3}
                value={motivoPerdida}
                onChange={(e) => setMotivoPerdida(e.target.value)}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] text-sm outline-none focus:border-red-500 resize-none"
                placeholder={t('lostSaleModal.reasonPlaceholder')}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPerdidaModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
              >
                {t('lostSaleModal.cancel')}
              </button>
              <button
                onClick={marcarComoPerdida}
                disabled={!motivoPerdida.trim()}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-[var(--foreground)] font-bold transition-all"
              >
                {t('lostSaleModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Cotización */}
      {showDeleteModal && cotizacionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)]">{t('deleteModal.title')}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{cotizacionToDelete.codigo}</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-sm text-[var(--foreground)]">
                <strong>{t('deleteModal.client')}</strong> {cotizacionToDelete.cliente_nombre}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <strong>{t('deleteModal.total')}</strong> ${formatCurrency(cotizacionToDelete.precio_total)}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <strong>{t('deleteModal.status')}</strong> {cotizacionToDelete.estado}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-300 font-medium mb-2">
                  {t('deleteModal.warningTitle')}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t('deleteModal.warningBody') }} />
              </div>
              
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                {t('deleteModal.confirmQuestion')}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCotizacionToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] disabled:opacity-50 text-[var(--foreground)] font-medium transition-all"
              >
                {t('lostSaleModal.cancel')}
              </button>
              <button
                onClick={eliminarCotizacion}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-[var(--foreground)] font-bold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('deleteModal.deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('deleteModal.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
