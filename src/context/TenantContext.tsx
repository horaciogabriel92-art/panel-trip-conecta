"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PlanFeatures {
  comisiones?: boolean;
  vendedor_autoconfirma?: boolean;
  dominio_propio?: boolean;
  [key: string]: boolean | undefined;
}

export interface PlanConfig {
  slug: string;
  nombre: string;
  max_users: number | null;
  max_cotizaciones_por_mes: number | null;
  max_paquetes: number | null;
  permite_dominio_propio: boolean;
  precio_mensual_usd: number;
  precio_usuario_extra_usd: number;
  features: PlanFeatures;
}

export interface TenantConfig {
  id: string | null;
  nombre: string;
  slug: string;
  logo_url: string;
  color_primario: string;
  color_secundario: string;
  dominio: string;
  trial_ends_at: string | null;
  estado_suscripcion: string | null;
  plan_started_at: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  extra_users_billed?: number;
  configuracion: Record<string, any>;
  plan: PlanConfig | null;
}

interface TenantContextType {
  tenant: TenantConfig;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_PLAN: PlanConfig = {
  slug: 'free',
  nombre: 'Free',
  max_users: 1,
  max_cotizaciones_por_mes: 10,
  max_paquetes: 1,
  permite_dominio_propio: false,
  precio_mensual_usd: 0,
  precio_usuario_extra_usd: 0,
  features: {
    comisiones: false,
    vendedor_autoconfirma: false,
    dominio_propio: false
  }
};

const DEFAULT_TENANT: TenantConfig = {
  id: null,
  nombre: 'Quotix Travel',
  slug: 'quotix-travel',
  logo_url: '/logo-quotix-travel.png',
  color_primario: '#0ea5e9',
  color_secundario: '#6366f1',
  dominio: 'travel.quotixos.com',
  trial_ends_at: null,
  estado_suscripcion: null,
  plan_started_at: null,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  extra_users_billed: 0,
  configuracion: {
    features: { comisiones: { enabled: false } },
    workflow: { mode: 'admin_confirma' }
  },
  plan: DEFAULT_PLAN
};

const TenantContext = createContext<TenantContextType>({
  tenant: DEFAULT_TENANT,
  isLoading: true,
  error: null
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function normalizePlan(plan: any): PlanConfig {
  if (!plan) return DEFAULT_PLAN;
  return {
    slug: plan.slug || DEFAULT_PLAN.slug,
    nombre: plan.nombre || DEFAULT_PLAN.nombre,
    max_users: plan.max_users ?? DEFAULT_PLAN.max_users,
    max_cotizaciones_por_mes: plan.max_cotizaciones_por_mes ?? DEFAULT_PLAN.max_cotizaciones_por_mes,
    max_paquetes: plan.max_paquetes ?? DEFAULT_PLAN.max_paquetes,
    permite_dominio_propio: plan.permite_dominio_propio ?? DEFAULT_PLAN.permite_dominio_propio,
    precio_mensual_usd: Number(plan.precio_mensual_usd) || DEFAULT_PLAN.precio_mensual_usd,
    precio_usuario_extra_usd: Number(plan.precio_usuario_extra_usd) || DEFAULT_PLAN.precio_usuario_extra_usd,
    features: plan.features || DEFAULT_PLAN.features
  };
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const domain = window.location.hostname;

        // Si el usuario está autenticado, obtenemos su tenant real.
        // Si no, fallback al dominio (público).
        const url = token
          ? `${API_URL}/config/tenant/me`
          : `${API_URL}/config/tenant?domain=${encodeURIComponent(domain)}`;

        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTenant({
          ...data,
          configuracion: data.configuracion || DEFAULT_TENANT.configuracion,
          plan: normalizePlan(data.plan)
        });
      } catch (err) {
        console.error('[TenantContext] Error fetching tenant config:', err);
        setError('No se pudo cargar la configuración del tenant');
        setTenant(DEFAULT_TENANT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant: tenant || DEFAULT_TENANT, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
