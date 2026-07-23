"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ImagenUploader from "@/components/common/ImagenUploader";
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Globe,
  Palette,
  Phone,
  MapPin,
  Mail,
  Clock,
  Type,
  ToggleRight,
  Instagram,
  Facebook,
} from "lucide-react";

const DEFAULT_LANDING = {
  activo: true,
  titulo: "",
  descripcion: "",
  whatsapp: "",
  telefono: "",
  email: "",
  direccion: "",
  horarios: "",
  redes_sociales: {},
  color_primario: "#0ea5e9",
  color_secundario: "#6366f1",
  color_fondo: "#ffffff",
  color_texto: "#0f172a",
  footer_texto: "",
  footer_links: [] as { label: string; url: string }[],
  botones_extra: [] as { label: string; url: string; tipo: string }[],
  seo: { title: "", description: "", keywords: "" },
  mostrar_precios: true,
  permitir_pdf: true,
};

interface LandingTabProps {
  tenantSlug: string;
}

export default function LandingTab({ tenantSlug }: LandingTabProps) {
  const [landing, setLanding] = useState<any>(DEFAULT_LANDING);
  const [slug, setSlug] = useState(tenantSlug);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/config/landing");
        setSlug(res.data.slug || tenantSlug);
        setLanding({ ...DEFAULT_LANDING, ...(res.data.landing || {}) });
      } catch (error: any) {
        console.error("Error cargando landing config:", error);
        setMessage({ type: "error", text: "Error al cargar la configuración de la landing" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [tenantSlug]);

  const updateField = (field: string, value: any) => {
    setLanding((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateRed = (key: string, value: string) => {
    setLanding((prev: any) => ({
      ...prev,
      redes_sociales: { ...prev.redes_sociales, [key]: value },
    }));
  };

  const updateSeo = (key: string, value: string) => {
    setLanding((prev: any) => ({
      ...prev,
      seo: { ...prev.seo, [key]: value },
    }));
  };

  const addFooterLink = () => {
    setLanding((prev: any) => ({
      ...prev,
      footer_links: [...prev.footer_links, { label: "", url: "" }],
    }));
  };

  const updateFooterLink = (idx: number, field: string, value: string) => {
    setLanding((prev: any) => ({
      ...prev,
      footer_links: prev.footer_links.map((l: any, i: number) =>
        i === idx ? { ...l, [field]: value } : l
      ),
    }));
  };

  const removeFooterLink = (idx: number) => {
    setLanding((prev: any) => ({
      ...prev,
      footer_links: prev.footer_links.filter((_: any, i: number) => i !== idx),
    }));
  };

  const addBotonExtra = () => {
    setLanding((prev: any) => ({
      ...prev,
      botones_extra: [...prev.botones_extra, { label: "", url: "", tipo: "link" }],
    }));
  };

  const updateBotonExtra = (idx: number, field: string, value: string) => {
    setLanding((prev: any) => ({
      ...prev,
      botones_extra: prev.botones_extra.map((b: any, i: number) =>
        i === idx ? { ...b, [field]: value } : b
      ),
    }));
  };

  const removeBotonExtra = (idx: number) => {
    setLanding((prev: any) => ({
      ...prev,
      botones_extra: prev.botones_extra.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.put("/config/landing", { landing });
      setMessage({ type: "success", text: "Landing guardada correctamente" });
    } catch (error: any) {
      console.error("Error guardando landing:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error al guardar la landing",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const publicUrl = `https://travel.quotixos.com/${slug}`;

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Preview URL */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          URL pública
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 text-sm text-blue-400 hover:text-blue-300 truncate"
          >
            {publicUrl}
          </a>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] rounded-xl text-sm font-medium hover:bg-[var(--border)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver
          </a>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          El slug se hereda del nombre de la agencia. Para cambiarlo contactá a soporte.
        </p>
      </div>

      {/* General */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-blue-400" />
          General
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Landing activa</p>
              <p className="text-xs text-[var(--muted-foreground)]">Mostrar la página pública de paquetes</p>
            </div>
            <button
              type="button"
              onClick={() => updateField("activo", !landing.activo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${landing.activo ? "bg-blue-600" : "bg-gray-500"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${landing.activo ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Título público</label>
            <input
              type="text"
              value={landing.titulo}
              onChange={(e) => updateField("titulo", e.target.value)}
              placeholder="Ej: Mi Agencia de Viajes"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Descripción</label>
            <textarea
              value={landing.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              rows={3}
              placeholder="Breve descripción que aparece en el hero..."
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Imagen OG (redes sociales)</label>
            <ImagenUploader
              imagenUrl={landing.imagen_og || ""}
              onImagenSubida={(url) => updateField("imagen_og", url)}
              label=""
            />
          </div>
        </div>
      </div>

      {/* Marca */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Apariencia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "color_primario", label: "Color primario" },
            { key: "color_secundario", label: "Color secundario" },
            { key: "color_fondo", label: "Color de fondo" },
            { key: "color_texto", label: "Color de texto" },
          ].map((c: any) => (
            <div key={c.key} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
              <span className="text-sm text-[var(--foreground)]">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-[var(--muted-foreground)]">
                  {(landing as any)[c.key]}
                </span>
                <input
                  type="color"
                  value={(landing as any)[c.key] || "#000000"}
                  onChange={(e) => updateField(c.key, e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-400" />
          Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">WhatsApp</label>
            <input
              type="tel"
              value={landing.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="+598 99 123 456"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Teléfono</label>
            <input
              type="tel"
              value={landing.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
              placeholder="+598 99 123 456"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="email"
                value={landing.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contacto@miagencia.com"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Horarios</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={landing.horarios}
                onChange={(e) => updateField("horarios", e.target.value)}
                placeholder="Lun a Vie 9 a 18hs"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Dirección</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={landing.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
                placeholder="Av. Principal 123, Montevideo"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">Redes sociales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["instagram", "facebook", "tiktok", "linkedin", "youtube"].map((red) => (
              <div key={red}>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1 capitalize">{red}</label>
                <input
                  type="url"
                  value={(landing.redes_sociales || {})[red] || ""}
                  onChange={(e) => updateRed(red, e.target.value)}
                  placeholder={`https://${red}.com/...`}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Footer</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Texto del footer</label>
            <input
              type="text"
              value={landing.footer_texto}
              onChange={(e) => updateField("footer_texto", e.target.value)}
              placeholder="Ej: Todos los derechos reservados."
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Links del footer</label>
            <div className="space-y-2">
              {landing.footer_links.map((link: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateFooterLink(idx, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateFooterLink(idx, "url", e.target.value)}
                    placeholder="URL"
                    className="flex-[2] bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFooterLink(idx)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFooterLink}
              className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" /> Agregar link
            </button>
          </div>
        </div>
      </div>

      {/* Botones extra */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Botones extra</h3>
        <div className="space-y-2">
          {landing.botones_extra.map((btn: any, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={btn.label}
                onChange={(e) => updateBotonExtra(idx, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
              <input
                type="url"
                value={btn.url}
                onChange={(e) => updateBotonExtra(idx, "url", e.target.value)}
                placeholder="URL"
                className="flex-[2] bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
              <select
                value={btn.tipo}
                onChange={(e) => updateBotonExtra(idx, "tipo", e.target.value)}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              >
                <option value="link">Link</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <button
                type="button"
                onClick={() => removeBotonExtra(idx)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBotonExtra}
          className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <Plus className="w-4 h-4" /> Agregar botón
        </button>
      </div>

      {/* Opciones */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <ToggleRight className="w-5 h-5 text-orange-400" />
          Opciones
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Mostrar precios</p>
              <p className="text-xs text-[var(--muted-foreground)]">Mostrar el precio desde en las tarjetas</p>
            </div>
            <button
              type="button"
              onClick={() => updateField("mostrar_precios", !landing.mostrar_precios)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${landing.mostrar_precios ? "bg-blue-600" : "bg-gray-500"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${landing.mostrar_precios ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Permitir descargar PDF</p>
              <p className="text-xs text-[var(--muted-foreground)]">Opción de descargar PDF desde el detalle</p>
            </div>
            <button
              type="button"
              onClick={() => updateField("permitir_pdf", !landing.permitir_pdf)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${landing.permitir_pdf ? "bg-blue-600" : "bg-gray-500"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${landing.permitir_pdf ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Title</label>
            <input
              type="text"
              value={landing.seo?.title || ""}
              onChange={(e) => updateSeo("title", e.target.value)}
              placeholder="Título para Google"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Description</label>
            <textarea
              value={landing.seo?.description || ""}
              onChange={(e) => updateSeo("description", e.target.value)}
              rows={2}
              placeholder="Descripción para buscadores"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Keywords</label>
            <input
              type="text"
              value={landing.seo?.keywords || ""}
              onChange={(e) => updateSeo("keywords", e.target.value)}
              placeholder="agencia de viajes, paquetes turísticos"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar landing
        </button>
      </div>
    </div>
  );
}
