"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/ventas', label: 'Mis Ventas', icon: ShoppingCart },
  { href: '/documentos', label: 'Mis Documentos', icon: Files },
];

export default function Sidebar({ role = 'vendedor' }: { role?: 'admin' | 'vendedor' }) {
  const pathname = usePathname();
  const links = role === 'admin' ? adminLinks : vendedorLinks;

  return (
    <aside className="w-64 glass border-r border-white/5 h-screen sticky top-0 flex flex-col pt-6">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Plane className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Trip Conecta</h1>
          <span className="text-xs text-slate-500">B2B System</span>
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
        

      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configuración</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
