"use client";

import { useMemo, useState, useEffect } from "react";
import type {
  AlojamientoCotizacion,
  TransferCotizacion,
  SeguroCotizacion,
  ExtraCotizacion,
  MonedaCotizacion,
} from "@/types/cotizacion";

export interface PricingInputs {
  moneda: MonedaCotizacion;
  vuelos: string;
  hospedajes: string;
  traslados: string;
  seguros: string;
  extras: string;
  impuestos: string;
  subtotal: string;
  total: string;
}

export interface PricingOverrides {
  vuelos?: string;
  hospedajes?: string;
  traslados?: string;
  seguros?: string;
  extras?: string;
  impuestos?: string;
}

interface UseCotizacionPricingProps {
  vuelos: any[];
  alojamientos: AlojamientoCotizacion[];
  transfers: TransferCotizacion[];
  seguros: SeguroCotizacion[];
  extras: ExtraCotizacion[];
  numPasajeros: number;
  pricing: PricingInputs;
  onChange: (pricing: PricingInputs) => void;
}

function sumBy<T>(items: T[], getter: (item: T) => number | undefined | null): number {
  return items.reduce((sum, item) => {
    const value = getter(item);
    return sum + (typeof value === "number" && !isNaN(value) ? value : 0);
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

  // Vuelos: por ahora no hay precio por persona en el objeto de vuelo,
  // así que esto queda en 0 a menos que el backend lo agregue.
  const vuelosTotal = 0;

  // Hospedajes: solo los seleccionados
  const hospedajesSeleccionados = alojamientos.filter((a) => a.seleccionado);
  const hospedajesTotal =
    sumBy(hospedajesSeleccionados, (a) => a.precio_por_persona) * pasajeros;

  // Transfers
  const trasladosTotal =
    sumBy(transfers, (t) => t.precio_por_persona) * pasajeros;

  // Seguros
  const segurosTotal =
    sumBy(seguros, (s) => s.precio_por_persona) * pasajeros;

  // Extras: solo los incluidos
  const extrasTotal =
    sumBy(
      extras.filter((e) => e.incluido !== false),
      (e) => e.precio_por_persona
    ) * pasajeros;

  return {
    vuelos: vuelosTotal,
    hospedajes: hospedajesTotal,
    traslados: trasladosTotal,
    seguros: segurosTotal,
    extras: extrasTotal,
  };
}

export function useCotizacionPricing({
  vuelos,
  alojamientos,
  transfers,
  seguros,
  extras,
  numPasajeros,
  pricing,
  onChange,
}: UseCotizacionPricingProps) {
  // Overrides explícitos del operador
  const [overrides, setOverrides] = useState<PricingOverrides>({});

  // Totales calculados desde servicios
  const calculados = useMemo(
    () =>
      calcularTotalesDesdeServicios({
        vuelos,
        alojamientos,
        transfers,
        seguros,
        extras,
        numPasajeros,
      }),
    [vuelos, alojamientos, transfers, seguros, extras, numPasajeros]
  );

  // Cuando los calculados cambian, precargamos los campos vacíos con el cálculo
  useEffect(() => {
    const next: Partial<PricingInputs> = {};

    (Object.keys(calculados) as Array<keyof typeof calculados>).forEach((key) => {
      const currentValue = pricing[key];
      const calculatedValue = calculados[key];
      if (
        (currentValue === "" || currentValue === "0" || currentValue === "0.00") &&
        calculatedValue > 0
      ) {
        next[key] = calculatedValue.toFixed(2);
      }
    });

    if (Object.keys(next).length > 0) {
      onChange({ ...pricing, ...next });
    }
  }, [calculados]);

  // Valores finales: override > manual > calculado
  const finalValues = useMemo(() => {
    const getValue = (key: keyof typeof calculados): number => {
      const override = overrides[key];
      if (override !== undefined && override !== "") {
        const parsed = parseFloat(override);
        if (!isNaN(parsed)) return parsed;
      }
      const manual = pricing[key];
      if (manual !== undefined && manual !== "") {
        const parsed = parseFloat(manual);
        if (!isNaN(parsed)) return parsed;
      }
      return calculados[key];
    };

    const vuelos = getValue("vuelos");
    const hospedajes = getValue("hospedajes");
    const traslados = getValue("traslados");
    const seguros = getValue("seguros");
    const extras = getValue("extras");
    const impuestos = parseFloat(pricing.impuestos) || 0;

    const subtotal = vuelos + hospedajes + traslados + seguros + extras;
    const total = subtotal + impuestos;

    return {
      vuelos,
      hospedajes,
      traslados,
      seguros,
      extras,
      impuestos,
      subtotal,
      total,
    };
  }, [overrides, pricing, calculados]);

  const setField = (field: keyof PricingInputs, value: string) => {
    if (
      field === "vuelos" ||
      field === "hospedajes" ||
      field === "traslados" ||
      field === "seguros" ||
      field === "extras" ||
      field === "impuestos"
    ) {
      setOverrides((prev) => ({ ...prev, [field]: value }));
    }
    onChange({ ...pricing, [field]: value });
  };

  const resetOverrides = () => setOverrides({});

  return {
    calculados,
    finalValues,
    setField,
    resetOverrides,
  };
}
