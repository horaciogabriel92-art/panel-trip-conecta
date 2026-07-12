"use client";

import { useState } from "react";
import { BedDouble, Bus, Shield, Ticket, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AlojamientoCotizacion,
  TransferCotizacion,
  SeguroCotizacion,
  ExtraCotizacion,
  MonedaCotizacion,
} from "@/types/cotizacion";
import AlojamientoForm from "./AlojamientoForm";
import TransferForm from "./TransferForm";
import SeguroForm from "./SeguroForm";
import ExtraForm from "./ExtraForm";

interface Props {
  alojamientos: AlojamientoCotizacion[];
  transfers: TransferCotizacion[];
  seguros: SeguroCotizacion[];
  extras: ExtraCotizacion[];
  moneda?: MonedaCotizacion;
  onChange: (payload: {
    alojamientos: AlojamientoCotizacion[];
    transfers: TransferCotizacion[];
    seguros: SeguroCotizacion[];
    extras: ExtraCotizacion[];
  }) => void;
}

type TabKey = "alojamiento" | "transfers" | "seguros" | "extras";

export default function ServiciosStep({
  alojamientos,
  transfers,
  seguros,
  extras,
  moneda = "USD",
  onChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("alojamiento");

  const tabs: { key: TabKey; label: string; icon: React.ElementType; count: number }[] = [
    { key: "alojamiento", label: "Alojamiento", icon: BedDouble, count: alojamientos.length },
    { key: "transfers", label: "Transfers", icon: Bus, count: transfers.length },
    { key: "seguros", label: "Seguro", icon: Shield, count: seguros.length },
    { key: "extras", label: "Extras", icon: Ticket, count: extras.length },
  ];

  const handleChange = (field: keyof Props, value: any) => {
    onChange({
      alojamientos,
      transfers,
      seguros,
      extras,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[var(--muted)] rounded-2xl border border-[var(--border)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                    isActive ? "bg-white/20 text-white" : "bg-[var(--background)] text-[var(--muted-foreground)]"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "alojamiento" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-[var(--muted-foreground)]">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Agregá las opciones de alojamiento que quieras presentar. Marcá una como{" "}
              <strong>seleccionada</strong> para destacar la opción recomendada.
            </p>
          </div>
          <AlojamientoForm
            alojamientos={alojamientos}
            moneda={moneda}
            onChange={(value) => handleChange("alojamientos", value)}
          />
        </div>
      )}

      {activeTab === "transfers" && (
        <TransferForm
          transfers={transfers}
          moneda={moneda}
          onChange={(value) => handleChange("transfers", value)}
        />
      )}

      {activeTab === "seguros" && (
        <SeguroForm
          seguros={seguros}
          moneda={moneda}
          onChange={(value) => handleChange("seguros", value)}
        />
      )}

      {activeTab === "extras" && (
        <ExtraForm
          extras={extras}
          moneda={moneda}
          onChange={(value) => handleChange("extras", value)}
        />
      )}
    </div>
  );
}
