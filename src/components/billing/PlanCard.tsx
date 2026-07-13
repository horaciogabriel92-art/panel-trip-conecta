"use client";

import { Check, X, Loader2 } from "lucide-react";
import type { PlanConfig } from "@/context/TenantContext";

interface PlanCardProps {
  plan: PlanConfig;
  isCurrent: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  extraUsers?: number;
  onSelect: (plan: PlanConfig) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface FeatureItem {
  key: string;
  label: string;
  dynamic?: (plan: PlanConfig) => string | null;
}

const FEATURES: FeatureItem[] = [
  { key: "pdf_cotizaciones", label: "Cotizaciones en PDF en minutos" },
  { key: "crm_agentes", label: "CRM para agentes de viajes" },
  { key: "kanban_cotizaciones", label: "Kanban de cotizaciones" },
  { key: "amadeus_pnr", label: "Importá reservas de Amadeus pegando el PNR" },
  { key: "emails_automaticos", label: "Emails automáticos" },
  { key: "dominio_propio", label: "Dominio propio incluido" },
  { key: "soporte_prioritario", label: "Soporte prioritario" },
  { key: "reportes", label: "Reportes" },
  { key: "comisiones_avanzado", label: "Control de comisiones avanzado" },
  { key: "vouchers_documentos", label: "Vouchers y documentos de viaje" },
  { key: "usuarios_extra", label: "+$10 / mes por usuario extra", dynamic: () => null },
];

function getUsersText(plan: PlanConfig): string | null {
  if (plan.max_users == null) return "Usuarios ilimitados";
  if (plan.max_users === 1) return "1 usuario";
  return `${plan.max_users} usuarios incluidos`;
}

function getQuotesText(plan: PlanConfig): string | null {
  if (plan.max_cotizaciones_por_mes == null) return "Cotizaciones ilimitadas";
  return `${plan.max_cotizaciones_por_mes} cotizaciones / mes`;
}

function getPackagesText(plan: PlanConfig): string | null {
  if (plan.max_paquetes == null) return "Paquetes ilimitados";
  return `${plan.max_paquetes} paquetes`;
}

export default function PlanCard({
  plan,
  isCurrent,
  isDisabled,
  isLoading,
  extraUsers = 0,
  onSelect,
}: PlanCardProps) {
  const isFree = plan.precio_mensual_usd === 0;
  const extraTotal = extraUsers * (plan.precio_usuario_extra_usd || 0);
  const total = plan.precio_mensual_usd + extraTotal;

  const hasFeature = (key: string): boolean => {
    if (key === "usuarios_extra") {
      return plan.features?.usuarios_extra === true;
    }
    return plan.features?.[key] === true;
  };

  return (
    <div
      className={`relative rounded-2xl p-6 border transition-all flex flex-col h-full ${
        isCurrent
          ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30"
          : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]"
      }`}
    >
      {isCurrent && (
        <div className="absolute -top-3 left-6">
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
            Plan actual
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-black text-[var(--foreground)]">{plan.nombre}</h3>
        {plan.description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{plan.description}</p>
        )}
        <p className="text-3xl font-black text-[var(--foreground)] mt-3">
          {formatCurrency(plan.precio_mensual_usd)}
          <span className="text-sm font-medium text-[var(--muted-foreground)]">/mes</span>
        </p>
        {!isFree && extraUsers > 0 && hasFeature("usuarios_extra") && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            + {formatCurrency(extraTotal)} por {extraUsers} usuario{extraUsers > 1 ? "s" : ""} extra
          </p>
        )}
        {!isFree && total > plan.precio_mensual_usd && hasFeature("usuarios_extra") && (
          <p className="text-lg font-bold text-emerald-500 mt-2">
            Total: {formatCurrency(total)}/mes
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        <li className="flex items-start gap-2 text-sm text-[var(--foreground)]">
          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          {getUsersText(plan)}
        </li>
        <li className="flex items-start gap-2 text-sm text-[var(--foreground)]">
          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          {getQuotesText(plan)}
        </li>
        <li className="flex items-start gap-2 text-sm text-[var(--foreground)]">
          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          {getPackagesText(plan)}
        </li>
        {FEATURES.map((feature) => {
          const enabled = hasFeature(feature.key);
          if (feature.dynamic) {
            const dynamicText = feature.dynamic(plan);
            if (!dynamicText) return null;
          }
          return (
            <li
              key={feature.key}
              className={`flex items-start gap-2 text-sm ${
                enabled ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] opacity-60"
              }`}
            >
              {enabled ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              {feature.label}
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isDisabled || isLoading || isCurrent}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-auto ${
          isCurrent
            ? "bg-emerald-500 text-white cursor-default"
            : isDisabled
            ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
            : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
        }`}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isCurrent ? "Activo" : isFree ? "Gratis" : "Elegir plan"}
      </button>
    </div>
  );
}
