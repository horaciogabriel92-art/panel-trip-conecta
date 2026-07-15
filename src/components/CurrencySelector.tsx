"use client";

import { MONEDAS } from "@/lib/utils";
import type { MonedaCotizacion } from "@/types/cotizacion";

interface Props {
  value: MonedaCotizacion;
  onChange: (moneda: MonedaCotizacion) => void;
  label?: string;
  className?: string;
}

export default function CurrencySelector({
  value,
  onChange,
  label = "Moneda",
  className = "",
}: Props) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MonedaCotizacion)}
        className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
      >
        {MONEDAS.map((m) => (
          <option key={m.codigo} value={m.codigo} className="bg-[var(--background)]">
            {m.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
