"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useFeature } from '@/hooks/useFeature';
import {
  ShoppingCart,
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  CreditCard,
  FileText,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  ChevronDown,
  FileDown,
  Receipt
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import HistorialPagos from '@/components/ventas/HistorialPagos';

interface Pago {
  id: string;
  monto: number;
  medio_pago?: string;
  fecha_pago: string;
  observaciones?: string;
  tipo: 'inicial' | 'adicional';
  comprobante_url?: string;
}

interface Comprobante {
  id: string;
  nombre_archivo: string;
  url: string;
  ruta_archivo?: string;
}

interface Venta {
  id: string;
  codigo: string;
  cotizacion_id?: string;
  vendedor_id?: string;
  vendedor_nombre?: string;
  cliente_nombre: string;
  cliente_email?: string;
  cliente_telefono?: string;
  paquete_nombre?: string;
  fecha_salida?: string;
  num_pasajeros: number;
  precio_total: number;
  monto_pagado: number;
  monto_restante: number;
  tipo_pago: 'total' | 'parcial' | 'pendiente';
  estado: 'confirmada' | 'en_proceso' | 'emitida' | 'cancelada' | 'reembolsada';
  comision_estado: 'pendiente' | 'pagada';
  comision_monto: number;
  comision_porcentaje: number;
  fecha_creacion: string;
  notas?: string;
  pagos: Pago[];
  comprobantes_pago: Comprobante[];
}

const estadosVenta: { key: Venta['estado']; label: string; color: string; icon: any }[] = [
  { key: 'confirmada', label: 'Confirmada', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  { key: 'en_proceso', label: 'En proceso', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  { key: 'emitida', label: 'Emitida', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: FileText },
  { key: 'cancelada', label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
  { key: 'reembolsada', label: 'Reembolsada', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: AlertCircle },
];

export default function AdminVentaDetalle() {
  const { success: toastSuccess, error: toastError } = useToast();
  const { enabled: comisionesEnabled } = useFeature('comisiones');
  const params = useParams();
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [isUpdatingEstado, setIsUpdatingEstado] = useState(false);
  const [showPagarComision, setShowPagarComision] = useState(false);
  const [metodoPagoComision, setMetodoPagoComision] = useState('transferencia');
  const [referenciaPagoComision, setReferenciaPagoComision] = useState('');
  const [notasPagoComision, setNotasPagoComision] = useState('');

  useEffect(() => {
    if (params.id) fetchVenta();
  }, [params.id]);

  const fetchVenta = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/ventas/${params.id}`);
      setVenta(res.data);
    } catch (err) {
      console.error(err);
      toastError('Error al cargar la venta', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEstado = async (nuevoEstado: Venta['estado']) => {
    if (!venta) return;
    setIsUpdatingEstado(true);
    try {
      await api.put(`/ventas/${venta.id}/estado`, { estado: nuevoEstado });
      toastSuccess('Estado actualizado', 'Actualizado');
      setShowEstadoDropdown(false);
      fetchVenta();
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al actualizar estado', 'Error');
    } finally {
      setIsUpdatingEstado(false);
    }
  };

  const handlePagarComision = async () => {
    if (!venta) return;
    try {
      await api.put(`/ventas/${venta.id}/pagar-comision`, {
        metodo_pago: metodoPagoComision,
        referencia_pago: referenciaPagoComision || null,
        notas: notasPagoComision || null
      });
      toastSuccess('Comisión marcada como pagada', 'Pago registrado');
      setShowPagarComision(false);
      setReferenciaPagoComision('');
      setNotasPagoComision('');
      fetchVenta();
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al pagar comisión', 'Error');
    }
  };

  const handleDownloadComprobante = async (comprobante: Comprobante) => {
    try {
      const downloadUrl = comprobante.id.startsWith('comp_') && comprobante.ruta_archivo
        ? `/upload/comprobante-pago/download-by-filename/${comprobante.ruta_archivo.split('/').pop()}`
        : `/upload/comprobante-pago/${comprobante.id}/download`;

      const response = await api.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = comprobante.nombre_archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toastError('Error al descargar comprobante', 'Error');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const config = estadosVenta.find(e => e.key === estado);
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase border flex items-center gap-1", config.color)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Venta no encontrada</h2>
        <Link href="/admin/ventas" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a ventas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/ventas" className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all">
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-[var(--foreground)]">{venta.codigo}</h2>
            {getEstadoBadge(venta.estado)}
            {comisionesEnabled && (
              venta.comision_estado === 'pagada' ? (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-bold">Comisión pagada</span>
              ) : (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-bold">Comisión pendiente</span>
              )
            )}
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">
            Creada el {new Date(venta.fecha_creacion).toLocaleDateString('es-AR')}
          </p>
        </div>
        <div className="flex gap-2">
          {venta.cotizacion_id && (
            <Link
              href={`/admin/cotizaciones/${venta.cotizacion_id}`}
              className="px-4 py-2 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-xl flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              Ver cotización
            </Link>
          )}
          <div className="relative">
            <button
              onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}
              disabled={isUpdatingEstado}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              Cambiar estado
              <ChevronDown className="w-4 h-4" />
            </button>
            {showEstadoDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-20 overflow-hidden">
                {estadosVenta.map((e) => (
                  <button
                    key={e.key}
                    onClick={() => handleUpdateEstado(e.key)}
                    className="w-full text-left px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
                  >
                    <e.icon className="w-4 h-4" />
                    {e.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Cliente
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--muted)] rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)]">Nombre</p>
                  <p className="font-medium text-[var(--foreground)]">{venta.cliente_nombre}</p>
                </div>
                {venta.cliente_email && (
                  <div className="p-3 bg-[var(--muted)] rounded-xl">
                    <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                    <p className="font-medium text-[var(--foreground)] break-all">{venta.cliente_email}</p>
                  </div>
                )}
                {venta.cliente_telefono && (
                  <div className="p-3 bg-[var(--muted)] rounded-xl">
                    <p className="text-xs text-[var(--muted-foreground)]">Teléfono</p>
                    <p className="font-medium text-[var(--foreground)]">{venta.cliente_telefono}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Paquete / Viaje
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--muted)] rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)]">Paquete</p>
                  <p className="font-medium text-[var(--foreground)]">{venta.paquete_nombre || 'N/A'}</p>
                </div>
                <div className="p-3 bg-[var(--muted)] rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)]">Pasajeros</p>
                  <p className="font-medium text-[var(--foreground)]">{venta.num_pasajeros}</p>
                </div>
                {venta.fecha_salida && (
                  <div className="p-3 bg-[var(--muted)] rounded-xl">
                    <p className="text-xs text-[var(--muted-foreground)]">Fecha de salida</p>
                    <p className="font-medium text-[var(--foreground)]">{new Date(venta.fecha_salida).toLocaleDateString('es-AR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagos */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Pagos
            </h3>
            <HistorialPagos
              precioTotal={venta.precio_total}
              montoPagado={venta.monto_pagado || 0}
              montoRestante={venta.monto_restante || Math.max(0, venta.precio_total - (venta.monto_pagado || 0))}
              tipoPago={venta.tipo_pago}
              pagos={venta.pagos || []}
            />
          </div>

          {/* Comprobantes de pago */}
          {venta.comprobantes_pago && venta.comprobantes_pago.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border-blue-500/20">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Comprobantes de Pago ({venta.comprobantes_pago.length})
              </h3>
              <div className="space-y-3">
                {venta.comprobantes_pago.map((comp) => (
                  <div key={comp.id} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <FileDown className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)] truncate max-w-[300px]">{comp.nombre_archivo}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Comprobante de pago</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadComprobante(comp)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {venta.notas && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Notas</h3>
              <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">{venta.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Resumen Financiero</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Precio total</span>
                <span className="text-[var(--foreground)] font-medium">${formatCurrency(venta.precio_total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Pagado</span>
                <span className="text-green-400 font-medium">${formatCurrency(venta.monto_pagado || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Restante</span>
                <span className="text-[var(--foreground)] font-medium">${formatCurrency(venta.monto_restante || 0)}</span>
              </div>
              <div className="h-px bg-[var(--muted)] my-3" />
              {comisionesEnabled && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[var(--foreground)]">Comisión</span>
                    <span className="text-2xl font-black text-purple-400">${formatCurrency(venta.comision_monto)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{venta.comision_porcentaje}% del total</p>
                </>
              )}
            </div>

            {comisionesEnabled && venta.comision_estado !== 'pagada' && (
              <button
                onClick={() => setShowPagarComision(true)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Marcar Comisión Pagada
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Pagar Comisión */}
      {showPagarComision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-4">Pagar Comisión</h3>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6">
              <p className="text-sm text-[var(--muted-foreground)]">Monto de comisión:</p>
              <p className="text-2xl font-black text-purple-400">${formatCurrency(venta.comision_monto)}</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Vendedor: {venta.vendedor_nombre || 'N/A'}</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Método de pago *</label>
                <select
                  value={metodoPagoComision}
                  onChange={(e) => setMetodoPagoComision(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500"
                >
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cheque">Cheque</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Referencia de pago</label>
                <input
                  type="text"
                  value={referenciaPagoComision}
                  onChange={(e) => setReferenciaPagoComision(e.target.value)}
                  placeholder="Ej: Transferencia #12345"
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Notas adicionales</label>
                <textarea
                  value={notasPagoComision}
                  onChange={(e) => setNotasPagoComision(e.target.value)}
                  placeholder="Notas sobre el pago..."
                  rows={3}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPagarComision(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePagarComision}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
