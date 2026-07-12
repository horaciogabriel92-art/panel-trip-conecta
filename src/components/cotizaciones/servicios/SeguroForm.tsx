"use client";

import { Plus, Trash2 } from "lucide-react";
import type { SeguroCotizacion, MonedaCotizacion } from "@/types/cotizacion";

interface Props {
  seguros: SeguroCotizacion[];
  moneda?: MonedaCotizacion;
  onChange: (seguros: SeguroCotizacion[]) => void;
}

export default function SeguroForm({ seguros, moneda = "USD", onChange }: Props) {
  const add = () => {
    onChange([
      ...seguros,
      {
        compania: "",
        tipo_cobertura: "",
        cobertura_detalle: "",
        fecha_inicio: "",
        fecha_fin: "",
        precio_por_persona: undefined,
        moneda,
      },
    ]);
  };

  const remove = (index: number) => {
    onChange(seguros.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof SeguroCotizacion, value: any) => {
    const updated = [...seguros];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {seguros.map((s, idx) => (
        <div key={idx} className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Seguro {idx + 1}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Compañía</label>
              <input
                type="text"
                value={s.compania || ""}
                onChange={(e) => update(idx, "compania", e.target.value)}
                placeholder="Ej: Assist Card"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Tipo de cobertura</label>
              <input
                type="text"
                value={s.tipo_cobertura || ""}
                onChange={(e) => update(idx, "tipo_cobertura", e.target.value)}
                placeholder="Ej: Básica / Premium"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Fecha inicio</label>
              <input
                type="date"
                value={s.fecha_inicio || ""}
                onChange={(e) => update(idx, "fecha_inicio", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Fecha fin</label>
              <input
                type="date"
                value={s.fecha_fin || ""}
                onChange={(e) => update(idx, "fecha_fin", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Precio por persona</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">{moneda === "USD" ? "$" : "$U"}</span>
                <input
                  type="number"
                  value={s.precio_por_persona ?? ""}
                  onChange={(e) => update(idx, "precio_por_persona", e.target.value === "" ? undefined : Number(e.target.value))}
                  placeholder="0.00"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Moneda</label>
              <select
                value={s.moneda || moneda}
                onChange={(e) => update(idx, "moneda", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              >
                <option value="USD">USD</option>
                <option value="UYU">UYU</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">¿Qué cubre?</label>
              <textarea
                value={s.cobertura_detalle || ""}
                onChange={(e) => update(idx, "cobertura_detalle", e.target.value)}
                placeholder="Detalle de la cobertura: asistencia médica, cancelación, equipaje, etc."
                rows={3}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Notas</label>
              <input
                type="text"
                value={s.notas || ""}
                onChange={(e) => update(idx, "notas", e.target.value)}
                placeholder="Observaciones adicionales..."
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
        <Plus className="w-4 h-4" /> Agregar seguro
      </button>
    </div>
  );
}
