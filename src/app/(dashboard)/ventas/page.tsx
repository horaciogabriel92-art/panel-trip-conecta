"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, CheckCircle, Clock, ExternalLink, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/ventas');
        setVentas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVentas();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Gestión de Ventas</h2>
          <p className="text-slate-400">Control de reservas confirmadas y estados de pago</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 w-72">
           <Search className="w-4 h-4 text-slate-500" />
           <input type="text" placeholder="Número de venta..." className="bg-transparent border-none outline-none text-sm w-full text-slate-300" />
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6">ID Venta</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Paquete</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6">Vendedor</th>
                <th className="px-8 py-6">Estado</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-8 py-6 text-blue-400 font-bold">{v.numero_venta}</td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-white uppercase text-sm">{v.cliente_nombre} {v.cliente_apellido}</p>
                    <p className="text-xs text-slate-500">{v.cliente_email}</p>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-300 font-medium">Europa Classic 15d</td>
                  <td className="px-8 py-6 text-sm font-black text-white">${v.precio_venta_total.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-lg text-slate-400">ID: {v.vendedor_id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{v.estado_venta}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {ventas.length === 0 && !isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-4">
              <ShoppingCart className="w-12 h-12 opacity-10" />
              <p className="italic font-medium">No se han registrado ventas aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
