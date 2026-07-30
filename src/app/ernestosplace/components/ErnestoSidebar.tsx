"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useErnesto } from "@/context/ErnestoContext";
import {
  LayoutDashboard,
  Users,
  Headphones,
  Megaphone,
  LogOut,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/ernestosplace", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ernestosplace/clients", label: "Clientes", icon: Users },
  { href: "/ernestosplace/inbox", label: "Soporte", icon: Headphones },
  { href: "/ernestosplace/announcements", label: "Comunicaciones", icon: Megaphone },
];

export function ErnestoSidebar() {
  const pathname = usePathname();
  const { superadmin, logout } = useErnesto();

  return (
    <aside className="w-64 min-h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[var(--foreground)]">Ernesto&apos;s Place</h1>
            <p className="text-xs text-[var(--muted-foreground)]">Panel de control</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">{superadmin?.nombre}</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">{superadmin?.email}</p>
          <p className="text-xs text-emerald-500 mt-1 capitalize">{superadmin?.rol}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
