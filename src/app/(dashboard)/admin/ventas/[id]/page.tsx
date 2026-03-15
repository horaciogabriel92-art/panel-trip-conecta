"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  DollarSign,
  CheckCircle,
  FileText,
  Upload,
  X,
  Plane,
  Hotel,
  Ticket,
  Shield,
  FileCheck,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Venta {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  vendedor_id: string;
  vendedor_nombre?: string;
  paquete_nombre: string;
  fecha_salida?: string;
  num_pasajeros: number;
  precio_total: number;
  comision_monto: number;
  comision_estado: 'pendiente' | 'pagada';
  estado: string;
  fecha_creacion: string;
  notas?: string;
}

interface Documento {
  id: string;
  tipo: string;
  nombre_archivo: string;
  descripcion?: string;
  fecha_subida: string;
}

const tiposDocumentos = [
  { value: 'boleto_aereo', label: 'Boleto Aéreo', icon: Plane },
  { value: 'voucher_hotel', label: 'Voucher Hotel', icon: Hotel },
  { value: 'voucher_actividad', label: 'Voucher Actividad', icon: Ticket },
  { value: 'seguro', label: 'Seguro de Viaje', icon: Shield },
  { value: 'itinerario_final', label: 'Itinerario Final', icon: FileCheck },
  { value: 'e_ticket', label: 'E-Ticket', icon: Plane },
  { value: 'boarding_pass', label: 'Boarding Pass', icon: Ticket },
  { value: 'otro', label: 'Otro', icon: FileText }
];

export default function AdminVentaDetalle() {
  const params = useParams();
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPagarComision, setShowPagarComision] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Formulario de subida
  const [tipoDocumento, setTipoDocumento] = useState('boleto_aereo');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async (docId: string, fileName: string) => {
    setDownloadingId(docId);
    try {
      const response = await api.get(`/documentos/${docId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando:', err);
      alert('Error al descargar el documento');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [ventaRes, docsRes] = await Promise.all([
        api.get(`/ventas/${params.id}`),
        api.get(`/documentos/venta/${params.id}`)
      ]);
      setVenta(ventaRes.data);
      setDocumentos(docsRes.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('documento', archivo);
    formData.append('tipo', tipoDocumento);
    formData.append('descripcion', descripcion);
    formData.append('venta_id', params.id as string);

    try {
      await api.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizar estado de venta a "emitida" si es la primera vez
      if (documentos.length === 0 && venta?.estado === 'confirmada') {
        await api.put(`/ventas/${params.id}/estado`, { estado: 'emitida' });
      }
      
      setShowUploadModal(false);
      setArchivo(null);
      setDescripcion('');
      fetchData();
      alert('Documento subido exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al subir documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocumento = async (docId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;
    
    try {
      await api.delete(`/documentos/${docId}`);
      fetchData();
      alert('Documento eliminado');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const handlePagarComision = async () => {
    try {
      await api.put(`/ventas/${params.id}/pagar-comision`);
      setShowPagarComision(false);
      fetchData();
      alert('Comisión marcada como pagada');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al pagar comisión');
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'emitida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'confirmada': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'en_proceso': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    return tiposDocumentos.find(t => t.value === tipo)?.label || tipo;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Venta no encontrada</h2>
        <Link href="/admin/ventas" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a ventas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/ventas" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white">Venta {venta.codigo}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(venta.estado)}`}>
              {venta.estado.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info general */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Información General</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase mb-1">Cliente</p>
                <p className="font-medium text-white">{venta.cliente_nombre}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase mb-1">Vendedor</p>
                <p className="font-medium text-white">{venta.vendedor_nombre || '-'}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase mb-1">Pasajeros</p>
                <p className="font-medium text-white">{venta.num_pasajeros}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase mb-1">Fecha</p>
                <p className="font-medium text-white">
                  {new Date(venta.fecha_creacion).toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Documentos de Viaje
              </h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir Documento
              </button>
            </div>

            {documentos.length > 0 ? (
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{getTipoDocumentoLabel(doc.tipo)}</p>
                        <p className="text-xs text-slate-400">{doc.nombre_archivo}</p>
                        {doc.descripcion && (
                          <p className="text-xs text-slate-500 mt-1">{doc.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(doc.id, doc.nombre_archivo)}
                        disabled={downloadingId === doc.id}
                        className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 disabled:bg-slate-600 transition-all"
                      >
                        {downloadingId === doc.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteDocumento(doc.id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No hay documentos subidos</p>
              </div>
            )}
          </div>

          {/* Notas */}
          {venta.notas && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Notas</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{venta.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha - Acciones */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">Resumen Financiero</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Venta</span>
                <span className="text-white">${venta.precio_total.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Comisión Vendedor</span>
                <span className="text-2xl font-black text-green-400">${venta.comision_monto.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estado</span>
                <span className={venta.comision_estado === 'pagada' ? 'text-green-400' : 'text-orange-400'}>
                  {venta.comision_estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                </span>
              </div>
            </div>

            {venta.comision_estado === 'pendiente' && (
              <button
                onClick={() => setShowPagarComision(true)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Marcar Comisión Pagada
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Subir Documento */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8">
            <h3 className="text-2xl font-black text-white mb-6">Subir Documento</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tipo de Documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  {tiposDocumentos.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Ej: Vuelo AR1234, Hotel XYZ"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Archivo PDF</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-center cursor-pointer hover:bg-white/10 transition-all"
                >
                  {archivo ? (
                    <div>
                      <p className="text-white font-medium">{archivo.name}</p>
                      <p className="text-sm text-slate-400">Click para cambiar</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400">Click para seleccionar PDF</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  />
                </div>
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
                  disabled={!archivo || isUploading}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold transition-all"
                >
                  {isUploading ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagar Comisión */}
      {showPagarComision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8">
            <h3 className="text-2xl font-black text-white mb-4">Pagar Comisión</h3>
            <p className="text-slate-400 mb-6">
              ¿Estás seguro de marcar la comisión de ${venta.comision_monto.toLocaleString()} como pagada al vendedor?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPagarComision(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePagarComision}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
