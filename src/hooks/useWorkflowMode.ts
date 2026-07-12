"use client";

import { useTenant } from "@/context/TenantContext";

export type WorkflowMode = "admin_confirma" | "vendedor_autoconfirma" | "simple";

export function useWorkflowMode() {
  const { tenant } = useTenant();

  const planAllowsAutoconfirmar = tenant?.plan?.features?.vendedor_autoconfirma === true;
  const planSlug = tenant?.plan?.slug;

  const rawMode = tenant?.configuracion?.workflow?.mode as WorkflowMode | undefined;

  // Free/freelance always use simple workflow
  const isSimple = planSlug === "free" || planSlug === "freelance" || rawMode === "simple";

  // Valid modes: if not simple, respect configured mode only if plan allows it
  let mode: WorkflowMode = "admin_confirma";
  if (isSimple) {
    mode = "simple";
  } else if (rawMode === "vendedor_autoconfirma" && planAllowsAutoconfirmar) {
    mode = "vendedor_autoconfirma";
  }

  return {
    mode,
    isAdminConfirma: mode === "admin_confirma",
    isVendedorAutoconfirma: mode === "vendedor_autoconfirma",
    isSimple,
    canVendedorAutoconfirmar: planAllowsAutoconfirmar,
  };
}
