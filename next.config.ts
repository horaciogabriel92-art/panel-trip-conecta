import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reducir uso de memoria durante el build
  experimental: {
    // Deshabilitar algunas optimizaciones para reducir memoria
    turbotrace: {
      logLevel: 'error',
    },
  },
  // Configuración para builds en servidores con poca memoria
  staticPageGenerationTimeout: 120,
  // Limitar workers para reducir uso de memoria
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
