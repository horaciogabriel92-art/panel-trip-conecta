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
  Plane,
  X
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

interface SidebarProps {
  role?: 'admin' | 'vendedor';
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role = 'vendedor', mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const links = role === 'admin' ? adminLinks : vendedorLinks;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "w-64 glass border-r border-[var(--border)] h-screen flex flex-col pt-6",
          "fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          "-translate-x-full lg:translate-x-0 lg:static lg:top-0",
          mobileOpen && "translate-x-0"
        )}
      >
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-none text-[var(--foreground)] truncate">Trip Conecta</h1>
            <span className="text-xs text-[var(--muted-foreground)]">B2B System</span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                <span className="font-medium truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <Link 
            href="/configuracion"
            onClick={handleLinkClick}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              pathname === '/configuracion'
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Settings className={cn("w-5 h-5 shrink-0", pathname === '/configuracion' ? "text-white" : "")} />
            <span className="font-medium truncate">Configuración</span>
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium truncate">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
