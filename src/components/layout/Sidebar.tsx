"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ShoppingCart, 
  Users, 
  Wallet, 
  Files,
  Settings,
  LogOut,
  Plane
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/admin/paquetes', label: 'Paquetes', icon: Package },
  { href: '/admin/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/admin/vendedores', label: 'Vendedores', icon: Users },
  { href: '/admin/comisiones', label: 'Comisiones', icon: Wallet },
  { href: '/admin/documentos', label: 'Documentos', icon: Files },
];

const vendedorLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/paquetes', label: 'Catálogo', icon: Package },
  { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/mis-ventas', label: 'Mis Ventas', icon: ShoppingCart },
  { href: '/documentos', label: 'Mis Documentos', icon: Files },
];

export default function Sidebar({ role = 'vendedor' }: { role?: 'admin' | 'vendedor' }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const links = role === 'admin' ? adminLinks : vendedorLinks;

  return (
    <aside className="w-64 glass border-r border-[var(--border)] h-screen sticky top-0 flex flex-col pt-6">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none text-[var(--foreground)]">Trip Conecta</h1>
          <span className="text-xs text-[var(--muted-foreground)]">B2B System</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configuración</span>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
