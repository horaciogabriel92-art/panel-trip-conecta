"use client";

import { useTenant } from "@/context/TenantContext";
import {
  CreditCard,
  Calendar,
  Users,
  FileText,
  Package,
  Globe,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDaysLeft(dateString: string | null) {
  if (!dateString) return null;
  const end = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PlanPage() {
  const { tenant, isLoading } = useTenant();
  const plan = tenant.plan;
  const daysLeft = getDaysLeft(tenant.trial_ends_at);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isTrial = tenant.estado_suscripcion === "trial";
  const trialExpiringSoon = isTrial && daysLeft !== null && daysLeft <= 3;

  const limits = [
    {
      icon: <Users className="w-5 h-5 text-blue-400" />,
      label: "Usuarios",
      value: plan?.max_users === null ? "Ilimitados" : plan?.max_users,
    },
    {
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      label: "Cotizaciones/mes",
      value: plan?.max_cotizaciones_por_mes === null ? "Ilimitadas" : plan?.max_cotizaciones_por_mes,
    },
    {
      icon: <Package className="w-5 h-5 text-purple-400" />,
      label: "Paquetes",
      value: plan?.max_paquetes === null ? "Ilimitados" : plan?.max_paquetes,
    },
    {
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      label: "Dominio propio",
      value: plan?.permite_dominio_propio ? "Incluido" : "No incluido",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)] flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-500" />
          Mi Plan
        </h2>
        <p className="text-[var(--muted-foreground)]">
          Gestiona tu suscripción y conoce los límites de tu cuenta
        </p>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div
          className={`rounded-2xl p-4 border flex items-start gap-3 ${
            trialExpiringSoon
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              Estás en periodo de prueba gratuita de 7 días
            </p>
            <p className="text-sm opacity-90">
              {daysLeft !== null && daysLeft > 0
                ? `Te quedan ${daysLeft} días de prueba. Vence el ${formatDate(tenant.trial_ends_at)}.`
                : `Tu prueba vence el ${formatDate(tenant.trial_ends_at)}.`}
            </p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-500">
                Plan actual
              </span>
              {isTrial && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Trial
                </span>
              )}
            </div>
            <h3 className="text-3xl font-black text-[var(--foreground)]">
              {plan?.nombre || "Free"}
            </h3>
            <p className="text-[var(--muted-foreground)] mt-1">
              {formatCurrency(plan?.precio_mensual_usd || 0)} / mes
            </p>
          </div>
          <button
            disabled
            className="px-6 py-2.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-xl font-medium cursor-not-allowed"
          >
            Actualizar plan (próximamente)
          </button>
        </div>
      </div>

      {/* Limits grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {limits.map((item) => (
          <div
            key={item.label}
            className="glass-card rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">{item.label}</p>
              <p className="text-xl font-bold text-[var(--foreground)]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Extra user price */}
      {(plan?.precio_usuario_extra_usd || 0) > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
            Usuarios adicionales
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Cada usuario extra cuesta{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {formatCurrency(plan?.precio_usuario_extra_usd || 0)} / mes
            </span>
          </p>
        </div>
      )}

      {/* Status details */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Detalles de la suscripción
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted-foreground)]">Estado</span>
            <span className="font-medium text-[var(--foreground)] capitalize">
              {tenant.estado_suscripcion || "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted-foreground)]">Inicio del plan</span>
            <span className="font-medium text-[var(--foreground)]">
              {formatDate(tenant.plan_started_at)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted-foreground)]">Fin de prueba</span>
            <span className="font-medium text-[var(--foreground)]">
              {formatDate(tenant.trial_ends_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Help note */}
      <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Durante el periodo de prueba tienes acceso completo al plan seleccionado.
          Al vencer, tu cuenta pasará al plan Free a menos que actives una suscripción paga.
        </p>
      </div>
    </div>
  );
}
