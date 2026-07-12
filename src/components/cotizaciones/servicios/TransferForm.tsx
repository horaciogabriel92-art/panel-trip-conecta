"use client";

import { Plus, Trash2 } from "lucide-react";
import type { TransferCotizacion, MonedaCotizacion } from "@/types/cotizacion";

interface Props {
  transfers: TransferCotizacion[];
  moneda?: MonedaCotizacion;
  onChange: (transfers: TransferCotizacion[]) => void;
}

export default function TransferForm({ transfers, moneda = "USD", onChange }: Props) {
  const add = () => {
    onChange([
      ...transfers,
      {
        nombre: "",
        origen: "",
        destino: "",
        fecha: "",
        hora: "",
        precio_por_persona: undefined,
        moneda,
        orden: transfers.length + 1,
      },
    ]);
  };

  const remove = (index: number) => {
    onChange(transfers.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof TransferCotizacion, value: any) => {
    const updated = [...transfers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {transfers.map((t, idx) => (
        <div key={idx} className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Transfer {idx + 1}</span>
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
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Nombre del servicio</label>
              <input
                type="text"
                value={t.nombre || ""}
                onChange={(e) => update(idx, "nombre", e.target.value)}
                placeholder='Ej: "Transfer aeropuerto - hotel"'
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Origen</label>
              <input
                type="text"
                value={t.origen || ""}
                onChange={(e) => update(idx, "origen", e.target.value)}
                placeholder="Ej: Aeropuerto MAD"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Destino</label>
              <input
                type="text"
                value={t.destino || ""}
                onChange={(e) => update(idx, "destino", e.target.value)}
                placeholder="Ej: Hotel centro"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Fecha</label>
              <input
                type="date"
                value={t.fecha || ""}
                onChange={(e) => update(idx, "fecha", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Hora</label>
              <input
                type="time"
                value={t.hora || ""}
                onChange={(e) => update(idx, "hora", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Precio por persona</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">{moneda === "USD" ? "$" : "$U"}</span>
                <input
                  type="number"
                  value={t.precio_por_persona ?? ""}
                  onChange={(e) => update(idx, "precio_por_persona", e.target.value === "" ? undefined : Number(e.target.value))}
                  placeholder="0.00"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Notas</label>
              <input
                type="text"
                value={t.notas || ""}
                onChange={(e) => update(idx, "notas", e.target.value)}
                placeholder="Detalles del vehículo, conductor, etc."
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
        <Plus className="w-4 h-4" /> Agregar transfer
      </button>
    </div>
  );
}
