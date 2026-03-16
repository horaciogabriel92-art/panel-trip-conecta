"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Wallet, CheckCircle, Clock, DollarSign, Users, Calendar, Check } from 'lucide-react';
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

export default function ComisionesAdmin() {
  const [comisiones, setComisiones] = useState<VendedorComision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchComisiones();
  }, []);

  const fetchComisiones = async () => {
    try {
      const res = await api.get('/comisiones/pendientes');
      // Convertir el objeto agrupado en array
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
      
      alert(`Comisiones pagadas exitosamente a ${vendedorData.vendedor.nombre}`);
      fetchComisiones();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al pagar comisiones');
    } finally {
      setIsPaying(false);
      setSelectedVendedor(null);
    }
  };

  const totalPendiente = comisiones.reduce((sum, c) => sum + c.total_comision, 0);
  const totalVendedores = comisiones.length;
  const totalVentas = comisiones.reduce((sum, c) => sum + c.ventas.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Total Pendiente</p>
          </div>
          <p className="text-3xl font-black text-white">${formatCurrency(totalPendiente)}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Vendedores</p>
          </div>
          <p className="text-3xl font-black text-white">{totalVendedores}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Ventas Pendientes</p>
          </div>
          <p className="text-3xl font-black text-white">{totalVentas}</p>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black text-white">Comisiones Pendientes</h2>
        <p className="text-slate-400">Gestiona los pagos de comisiones a vendedores</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comisiones.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">¡Todo al día!</h3>
          <p className="text-slate-400">No hay comisiones pendientes de pago</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comisiones.map((item) => (
            <div key={item.vendedor.id} className="glass-card rounded-3xl overflow-hidden">
              {/* Header del vendedor */}
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-lg">
                      {item.vendedor.nombre[0]}{item.vendedor.apellido[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.vendedor.nombre} {item.vendedor.apellido}
                    </h3>
                    <p className="text-sm text-slate-400">{item.vendedor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Total a pagar</p>
                    <p className="text-2xl font-black text-orange-400">
                      ${formatCurrency(item.total_comision)}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePagarComisiones(item.vendedor.id)}
                    disabled={isPaying}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
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
              <div className="divide-y divide-white/5">
                {item.ventas.map((venta) => (
                  <div key={venta.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{venta.paquete_nombre}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>Cliente: {venta.cliente_nombre}</span>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono">{venta.codigo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-400">${formatCurrency(venta.comision_monto)}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(venta.fecha_creacion).toLocaleDateString('es-UY')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
