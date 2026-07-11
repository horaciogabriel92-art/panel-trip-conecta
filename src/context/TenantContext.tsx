"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TenantConfig {
  id: string | null;
  nombre: string;
  slug: string;
  logo_url: string;
  color_primario: string;
  color_secundario: string;
  dominio: string;
}

interface TenantContextType {
  tenant: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_TENANT: TenantConfig = {
  id: null,
  nombre: 'Quotix Travel',
  slug: 'quotix-travel',
  logo_url: '/logo-quotix-travel.png',
  color_primario: '#0ea5e9',
  color_secundario: '#6366f1',
  dominio: 'travel.quotixos.com'
};

const TenantContext = createContext<TenantContextType>({
  tenant: DEFAULT_TENANT,
  isLoading: true,
  error: null
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const domain = window.location.hostname;
        const response = await fetch(`${API_URL}/config/tenant?domain=${encodeURIComponent(domain)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTenant(data);
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
