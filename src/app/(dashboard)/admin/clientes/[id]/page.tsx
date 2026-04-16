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
  MessageSquare,
  Plus,
  Tag,
  Flag,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  email_alt: string | null;
  telefono: string | null;
  telefono_alt: string | null;
  whatsapp: string | null;
  tipo_documento: string;
  documento: string;
  fecha_nacimiento: string | null;
  nacionalidad: string;
  ciudad: string | null;
  direccion: string | null;
  pais: string | null;
  notas: string | null;
  notas_crm: string | null;
  // Campos CRM
  preferencias_viaje: any | null;
  temporada_preferida: string | null;
  fuente_lead: string | null;
  referido_por: string | null;
  tags: string[] | null;
  prioridad: 'alta' | 'media' | 'baja' | null;
  fecha_proximo_viaje_ideal: string | null;
  estado: 'activo' | 'inactivo' | 'bloqueado' | null;
  created_at: string;
  updated_at: string;
}

interface Nota {
  id: string;
  contenido: string;
  tipo: string;
  es_privada: boolean;
  created_at: string;
  vendedor: {
    id: string;
    nombre: string;
    apellido: string;
  };
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
  const [notas, setNotas] = useState<Nota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "cotizaciones" | "historial" | "notas">("info");
  
  // Estados para notas
  const [nuevaNota, setNuevaNota] = useState("");
  const [tipoNota, setTipoNota] = useState("general");
  const [esPrivada, setEsPrivada] = useState(false);
  const [enviandoNota, setEnviandoNota] = useState(false);

  // Estados para agregar pasajero
  const [showPasajeroModal, setShowPasajeroModal] = useState(false);
  const [nuevoPasajero, setNuevoPasajero] = useState({
    tipo_documento: "CI",
    documento: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    nacionalidad: "Uruguay",
  });
  const [guardandoPasajero, setGuardandoPasajero] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clienteId = params.id as string;

        // Cargar cliente con todas sus relaciones
        const clienteRes = await api.get(`/clientes/${clienteId}`);
        const data = clienteRes.data;
        
        setCliente(data.cliente || data);
        setPasajeros(data.pasajeros || []);
        setCotizaciones(data.cotizaciones || []);
        setHistorial(data.historial || []);
        
        // Cargar notas (usando el mismo endpoint con :id/notas)
        const notasRes = await api.get(`/clientes/${clienteId}/notas`);
        setNotas(notasRes.data?.notas || []);
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
  
  const handleCrearNota = async () => {
    if (!nuevaNota.trim() || !cliente) return;
    
    setEnviandoNota(true);
    try {
      const res = await api.post(`/clientes/${cliente.id}/notas`, {
        contenido: nuevaNota,
        tipo: tipoNota,
        es_privada: esPrivada
      });
      
      setNotas([res.data.nota, ...notas]);
      setNuevaNota("");
      setTipoNota("general");
      setEsPrivada(false);
    } catch (error) {
      console.error("Error creando nota:", error);
    } finally {
      setEnviandoNota(false);
    }
  };
  
  const handleEliminarNota = async (notaId: string) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    
    try {
      await api.delete(`/clientes/notas/${notaId}`);
      setNotas(notas.filter(n => n.id !== notaId));
    } catch (error) {
      console.error("Error eliminando nota:", error);
    }
  };
  
  const getPrioridadColor = (prioridad: string | null) => {
    switch (prioridad?.toLowerCase()) {
      case "alta": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "baja": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };
  
  const getEstadoClienteColor = (estado: string | null) => {
    switch (estado?.toLowerCase()) {
      case "activo": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "bloqueado": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "inactivo": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Helpers para formatear valores de visualización
  const formatPrioridad = (prioridad: string | null) => {
    const map: Record<string, string> = {
      alta: "Alta",
      media: "Media", 
      baja: "Baja"
    };
    return map[prioridad?.toLowerCase() || ""] || prioridad || "";
  };

  const formatEstado = (estado: string | null) => {
    const map: Record<string, string> = {
      activo: "Activo",
      inactivo: "Inactivo",
      bloqueado: "Bloqueado"
    };
    return map[estado?.toLowerCase() || ""] || estado || "";
  };

  const formatTemporada = (temporada: string | null) => {
    const map: Record<string, string> = {
      verano: "Verano",
      invierno: "Invierno",
      primavera: "Primavera",
      otono: "Otoño",
      cualquiera: "Cualquiera"
    };
    return map[temporada?.toLowerCase() || ""] || temporada || "";
  };

  // Helper para formatear fechas de forma segura
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-AR");
    } catch {
      return "Fecha inválida";
    }
  };

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

  const handleAgregarPasajero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;
    setGuardandoPasajero(true);
    try {
      const res = await api.post(`/clientes/${cliente.id}/pasajeros`, nuevoPasajero);
      setPasajeros((prev) => [...prev, res.data.pasajero]);
      setNuevoPasajero({
        tipo_documento: "CI",
        documento: "",
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        nacionalidad: "Uruguay",
      });
      setShowPasajeroModal(false);
    } catch (error: any) {
      console.error("Error agregando pasajero:", error);
      alert(error.response?.data?.error || "Error al agregar pasajero");
    } finally {
      setGuardandoPasajero(false);
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
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/admin/clientes"
          className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)]/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[var(--foreground)]">
              {cliente.nombre} {cliente.apellido}
            </h2>
            {cliente.prioridad && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getPrioridadColor(cliente.prioridad)}`}>
                {formatPrioridad(cliente.prioridad)}
              </span>
            )}
            {cliente.estado && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getEstadoClienteColor(cliente.estado)}`}>
                {formatEstado(cliente.estado)}
              </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">
            Cliente desde {formatDate(cliente.created_at)}
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
      <div className="flex gap-2 border-b border-[var(--border)] overflow-x-auto">
        {[
          { id: "info", label: "Información", icon: User },
          { id: "cotizaciones", label: `Cotizaciones (${cotizaciones.length})`, icon: CreditCard },
          { id: "notas", label: `Notas (${notas.length})`, icon: MessageSquare },
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
              <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl min-w-0">
                <User className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">Nombre completo</p>
                  <p className="font-medium text-[var(--foreground)] break-words">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl min-w-0">
                <FileText className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">Documento</p>
                  <p className="font-medium text-[var(--foreground)] break-words">
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
                      {formatDate(cliente.fecha_nacimiento)}
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
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl min-w-0">
                  <Mail className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                    <a
                      href={`mailto:${cliente.email}`}
                      className="font-medium text-[var(--foreground)] hover:text-blue-400 break-all"
                    >
                      {cliente.email}
                    </a>
                  </div>
                </div>
              )}
              
              {cliente.email_alt && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl min-w-0">
                  <Mail className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">Email alternativo</p>
                    <a
                      href={`mailto:${cliente.email_alt}`}
                      className="font-medium text-[var(--foreground)] hover:text-blue-400 break-all"
                    >
                      {cliente.email_alt}
                    </a>
                  </div>
                </div>
              )}

              {cliente.telefono && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl min-w-0">
                  <Phone className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">Teléfono</p>
                    <a
                      href={`tel:${cliente.telefono}`}
                      className="font-medium text-[var(--foreground)] hover:text-blue-400 break-words"
                    >
                      {cliente.telefono}
                    </a>
                  </div>
                </div>
              )}
              
              {cliente.telefono_alt && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Teléfono alternativo</p>
                    <a
                      href={`tel:${cliente.telefono_alt}`}
                      className="font-medium text-[var(--foreground)] hover:text-blue-400"
                    >
                      {cliente.telefono_alt}
                    </a>
                  </div>
                </div>
              )}
              
              {cliente.whatsapp && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">WhatsApp</p>
                    <a
                      href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--foreground)] hover:text-green-400"
                    >
                      {cliente.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {cliente.direccion && (
                <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl min-w-0">
                  <MapPin className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">Dirección</p>
                    <p className="font-medium text-[var(--foreground)] break-words">{cliente.direccion}</p>
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
          
          {/* Preferencias CRM */}
          {(cliente.temporada_preferida || cliente.fecha_proximo_viaje_ideal || cliente.tags || cliente.fuente_lead) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-400" />
                Preferencias
              </h3>
              <div className="space-y-4">
                {cliente.temporada_preferida && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                    <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Temporada preferida</p>
                      <p className="font-medium text-[var(--foreground)]">{formatTemporada(cliente.temporada_preferida)}</p>
                    </div>
                  </div>
                )}
                
                {cliente.fecha_proximo_viaje_ideal && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                    <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Próximo viaje ideal</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {formatDate(cliente.fecha_proximo_viaje_ideal)}
                      </p>
                    </div>
                  </div>
                )}
                
                {cliente.fuente_lead && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                    <Tag className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Fuente</p>
                      <p className="font-medium text-[var(--foreground)]">{cliente.fuente_lead}</p>
                    </div>
                  </div>
                )}
                
                {cliente.tags && cliente.tags.length > 0 && (
                  <div className="p-3 bg-[var(--muted)] rounded-xl">
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {cliente.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pasajeros frecuentes */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Pasajeros frecuentes</h3>
              <button
                onClick={() => setShowPasajeroModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            {pasajeros.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No hay pasajeros registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pasajeros.map((p) => (
                  <div key={p.id} className="p-3 bg-[var(--muted)] rounded-xl">
                    <p className="font-medium text-[var(--foreground)]">
                      {p.nombre} {p.apellido}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Doc: {p.documento}
                    </p>
                    {p.nacionalidad && (
                      <p className="text-xs text-[var(--muted-foreground)]">{p.nacionalidad}</p>
                    )}
                    {p.fecha_nacimiento && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Nac: {new Date(p.fecha_nacimiento).toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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

      {/* Modal Agregar Pasajero */}
      {showPasajeroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-6">Agregar Pasajero</h3>
            <form onSubmit={handleAgregarPasajero} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Tipo</label>
                  <select
                    value={nuevoPasajero.tipo_documento}
                    onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, tipo_documento: e.target.value })}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                  >
                    <option value="CI">CI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Documento</label>
                  <input
                    type="text"
                    value={nuevoPasajero.documento}
                    onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, documento: e.target.value })}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                    placeholder="Número de documento"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nuevoPasajero.nombre}
                    onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, nombre: e.target.value })}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={nuevoPasajero.apellido}
                    onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, apellido: e.target.value })}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                    placeholder="Apellido"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={nuevoPasajero.fecha_nacimiento}
                  onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, fecha_nacimiento: e.target.value })}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nacionalidad</label>
                <input
                  type="text"
                  value={nuevoPasajero.nacionalidad}
                  onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, nacionalidad: e.target.value })}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasajeroModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPasajero}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  {guardandoPasajero ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
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
                  className="flex flex-wrap items-center justify-between p-4 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)]/80 transition-colors gap-2"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)] break-words">
                        {cot.nombre_cotizacion || cot.destino_principal || cot.codigo}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {cot.num_pasajeros || 1} pasajeros •{" "}
                        {formatDate(cot.fecha_creacion)}
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

      {activeTab === "notas" && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Notas del cliente
          </h3>
          
          {/* Formulario nueva nota */}
          <div className="mb-6 p-4 bg-[var(--muted)] rounded-xl">
            <textarea
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              placeholder="Escribir una nueva nota..."
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <select
                  value={tipoNota}
                  onChange={(e) => setTipoNota(e.target.value)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--foreground)]"
                >
                  <option value="general">General</option>
                  <option value="llamada">Llamada</option>
                  <option value="reunion">Reunión</option>
                  <option value="seguimiento">Seguimiento</option>
                  <option value="preferencias">Preferencias</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esPrivada}
                    onChange={(e) => setEsPrivada(e.target.checked)}
                    className="rounded border-[var(--border)]"
                  />
                  Privada
                </label>
              </div>
              <button
                onClick={handleCrearNota}
                disabled={!nuevaNota.trim() || enviandoNota}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
              >
                {enviandoNota ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Agregar nota
              </button>
            </div>
          </div>
          
          {/* Lista de notas */}
          {notas.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay notas registradas</p>
              <p className="text-sm">Agrega la primera nota arriba</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notas.map((nota) => (
                <div key={nota.id} className="p-4 bg-[var(--muted)] rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs uppercase">
                          {nota.tipo}
                        </span>
                        {nota.es_privada && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">
                            Privada
                          </span>
                        )}
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {(() => {
                              const d = nota.created_at ? new Date(nota.created_at) : null;
                              return d && !isNaN(d.getTime()) 
                                ? d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "Fecha inválida";
                            })()}
                        </span>
                      </div>
                      <p className="text-[var(--foreground)] whitespace-pre-wrap break-words">{nota.contenido}</p>
                      {nota.vendedor && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          Por: {nota.vendedor.nombre} {nota.vendedor.apellido}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEliminarNota(nota.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    {getTipoIcon(item.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] break-words">{item.descripcion}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {(() => {
                        const d = item.fecha ? new Date(item.fecha) : null;
                        return d && !isNaN(d.getTime())
                          ? d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Fecha inválida";
                      })()}
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
