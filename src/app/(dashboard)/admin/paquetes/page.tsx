"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecursoVendedor {
  nombre: string;
  url: string;
  tipo: 'imagen' | 'video' | 'pdf';
}

interface Paquete {
  id?: string;
  nombre: string;
  destino: string;
  tipo: string;
  descripcion: string;
  precio_doble: number;
  precio_triple: number;
  precio_cuadruple: number;
  cupos_totales: number;
  cupos_disponibles: number;
  fecha_salida?: string;
  duracion: number;
  status: 'activo' | 'inactivo';
  imagen_url?: string;
  incluye: string[];
  no_incluye: string[];
  recursos_vendedores?: RecursoVendedor[];
}

const emptyPaquete: Paquete = {
  nombre: '',
  destino: '',
  tipo: 'internacional',
  descripcion: '',
  precio_doble: 0,
  precio_triple: 0,
  precio_cuadruple: 0,
  cupos_totales: 0,
  cupos_disponibles: 0,
  duracion: 7,
  status: 'activo',
  incluye: [],
  no_incluye: [],
  recursos_vendedores: []
};

export default function PaquetesAdmin() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<Paquete | null>(null);
  const [formData, setFormData] = useState<Paquete>(emptyPaquete);
  const [incluyeInput, setIncluyeInput] = useState('');
  const [noIncluyeInput, setNoIncluyeInput] = useState('');
  const [recursoInput, setRecursoInput] = useState<{ nombre: string; url: string; tipo: 'imagen' | 'video' | 'pdf' }>({ nombre: '', url: '', tipo: 'imagen' });

  useEffect(() => {
    fetchPaquetes();
  }, []);

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

  const handleOpenModal = (paquete?: Paquete) => {
    if (paquete) {
      setEditingPaquete(paquete);
      setFormData(paquete);
    } else {
      setEditingPaquete(null);
      setFormData(emptyPaquete);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaquete) {
        await api.put(`/paquetes/${editingPaquete.id}`, formData);
      } else {
        await api.post('/paquetes', formData);
      }
      setShowModal(false);
      fetchPaquetes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar paquete');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este paquete?')) return;
    try {
      await api.delete(`/paquetes/${id}`);
      fetchPaquetes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar paquete');
    }
  };

  const addIncluye = () => {
    if (incluyeInput.trim()) {
      setFormData({ ...formData, incluye: [...formData.incluye, incluyeInput.trim()] });
      setIncluyeInput('');
    }
  };

  const addNoIncluye = () => {
    if (noIncluyeInput.trim()) {
      setFormData({ ...formData, no_incluye: [...formData.no_incluye, noIncluyeInput.trim()] });
      setNoIncluyeInput('');
    }
  };

  const removeIncluye = (index: number) => {
    setFormData({ ...formData, incluye: formData.incluye.filter((_, i) => i !== index) });
  };

  const removeNoIncluye = (index: number) => {
    setFormData({ ...formData, no_incluye: formData.no_incluye.filter((_, i) => i !== index) });
  };

  const addRecurso = () => {
    if (recursoInput.nombre.trim() && recursoInput.url.trim()) {
      const nuevosRecursos = [...(formData.recursos_vendedores || []), { ...recursoInput }];
      setFormData({ ...formData, recursos_vendedores: nuevosRecursos });
      setRecursoInput({ nombre: '', url: '', tipo: 'imagen' });
    }
  };

  const removeRecurso = (index: number) => {
    setFormData({ 
      ...formData, 
      recursos_vendedores: (formData.recursos_vendedores || []).filter((_, i) => i !== index) 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Gestión de Paquetes</h2>
          <p className="text-slate-400">Crea y administra los paquetes turísticos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
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
                <th className="px-6 py-4 font-black">Precio Doble</th>
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
                    <p className="text-xs text-slate-500">{p.tipo} • {p.duracion} días</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{p.destino}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-400">${p.precio_doble?.toLocaleString()}</td>
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
                       <button 
                         onClick={() => handleOpenModal(p)}
                         className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => p.id && handleDelete(p.id)}
                         className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
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

      {/* Modal Crear/Editar Paquete */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">
            <h3 className="text-2xl font-black text-white mb-6">
              {editingPaquete ? 'Editar Paquete' : 'Nuevo Paquete'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Nombre del Paquete</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Ej: Europa Express 2024"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Destino</label>
                  <input
                    type="text"
                    required
                    value={formData.destino}
                    onChange={(e) => setFormData({...formData, destino: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Ej: Madrid, España"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="internacional">Internacional</option>
                    <option value="nacional">Nacional</option>
                    <option value="regional">Regional</option>
                    <option value="crucero">Crucero</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Duración (días)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.duracion}
                    onChange={(e) => setFormData({...formData, duracion: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Fecha de Salida</label>
                  <input
                    type="date"
                    value={formData.fecha_salida || ''}
                    onChange={(e) => setFormData({...formData, fecha_salida: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Precio Doble</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.precio_doble}
                      onChange={(e) => setFormData({...formData, precio_doble: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Precio Triple</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.precio_triple}
                      onChange={(e) => setFormData({...formData, precio_triple: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Precio Cuádruple</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.precio_cuadruple}
                      onChange={(e) => setFormData({...formData, precio_cuadruple: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Cupos Totales</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.cupos_totales}
                      onChange={(e) => setFormData({...formData, 
                        cupos_totales: Number(e.target.value),
                        cupos_disponibles: Number(e.target.value)
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'activo' | 'inactivo'})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Descripción</label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                    placeholder="Descripción del paquete..."
                  />
                </div>

                {/* Incluye */}
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Incluye</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={incluyeInput}
                      onChange={(e) => setIncluyeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluye())}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                      placeholder="Ej: Vuelo directo"
                    />
                    <button
                      type="button"
                      onClick={addIncluye}
                      className="px-4 py-2 bg-blue-600 rounded-xl text-white font-medium"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.incluye.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                        {item}
                        <button type="button" onClick={() => removeIncluye(idx)} className="hover:text-green-300">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* No Incluye */}
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">No Incluye</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={noIncluyeInput}
                      onChange={(e) => setNoIncluyeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNoIncluye())}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                      placeholder="Ej: Seguro de viaje"
                    />
                    <button
                      type="button"
                      onClick={addNoIncluye}
                      className="px-4 py-2 bg-blue-600 rounded-xl text-white font-medium"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.no_incluye.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                        {item}
                        <button type="button" onClick={() => removeNoIncluye(idx)} className="hover:text-red-300">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Imagen de Portada */}
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Imagen de Portada (URL)</label>
                  <input
                    type="url"
                    value={formData.imagen_url || ''}
                    onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.imagen_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.imagen_url} 
                        alt="Preview" 
                        className="h-32 rounded-xl object-cover"
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                {/* Recursos para Vendedores */}
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Recursos para Vendedores (Placas RRSS)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      value={recursoInput.nombre}
                      onChange={(e) => setRecursoInput({...recursoInput, nombre: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                      placeholder="Nombre del recurso"
                    />
                    <input
                      type="url"
                      value={recursoInput.url}
                      onChange={(e) => setRecursoInput({...recursoInput, url: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                      placeholder="URL del archivo"
                    />
                    <select
                      value={recursoInput.tipo}
                      onChange={(e) => setRecursoInput({...recursoInput, tipo: e.target.value as 'imagen' | 'video' | 'pdf'})}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                    >
                      <option value="imagen">Imagen</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addRecurso}
                    className="px-4 py-2 bg-blue-600 rounded-xl text-white font-medium mb-2"
                  >
                    Agregar Recurso
                  </button>
                  <div className="space-y-2">
                    {(formData.recursos_vendedores || []).map((recurso, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            recurso.tipo === 'imagen' && "bg-purple-500/20 text-purple-400",
                            recurso.tipo === 'video' && "bg-red-500/20 text-red-400",
                            recurso.tipo === 'pdf' && "bg-orange-500/20 text-orange-400"
                          )}>
                            {recurso.tipo.toUpperCase()}
                          </span>
                          <span className="text-sm text-white">{recurso.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={recurso.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Ver
                          </a>
                          <button 
                            type="button" 
                            onClick={() => removeRecurso(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                >
                  {editingPaquete ? 'Guardar Cambios' : 'Crear Paquete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
