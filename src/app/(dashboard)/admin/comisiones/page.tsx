"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Wallet, CheckCircle, Clock, DollarSign, Users, Calendar, Check, History, User } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface ComisionPendiente {
  id: string;
  codigo: string;
  cliente_nombre: string;
  paquete_nombre: string;
  comision_monto: number;
  fecha_creacion: string;
  vendedor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface VendedorComision {
  vendedor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  ventas: ComisionPendiente[];
  total_comision: number;
}

interface PagoComision {
  id: string;
  vendedor_id: string;
  venta_id: string;
  monto: number;
  metodo_pago?: string;
  referencia_pago?: string;
  notas?: string;
  fecha_pago: string;
  pagado_por?: {
    nombre: string;
    apellido: string;
  };
  vendedor?: {
    nombre: string;
    apellido: string;
    email: string;
  };
}

export default function ComisionesAdmin() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'pendientes' | 'pagadas'>('pendientes');

  const [comisiones, setComisiones] = useState<VendedorComision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [pagos, setPagos] = useState<PagoComision[]>([]);
  const [isLoadingPagos, setIsLoadingPagos] = useState(false);

  useEffect(() => {
    fetchComisiones();
  }, []);

  useEffect(() => {
    if (activeTab === 'pagadas') {
      fetchPagadas();
    }
  }, [activeTab]);

  const fetchComisiones = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/comisiones/pendientes');
      const agrupadas = res.data.agrupadas_por_vendedor 
        ? Object.values(res.data.agrupadas_por_vendedor)
        : [];
      setComisiones(agrupadas as VendedorComision[]);
    } catch (err) {
      console.error('Error fetching comisiones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPagadas = async () => {
    try {
      setIsLoadingPagos(true);
      const res = await api.get('/comisiones/pagadas');
      setPagos(res.data || []);
    } catch (err) {
      console.error('Error fetching pagos:', err);
      toastError('Error al cargar comisiones pagadas', 'Error');
    } finally {
      setIsLoadingPagos(false);
    }
  };

  const handlePagarComisiones = async (vendedorId: string) => {
    const vendedorData = comisiones.find(c => c.vendedor.id === vendedorId);
    if (!vendedorData) return;

    const ventasIds = vendedorData.ventas.map(v => v.id);
    
    setIsPaying(true);
    try {
      await api.post('/comisiones/pagos', {
        vendedor_id: vendedorId,
        ventas_ids: ventasIds,
        metodo_pago: 'transferencia',
        notas: `Pago consolidado de ${ventasIds.length} ventas`
      });
      
      toastSuccess(`Comisiones pagadas exitosamente a ${vendedorData.vendedor.nombre}`, 'Pago realizado');
      fetchComisiones();
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al pagar comisiones', 'Error');
    } finally {
      setIsPaying(false);
      setSelectedVendedor(null);
    }
  };

  const totalPendiente = comisiones.reduce((sum, c) => sum + c.total_comision, 0);
  const totalVendedores = comisiones.length;
  const totalVentas = comisiones.reduce((sum, c) => sum + c.ventas.length, 0);
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] font-medium">Total Pendiente</p>
          </div>
          <p className="text-3xl font-black text-[var(--foreground)]">${formatCurrency(totalPendiente)}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] font-medium">Vendedores</p>
          </div>
          <p className="text-3xl font-black text-[var(--foreground)]">{totalVendedores}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] font-medium">Ventas Pendientes</p>
          </div>
          <p className="text-3xl font-black text-[var(--foreground)]">{totalVentas}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[var(--foreground)]">Comisiones</h2>
          <p className="text-[var(--muted-foreground)]">Gestiona los pagos de comisiones a vendedores</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === 'pendientes'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            <Clock className="w-4 h-4" />
            Pendientes
          </button>
          <button
            onClick={() => setActiveTab('pagadas')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === 'pagadas'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            <History className="w-4 h-4" />
            Pagadas
          </button>
        </div>
      </div>

      {activeTab === 'pendientes' ? (
        isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comisiones.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">¡Todo al día!</h3>
            <p className="text-[var(--muted-foreground)]">No hay comisiones pendientes de pago</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comisiones.map((item) => (
              <div key={item.vendedor.id} className="glass-card rounded-3xl overflow-hidden">
                {/* Header del vendedor */}
                <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-lg">
                        {item.vendedor.nombre[0]}{item.vendedor.apellido[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        {item.vendedor.nombre} {item.vendedor.apellido}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">{item.vendedor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-[var(--muted-foreground)]">Total a pagar</p>
                      <p className="text-2xl font-black text-orange-400">
                        ${formatCurrency(item.total_comision)}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePagarComisiones(item.vendedor.id)}
                      disabled={isPaying}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-[var(--foreground)] font-bold px-6 py-3 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                    >
                      {isPaying ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Pagar
                    </button>
                  </div>
                </div>

                {/* Lista de ventas */}
                <div className="divide-y divide-[var(--border)]">
                  {item.ventas.map((venta) => (
                    <div key={venta.id} className="p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{venta.paquete_nombre}</p>
                          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                            <span>Cliente: {venta.cliente_nombre}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono">{venta.codigo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-400">${formatCurrency(venta.comision_monto)}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {new Date(venta.fecha_creacion).toLocaleDateString('es-UY')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        isLoadingPagos ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pagos.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <History className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Sin pagos registrados</h3>
            <p className="text-[var(--muted-foreground)]">Aún no hay comisiones pagadas</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Total pagado en comisiones</p>
                  <p className="text-2xl font-black text-green-400">${formatCurrency(totalPagado)}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{pagos.length} pago{pagos.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-6 py-4 font-bold">Vendedor</th>
                      <th className="px-6 py-4 font-bold">Monto</th>
                      <th className="px-6 py-4 font-bold">Método</th>
                      <th className="px-6 py-4 font-bold">Referencia / Notas</th>
                      <th className="px-6 py-4 font-bold">Pagado por</th>
                      <th className="px-6 py-4 font-bold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--foreground)]">
                                {pago.vendedor ? `${pago.vendedor.nombre} ${pago.vendedor.apellido}` : '—'}
                              </p>
                              {pago.vendedor?.email && (
                                <p className="text-xs text-[var(--muted-foreground)]">{pago.vendedor.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-400">${formatCurrency(pago.monto)}</span>
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground)] capitalize">
                          {pago.metodo_pago || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[var(--foreground)] text-sm">{pago.referencia_pago || '—'}</p>
                          {pago.notas && (
                            <p className="text-xs text-[var(--muted-foreground)]">{pago.notas}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)] text-sm">
                          {pago.pagado_por ? `${pago.pagado_por.nombre} ${pago.pagado_por.apellido}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)] text-sm">
                          {new Date(pago.fecha_pago).toLocaleDateString('es-UY')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
