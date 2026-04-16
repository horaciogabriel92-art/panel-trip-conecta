"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Percent, 
  CheckCircle, 
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

interface Vendedor {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: string;
  activo: boolean;
  comision_porcentaje: number;
  fecha_registro: string;
}

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  vendedor_id?: string;
  paquete_nombre?: string;
  precio_total: number;
  comision_vendedor?: number;
  estado: 'pendiente' | 'convertida' | 'vencida' | 'cancelada';
  fecha_creacion: string;
  num_pasajeros: number;
}

export default function VendedorDetalle() {
  const params = useParams();
  const router = useRouter();
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendedorData();
  }, [params.id]);

  const fetchVendedorData = async () => {
    try {
      // Fetch vendedor info
      const usersRes = await api.get('/auth/users');
      const vendedorData = usersRes.data.find((u: Vendedor) => u.id === params.id);
      
      if (!vendedorData) {
        router.push('/admin/vendedores');
        return;
      }
      setVendedor(vendedorData);

      // Fetch cotizaciones del vendedor
      const cotizacionesRes = await api.get('/cotizaciones');
      const vendedorCotizaciones = cotizacionesRes.data.filter(
        (c: Cotizacion) => {
          // Buscar el vendedor_id en la respuesta
          return c.vendedor_id === params.id || 
                 (c as any).vendedor?.id === params.id
        }
      );
      setCotizaciones(vendedorCotizaciones);
    } catch (err) {
      console.error('Error cargando datos del vendedor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'convertida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pendiente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelada': return 'bg-slate-500/10 text-[var(--muted-foreground)] border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  // Estadísticas
  const stats = {
    totalCotizaciones: cotizaciones.length,
    convertidas: cotizaciones.filter(c => c.estado === 'convertida').length,
    pendientes: cotizaciones.filter(c => c.estado === 'pendiente').length,
    montoTotal: cotizaciones.reduce((sum, c) => sum + (c.precio_total || 0), 0),
    comisionTotal: cotizaciones.reduce((sum, c) => sum + (c.comision_vendedor || 0), 0)
  };

  const conversionRate = stats.totalCotizaciones > 0 
    ? Math.round((stats.convertidas / stats.totalCotizaciones) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendedor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Vendedor no encontrado</h2>
        <Link href="/admin/vendedores" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a vendedores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/vendedores" className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all">
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[var(--foreground)]">Detalle del Vendedor</h2>
          <p className="text-[var(--muted-foreground)] text-sm">
            Información completa y cotizaciones del agente
          </p>
        </div>
      </div>

      {/* Info del Vendedor */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-400">
              {vendedor.nombre[0]}{vendedor.apellido[0]}
            </span>
          </div>
          
          {/* Info Principal */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">
                {vendedor.nombre} {vendedor.apellido}
              </h3>
              {vendedor.activo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                  <CheckCircle className="w-3 h-3" /> Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                  <XCircle className="w-3 h-3" /> Inactivo
                </span>
              )}
            </div>
            <p className="text-[var(--muted-foreground)] text-sm">ID: {vendedor.id.slice(0, 12)}...</p>
          </div>

          {/* Datos de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
              <Mail className="w-5 h-5 text-[var(--muted-foreground)]" />
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                <p className="text-sm text-[var(--foreground)]">{vendedor.email}</p>
              </div>
            </div>
            {vendedor.telefono && (
              <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Teléfono</p>
                  <p className="text-sm text-[var(--foreground)]">{vendedor.telefono}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
              <User className="w-5 h-5 text-[var(--muted-foreground)]" />
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Rol</p>
                <p className="text-sm text-[var(--foreground)] font-medium text-purple-400 capitalize">
                  {vendedor.rol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-[var(--muted-foreground)]">Total Cotizaciones</p>
          </div>
          <p className="text-3xl font-black text-[var(--foreground)]">{stats.totalCotizaciones}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm text-[var(--muted-foreground)]">Convertidas</p>
          </div>
          <p className="text-3xl font-black text-green-400">{stats.convertidas}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <p className="text-sm text-[var(--muted-foreground)]">Tasa Conversión</p>
          </div>
          <p className="text-3xl font-black text-orange-400">{conversionRate}%</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-[var(--muted-foreground)]">Monto Total</p>
          </div>
          <p className="text-3xl font-black text-blue-400">${formatCurrency(stats.montoTotal)}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-[var(--muted-foreground)]">Comisión Total</p>
          </div>
          <p className="text-3xl font-black text-purple-400">${formatCurrency(stats.comisionTotal)}</p>
        </div>
      </div>

      {/* Lista de Cotizaciones */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Cotizaciones del Vendedor
          </h3>
        </div>

        {cotizaciones.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
            <p className="text-[var(--muted-foreground)] text-lg">No hay cotizaciones registradas</p>
            <p className="text-[var(--muted-foreground)] text-sm mt-2">
              Este vendedor aún no ha creado ninguna cotización
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Código</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Cliente</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Paquete</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Pasajeros</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Estado</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Fecha</th>
                  <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                    <td className="p-4">
                      <span className="text-blue-400 font-mono text-sm font-bold">{c.codigo}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{c.cliente_nombre}</p>
                        {c.cliente_email && (
                          <p className="text-xs text-[var(--muted-foreground)]">{c.cliente_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--foreground)]">{c.paquete_nombre || '-'}</td>
                    <td className="p-4">
                      <span className="text-[var(--foreground)] font-medium">{c.num_pasajeros}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-blue-400 font-bold">${formatCurrency(c.precio_total)}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase border",
                        getStatusColor(c.estado)
                      )}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--muted-foreground)] text-sm">
                      {new Date(c.fecha_creacion).toLocaleDateString('es-AR')}
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/admin/cotizaciones/${c.id}`}
                        className="p-2 bg-[var(--muted)] rounded-lg hover:bg-blue-600 transition-all inline-flex items-center gap-2 text-sm text-[var(--foreground)] hover:text-[var(--foreground)]"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
