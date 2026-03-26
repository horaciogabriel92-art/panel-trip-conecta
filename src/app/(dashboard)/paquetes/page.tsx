"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Search, Filter, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PaquetesCatalogo() {
  const [paquetes, setPaquetes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        const res = await api.get('/paquetes');
        setPaquetes(res.data.filter((p: any) => p.status === 'activo'));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[var(--foreground)]">Catálogo de Destinos</h2>
          <p className="text-[var(--muted-foreground)]">Encuentra el viaje perfecto para tus clientes</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-3 bg-[var(--muted)] border border-[var(--border)] rounded-2xl px-4 py-2 w-64">
             <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
             <input type="text" placeholder="Buscar destino..." className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)]" />
           </div>
           <button className="p-3 bg-[var(--muted)] rounded-2xl border border-[var(--border)] hover:bg-[var(--muted)] transition-all">
             <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
           </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paquetes.map((p) => (
            <div key={p.id} className="glass-card rounded-[2rem] overflow-hidden flex flex-col group">
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <img 
                  src={p.imagen_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800'} 
                  alt={p.nombre} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] shadow-xl">
                  {p.tipo}
                </div>
                <div className="absolute bottom-4 left-6 z-20">
                  <h3 className="text-xl font-black text-[var(--foreground)] uppercase leading-tight mb-1">{p.nombre}</h3>
                  <p className="flex items-center gap-1 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-3 h-3" /> {p.destino}
                  </p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--muted)] p-3 rounded-2xl">
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-black mb-1">Desde</p>
                    <p className="text-xl font-black text-[var(--foreground)]">${p.precio_doble}</p>
                  </div>
                  <div className="bg-[var(--muted)] p-3 rounded-2xl">
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-black mb-1">Disponibles</p>
                    <p className="text-xl font-black text-[var(--foreground)]">{p.cupos_disponibles}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                    {p.descripcion || "Disfruta de una experiencia inolvidable en este destino seleccionado cuidadosamente para tus clientes. Incluye hotel, traslados y actividades principales."}
                  </p>
                </div>

                <Link 
                  href={`/paquetes/${p.id}`} 
                  className="mt-auto w-full group/btn bg-[var(--muted)] hover:bg-blue-600 border border-[var(--border)] hover:border-blue-500 text-[var(--foreground)] py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2"
                >
                  Continuar a Cotizar 
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
