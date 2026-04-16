import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Reducir uso de memoria durante el build
  staticPageGenerationTimeout: 120,
  // Limitar workers para reducir uso de memoria
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2,
  },
  // Redirects para rutas legacy
  async redirects() {
    return [
      {
        source: '/ventas',
        destination: '/mis-ventas',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
