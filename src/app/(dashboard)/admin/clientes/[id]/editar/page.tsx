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
  Loader2,
  Save,
  Tag,
  Flag,
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
}

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cliente, setCliente] = useState<Partial<Cliente>>({});
  const [nuevoTag, setNuevoTag] = useState("");

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const res = await api.get(`/clientes/${params.id}`);
        const data = res.data.cliente || res.data;
        setCliente(data);
      } catch (error) {
        console.error("Error cargando cliente:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCliente();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put(`/clientes/${params.id}`, cliente);
      router.push(`/admin/clientes/${params.id}`);
    } catch (error) {
      console.error("Error guardando cliente:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Cliente, value: any) => {
    setCliente((prev) => ({ ...prev, [field]: value }));
  };

  const agregarTag = () => {
    if (!nuevoTag.trim()) return;
    const tags = cliente.tags || [];
    if (!tags.includes(nuevoTag.trim())) {
      handleChange("tags", [...tags, nuevoTag.trim()]);
    }
    setNuevoTag("");
  };

  const eliminarTag = (tag: string) => {
    const tags = cliente.tags || [];
    handleChange("tags", tags.filter((t) => t !== tag));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/clientes/${params.id}`}
          className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)]/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[var(--foreground)]">
            Editar Cliente
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm">
            {cliente.nombre} {cliente.apellido}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={cliente.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={cliente.apellido || ""}
                onChange={(e) => handleChange("apellido", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Tipo de documento
              </label>
              <select
                value={cliente.tipo_documento || "CI"}
                onChange={(e) => handleChange("tipo_documento", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                <option value="CI">CI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Documento
              </label>
              <input
                type="text"
                value={cliente.documento || ""}
                onChange={(e) => handleChange("documento", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={cliente.fecha_nacimiento || ""}
                onChange={(e) => handleChange("fecha_nacimiento", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Nacionalidad
              </label>
              <input
                type="text"
                value={cliente.nacionalidad || ""}
                onChange={(e) => handleChange("nacionalidad", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={cliente.email || ""}
                onChange={(e) => handleChange("email", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Email alternativo
              </label>
              <input
                type="email"
                value={cliente.email_alt || ""}
                onChange={(e) => handleChange("email_alt", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={cliente.telefono || ""}
                onChange={(e) => handleChange("telefono", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Teléfono alternativo
              </label>
              <input
                type="tel"
                value={cliente.telefono_alt || ""}
                onChange={(e) => handleChange("telefono_alt", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={cliente.whatsapp || ""}
                onChange={(e) => handleChange("whatsapp", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={cliente.direccion || ""}
                onChange={(e) => handleChange("direccion", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={cliente.ciudad || ""}
                onChange={(e) => handleChange("ciudad", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                País
              </label>
              <input
                type="text"
                value={cliente.pais || ""}
                onChange={(e) => handleChange("pais", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Información CRM */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-blue-400" />
            Información CRM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Estado
              </label>
              <select
                value={cliente.estado || "activo"}
                onChange={(e) => handleChange("estado", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Prioridad
              </label>
              <select
                value={cliente.prioridad || "media"}
                onChange={(e) => handleChange("prioridad", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Temporada preferida
              </label>
              <select
                value={cliente.temporada_preferida || ""}
                onChange={(e) => handleChange("temporada_preferida", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                <option value="">Sin preferencia</option>
                <option value="verano">Verano</option>
                <option value="invierno">Invierno</option>
                <option value="primavera">Primavera</option>
                <option value="otono">Otoño</option>
                <option value="cualquiera">Cualquiera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Próximo viaje ideal
              </label>
              <input
                type="date"
                value={cliente.fecha_proximo_viaje_ideal || ""}
                onChange={(e) => handleChange("fecha_proximo_viaje_ideal", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Fuente de lead
              </label>
              <select
                value={cliente.fuente_lead || ""}
                onChange={(e) => handleChange("fuente_lead", e.target.value || null)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                <option value="">Seleccionar...</option>
                <option value="Web">Web</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Referido">Referido</option>
                <option value="Evento">Evento</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(cliente.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => eliminarTag(tag)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoTag}
                  onChange={(e) => setNuevoTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), agregarTag())}
                  placeholder="Agregar tag..."
                  className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={agregarTag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Notas CRM
              </label>
              <textarea
                value={cliente.notas_crm || ""}
                onChange={(e) => handleChange("notas_crm", e.target.value || null)}
                rows={4}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/admin/clientes/${params.id}`}
            className="px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-xl font-medium hover:bg-[var(--muted)] transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
