"use client";

import { useTenant } from "@/context/TenantContext";

export function useFeature(feature: string) {
  const { tenant } = useTenant();

  const planAllows = tenant?.plan?.features?.[feature] === true;
  const tenantEnabled = tenant?.configuracion?.features?.[feature]?.enabled === true;

  return {
    allowed: planAllows,
    enabled: planAllows && tenantEnabled,
    disabledByPlan: !planAllows,
  };
}
