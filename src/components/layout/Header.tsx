"use client";

import { Search, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import NotificationsBell from '@/components/NotificationsBell';

// Import dinámico del ThemeToggle para evitar SSR
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
});

export default function Header({ userName = 'Usuario', userRole = 'Vendedor' }: { userName?: string; userRole?: string }) {
  return (
    <header className="h-16 glass sticky top-0 z-50 border-b border-[var(--border)] flex items-center justify-between px-8">
      <div className="flex items-center gap-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 w-96">
        <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
        <input 
          type="text" 
          placeholder="Buscar paquetes, ventas, clientes..." 
          className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
        />
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <NotificationsBell />

        <div className="h-8 w-px bg-[var(--border)] mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[var(--foreground)]">{userName}</p>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-bold">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
