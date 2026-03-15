"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Search, Plus, Filter, Calendar, User, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/cotizaciones');
        setCotizaciones(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCotizaciones();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Mis Cotizaciones</h2>
          <p className="text-slate-400">Gestiona las propuestas enviadas a tus clientes</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cotizaciones.map((c) => (
          <div key={c.id} className="glass-card p-6 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{c.numero_cotizacion}</span>
                <h3 className="text-lg font-black text-white leading-tight uppercase">{c.paquete_nombre || "Europa Express"}</h3>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                c.status === 'convertida' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              )}>
                {c.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase font-black">Cliente</p>
                 <p className="text-sm font-bold text-slate-200">{c.cliente_nombre} {c.cliente_apellido}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase font-black">Total</p>
                 <p className="text-sm font-black text-blue-400">${c.precio_total.toLocaleString()}</p>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <button className="text-xs font-black text-white hover:text-blue-400 border border-white/10 hover:border-blue-500/50 px-4 py-2 rounded-xl transition-all">
                VER DETALLE
              </button>
            </div>
          </div>
        ))}

        {cotizaciones.length === 0 && !isLoading && (
          <div className="col-span-full py-20 bg-white/2 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 space-y-4">
             <FileText className="w-12 h-12 opacity-20" />
             <p className="font-medium italic">Aún no tienes cotizaciones registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
