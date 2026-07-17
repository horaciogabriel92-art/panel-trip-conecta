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
  subtotal: number;
  total: number;
}

export function toMoney(value: string | number | undefined | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const trimmed = value.trim().replace(",", ".");
  if (trimmed === "") return 0;
  const num = Number(trimmed);
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

  const vuelosTotal = sumBy(vuelos, (v) => v.precio_por_persona) * pasajeros;

  const hospedajesTotal =
    sumBy(
      alojamientos.filter((a) => a.seleccionado !== false),
      (a) => a.precio_por_persona
    ) * pasajeros;

  const trasladosTotal = sumBy(transfers, (t) => t.precio_por_persona) * pasajeros;
  const segurosTotal = sumBy(seguros, (s) => s.precio_por_persona) * pasajeros;

  const extrasTotal =
    sumBy(
      extras.filter((e) => e.incluido !== false),
      (e) => e.precio_por_persona
    ) * pasajeros;

  const subtotal =
    vuelosTotal + hospedajesTotal + trasladosTotal + segurosTotal + extrasTotal;

  return {
    vuelos: vuelosTotal,
    hospedajes: hospedajesTotal,
    traslados: trasladosTotal,
    seguros: segurosTotal,
    extras: extrasTotal,
    subtotal,
    total: subtotal,
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
