"use client";

import { Check, X, Loader2 } from "lucide-react";
import type { PlanConfig } from "@/context/TenantContext";
import { useTranslations } from "next-intl";

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
  dynamic?: (plan: PlanConfig) => string | null;
}

export default function PlanCard({
  plan,
  isCurrent,
  isDisabled,
  isLoading,
  extraUsers = 0,
  onSelect,
}: PlanCardProps) {
  const t = useTranslations("plan");
  const isFree = plan.precio_mensual_usd === 0;
  const extraTotal = extraUsers * (plan.precio_usuario_extra_usd || 0);
  const total = plan.precio_mensual_usd + extraTotal;

  const descriptions: Record<string, string> = {
    free: t("descriptions.free"),
    freelance: t("descriptions.freelance"),
    "pro-agencia": t("descriptions.pro-agencia"),
    "pro-ilimitado": t("descriptions.pro-ilimitado"),
    test: t("descriptions.test"),
  };

  const features: FeatureItem[] = [
    { key: "pdf_cotizaciones" },
    { key: "crm_agentes" },
    { key: "kanban_cotizaciones" },
    { key: "amadeus_pnr" },
    { key: "emails_automaticos" },
    { key: "dominio_propio" },
    { key: "soporte_prioritario" },
    { key: "reportes" },
    { key: "comisiones_avanzado" },
    { key: "vouchers_documentos" },
    { key: "usuarios_extra", dynamic: () => null },
  ];

  const getUsersText = (plan: PlanConfig): string | null => {
    if (plan.max_users == null) return t("users.unlimited");
    if (plan.max_users === 1) return t("users.one");
    return t("users.included", { count: plan.max_users });
  };

  const getQuotesText = (plan: PlanConfig): string | null => {
    if (plan.max_cotizaciones_por_mes == null) return t("quotes.unlimited");
    return t("quotes.perMonth", { count: plan.max_cotizaciones_por_mes });
  };

  const getPackagesText = (plan: PlanConfig): string | null => {
    if (plan.max_paquetes == null) return t("packages.unlimited");
    return t("packages.count", { count: plan.max_paquetes });
  };

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
            {t("currentBadge")}
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-black text-[var(--foreground)]">{plan.nombre}</h3>
        {(plan.description || descriptions[plan.slug]) && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {plan.description || descriptions[plan.slug]}
          </p>
        )}
        <p className="text-3xl font-black text-[var(--foreground)] mt-3">
          {formatCurrency(plan.precio_mensual_usd)}
          <span className="text-sm font-medium text-[var(--muted-foreground)]">{t("perMonth")}</span>
        </p>
        {!isFree && extraUsers > 0 && hasFeature("usuarios_extra") && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {t("extraUsersTotal", { amount: formatCurrency(extraTotal), count: extraUsers })}
          </p>
        )}
        {!isFree && total > plan.precio_mensual_usd && hasFeature("usuarios_extra") && (
          <p className="text-lg font-bold text-emerald-500 mt-2">
            {t("totalLabel", { amount: formatCurrency(total) })}
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
        {features.map((feature) => {
          const enabled = hasFeature(feature.key);
          if (feature.dynamic) {
            const dynamicText = feature.dynamic(plan);
            if (!dynamicText) return null;
          }
          const label = feature.key === "usuarios_extra"
            ? t("features.usuarios_extra", { price: plan.precio_usuario_extra_usd || 10 })
            : t(`features.${feature.key}`);
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
              {label}
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
        {isCurrent ? t("cta.active") : isFree ? t("cta.free") : t("cta.choose")}
      </button>
    </div>
  );
}
