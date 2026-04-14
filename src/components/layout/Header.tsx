"use client";

import { Search, User, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import NotificationsBell from '@/components/NotificationsBell';

// Import dinámico del ThemeToggle para evitar SSR
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
});

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onMenuClick?: () => void;
}

export default function Header({ userName = 'Usuario', userRole = 'Vendedor', onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 glass sticky top-0 z-30 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-8 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--foreground)] shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 w-72 lg:w-96">
          <Search className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar paquetes, ventas, clientes..." 
            className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        
        <NotificationsBell />

        <div className="h-8 w-px bg-[var(--border)] mx-1 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="text-right hidden sm:block min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{userName}</p>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-bold truncate">{userRole}</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 shrink-0">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
