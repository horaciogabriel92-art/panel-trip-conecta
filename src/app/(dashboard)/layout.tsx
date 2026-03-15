"use client";

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('📊 DashboardLayout: isLoading=', isLoading, 'user=', user, 'isClient=', isClient);
    // Solo redirigir después de confirmar que estamos en cliente y el loading terminó
    if (isClient && !isLoading && !user) {
      console.log('🔴 No user found, redirecting to login');
      router.push('/login');
    }
  }, [user, isLoading, router, isClient]);

  // Mostrar loading mientras se inicializa o no hay usuario
  if (!isClient || isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <div className="gradient-bg" />
      <Sidebar role={user.rol} />
      <div className="flex-1 flex flex-col">
        <Header userName={`${user.nombre} ${user.apellido}`} userRole={user.rol} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
