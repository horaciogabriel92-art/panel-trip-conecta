"use client";

import { Plus, Trash2, Check } from "lucide-react";
import { cn, getSimboloMoneda, parsePrecioInput } from "@/lib/utils";
import type { CruceroCotizacion, MonedaCotizacion } from "@/types/cotizacion";

interface Props {
  cruceros: CruceroCotizacion[];
  moneda?: MonedaCotizacion;
  onChange: (cruceros: CruceroCotizacion[]) => void;
}

const TIPOS_HABITACION = [
  { value: "simple", label: "Simple" },
  { value: "doble", label: "Doble" },
  { value: "triple", label: "Triple" },
  { value: "cuadruple", label: "Cuádruple" },
  { value: "suite", label: "Suite" },
];

export default function CruceroForm({ cruceros = [], moneda = "USD", onChange }: Props) {
  const add = () => {
    onChange([
      ...cruceros,
      {
        nombre: "",
        compania: "",
        barco: "",
        puerto_embarque: "",
        puerto_desembarque: "",
        fecha_embarque: "",
        fecha_desembarque: "",
        cabina: "",
        tipo_habitacion: "doble",
        moneda,
        precio_por_persona: 0,
        incluido: true,
        es_opcion: false,
        seleccionado: false,
      },
    ]);
  };

  const remove = (index: number) => {
    const updated = cruceros.filter((_, i) => i !== index);
    const opcionales = updated.filter((c) => c.incluido === false);
    if (opcionales.length > 0 && !opcionales.some((c) => c.seleccionado)) {
      const primerOpcional = updated.findIndex((c) => c.incluido === false);
      if (primerOpcional >= 0) updated[primerOpcional].seleccionado = true;
    }
    onChange(updated);
  };

  const update = (index: number, field: keyof CruceroCotizacion, value: any) => {
    const updated = [...cruceros];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const toggleSeleccionado = (index: number) => {
    const target = cruceros[index];
    if (target.incluido !== false && target.es_opcion !== true) return;
    const updated = cruceros.map((c, i) => ({
      ...c,
      seleccionado: i === index,
      es_opcion: c.incluido === false || c.es_opcion === true || i === index,
    }));
    onChange(updated);
  };

  const toggleIncluido = (index: number) => {
    const updated = cruceros.map((c, i) => {
      if (i !== index) return c;
      const nuevoIncluido = !(c.incluido !== false);
      return {
        ...c,
        incluido: nuevoIncluido,
        es_opcion: !nuevoIncluido,
        seleccionado: !nuevoIncluido ? c.seleccionado : false,
      };
    });
    const opcionales = updated.filter((c) => c.incluido === false);
    if (opcionales.length > 0 && !opcionales.some((c) => c.seleccionado)) {
      const primerOpcional = updated.findIndex((c) => c.incluido === false);
      if (primerOpcional >= 0) updated[primerOpcional].seleccionado = true;
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {cruceros.map((c, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded-2xl border p-4 space-y-4 transition-all",
            c.incluido === false
              ? c.seleccionado
                ? "bg-emerald-500/5 border-emerald-500/30"
                : "bg-[var(--muted)] border-[var(--border)]"
              : "bg-[var(--muted)] border-[var(--border)]"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {c.incluido !== false ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Check className="w-3 h-3" /> Incluido
                </span>
              ) : (
                <>
                  <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">
                    Opción {idx + 1}
                  </span>
                  {c.seleccionado && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <Check className="w-3 h-3" /> Seleccionado
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleIncluido(idx)}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  c.incluido !== false ? "bg-emerald-500" : "bg-slate-500"
                )}
                title={c.incluido !== false ? "Incluido en la cotización" : "Opcional / upgrade"}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                    c.incluido !== false ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>
              {c.incluido === false && !c.seleccionado && (
                <button
                  type="button"
                  onClick={() => toggleSeleccionado(idx)}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Marcar seleccionado
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
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Nombre del crucero *</label>
              <input
                type="text"
                value={c.nombre || ""}
                onChange={(e) => update(idx, "nombre", e.target.value)}
                placeholder="Ej: Crucero por el Caribe"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Compañía</label>
              <input
                type="text"
                value={c.compania || ""}
                onChange={(e) => update(idx, "compania", e.target.value)}
                placeholder="Ej: Royal Caribbean"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Barco</label>
              <input
                type="text"
                value={c.barco || ""}
                onChange={(e) => update(idx, "barco", e.target.value)}
                placeholder="Ej: Oasis of the Seas"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Puerto embarque</label>
              <input
                type="text"
                value={c.puerto_embarque || ""}
                onChange={(e) => update(idx, "puerto_embarque", e.target.value)}
                placeholder="Ej: Miami"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Puerto desembarque</label>
              <input
                type="text"
                value={c.puerto_desembarque || ""}
                onChange={(e) => update(idx, "puerto_desembarque", e.target.value)}
                placeholder="Ej: Barcelona"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Embarque</label>
              <input
                type="date"
                value={c.fecha_embarque || ""}
                onChange={(e) => update(idx, "fecha_embarque", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Desembarque</label>
              <input
                type="date"
                value={c.fecha_desembarque || ""}
                onChange={(e) => update(idx, "fecha_desembarque", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Cabina / Tipo</label>
              <input
                type="text"
                value={c.cabina || ""}
                onChange={(e) => update(idx, "cabina", e.target.value)}
                placeholder="Ej: Balcón"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Habitación</label>
              <select
                value={c.tipo_habitacion || "doble"}
                onChange={(e) => update(idx, "tipo_habitacion", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              >
                {TIPOS_HABITACION.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Precio por persona</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">{getSimboloMoneda(moneda)}</span>
                <input
                  type="number"
                  value={c.precio_por_persona ?? ""}
                  onChange={(e) => update(idx, "precio_por_persona", parsePrecioInput(e.target.value))}
                  placeholder="0.00"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Notas</label>
              <input
                type="text"
                value={c.notas || ""}
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
        <Plus className="w-4 h-4" /> Agregar crucero
      </button>
    </div>
  );
}
