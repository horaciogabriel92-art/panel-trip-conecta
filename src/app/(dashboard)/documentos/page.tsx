"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Files, Download, Upload, Trash2, Eye, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocumentos = async () => {
      // For now, this is a placeholder as we need a way to get ALL documents for the user
      setIsLoading(false);
    };
    fetchDocumentos();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Bandeja de Documentos</h2>
          <p className="text-slate-400">Accede a vouchers, itinerarios y boletos</p>
        </div>
        {user?.role === 'admin' && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Documento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3].map((doc) => (
          <div key={doc} className="glass-card p-6 rounded-[2rem] space-y-4 group">
             <div className="h-40 bg-white/5 rounded-2xl flex items-center justify-center border border-dashed border-white/10 group-hover:border-blue-500/30 transition-all">
                <Files className="w-12 h-12 text-slate-500 group-hover:text-blue-400 transition-colors" />
             </div>
             
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">VOUCHER</span>
                 <span className="text-[10px] text-slate-500">2.4 MB</span>
               </div>
               <h3 className="text-lg font-bold text-white truncate uppercase">Itinerario Europa {doc}</h3>
               <div className="flex items-center gap-2 text-xs text-slate-500">
                 <ShoppingBag className="w-3.5 h-3.5" />
                 <span>Venta #VEN-2024-00{doc}</span>
               </div>
             </div>

             <div className="pt-4 flex gap-2">
               <button className="flex-1 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                 <Download className="w-4 h-4" />
                 <span className="text-xs font-black uppercase">Descargar</span>
               </button>
               <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                 <Eye className="w-4 h-4 text-slate-400" />
               </button>
             </div>
          </div>
        ))}
      </div>

      {documentos.length === 0 && !isLoading && (
         <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-4 glass-card rounded-3xl">
           <Files className="w-12 h-12 opacity-10" />
           <p className="italic font-medium">No hay documentos disponibles en este momento.</p>
         </div>
      )}
    </div>
  );
}
