"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export default function TrialBanner() {
  const { tenant } = useTenant();

  if (!tenant || tenant.estado_suscripcion !== "trial" || !tenant.trial_ends_at) {
    return null;
  }

  const end = new Date(tenant.trial_ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return null;
  }

  const planName = tenant.plan?.nombre || "Pro";

  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 text-sm">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        <Clock className="w-4 h-4 shrink-0" />
        <span>
          Estás probando el plan <strong className="font-bold">{planName}</strong>.
          {" "}
          {daysLeft === 0
            ? "Tu prueba gratuita vence hoy."
            : `Te quedan ${daysLeft} ${daysLeft === 1 ? "día" : "días"} de prueba gratuita.`}
        </span>
        <Link
          href="/configuracion/plan"
          className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-white/90 transition-colors"
        >
          Ver planes
        </Link>
      </div>
    </div>
  );
}
