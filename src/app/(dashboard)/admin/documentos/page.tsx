"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Files, Upload, Download, Trash2, Search, FileText, Image, File, CheckCircle, XCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Documento {
  id: string;
  venta_id: string;
  tipo: 'boleto_aereo' | 'voucher_hotel' | 'voucher_actividad' | 'seguro' | 'itinerario_final' | 'e_ticket' | 'boarding_pass' | 'otro';
  nombre_archivo: string;
  ruta_archivo: string;
  descripcion?: string;
  fecha_subida: string;
  subido_por: {
    nombre: string;
    apellido: string;
  };
  venta?: {
    codigo: string;
    cliente_nombre: string;
    paquete_nombre: string;
  };
}

interface Venta {
  id: string;
  codigo: string;
  cliente_nombre: string;
  paquete_nombre: string;
}

const tipoLabels: Record<string, { label: string; color: string; icon: any }> = {
  boleto_aereo: { label: 'Boleto Aéreo', color: 'bg-blue-500/10 text-blue-400', icon: FileText },
  voucher_hotel: { label: 'Voucher Hotel', color: 'bg-purple-500/10 text-purple-400', icon: FileText },
  voucher_actividad: { label: 'Voucher Actividad', color: 'bg-green-500/10 text-green-400', icon: FileText },
  seguro: { label: 'Seguro', color: 'bg-orange-500/10 text-orange-400', icon: FileText },
  itinerario_final: { label: 'Itinerario Final', color: 'bg-pink-500/10 text-pink-400', icon: FileText },
  e_ticket: { label: 'E-Ticket', color: 'bg-cyan-500/10 text-cyan-400', icon: FileText },
  boarding_pass: { label: 'Boarding Pass', color: 'bg-yellow-500/10 text-yellow-400', icon: FileText },
  otro: { label: 'Otro', color: 'bg-slate-500/10 text-slate-400', icon: File },
};

export default function DocumentosAdmin() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState('');
  const [uploadForm, setUploadForm] = useState({
    tipo: 'otro' as Documento['tipo'],
    descripcion: '',
    archivo: null as File | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener todas las ventas para el selector
      const ventasRes = await api.get('/ventas');
      setVentas(ventasRes.data);
      
      // Obtener documentos de todas las ventas
      const docsPromises = ventasRes.data.map((v: Venta) => 
        api.get(`/documentos/venta/${v.id}`).catch(() => ({ data: [] }))
      );
      const docsResults = await Promise.all(docsPromises);
      const allDocs = docsResults.flatMap((res, idx) => 
        res.data.map((d: Documento) => ({ ...d, venta: ventasRes.data[idx] }))
      );
      setDocumentos(allDocs);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.archivo || !selectedVenta) return;

    const formData = new FormData();
    formData.append('venta_id', selectedVenta);
    formData.append('tipo', uploadForm.tipo);
    formData.append('descripcion', uploadForm.descripcion);
    formData.append('archivo', uploadForm.archivo);

    try {
      await api.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadForm({ tipo: 'otro', descripcion: '', archivo: null });
      setSelectedVenta('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al subir documento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;
    try {
      await api.delete(`/documentos/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar documento');
    }
  };

  const getFileIcon = (tipo: string) => {
    const config = tipoLabels[tipo] || tipoLabels.otro;
    const Icon = config.icon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Gestión de Documentos</h2>
          <p className="text-slate-400">Administra boletos, vouchers y documentación de viajes</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Subir Documento
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 max-w-md">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar documento..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-300" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Documento</th>
                <th className="px-6 py-4 font-black">Venta</th>
                <th className="px-6 py-4 font-black">Cliente</th>
                <th className="px-6 py-4 font-black">Subido por</th>
                <th className="px-6 py-4 font-black">Fecha</th>
                <th className="px-6 py-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documentos.map((doc) => {
                const tipoConfig = tipoLabels[doc.tipo] || tipoLabels.otro;
                return (
                  <tr key={doc.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tipoConfig.color)}>
                          {getFileIcon(doc.tipo)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{doc.nombre_archivo}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", tipoConfig.color)}>
                            {tipoConfig.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300 font-mono">{doc.venta?.codigo}</p>
                      <p className="text-xs text-slate-500">{doc.venta?.paquete_nombre}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {doc.venta?.cliente_nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {doc.subido_por?.nombre} {doc.subido_por?.apellido}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(doc.fecha_subida).toLocaleDateString('es-UY')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={doc.ruta_archivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-400 transition-all"
                          title="Ver/Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isLoading && (
            <div className="p-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && documentos.length === 0 && (
            <div className="p-20 text-center text-slate-500">
              <Files className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No hay documentos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Subir Documento */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-8">
            <h3 className="text-2xl font-black text-white mb-6">Subir Documento</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Venta</label>
                <select
                  required
                  value={selectedVenta}
                  onChange={(e) => setSelectedVenta(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar venta...</option>
                  {ventas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.codigo} - {v.cliente_nombre} ({v.paquete_nombre})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tipo de Documento</label>
                <select
                  required
                  value={uploadForm.tipo}
                  onChange={(e) => setUploadForm({...uploadForm, tipo: e.target.value as Documento['tipo']})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  {Object.entries(tipoLabels).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Descripción (opcional)</label>
                <textarea
                  value={uploadForm.descripcion}
                  onChange={(e) => setUploadForm({...uploadForm, descripcion: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                  placeholder="Notas sobre el documento..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Archivo</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadForm({...uploadForm, archivo: e.target.files?.[0] || null})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-slate-500 mt-1">Máximo 10MB. Formatos: PDF, JPG, PNG</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                >
                  Subir Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
