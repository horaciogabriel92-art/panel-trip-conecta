"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
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
  Download,
  Plane,
  Hotel,
  Ticket,
  Shield,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Venta {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
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

const tiposDocumentos: Record<string, { icon: any; label: string; color: string }> = {
  boleto_aereo: { icon: Plane, label: 'Boleto Aéreo', color: 'text-blue-400' },
  voucher_hotel: { icon: Hotel, label: 'Voucher Hotel', color: 'text-green-400' },
  voucher_actividad: { icon: Ticket, label: 'Voucher Actividad', color: 'text-purple-400' },
  seguro: { icon: Shield, label: 'Seguro de Viaje', color: 'text-orange-400' },
  itinerario_final: { icon: FileCheck, label: 'Itinerario Final', color: 'text-cyan-400' },
  e_ticket: { icon: Plane, label: 'E-Ticket', color: 'text-blue-400' },
  boarding_pass: { icon: Ticket, label: 'Boarding Pass', color: 'text-pink-400' },
  otro: { icon: FileText, label: 'Documento', color: 'text-slate-400' }
};

export default function VentaDetalle() {
  const params = useParams();
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
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
    
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'emitida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'confirmada': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'en_proceso': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    setDownloadingId(docId);
    try {
      const response = await api.get(`/documentos/${docId}/download`, {
        responseType: 'blob', // Importante para recibir el archivo como blob
      });
      
      // Crear URL del blob y descargar
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
        <Link href="/mis-ventas" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a mis ventas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mis-ventas" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white">Venta {venta.codigo}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(venta.estado)}`}>
              {venta.estado.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {venta.paquete_nombre}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del cliente */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Datos del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase mb-1">Nombre</p>
                <p className="font-medium text-white">{venta.cliente_nombre}</p>
              </div>
              {venta.cliente_email && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase mb-1">Email</p>
                  <p className="font-medium text-white">{venta.cliente_email}</p>
                </div>
              )}
              {venta.cliente_telefono && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 uppercase mb-1">Teléfono</p>
                  <p className="font-medium text-white">{venta.cliente_telefono}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documentos de viaje */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Documentos de Viaje
            </h3>
            
            {documentos.length > 0 ? (
              <div className="space-y-3">
                {documentos.map((doc) => {
                  const tipo = tiposDocumentos[doc.tipo] || tiposDocumentos.otro;
                  const Icon = tipo.icon;
                  
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${tipo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{tipo.label}</p>
                          <p className="text-xs text-slate-400">{doc.nombre_archivo}</p>
                          {doc.descripcion && (
                            <p className="text-xs text-slate-500 mt-1">{doc.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.id, doc.nombre_archivo)}
                        disabled={downloadingId === doc.id}
                        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-xl transition-all"
                      >
                        {downloadingId === doc.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Aún no hay documentos disponibles</p>
                <p className="text-slate-500 text-sm mt-1">
                  El admin los subirá cuando estén listos
                </p>
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

        {/* Columna derecha - Resumen */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">Resumen</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pasajeros</span>
                <span className="text-white">{venta.num_pasajeros}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fecha Salida</span>
                <span className="text-white">
                  {venta.fecha_salida 
                    ? new Date(venta.fecha_salida).toLocaleDateString('es-AR')
                    : 'A definir'
                  }
                </span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-black text-blue-400">${formatCurrency(venta.precio_total)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-400">Tu comisión</span>
                <span className="text-green-400 font-medium">${formatCurrency(venta.comision_monto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estado comisión</span>
                <span className={venta.comision_estado === 'pagada' ? 'text-green-400' : 'text-orange-400'}>
                  {venta.comision_estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                </span>
              </div>
            </div>

            {documentos.length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Documentos listos</span>
                </div>
                <p className="text-sm text-slate-400">
                  {documentos.length} documento{documentos.length > 1 ? 's' : ''} disponible{documentos.length > 1 ? 's' : ''} para descargar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
