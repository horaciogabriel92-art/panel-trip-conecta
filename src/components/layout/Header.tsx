"use client";

import { Bell, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header({ userName = 'Usuario', userRole = 'Vendedor' }: { userName?: string; userRole?: string }) {
  return (
    <header className="h-16 glass sticky top-0 z-50 border-b border-white/5 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-96">
        <Search className="w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar paquetes, ventas, clientes..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-300"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
