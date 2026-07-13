"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useFeature } from '@/hooks/useFeature';
import { cn } from '@/lib/utils';
import SidebarPlanUpsell from '@/components/billing/SidebarPlanUpsell';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ShoppingCart, 
  Users, 
  Wallet, 
  Settings,
  LogOut,
  Plane,
  X,
  BarChart3,
  CreditCard,
  PanelLeftClose,
  PanelRightOpen
} from 'lucide-react';

interface SidebarProps {
  role?: 'admin' | 'vendedor';
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ 
  role = 'vendedor', 
  mobileOpen = false, 
  onClose,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname();
  const { logout, hasPermission } = useAuth();
  const { tenant } = useTenant();
  const { enabled: comisionesEnabled } = useFeature('comisiones');

  const isAdmin = role === 'admin';

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/clientes', label: 'Clientes', icon: Users },
    { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
    { href: '/admin/ventas', label: 'Ventas', icon: ShoppingCart },
    { href: '/admin/paquetes', label: 'Paquetes', icon: Package },
    { href: '/admin/comisiones', label: 'Comisiones', icon: Wallet, permission: 'ver_comisiones_otros' as const, hidden: !comisionesEnabled },
    { href: '/admin/reportes', label: 'Reportes', icon: BarChart3, permission: 'ver_reportes' as const },
  ].filter(link => (!link.permission || hasPermission(link.permission)) && !link.hidden);

  const vendedorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/paquetes', label: 'Catálogo', icon: Package },
    { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
    { href: '/admin/clientes', label: 'Clientes', icon: Users },
    { href: '/mis-ventas', label: 'Mis Ventas', icon: ShoppingCart },
  ];

  const links = isAdmin ? adminLinks : vendedorLinks;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "glass border-r border-[var(--border)] h-screen flex flex-col pt-6",
          "fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0 w-64"
        )}
      >
        {/* Header */}
        <div className={cn(
          "mb-10 flex items-center",
          collapsed ? "px-3 flex-col gap-3" : "px-6 gap-3"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            {tenant?.logo_url ? (
              <img 
                src={tenant.logo_url}
                alt={tenant.nombre}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Plane className="w-5 h-5 text-white" />
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg leading-none text-[var(--foreground)] truncate">
                {tenant?.nombre || 'Quotix Travel'}
              </h1>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? (
              <PanelRightOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-2 overflow-y-auto",
          collapsed ? "px-2" : "px-4"
        )}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center rounded-xl transition-all group",
                  collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                {!collapsed && <span className="font-medium truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-[var(--border)] space-y-2",
          collapsed ? "p-2" : "p-4"
        )}>
          <SidebarPlanUpsell collapsed={collapsed} />
          <Link 
            href="/configuracion"
            onClick={handleLinkClick}
            title={collapsed ? "Configuración" : undefined}
            className={cn(
              "flex items-center rounded-xl transition-all",
              collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
              pathname === '/configuracion' || pathname?.startsWith('/configuracion/')
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Settings className={cn("w-5 h-5 shrink-0", pathname === '/configuracion' || pathname?.startsWith('/configuracion/') ? "text-white" : "")} />
            {!collapsed && <span className="font-medium truncate">Configuración</span>}
          </Link>
          {isAdmin && (
            <Link 
              href="/configuracion/plan"
              onClick={handleLinkClick}
              title={collapsed ? "Mi Plan" : undefined}
              className={cn(
                "flex items-center rounded-xl transition-all",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                pathname === '/configuracion/plan'
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <CreditCard className={cn("w-5 h-5 shrink-0", pathname === '/configuracion/plan' ? "text-white" : "")} />
              {!collapsed && <span className="font-medium truncate">Mi Plan</span>}
            </Link>
          )}
          <button 
            onClick={logout}
            title={collapsed ? "Cerrar Sesión" : undefined}
            className={cn(
              "flex items-center rounded-xl text-red-500 hover:bg-red-500/10 transition-all",
              collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium truncate">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
