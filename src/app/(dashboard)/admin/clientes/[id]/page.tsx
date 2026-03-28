"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  MapPin,
  History,
  CreditCard,
  Users,
  Edit,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  tipo_documento: string;
  documento: string;
  fecha_nacimiento: string | null;
  nacionalidad: string;
  ciudad: string | null;
  direccion: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

interface Pasajero {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string | null;
  nacionalidad: string;
  es_titular: boolean;
}

interface CotizacionResumen {
  id: string;
  codigo: string;
  nombre_cotizacion?: string;
  destino_principal?: string;
  precio_total: number;
  precio_moneda?: string;
  estado: string;
  fecha_creacion: string;
  num_pasajeros?: number;
}

interface HistorialItem {
  id: string;
  tipo: "creacion" | "cotizacion" | "venta" | "nota" | "llamada";
  descripcion: string;
  fecha: string;
  vendedor_nombre?: string;
}

export default function ClienteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [cotizaciones, setCotizaciones] = useState<CotizacionResumen[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "cotizaciones" | "historial">("info");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clienteId = params.id as string;

        // Cargar cliente con todas sus relaciones
        const clienteRes = await api.get(`/clientes/${clienteId}`);
        const data = clienteRes.data;
        
        setCliente(data.cliente || data);
        setCotizaciones(data.cotizaciones || []);
        setHistorial(data.historial || []);
      } catch (error) {
        console.error("Error cargando datos del cliente:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "convertida":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "pendiente":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "respondida":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "vencida":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "cotizacion":
        return <CreditCard className="w-4 h-4" />;
      case "venta":
        return <CreditCard className="w-4 h-4 text-green-400" />;
      case "llamada":
        return <Phone className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Cliente no encontrado</h2>
        <Link
          href="/admin/clientes"
          className="text-blue-400 hover:text-blue-300 mt-4 inline-block"
        >
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)]/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[var(--foreground)]">
            {cliente.nombre} {cliente.apellido}
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm">
            Cliente desde {new Date(cliente.created_at).toLocaleDateString("es-AR")}
          </p>
        </div>
        <Link
          href={`/admin/clientes/${cliente.id}/editar`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {[
          { id: "info", label: "Información", icon: User },
          { id: "cotizaciones", label: `Cotizaciones (${cotizaciones.length})`, icon: CreditCard },
          { id: "historial", label: "Historial", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Información Personal
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Nombre completo</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Documento</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {cliente.tipo_documento} {cliente.documento}
                  </p>
                </div>
              </div>

              {cliente.fecha_nacimiento && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Fecha de nacimiento</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {new Date(cliente.fecha_nacimiento).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              )}

              {cliente.nacionalidad && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <MapPin className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Nacionalidad</p>
                    <p className="font-medium text-[var(--foreground)]">{cliente.nacionalidad}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contacto */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Contacto
            </h3>
            <div className="space-y-4">
              {cliente.email && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <Mail className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                    <a
                      href={`mailto:${cliente.email}`}
                      className="font-medium text-[var(--foreground)] hover:text-blue-400"
                    >
                      {cliente.email}
                    </a>
                  </div>
                </div>
              )}

              {cliente.telefono && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Teléfono</p>
                    <a
                      href={`tel:${cliente.telefono}`}
                      className="font-medium text-[var(--foreground)] hover:text-blue-400"
                    >
                      {cliente.telefono}
                    </a>
                  </div>
                </div>
              )}

              {cliente.direccion && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <MapPin className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Dirección</p>
                    <p className="font-medium text-[var(--foreground)]">{cliente.direccion}</p>
                  </div>
                </div>
              )}

              {cliente.ciudad && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <MapPin className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Ciudad</p>
                    <p className="font-medium text-[var(--foreground)]">{cliente.ciudad}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {cliente.notas && (
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Notas</h3>
              <p className="text-[var(--foreground)] whitespace-pre-wrap">{cliente.notas}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "cotizaciones" && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
            Cotizaciones ({cotizaciones.length})
          </h3>

          {cotizaciones.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay cotizaciones registradas para este cliente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cotizaciones.map((cot) => (
                <Link
                  key={cot.id}
                  href={`/admin/cotizaciones/${cot.id}`}
                  className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)]/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {cot.nombre_cotizacion || cot.destino_principal || cot.codigo}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {cot.num_pasajeros || 1} pasajeros •{" "}
                        {new Date(cot.fecha_creacion).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getEstadoColor(
                        cot.estado
                      )}`}
                    >
                      {cot.estado}
                    </span>
                    <p className="font-bold text-[var(--foreground)]">
                      ${cot.precio_total} {cot.precio_moneda}
                    </p>
                    <ExternalLink className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "historial" && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Historial</h3>

          {historial.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay actividad registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-[var(--muted)] rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTipoIcon(item.tipo)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--foreground)]">{item.descripcion}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {new Date(item.fecha).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {item.vendedor_nombre && ` • ${item.vendedor_nombre}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
