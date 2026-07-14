"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTenant, type PlanConfig } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { useBilling, type SubscriptionStatus } from "@/hooks/useBilling";
import PlanCard from "@/components/billing/PlanCard";
import InvoiceHistory from "@/components/billing/InvoiceHistory";
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  ExternalLink,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PlanPage() {
  const { user } = useAuth();
  const { tenant, isLoading: isTenantLoading } = useTenant();
  const { createCheckout, createPortal, getSubscriptionStatus, cancelSubscription, isLoading: isBillingLoading, error: billingError } = useBilling();
  const locale = "es-ES";

  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const searchParams = useSearchParams();

  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [extraUsers, setExtraUsers] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysLeft = (dateString: string | null) => {
    if (!dateString) return null;
    const end = new Date(dateString).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/config/plans`);
        if (!res.ok) throw new Error("Error al cargar los planes");
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[PlanPage] Error fetching plans:", err);
      } finally {
        setIsPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const status = await getSubscriptionStatus();
        if (status) {
          setSubscriptionStatus(status);
        }
      } catch (err) {
        console.error("[PlanPage] Error fetching subscription status:", err);
      } finally {
        setIsSubscriptionLoading(false);
      }
    };
    if (user?.rol === "admin") {
      fetchSubscriptionStatus();
    }
  }, [getSubscriptionStatus, user?.rol]);

  const currentPlanSlug = tenant.plan?.slug || "free";
  const isTrial = tenant.estado_suscripcion === "trial";
  const isActive = tenant.estado_suscripcion === "activo";
  const isSuspended = tenant.estado_suscripcion === "suspendido";
  const daysLeft = getDaysLeft(tenant.trial_ends_at);
  const trialExpiringSoon = isTrial && daysLeft !== null && daysLeft <= 3;

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.precio_mensual_usd - b.precio_mensual_usd);
  }, [plans]);

  const handleSelectPlan = async (plan: PlanConfig) => {
    if (plan.slug === "free") return;
    setSelectedPlan(plan.slug);
    const isProPlan = plan.slug === "pro-agencia" || plan.slug === "pro-ilimitado";
    const url = await createCheckout({
      plan_slug: plan.slug,
      extra_users: isProPlan ? extraUsers : 0,
    });
    if (url) {
      window.location.href = url;
    }
  };

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que querés cancelar la suscripción?")) return;
    const ok = await cancelSubscription();
    if (ok) {
      window.location.reload();
    }
  };

  const handlePortal = async () => {
    const url = await createPortal();
    if (url) {
      window.location.href = url;
    }
  };

  const canHaveExtraUsers = currentPlanSlug === "pro-agencia" || currentPlanSlug === "pro-ilimitado";

  if (isTenantLoading || isPlansLoading || isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (user?.rol !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">{"Acceso restringido"}</h2>
        <p className="text-[var(--muted-foreground)] max-w-md">
          {"Solo los administradores pueden acceder a esta sección."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)] flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-500" />
          {"Plan y facturación"}
        </h2>
        <p className="text-[var(--muted-foreground)]">
          {"Gestioná tu plan y pagos"}
        </p>
      </div>

      {/* Stripe redirect messages */}
      {success && (
        <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{"Suscripción actualizada"}</p>
            <p className="text-sm opacity-90">
              {"Tu suscripción se actualizó correctamente."}
            </p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="rounded-2xl p-4 border border-amber-500/20 bg-amber-500/10 text-amber-400 flex items-start gap-3">
          <X className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{"Pago cancelado"}</p>
            <p className="text-sm opacity-90">
              {"El proceso de pago fue cancelado."}
            </p>
          </div>
        </div>
      )}

      {/* Trial / status banner */}
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
            <p className="font-medium">{"Estás en periodo de prueba"}</p>
            <p className="text-sm opacity-90">
              {daysLeft !== null && daysLeft > 0
                ? `Te quedan ${daysLeft} días de prueba. Vence el ${formatDate(tenant.trial_ends_at)}.`
                : `Tu prueba vence el ${formatDate(tenant.trial_ends_at)}.`}
            </p>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="rounded-2xl p-4 border border-red-500/20 bg-red-500/10 text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{"Suscripción suspendida"}</p>
            <p className="text-sm opacity-90">
              {"Tu suscripción está suspendida. Renovala para seguir usando el panel."}
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-500">
                {"Plan actual"}
              </span>
              {isTrial && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {"Prueba"}
                </span>
              )}
              {isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {"Activo"}
                </span>
              )}
              {isSuspended && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {"Suspendido"}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-black text-[var(--foreground)]">
              {tenant.plan?.nombre || "Free"}
            </h3>
            <p className="text-[var(--muted-foreground)] mt-1">
              {formatCurrency(tenant.plan?.precio_mensual_usd || 0, locale)} / {"mes"}
            </p>
            {(isActive || isTrial) && subscriptionStatus?.subscription_renewal_date && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="text-[var(--muted-foreground)]">
                  {`Próxima renovación: ${formatDate(subscriptionStatus.subscription_renewal_date)}`}
                </span>
                {subscriptionStatus.next_invoice_amount_usd != null && subscriptionStatus.next_invoice_amount_usd > 0 && (
                  <span className="text-[var(--muted-foreground)]">
                    {`Próximo pago: ${formatCurrency(subscriptionStatus.next_invoice_amount_usd, locale)}`}
                  </span>
                )}
              </div>
            )}

            {isTrial && (
              <div
                className={`mt-4 rounded-xl p-4 border ${
                  trialExpiringSoon
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{"Periodo de prueba"}</p>
                    <p className="text-sm opacity-90">
                      {daysLeft !== null && daysLeft > 0
                        ? `Te quedan ${daysLeft} días de prueba. Vence el ${formatDate(tenant.trial_ends_at)}.`
                        : `Tu prueba vence el ${formatDate(tenant.trial_ends_at)}.`}
                    </p>
                    <p className="text-sm mt-2 opacity-80">{"Elegí un plan para continuar."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {tenant.stripe_customer_id && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePortal}
                disabled={isBillingLoading}
                className="px-6 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {isBillingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {"Gestionar suscripción"}
                <ExternalLink className="w-4 h-4" />
              </button>
              {(isActive || isTrial) && (
                <button
                  onClick={handleCancel}
                  disabled={isBillingLoading}
                  className="px-6 py-2.5 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  {"Cancelar suscripción"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Extra users selector */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)]">{"Usuarios extra"}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {`${formatCurrency(10, locale)} por usuario adicional`}
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                {"Solo para planes Pro"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExtraUsers(Math.max(0, extraUsers - 1))}
              className="w-10 h-10 rounded-xl bg-[var(--muted)] text-[var(--foreground)] font-bold hover:bg-[var(--border)] transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-[var(--foreground)]">{extraUsers}</span>
            <button
              onClick={() => setExtraUsers(extraUsers + 1)}
              className="w-10 h-10 rounded-xl bg-[var(--muted)] text-[var(--foreground)] font-bold hover:bg-[var(--border)] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {billingError && (
        <div className="rounded-2xl p-4 border border-red-500/20 bg-red-500/10 text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{billingError}</p>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            isCurrent={plan.slug === currentPlanSlug}
            isDisabled={isBillingLoading}
            isLoading={selectedPlan === plan.slug && isBillingLoading}
            extraUsers={extraUsers}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      {/* Invoice history */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          {"Historial de pagos"}
        </h3>
        <InvoiceHistory />
      </div>
    </div>
  );
}
