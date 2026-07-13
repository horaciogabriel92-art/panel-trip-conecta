"use client";

import { Check, Loader2 } from "lucide-react";
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

  const features: string[] = [];
  if (plan.max_users == null) {
    features.push("Usuarios ilimitados");
  } else {
    features.push(`Hasta ${plan.max_users} ${plan.max_users === 1 ? "usuario" : "usuarios"}`);
  }

  if (plan.max_cotizaciones_por_mes == null) {
    features.push("Cotizaciones ilimitadas");
  } else {
    features.push(`${plan.max_cotizaciones_por_mes} cotizaciones/mes`);
  }

  if (plan.max_paquetes == null) {
    features.push("Paquetes ilimitados");
  } else {
    features.push(`${plan.max_paquetes} ${plan.max_paquetes === 1 ? "paquete" : "paquetes"}`);
  }

  if (plan.permite_dominio_propio) {
    features.push("Dominio propio");
  }

  if (plan.features?.comisiones) {
    features.push("Módulo de comisiones");
  }

  if (plan.features?.vendedor_autoconfirma) {
    features.push("Autoconfirmación de vendedores");
  }

  return (
    <div
      className={`relative rounded-2xl p-6 border transition-all ${
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
        <p className="text-3xl font-black text-[var(--foreground)] mt-2">
          {formatCurrency(plan.precio_mensual_usd)}
          <span className="text-sm font-medium text-[var(--muted-foreground)]">/mes</span>
        </p>
        {!isFree && extraUsers > 0 && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            + {formatCurrency(extraTotal)} por {extraUsers} usuario{extraUsers > 1 ? "s" : ""} extra
          </p>
        )}
        {!isFree && total > plan.precio_mensual_usd && (
          <p className="text-lg font-bold text-emerald-500 mt-2">
            Total: {formatCurrency(total)}/mes
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isDisabled || isLoading || isCurrent}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
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
