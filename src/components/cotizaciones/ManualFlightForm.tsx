"use client";

import { Plus, Trash2, Plane } from "lucide-react";
import { AirlineLogo } from "@/components/flights/AirlineLogo";
import { ParsedFlight } from "@/lib/amadeus-parser";

interface ManualFlightFormProps {
  flights: ParsedFlight[];
  onChange: (flights: ParsedFlight[]) => void;
}

const emptyFlight = (linea: number): ParsedFlight => ({
  linea,
  aerolinea_codigo: "",
  aerolinea_nombre: "",
  numero_vuelo: "",
  clase_codigo: "Y",
  fecha_salida: "",
  fecha_salida_original: "",
  dia_salida: 0,
  origen_codigo: "",
  origen_nombre: "",
  origen_ciudad: "",
  destino_codigo: "",
  destino_nombre: "",
  destino_ciudad: "",
  estado_codigo: "HK",
  asientos: 1,
  hora_salida: "",
  hora_llegada: "",
  fecha_llegada: "",
  dias_adicionales: 0,
});

const updateFlight = (
  flights: ParsedFlight[],
  index: number,
  field: keyof ParsedFlight,
  value: any
): ParsedFlight[] => {
  const updated = [...flights];
  updated[index] = { ...updated[index], [field]: value };
  return updated;
};

export default function ManualFlightForm({ flights, onChange }: ManualFlightFormProps) {
  const handleAdd = () => {
    onChange([...flights, emptyFlight(flights.length + 1)]);
  };

  const handleRemove = (index: number) => {
    const updated = flights.filter((_, i) => i !== index);
    onChange(updated.map((f, i) => ({ ...f, linea: i + 1 })));
  };

  return (
    <div className="space-y-4">
      {flights.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-[var(--border)] rounded-xl">
          <Plane className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No hay vuelos agregados</p>
          <p className="text-[var(--muted-foreground)] text-sm">
            Agregá los segmentos de vuelo manualmente
          </p>
        </div>
      )}

      {flights.map((flight, index) => (
        <div
          key={index}
          className="bg-[var(--muted)] rounded-xl p-4 border border-[var(--border)] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AirlineLogo iataCode={flight.aerolinea_codigo} size={20} />
              <span className="text-sm font-bold text-[var(--foreground)]">
                Vuelo {index + 1}
              </span>
            </div>
            <button
              onClick={() => handleRemove(index)}
              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              title="Eliminar vuelo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Aerolínea (IATA)
              </label>
              <input
                type="text"
                value={flight.aerolinea_codigo}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "aerolinea_codigo", e.target.value.toUpperCase()))
                }
                placeholder="LA"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none uppercase"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Número vuelo
              </label>
              <input
                type="text"
                value={flight.numero_vuelo}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "numero_vuelo", e.target.value.toUpperCase()))
                }
                placeholder="533"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Clase
              </label>
              <input
                type="text"
                value={flight.clase_codigo}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "clase_codigo", e.target.value.toUpperCase()))
                }
                placeholder="Y"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none uppercase"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Asientos
              </label>
              <input
                type="number"
                min={1}
                value={flight.asientos}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "asientos", parseInt(e.target.value) || 1))
                }
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Origen (IATA)
              </label>
              <input
                type="text"
                value={flight.origen_codigo}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "origen_codigo", e.target.value.toUpperCase()))
                }
                placeholder="JFK"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none uppercase"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Destino (IATA)
              </label>
              <input
                type="text"
                value={flight.destino_codigo}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "destino_codigo", e.target.value.toUpperCase()))
                }
                placeholder="SCL"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none uppercase"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Fecha salida
              </label>
              <input
                type="date"
                value={flight.fecha_salida}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "fecha_salida", e.target.value))
                }
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Hora salida
              </label>
              <input
                type="time"
                value={flight.hora_salida}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "hora_salida", e.target.value))
                }
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Fecha llegada
              </label>
              <input
                type="date"
                value={flight.fecha_llegada}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "fecha_llegada", e.target.value))
                }
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                Hora llegada
              </label>
              <input
                type="time"
                value={flight.hora_llegada}
                onChange={(e) =>
                  onChange(updateFlight(flights, index, "hora_llegada", e.target.value))
                }
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-[var(--border)] hover:border-teal-500/50 text-[var(--muted-foreground)] hover:text-teal-400 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold"
      >
        <Plus className="w-4 h-4" />
        Agregar vuelo
      </button>
    </div>
  );
}
