"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Rutas de /admin que solo pueden ver los administradores.
// Vendedores pueden acceder al resto (ej: /admin/clientes, /admin/cotizaciones, etc.).
const ADMIN_ONLY_PREFIXES = [
  '/admin/comisiones',
  '/admin/reportes',
  '/admin/paquetes',
  '/admin/ventas',
  '/admin/documentos',
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAdminOnly = pathname === '/admin' || ADMIN_ONLY_PREFIXES.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isClient && !isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.rol !== "admin" && isAdminOnly) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router, isClient, isAdminOnly]);

  if (!isClient || isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
