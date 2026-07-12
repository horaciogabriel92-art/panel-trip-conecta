"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ExtraCotizacion, MonedaCotizacion } from "@/types/cotizacion";

interface Props {
  extras: ExtraCotizacion[];
  moneda?: MonedaCotizacion;
  onChange: (extras: ExtraCotizacion[]) => void;
}

export default function ExtraForm({ extras, moneda = "USD", onChange }: Props) {
  const add = () => {
    onChange([
      ...extras,
      {
        nombre: "",
        descripcion: "",
        fecha: "",
        precio_por_persona: undefined,
        moneda,
        incluido: true,
        orden: extras.length + 1,
      },
    ]);
  };

  const remove = (index: number) => {
    onChange(extras.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof ExtraCotizacion, value: any) => {
    const updated = [...extras];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {extras.map((e, idx) => (
        <div key={idx} className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Extra {idx + 1}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Nombre</label>
              <input
                type="text"
                value={e.nombre || ""}
                onChange={(ev) => update(idx, "nombre", ev.target.value)}
                placeholder='Ej: "City tour por Madrid"'
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Fecha</label>
              <input
                type="date"
                value={e.fecha || ""}
                onChange={(ev) => update(idx, "fecha", ev.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Precio por persona</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">{moneda === "USD" ? "$" : "$U"}</span>
                <input
                  type="number"
                  value={e.precio_por_persona ?? ""}
                  onChange={(ev) => update(idx, "precio_por_persona", ev.target.value === "" ? undefined : Number(ev.target.value))}
                  placeholder="0.00"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Descripción</label>
              <input
                type="text"
                value={e.descripcion || ""}
                onChange={(ev) => update(idx, "descripcion", ev.target.value)}
                placeholder="Detalles del paseo, excursión o servicio extra..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 lg:col-span-2">
              <input
                type="checkbox"
                id={`extra-incluido-${idx}`}
                checked={e.incluido !== false}
                onChange={(ev) => update(idx, "incluido", ev.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor={`extra-incluido-${idx}`} className="text-sm text-[var(--foreground)]">
                Incluir en la cotización
              </label>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-all"
      >
        <Plus className="w-4 h-4" /> Agregar extra
      </button>
    </div>
  );
}
