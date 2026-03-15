"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaquetesAdmin() {
  const [paquetes, setPaquetes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        const res = await api.get('/paquetes');
        setPaquetes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaquetes();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Gestión de Paquetes</h2>
          <p className="text-slate-400">Crea y administra los paquetes turísticos</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Paquete
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
           <div className="flex-1 max-w-md flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
             <Search className="w-4 h-4 text-slate-500" />
             <input type="text" placeholder="Buscar paquetes..." className="bg-transparent border-none outline-none text-sm w-full text-slate-300" />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
             <Filter className="w-4 h-4" /> Filtros
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Paquete</th>
                <th className="px-6 py-4 font-black">Destino</th>
                <th className="px-6 py-4 font-black">Precio (Doble)</th>
                <th className="px-6 py-4 font-black">Cupos</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paquetes.map((p) => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase">{p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.tipo}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{p.destino}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-400">${p.precio_doble}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{p.cupos_disponibles} / {p.cupos_totales}</td>
                  <td className="px-6 py-4">
                    {p.status === 'activo' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                       <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="p-20 flex justify-center">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
