"use client";

import { useState } from "react";
import { PUBLIC_API_URL } from "@/lib/publicApi";

interface CotizacionFormProps {
  slug: string;
  paqueteId: string;
  paqueteNombre: string;
  landing: any;
}

export default function CotizacionForm({
  slug,
  paqueteId,
  paqueteNombre,
  landing,
}: CotizacionFormProps) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    documento: "",
    tipo_documento: "CI",
    num_pasajeros: 2,
    tipo_habitacion: "doble",
    fecha_salida_preferida: "",
    comentarios: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${PUBLIC_API_URL}/public/landing/${slug}/cotizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paquete_id: paqueteId,
          ...form,
          num_pasajeros: Number(form.num_pasajeros),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar la consulta");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar la consulta");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ¡Consulta enviada!
        </h3>
        <p className="text-green-700 text-sm">
          Un asesor se pondrá en contacto con vos a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-black/10 p-6 space-y-4"
      style={{ borderColor: "rgba(0,0,0,0.1)" }}
    >
      <h3
        className="text-lg font-semibold"
        style={{ color: landing?.color_texto || "#0f172a" }}
      >
        Consultar por {paqueteNombre}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            required
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            name="apellido"
            required
            value={form.apellido}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium opacity-70 mb-1">
            Documento
          </label>
          <input
            type="text"
            name="documento"
            value={form.documento}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">Tipo</label>
          <select
            name="tipo_documento"
            value={form.tipo_documento}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] bg-white"
          >
            <option value="CI">CI</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Pasajeros
          </label>
          <input
            type="number"
            name="num_pasajeros"
            min={1}
            value={form.num_pasajeros}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Habitación
          </label>
          <select
            name="tipo_habitacion"
            value={form.tipo_habitacion}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] bg-white"
          >
            <option value="doble">Doble</option>
            <option value="triple">Triple</option>
            <option value="cuadruple">Cuádruple</option>
            <option value="single">Single</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium opacity-70 mb-1">
            Fecha de salida preferida
          </label>
          <input
            type="date"
            name="fecha_salida_preferida"
            value={form.fecha_salida_preferida}
            onChange={handleChange}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium opacity-70 mb-1">
          Comentarios
        </label>
        <textarea
          name="comentarios"
          rows={3}
          value={form.comentarios}
          onChange={handleChange}
          className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] resize-none"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: landing?.color_primario || "#0ea5e9" }}
      >
        {loading ? "Enviando..." : "Solicitar cotización"}
      </button>

      {landing?.whatsapp && (
        <a
          href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-sm font-medium py-2 rounded-xl border transition-colors hover:bg-black/5"
          style={{ borderColor: "rgba(0,0,0,0.1)", color: landing?.color_texto || "#0f172a" }}
        >
          ¿Preferís escribir por WhatsApp?
        </a>
      )}
    </form>
  );
}
