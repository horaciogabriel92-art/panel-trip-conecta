"use client";

import { useMemo } from "react";
import type {
  AlojamientoCotizacion,
  TransferCotizacion,
  SeguroCotizacion,
  ExtraCotizacion,
  MonedaCotizacion,
} from "@/types/cotizacion";

export interface PricingValues {
  moneda: MonedaCotizacion;
  vuelos: number;
  hospedajes: number;
  traslados: number;
  seguros: number;
  extras: number;
  costo_neto: number;
  subtotal: number; // alias de costo_neto (por persona)
  total: number;
}

export function toMoney(value: string | number | undefined | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  // Soporta "1.365,00" (español) y "1365.00" / "1365,00"
  const hasCommaCents = /^[\d.]+,\d{1,2}$/.test(trimmed);
  const clean = hasCommaCents
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed.replace(",", ".");
  const num = Number(clean);
  return Number.isFinite(num) ? num : 0;
}

function sumBy<T>(items: T[], getter: (item: T) => number | undefined | null): number {
  return items.reduce((sum, item) => {
    const value = getter(item);
    return sum + (typeof value === "number" && Number.isFinite(value) ? value : 0);
  }, 0);
}

export function calcularTotalesDesdeServicios({
  vuelos,
  alojamientos,
  transfers,
  seguros,
  extras,
  numPasajeros,
}: {
  vuelos: any[];
  alojamientos: AlojamientoCotizacion[];
  transfers: TransferCotizacion[];
  seguros: SeguroCotizacion[];
  extras: ExtraCotizacion[];
  numPasajeros: number;
}) {
  const pasajeros = Math.max(1, numPasajeros);

  const vuelosPorPersona = sumBy(vuelos, (v) => v.precio_por_persona);
  const hospedajesPorPersona = sumBy(
    alojamientos.filter((a) => a.seleccionado !== false),
    (a) => a.precio_por_persona
  );
  const trasladosPorPersona = sumBy(transfers, (t) => t.precio_por_persona);
  const segurosPorPersona = sumBy(seguros, (s) => s.precio_por_persona);
  const extrasPorPersona = sumBy(
    extras.filter((e) => e.incluido !== false),
    (e) => e.precio_por_persona
  );

  const costo_neto =
    vuelosPorPersona +
    hospedajesPorPersona +
    trasladosPorPersona +
    segurosPorPersona +
    extrasPorPersona;

  return {
    vuelos: vuelosPorPersona,
    hospedajes: hospedajesPorPersona,
    traslados: trasladosPorPersona,
    seguros: segurosPorPersona,
    extras: extrasPorPersona,
    costo_neto,
    subtotal: costo_neto,
    total: costo_neto * pasajeros,
  };
}

export function useCotizacionPricing({
  vuelos,
  alojamientos,
  transfers,
  seguros,
  extras,
  numPasajeros,
  moneda,
}: {
  vuelos: any[];
  alojamientos: AlojamientoCotizacion[];
  transfers: TransferCotizacion[];
  seguros: SeguroCotizacion[];
  extras: ExtraCotizacion[];
  numPasajeros: number;
  moneda: MonedaCotizacion;
}) {
  const values = useMemo<PricingValues>(() => {
    const calculados = calcularTotalesDesdeServicios({
      vuelos,
      alojamientos,
      transfers,
      seguros,
      extras,
      numPasajeros,
    });

    return {
      moneda,
      ...calculados,
    };
  }, [vuelos, alojamientos, transfers, seguros, extras, numPasajeros, moneda]);

  return { values };
}
