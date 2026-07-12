import api from "./api";

export interface TenantConfiguracionInput {
  features?: {
    comisiones?: { enabled?: boolean };
    [key: string]: any;
  };
  workflow?: {
    mode?: "admin_confirma" | "vendedor_autoconfirma" | "simple";
  };
  [key: string]: any;
}

export const configAPI = {
  obtenerConfiguracionTenant: async () => {
    const domain = typeof window !== "undefined" ? window.location.hostname : "";
    const res = await api.get(`/config/tenant?domain=${encodeURIComponent(domain)}`);
    return res.data;
  },

  actualizarConfiguracionTenant: async (configuracion: TenantConfiguracionInput) => {
    const res = await api.put("/config/tenant", { configuracion });
    return res.data;
  },
};
