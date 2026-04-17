"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Package, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, Upload, X, ImageIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { parseAmadeusPNR } from '@/lib/amadeus-parser';
import { AirlineLogo } from '@/components/flights/AirlineLogo';
import { useToast } from '@/context/ToastContext';

// Componente para subir imágenes a Supabase Storage
function ImagenUploader({ imagenUrl, onImagenSubida }: { imagenUrl: string; onImagenSubida: (url: string) => void }) {
  const { error: toastError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(imagenUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toastError('Solo se permiten archivos de imagen (JPG, PNG, WebP)', 'Archivo inválido');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toastError('La imagen no debe superar los 5MB', 'Archivo muy grande');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('imagen', file);

      const res = await api.post('/upload/paquete-imagen', formData);

      const imageUrl = res.data.url;
      setPreview(imageUrl);
      onImagenSubida(imageUrl);
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al subir la imagen', 'Error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onImagenSubida('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Imagen de Portada</label>
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-48 rounded-xl object-cover border border-[var(--border)]"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-[var(--foreground)] shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="h-48 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-blue-500/50 bg-[var(--muted)] hover:bg-[var(--muted)] transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--muted-foreground)]">Subiendo...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[var(--foreground)] font-medium">Click para subir imagen</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">JPG, PNG o WebP (máx. 5MB)</p>
              </div>
            </>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Cambiar imagen
        </button>
      )}
    </div>
  );
}

interface RecursoVendedor {
  nombre: string;
  url: string;
  tipo: 'imagen' | 'video' | 'pdf';
}

interface Vuelo {
  tipo: 'ida' | 'vuelta';
  aerolinea_codigo?: string;
  aerolinea_nombre?: string;
  numero_vuelo?: string;
  origen_codigo: string;
  origen_nombre: string;
  destino_codigo: string;
  destino_nombre: string;
  fecha_salida: string;
  hora_salida?: string;
  hora_llegada?: string;
  clase?: string;
  escalas?: number;
  notas?: string;
}

interface Hotel {
  id: string;
  nombre: string;
  link?: string;
  ciudad?: string;
  precios: {
    doble: number;
    triple: number;
    cuadruple: number;
  };
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
  vuelos: Vuelo[];
  hoteles: Hotel[];
  itinerario?: { texto?: string; dias?: any[] } | string;
  comision_monto_usd?: number;
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
  recursos_vendedores: [],
  vuelos: [],
  hoteles: [],
  itinerario: { texto: '', dias: [] },
  comision_monto_usd: 0
};

// Función para parsear PNR de Amadeus usando el parser unificado
function parseAmadeusPNRToVuelos(pnrText: string): Vuelo[] {
  if (!pnrText.trim()) {
    return [];
  }

  // Usar el parser unificado de amadeus-parser.ts
  const result = parseAmadeusPNR(pnrText);
  
  if (!result.success || result.flights.length === 0) {
    console.error('[parseAmadeusPNRToVuelos] Error:', result.errors);
    return [];
  }

  // Mapear ParsedFlight[] a Vuelo[]
  return result.flights.map((flight, idx) => ({
    tipo: idx === 0 ? 'ida' : 'vuelta',
    aerolinea_codigo: flight.aerolinea_codigo,
    aerolinea_nombre: flight.aerolinea_nombre,
    numero_vuelo: flight.numero_vuelo,
    origen_codigo: flight.origen_codigo,
    origen_nombre: flight.origen_nombre,
    destino_codigo: flight.destino_codigo,
    destino_nombre: flight.destino_nombre,
    fecha_salida: flight.fecha_salida, // Ya viene en formato YYYY-MM-DD
    hora_salida: flight.hora_salida,   // Ya viene en formato HH:MM
    hora_llegada: flight.hora_llegada, // Ya viene en formato HH:MM
    clase: flight.clase_codigo,
    escalas: flight.dias_adicionales || 0,
    notas: flight.notas
  }));
}

export default function PaquetesAdmin() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<Paquete | null>(null);
  const [formData, setFormData] = useState<Paquete>(emptyPaquete);
  const [incluyeInput, setIncluyeInput] = useState('');
  const [noIncluyeInput, setNoIncluyeInput] = useState('');
  const [recursoInput, setRecursoInput] = useState<{ nombre: string; url: string; tipo: 'imagen' | 'video' | 'pdf' }>({ nombre: '', url: '', tipo: 'imagen' });
  const [modoItinerario, setModoItinerario] = useState<'amadeus' | 'manual'>('manual');
  const [pnrRaw, setPnrRaw] = useState('');

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
    // Reiniciar estados del modo itinerario
    setModoItinerario('manual');
    setPnrRaw('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEBUG: Mostrar qué se va a enviar
    console.log('Datos a enviar:', formData);
    
    try {
      let response;
      if (editingPaquete) {
        response = await api.put(`/paquetes/${editingPaquete.id}`, formData);
      } else {
        response = await api.post('/paquetes', formData);
      }
      console.log('Respuesta exitosa:', response.data);
      setShowModal(false);
      // Limpiar estados del modo itinerario
      setModoItinerario('manual');
      setPnrRaw('');
      fetchPaquetes();
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.response?.data?.details || err.message || 'Error desconocido al guardar paquete';
      const errorCode = err.response?.data?.code || '';
      toastError(`Error ${errorCode ? '(' + errorCode + ')' : ''}: ${errorMsg}`, 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este paquete?')) return;
    try {
      await api.delete(`/paquetes/${id}`);
      fetchPaquetes();
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al eliminar paquete', 'Error');
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

  // Helper functions para manejar vuelos
  const updateVueloIda = (field: keyof Vuelo, value: string) => {
    const vuelos = formData.vuelos || [];
    const vueloIda = vuelos.find(v => v.tipo === 'ida');
    const vueloVuelta = vuelos.find(v => v.tipo === 'vuelta');
    
    const updatedVuelo: Vuelo = {
      tipo: 'ida',
      origen_codigo: vueloIda?.origen_codigo || '',
      origen_nombre: vueloIda?.origen_nombre || '',
      destino_codigo: vueloIda?.destino_codigo || '',
      destino_nombre: vueloIda?.destino_nombre || '',
      fecha_salida: vueloIda?.fecha_salida || '',
      hora_salida: vueloIda?.hora_salida || '',
      hora_llegada: vueloIda?.hora_llegada || '',
      aerolinea_codigo: vueloIda?.aerolinea_codigo || '',
      aerolinea_nombre: vueloIda?.aerolinea_nombre || '',
      numero_vuelo: vueloIda?.numero_vuelo || '',
      escalas: vueloIda?.escalas || 0,
      ...vueloIda,
      [field]: value
    };

    const otrosVuelos = vuelos.filter(v => v.tipo !== 'ida');
    setFormData({ ...formData, vuelos: [...otrosVuelos, updatedVuelo] });
  };

  const updateVueloVuelta = (field: keyof Vuelo, value: string) => {
    const vuelos = formData.vuelos || [];
    const vueloVuelta = vuelos.find(v => v.tipo === 'vuelta');
    const vueloIda = vuelos.find(v => v.tipo === 'ida');
    
    const updatedVuelo: Vuelo = {
      tipo: 'vuelta',
      origen_codigo: vueloVuelta?.origen_codigo || '',
      origen_nombre: vueloVuelta?.origen_nombre || '',
      destino_codigo: vueloVuelta?.destino_codigo || '',
      destino_nombre: vueloVuelta?.destino_nombre || '',
      fecha_salida: vueloVuelta?.fecha_salida || '',
      hora_salida: vueloVuelta?.hora_salida || '',
      hora_llegada: vueloVuelta?.hora_llegada || '',
      aerolinea_codigo: vueloVuelta?.aerolinea_codigo || '',
      aerolinea_nombre: vueloVuelta?.aerolinea_nombre || '',
      numero_vuelo: vueloVuelta?.numero_vuelo || '',
      escalas: vueloVuelta?.escalas || 0,
      ...vueloVuelta,
      [field]: value
    };

    const otrosVuelos = vuelos.filter(v => v.tipo !== 'vuelta');
    setFormData({ ...formData, vuelos: [...otrosVuelos, updatedVuelo] });
  };

  // Helper functions para manejar hoteles
  const addHotel = () => {
    const nuevoHotel: Hotel = {
      id: crypto.randomUUID(),
      nombre: '',
      link: '',
      ciudad: formData.destino || '',
      precios: {
        doble: formData.precio_doble || 0,
        triple: formData.precio_triple || 0,
        cuadruple: formData.precio_cuadruple || 0
      }
    };
    setFormData({ ...formData, hoteles: [...(formData.hoteles || []), nuevoHotel] });
  };

  const updateHotel = (index: number, field: keyof Hotel | 'precio_doble' | 'precio_triple' | 'precio_cuadruple', value: string | number) => {
    const hoteles = [...(formData.hoteles || [])];
    if (field.startsWith('precio_')) {
      const tipo = field.replace('precio_', '') as 'doble' | 'triple' | 'cuadruple';
      hoteles[index].precios[tipo] = Number(value) || 0;
    } else {
      (hoteles[index] as any)[field] = value;
    }
    setFormData({ ...formData, hoteles });
  };

  const removeHotel = (index: number) => {
    setFormData({ 
      ...formData, 
      hoteles: (formData.hoteles || []).filter((_, i) => i !== index) 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">Gestión de Paquetes</h2>
          <p className="text-[var(--muted-foreground)]">Crea y administra los paquetes turísticos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Paquete
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between gap-4">
           <div className="flex-1 max-w-md flex items-center gap-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2">
             <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
             <input type="text" placeholder="Buscar paquetes..." className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)]" />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-all">
             <Filter className="w-4 h-4" /> Filtros
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Paquete</th>
                <th className="px-6 py-4 font-black">Destino</th>
                <th className="px-6 py-4 font-black">Precio Doble</th>
                <th className="px-6 py-4 font-black">Comisión</th>
                <th className="px-6 py-4 font-black">Cupos</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paquetes.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--muted)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[var(--foreground)] group-hover:text-blue-400 transition-colors uppercase">{p.nombre}</p>
                      {p.vuelos && p.vuelos.length > 0 && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full" title={`${p.vuelos.length} vuelo(s) configurado(s)`}>
                          ✈️
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">{p.tipo} • {p.duracion} días</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{p.destino}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-400">${formatCurrency(p.precio_doble)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-400">${formatCurrency(p.comision_monto_usd || 0)}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{p.cupos_disponibles} / {p.cupos_totales}</td>
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
                         className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => p.id && handleDelete(p.id)}
                         className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 transition-all"
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
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-6">
              {editingPaquete ? 'Editar Paquete' : 'Nuevo Paquete'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Nombre del Paquete</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    placeholder="Ej: Europa Express 2024"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Destino</label>
                  <input
                    type="text"
                    required
                    value={formData.destino}
                    onChange={(e) => setFormData({...formData, destino: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    placeholder="Ej: Madrid, España"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  >
                    <option value="internacional">Internacional</option>
                    <option value="nacional">Nacional</option>
                    <option value="regional">Regional</option>
                    <option value="crucero">Crucero</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Duración (días)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.duracion}
                    onChange={(e) => setFormData({...formData, duracion: Number(e.target.value)})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Fecha de Salida</label>
                  <input
                    type="date"
                    value={formData.fecha_salida || ''}
                    onChange={(e) => setFormData({...formData, fecha_salida: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Precio Doble</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.precio_doble}
                      onChange={(e) => setFormData({...formData, precio_doble: Number(e.target.value)})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Precio Triple</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.precio_triple}
                      onChange={(e) => setFormData({...formData, precio_triple: Number(e.target.value)})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Precio Cuádruple</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.precio_cuadruple}
                      onChange={(e) => setFormData({...formData, precio_cuadruple: Number(e.target.value)})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Comisión (USD)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.comision_monto_usd}
                      onChange={(e) => setFormData({...formData, comision_monto_usd: Number(e.target.value)})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Cupos Totales</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.cupos_totales}
                      onChange={(e) => setFormData({...formData, 
                        cupos_totales: Number(e.target.value),
                        cupos_disponibles: Number(e.target.value)
                      })}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'activo' | 'inactivo'})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Itinerario / Descripción del Viaje</label>
                  <textarea
                    rows={5}
                    value={typeof formData.itinerario === 'string' ? formData.itinerario : formData.itinerario?.texto || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      itinerario: { texto: e.target.value, dias: [] },
                      descripcion: e.target.value // Mantener sincronizado por compatibilidad
                    })}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                    placeholder="Describe el itinerario día por día..."
                  />
                </div>

                {/* Incluye */}
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Incluye</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={incluyeInput}
                      onChange={(e) => setIncluyeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluye())}
                      className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                      placeholder="Ej: Vuelo directo"
                    />
                    <button
                      type="button"
                      onClick={addIncluye}
                      className="px-4 py-2 bg-blue-600 rounded-xl text-[var(--foreground)] font-medium"
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
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">No Incluye</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={noIncluyeInput}
                      onChange={(e) => setNoIncluyeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNoIncluye())}
                      className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                      placeholder="Ej: Seguro de viaje"
                    />
                    <button
                      type="button"
                      onClick={addNoIncluye}
                      className="px-4 py-2 bg-blue-600 rounded-xl text-[var(--foreground)] font-medium"
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

                {/* Información de Vuelos */}
                <div className="md:col-span-2 border-t border-[var(--border)] pt-6 mt-2">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                    ✈️ Información de Vuelos
                  </h3>
                  
                  {/* Selector de Modo de Vuelos */}
                  <div className="mb-4">
                    <label className="text-sm text-[var(--muted-foreground)] mb-2 block">Modo de ingreso</label>
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="manual"
                          checked={modoItinerario === 'manual'}
                          onChange={() => setModoItinerario('manual')}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-[var(--foreground)]">✏️ Completar manualmente</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="amadeus"
                          checked={modoItinerario === 'amadeus'}
                          onChange={() => setModoItinerario('amadeus')}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-[var(--foreground)]">📋 Parsear PNR de Amadeus</span>
                      </label>
                    </div>

                    {modoItinerario === 'amadeus' && (
                      <div className="space-y-3 mb-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                        <textarea
                          rows={5}
                          value={pnrRaw}
                          onChange={(e) => setPnrRaw(e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none font-mono text-sm"
                          placeholder="Pega aquí el texto del PNR de Amadeus...

Ejemplo:
1. AA1234 Y 15JAN 1 BUEEZE HK1  1030 1300  777 J
2. AA5678 Y 20JAN 2 MIAEZE HK1  1500 0430  777 J"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const vuelosParseados = parseAmadeusPNRToVuelos(pnrRaw);
                              if (vuelosParseados.length === 0) {
                                toastError('No se detectaron vuelos en el PNR. Verifica el formato.', 'PNR inválido');
                                return;
                              }
                              setFormData({
                                ...formData,
                                vuelos: vuelosParseados
                              });
                              toastSuccess(`${vuelosParseados.length} vuelo(s) parseado(s) correctamente. Revisa los campos de Vuelo de Ida y Vuelta.`, '¡Listo!');
                            }}
                            disabled={!pnrRaw.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-xl text-[var(--foreground)] font-medium text-sm flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Procesar PNR
                          </button>
                          {formData.vuelos && formData.vuelos.length > 0 && (
                            <span className="text-green-400 text-sm flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {formData.vuelos.length} vuelo(s) cargado(s)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Vuelo de IDA */}
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-4">
                    <h4 className="text-blue-400 font-bold mb-3">VUELO DE IDA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Origen *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'ida')?.origen_codigo || ''}
                            onChange={(e) => updateVueloIda('origen_codigo', e.target.value.toUpperCase())}
                            className="w-20 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500 uppercase"
                            placeholder="MVD"
                            maxLength={3}
                          />
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'ida')?.origen_nombre || ''}
                            onChange={(e) => updateVueloIda('origen_nombre', e.target.value)}
                            className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                            placeholder="Montevideo"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Destino *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'ida')?.destino_codigo || ''}
                            onChange={(e) => updateVueloIda('destino_codigo', e.target.value.toUpperCase())}
                            className="w-20 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500 uppercase"
                            placeholder="MAD"
                            maxLength={3}
                          />
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'ida')?.destino_nombre || ''}
                            onChange={(e) => updateVueloIda('destino_nombre', e.target.value)}
                            className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                            placeholder="Madrid"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Fecha de Salida *</label>
                        <input
                          type="date"
                          value={formData.vuelos?.find(v => v.tipo === 'ida')?.fecha_salida || ''}
                          onChange={(e) => updateVueloIda('fecha_salida', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Aerolínea</label>
                        <div className="flex items-center gap-2">
                          <AirlineLogo
                            iataCode={formData.vuelos?.find(v => v.tipo === 'ida')?.aerolinea_codigo || ''}
                            size={28}
                          />
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'ida')?.aerolinea_nombre || ''}
                            onChange={(e) => updateVueloIda('aerolinea_nombre', e.target.value)}
                            className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                            placeholder="Ej: Air Europa"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Hora Salida</label>
                        <input
                          type="time"
                          value={formData.vuelos?.find(v => v.tipo === 'ida')?.hora_salida || ''}
                          onChange={(e) => updateVueloIda('hora_salida', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Hora Llegada</label>
                        <input
                          type="time"
                          value={formData.vuelos?.find(v => v.tipo === 'ida')?.hora_llegada || ''}
                          onChange={(e) => updateVueloIda('hora_llegada', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">N° Vuelo</label>
                        <input
                          type="text"
                          value={formData.vuelos?.find(v => v.tipo === 'ida')?.numero_vuelo || ''}
                          onChange={(e) => updateVueloIda('numero_vuelo', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                          placeholder="UX046"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Escalas</label>
                        <select
                          value={formData.vuelos?.find(v => v.tipo === 'ida')?.escalas || 0}
                          onChange={(e) => updateVueloIda('escalas', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                        >
                          <option value={0} className="bg-slate-900">Directo</option>
                          <option value={1} className="bg-slate-900">1 escala</option>
                          <option value={2} className="bg-slate-900">2 escalas</option>
                          <option value={3} className="bg-slate-900">3+ escalas</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vuelo de VUELTA */}
                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <h4 className="text-purple-400 font-bold mb-3">VUELO DE VUELTA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Origen *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.origen_codigo || ''}
                            onChange={(e) => updateVueloVuelta('origen_codigo', e.target.value.toUpperCase())}
                            className="w-20 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500 uppercase"
                            placeholder="MAD"
                            maxLength={3}
                          />
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.origen_nombre || ''}
                            onChange={(e) => updateVueloVuelta('origen_nombre', e.target.value)}
                            className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                            placeholder="Madrid"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Destino *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.destino_codigo || ''}
                            onChange={(e) => updateVueloVuelta('destino_codigo', e.target.value.toUpperCase())}
                            className="w-20 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500 uppercase"
                            placeholder="MVD"
                            maxLength={3}
                          />
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.destino_nombre || ''}
                            onChange={(e) => updateVueloVuelta('destino_nombre', e.target.value)}
                            className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                            placeholder="Montevideo"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Fecha de Salida *</label>
                        <input
                          type="date"
                          value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.fecha_salida || ''}
                          onChange={(e) => updateVueloVuelta('fecha_salida', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Aerolínea</label>
                        <div className="flex items-center gap-2">
                          <AirlineLogo
                            iataCode={formData.vuelos?.find(v => v.tipo === 'vuelta')?.aerolinea_codigo || ''}
                            size={28}
                          />
                          <input
                            type="text"
                            value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.aerolinea_nombre || ''}
                            onChange={(e) => updateVueloVuelta('aerolinea_nombre', e.target.value)}
                            className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                            placeholder="Ej: Air Europa"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Hora Salida</label>
                        <input
                          type="time"
                          value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.hora_salida || ''}
                          onChange={(e) => updateVueloVuelta('hora_salida', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Hora Llegada</label>
                        <input
                          type="time"
                          value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.hora_llegada || ''}
                          onChange={(e) => updateVueloVuelta('hora_llegada', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">N° Vuelo</label>
                        <input
                          type="text"
                          value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.numero_vuelo || ''}
                          onChange={(e) => updateVueloVuelta('numero_vuelo', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                          placeholder="UX047"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Escalas</label>
                        <select
                          value={formData.vuelos?.find(v => v.tipo === 'vuelta')?.escalas || 0}
                          onChange={(e) => updateVueloVuelta('escalas', e.target.value)}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] outline-none focus:border-purple-500"
                        >
                          <option value={0} className="bg-slate-900">Directo</option>
                          <option value={1} className="bg-slate-900">1 escala</option>
                          <option value={2} className="bg-slate-900">2 escalas</option>
                          <option value={3} className="bg-slate-900">3+ escalas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Imagen de Portada */}
                <div className="md:col-span-2">
                  <ImagenUploader 
                    imagenUrl={formData.imagen_url || ''}
                    onImagenSubida={(url) => setFormData({...formData, imagen_url: url})}
                  />
                </div>

                {/* Recursos para Vendedores */}
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Recursos para Vendedores (Placas RRSS)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      value={recursoInput.nombre}
                      onChange={(e) => setRecursoInput({...recursoInput, nombre: e.target.value})}
                      className="bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                      placeholder="Nombre del recurso"
                    />
                    <input
                      type="url"
                      value={recursoInput.url}
                      onChange={(e) => setRecursoInput({...recursoInput, url: e.target.value})}
                      className="bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                      placeholder="URL del archivo"
                    />
                    <select
                      value={recursoInput.tipo}
                      onChange={(e) => setRecursoInput({...recursoInput, tipo: e.target.value as 'imagen' | 'video' | 'pdf'})}
                      className="bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] outline-none focus:border-blue-500"
                    >
                      <option value="imagen">Imagen</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addRecurso}
                    className="px-4 py-2 bg-blue-600 rounded-xl text-[var(--foreground)] font-medium mb-2"
                  >
                    Agregar Recurso
                  </button>
                  <div className="space-y-2">
                    {(formData.recursos_vendedores || []).map((recurso, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            recurso.tipo === 'imagen' && "bg-purple-500/20 text-purple-400",
                            recurso.tipo === 'video' && "bg-red-500/20 text-red-400",
                            recurso.tipo === 'pdf' && "bg-orange-500/20 text-orange-400"
                          )}>
                            {recurso.tipo.toUpperCase()}
                          </span>
                          <span className="text-sm text-[var(--foreground)]">{recurso.nombre}</span>
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

              {/* Sección Hoteles */}
              <div className="space-y-4 border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                      🏨 Hoteles del Paquete
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Agrega los hoteles disponibles con sus precios por tipo de habitación
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addHotel}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Agregar Hotel
                  </button>
                </div>

                {formData.hoteles?.length === 0 && (
                  <div className="text-center py-8 bg-[var(--muted)] rounded-xl border border-dashed border-[var(--border)]">
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No hay hoteles configurados. Haz clic en "Agregar Hotel" para comenzar.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.hoteles?.map((hotel, index) => (
                    <div key={hotel.id} className="bg-[var(--muted)] rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase">Hotel {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeHotel(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Nombre del Hotel *</label>
                          <input
                            type="text"
                            required
                            value={hotel.nombre}
                            onChange={(e) => updateHotel(index, 'nombre', e.target.value)}
                            placeholder="Ej: Hotel Madrid Centro"
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Link/URL (opcional)</label>
                          <input
                            type="url"
                            value={hotel.link || ''}
                            onChange={(e) => updateHotel(index, 'link', e.target.value)}
                            placeholder="https://booking.com/hotel..."
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Ciudad</label>
                          <input
                            type="text"
                            value={hotel.ciudad || ''}
                            onChange={(e) => updateHotel(index, 'ciudad', e.target.value)}
                            placeholder="Ej: Madrid"
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Precio Doble *</label>
                          <input
                            type="number"
                            min={0}
                            required
                            value={hotel.precios.doble}
                            onChange={(e) => updateHotel(index, 'precio_doble', e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Precio Triple</label>
                          <input
                            type="number"
                            min={0}
                            value={hotel.precios.triple}
                            onChange={(e) => updateHotel(index, 'precio_triple', e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Precio Cuádruple</label>
                          <input
                            type="number"
                            min={0}
                            value={hotel.precios.cuadruple}
                            onChange={(e) => updateHotel(index, 'precio_cuadruple', e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold transition-all"
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
