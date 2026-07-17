"use client";

import { Plus, Trash2, Check } from "lucide-react";
import { cn, getSimboloMoneda, parsePrecioInput } from "@/lib/utils";
import type { AlojamientoCotizacion, MonedaCotizacion, TipoAlojamiento } from "@/types/cotizacion";

interface Props {
  alojamientos: AlojamientoCotizacion[];
  moneda?: MonedaCotizacion;
  onChange: (alojamientos: AlojamientoCotizacion[]) => void;
}

const TIPOS_ALOJAMIENTO: TipoAlojamiento[] = [
  "Hotel",
  "Apartamento",
  "Hostal",
  "Resort",
  "Posada",
  "Cabaña",
  "Otro",
];

const TIPOS_HABITACION = [
  { value: "simple", label: "Simple" },
  { value: "doble", label: "Doble" },
  { value: "triple", label: "Triple" },
  { value: "cuadruple", label: "Cuádruple" },
  { value: "suite", label: "Suite" },
];

const REGIMENES = [
  { value: "solo_alojamiento", label: "Solo alojamiento" },
  { value: "desayuno", label: "Desayuno" },
  { value: "media_pension", label: "Media pensión" },
  { value: "todo_incluido", label: "Todo incluido" },
];

function calcularNoches(checkin?: string, checkout?: string) {
  if (!checkin || !checkout) return 0;
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export default function AlojamientoForm({ alojamientos, moneda = "USD", onChange }: Props) {
  const add = () => {
    onChange([
      ...alojamientos,
      {
        nombre_alojamiento: "",
        tipo_alojamiento: "Hotel",
        ciudad: "",
        fecha_checkin: "",
        fecha_checkout: "",
        tipo_habitacion: "doble",
        regimen: "desayuno",
        moneda,
        es_opcion: alojamientos.length > 0,
        seleccionado: alojamientos.length === 0,
      },
    ]);
  };

  const remove = (index: number) => {
    const updated = alojamientos.filter((_, i) => i !== index);
    // Asegurar que al menos uno esté seleccionado si quedan opciones
    if (updated.length > 0 && !updated.some((a) => a.seleccionado)) {
      updated[0].seleccionado = true;
    }
    onChange(updated);
  };

  const update = (index: number, field: keyof AlojamientoCotizacion, value: any) => {
    const updated = [...alojamientos];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "fecha_checkin" || field === "fecha_checkout") {
      updated[index].noches = calcularNoches(updated[index].fecha_checkin, updated[index].fecha_checkout);
    }

    onChange(updated);
  };

  const toggleSeleccionado = (index: number) => {
    const updated = alojamientos.map((a, i) => ({
      ...a,
      seleccionado: i === index,
      es_opcion: i === index ? false : true,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {alojamientos.map((a, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded-2xl border p-4 space-y-4 transition-all",
            a.seleccionado
              ? "bg-emerald-500/5 border-emerald-500/30"
              : "bg-[var(--muted)] border-[var(--border)]"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">
                Opción {idx + 1}
              </span>
              {a.seleccionado && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Check className="w-3 h-3" /> Seleccionado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!a.seleccionado && (
                <button
                  type="button"
                  onClick={() => toggleSeleccionado(idx)}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Marcar como seleccionado
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Tipo</label>
              <select
                value={a.tipo_alojamiento || "Hotel"}
                onChange={(e) => update(idx, "tipo_alojamiento", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              >
                {TIPOS_ALOJAMIENTO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Nombre del alojamiento</label>
              <input
                type="text"
                value={a.nombre_alojamiento || ""}
                onChange={(e) => update(idx, "nombre_alojamiento", e.target.value)}
                placeholder="Ej: Hotel Emblemático"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Ciudad</label>
              <input
                type="text"
                value={a.ciudad || ""}
                onChange={(e) => update(idx, "ciudad", e.target.value)}
                placeholder="Ej: Madrid"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Check-in</label>
              <input
                type="date"
                value={a.fecha_checkin || ""}
                onChange={(e) => update(idx, "fecha_checkin", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Check-out</label>
              <input
                type="date"
                value={a.fecha_checkout || ""}
                onChange={(e) => update(idx, "fecha_checkout", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Noches</label>
              <input
                type="number"
                value={a.noches || ""}
                readOnly
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--muted-foreground)] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Habitación</label>
              <select
                value={a.tipo_habitacion || "doble"}
                onChange={(e) => update(idx, "tipo_habitacion", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              >
                {TIPOS_HABITACION.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Régimen</label>
              <select
                value={a.regimen || "desayuno"}
                onChange={(e) => update(idx, "regimen", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              >
                {REGIMENES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Precio por persona</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">{getSimboloMoneda(moneda)}</span>
                <input
                  type="number"
                  value={a.precio_por_persona ?? ""}
                  onChange={(e) => update(idx, "precio_por_persona", parsePrecioInput(e.target.value))}
                  placeholder="0.00"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Link web (opcional)</label>
              <input
                type="url"
                value={a.link_hotel || ""}
                onChange={(e) => update(idx, "link_hotel", e.target.value)}
                placeholder="https://..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Notas</label>
              <input
                type="text"
                value={a.notas || ""}
                onChange={(e) => update(idx, "notas", e.target.value)}
                placeholder="Detalles adicionales..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-all"
      >
        <Plus className="w-4 h-4" /> Agregar opción de alojamiento
      </button>
    </div>
  );
}
