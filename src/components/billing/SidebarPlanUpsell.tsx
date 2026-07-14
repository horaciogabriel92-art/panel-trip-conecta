"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useTenant, type PlanConfig } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface SidebarPlanUpsellProps {
  collapsed?: boolean;
}

export default function SidebarPlanUpsell({ collapsed }: SidebarPlanUpsellProps) {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const t = useTranslations("plan.upsell");
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/config/plans`);
        if (!res.ok) throw new Error("No se pudieron cargar los planes");
        const data = await res.json();
        if (!cancelled) setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[SidebarPlanUpsell] Error fetching plans:", err);
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextPlan = useMemo(() => {
    if (!plans.length || !tenant.plan) return null;
    const sorted = [...plans].sort((a, b) => a.precio_mensual_usd - b.precio_mensual_usd);
    return sorted.find((p) => p.precio_mensual_usd > tenant.plan!.precio_mensual_usd) || null;
  }, [plans, tenant.plan]);

  if (collapsed) return null;
  if (user?.rol !== "admin") return null;
  if (tenant.plan?.slug !== "free") return null;
  if (isLoading || !nextPlan) return null;

  const features: string[] = [];
  if (nextPlan.max_users != null) {
    features.push(t("users.upTo", { count: nextPlan.max_users }));
  } else {
    features.push(t("users.unlimited"));
  }

  if (nextPlan.max_cotizaciones_por_mes != null) {
    features.push(t("quotes.perMonth", { count: nextPlan.max_cotizaciones_por_mes }));
  } else {
    features.push(t("quotes.unlimited"));
  }

  if (nextPlan.max_paquetes != null) {
    features.push(t("packages.count", { count: nextPlan.max_paquetes }));
  } else {
    features.push(t("packages.unlimited"));
  }

  if (nextPlan.permite_dominio_propio) {
    features.push(t("customDomain"));
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider opacity-95">
          {t("title")}
        </span>
      </div>

      <h4 className="font-bold text-lg leading-tight mb-1">
        {t("upgradeTo", { planName: nextPlan.nombre })}
      </h4>
      <p className="text-sm font-medium opacity-95 mb-3">
        {t("price", { price: nextPlan.precio_mensual_usd })}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {features.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-semibold border border-white/10"
          >
            <Check className="w-3 h-3 shrink-0" />
            {feature}
          </span>
        ))}
      </div>

      <Link
        href="/configuracion/plan"
        className="group flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors shadow-md"
      >
        {t("viewPlans")}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
