"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { clientesAPI, ClienteInput } from "@/lib/api-clientes";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ClienteInput>({
    tipo_documento: "CI",
    documento: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    nacionalidad: "Uruguay",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.nombre || !formData.apellido) {
        setError("Nombre y apellido son requeridos");
        setLoading(false);
        return;
      }

      if (!formData.documento && !formData.email) {
        setError("Debe proporcionar al menos documento o email");
        setLoading(false);
        return;
      }

      const result = await clientesAPI.crear(formData);
      router.push(`/admin/clientes/${result.cliente.id}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Ya existe un cliente con este email o documento");
      } else {
        setError(err.response?.data?.error || "Error al crear cliente");
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)]/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)]">Nuevo Cliente</h2>
          <p className="text-[var(--muted-foreground)]">
            Se creará automáticamente como pasajero titular
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Documento */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo_documento}
              onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
            >
              <option value="CI">CI</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Documento
            </label>
            <input
              type="text"
              value={formData.documento}
              onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
              placeholder="Número de documento"
            />
          </div>
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
              placeholder="Nombre"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Apellido *
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
              placeholder="Apellido"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
            placeholder="cliente@email.com"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
            placeholder="099 123 456"
          />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
          />
        </div>

        {/* Nacionalidad */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
            Nacionalidad
          </label>
          <input
            type="text"
            value={formData.nacionalidad}
            onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/admin/clientes"
            className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium hover:bg-[var(--muted)] transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Cliente"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
