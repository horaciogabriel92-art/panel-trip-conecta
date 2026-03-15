"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FileText, Search, Plus, Filter, Calendar, User, DollarSign, Clock, X, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  paquete_nombre: string;
  precio_total: number;
  estado: 'pendiente' | 'convertida' | 'vencida' | 'cancelada';
  fecha_creacion: string;
  num_pasajeros: number;
}

interface Paquete {
  id: string;
  nombre: string;
  destino: string;
  precio_doble: number;
  tipo: string;
  duracion: number;
  status?: 'activo' | 'inactivo' | 'eliminado';
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [selectedPaquete, setSelectedPaquete] = useState<Paquete | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    paquete_id: '',
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    num_pasajeros: 2,
    tipo_habitacion: 'doble',
    fecha_salida: '',
    notas: ''
  });

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

  const fetchPaquetes = async () => {
    try {
      const res = await api.get('/paquetes');
      setPaquetes(res.data.filter((p: Paquete) => p.status === 'activo'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = () => {
    fetchPaquetes();
    setShowModal(true);
    setStep(1);
    setSelectedPaquete(null);
    setFormData({
      paquete_id: '',
      cliente_nombre: '',
      cliente_email: '',
      cliente_telefono: '',
      num_pasajeros: 2,
      tipo_habitacion: 'doble',
      fecha_salida: '',
      notas: ''
    });
  };

  const handleSelectPaquete = (paquete: Paquete) => {
    setSelectedPaquete(paquete);
    setFormData({ ...formData, paquete_id: paquete.id });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cotizaciones', formData);
      setShowModal(false);
      fetchCotizaciones();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al crear cotización');
    }
  };

  const calcularPrecio = () => {
    if (!selectedPaquete) return 0;
    return selectedPaquete.precio_doble * formData.num_pasajeros;
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'convertida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pendiente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelada': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Mis Cotizaciones</h2>
          <p className="text-slate-400">Gestiona las propuestas enviadas a tus clientes</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cotizaciones.map((c) => (
          <div key={c.id} className="glass-card p-6 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{c.codigo}</span>
                <h3 className="text-lg font-black text-white leading-tight uppercase">{c.paquete_nombre}</h3>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                getStatusColor(c.estado)
              )}>
                {c.estado}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase font-black">Cliente</p>
                 <p className="text-sm font-bold text-slate-200">{c.cliente_nombre}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase font-black">Pasajeros</p>
                 <p className="text-sm font-black text-blue-400">{c.num_pasajeros}</p>
               </div>
               <div className="space-y-1 col-span-2">
                 <p className="text-[10px] text-slate-500 uppercase font-black">Total Cotizado</p>
                 <p className="text-xl font-black text-blue-400">${c.precio_total.toLocaleString()}</p>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(c.fecha_creacion).toLocaleDateString()}</span>
              </div>
              {c.estado === 'pendiente' && (
                <button className="text-xs font-black text-white hover:text-blue-400 border border-white/10 hover:border-blue-500/50 px-4 py-2 rounded-xl transition-all">
                  CONVERTIR A VENTA
                </button>
              )}
            </div>
          </div>
        ))}

        {cotizaciones.length === 0 && !isLoading && (
          <div className="col-span-full py-20 bg-white/2 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 space-y-4">
             <FileText className="w-12 h-12 opacity-20" />
             <p className="font-medium italic">Aún no tienes cotizaciones registradas.</p>
             <button 
               onClick={handleOpenModal}
               className="text-blue-400 hover:underline"
             >
               Crear tu primera cotización
             </button>
          </div>
        )}
      </div>

      {/* Modal Nueva Cotización */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">
                {step === 1 ? 'Seleccionar Paquete' : 'Datos del Cliente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-4">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar paquete..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-300" 
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {paquetes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPaquete(p)}
                      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 font-bold">{p.nombre[0]}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{p.nombre}</h4>
                        <p className="text-sm text-slate-400">{p.destino} • {p.duracion} días</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400">${p.precio_doble.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">por persona</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedPaquete && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6">
                    <p className="text-sm text-blue-400 font-medium">Paquete seleccionado</p>
                    <h4 className="font-bold text-white">{selectedPaquete.nombre}</h4>
                    <p className="text-sm text-slate-400">${selectedPaquete.precio_doble.toLocaleString()} / persona</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm text-slate-400 mb-1 block">Nombre del Cliente</label>
                    <input
                      type="text"
                      required
                      value={formData.cliente_nombre}
                      onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      placeholder="Ej: María González"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={formData.cliente_email}
                      onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.cliente_telefono}
                      onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      placeholder="+598 99 123 456"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Pasajeros</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formData.num_pasajeros}
                      onChange={(e) => setFormData({...formData, num_pasajeros: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Tipo Habitación</label>
                    <select
                      value={formData.tipo_habitacion}
                      onChange={(e) => setFormData({...formData, tipo_habitacion: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    >
                      <option value="doble">Doble</option>
                      <option value="triple">Triple</option>
                      <option value="cuadruple">Cuádruple</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-slate-400 mb-1 block">Fecha de Salida Deseada</label>
                    <input
                      type="date"
                      value={formData.fecha_salida}
                      onChange={(e) => setFormData({...formData, fecha_salida: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-slate-400 mb-1 block">Notas</label>
                    <textarea
                      rows={3}
                      value={formData.notas}
                      onChange={(e) => setFormData({...formData, notas: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                      placeholder="Requerimientos especiales, preferencias, etc."
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Precio Estimado:</span>
                    <span className="text-2xl font-black text-blue-400">${calcularPrecio().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{formData.num_pasajeros} pasajeros × ${selectedPaquete?.precio_doble.toLocaleString()}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                  >
                    Crear Cotización
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
