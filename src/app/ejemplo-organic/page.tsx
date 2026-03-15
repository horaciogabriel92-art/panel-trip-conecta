"use client";

import { useState } from "react";
import { 
  DollarSign, Users, Wallet, TrendingUp, Plus, Search, 
  Bell, Settings, LogOut, Plane, Home, Package, FileText, 
  ShoppingBag, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle
} from "lucide-react";

export default function EjemploOrganicPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="pb-24">
      {/* Header Orgánico */}
      <header className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Clay */}
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_8px_30px_rgba(139,92,246,0.3)] flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Trip Conecta</h1>
              <p className="text-sm text-slate-400">Panel de Vendedor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-2xl bg-[#1a1a20] shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-[0_4px_20px_rgba(244,63,94,0.3)] flex items-center justify-center font-bold text-white">
              ML
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards - Estilo Claymorphism */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 - Facturación */}
          <div className="clay-card p-5 rounded-[28px]">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Mi Facturación</p>
            <p className="text-2xl font-bold text-white mb-2">$142.5k</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18%</span>
            </div>
          </div>

          {/* Card 2 - Por Cobrar */}
          <div className="clay-card p-5 rounded-[28px] border-amber-500/20">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Por Cobrar</p>
            <p className="text-2xl font-bold text-amber-400 mb-2">$5,200</p>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <span>3 ventas pendientes</span>
            </div>
          </div>

          {/* Card 3 - Ventas */}
          <div className="clay-card p-5 rounded-[28px]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Ventas</p>
            <p className="text-2xl font-bold text-white mb-2">24</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Este mes</span>
            </div>
          </div>

          {/* Card 4 - Clientes */}
          <div className="clay-card p-5 rounded-[28px]">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Clientes</p>
            <p className="text-2xl font-bold text-white mb-2">18</p>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <span>Activos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cotizaciones Urgentes - Cards Flotantes */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cotizaciones Urgentes</h2>
          <span className="text-xs text-slate-400">3 pendientes</span>
        </div>

        <div className="space-y-4">
          {/* Cotización 1 - Urgente */}
          <div className="clay-card p-5 rounded-[24px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">Bali Exótico</h3>
                  <p className="text-sm text-slate-400">Marta y Luis Rodríguez</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                    Expira 4h
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  10 noches
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  2 personas
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold text-white">$14,200</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)] text-white text-sm font-semibold hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-shadow">
                  Cerrar Venta
                </button>
              </div>
            </div>
          </div>

          {/* Cotización 2 */}
          <div className="clay-card p-5 rounded-[24px] opacity-80">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">Machu Picchu</h3>
                <p className="text-sm text-slate-400">Grupo Estudiantil (8 pax)</p>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                18h
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-white">$18,400</p>
              <button className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium">
                Ver
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo Rápido */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Catálogo</h2>
          <button className="text-sm text-violet-400 font-medium">Ver todo</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          {/* Paquete 1 */}
          <div className="flex-shrink-0 w-64 clay-card p-4 rounded-[24px]">
            <div className="h-32 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-medium">
                  Disponible
                </span>
              </div>
            </div>
            <h3 className="font-bold mb-1">París Romántico</h3>
            <p className="text-sm text-slate-400 mb-3">7 noches • Francia</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Desde</p>
                <p className="text-lg font-bold text-violet-400">$4,200</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Paquete 2 */}
          <div className="flex-shrink-0 w-64 clay-card p-4 rounded-[24px]">
            <div className="h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-lg bg-amber-500/80 text-white text-xs font-medium">
                  Últimos 3
                </span>
              </div>
            </div>
            <h3 className="font-bold mb-1">Riviera Maya</h3>
            <p className="text-sm text-slate-400 mb-3">5 noches • México</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Desde</p>
                <p className="text-lg font-bold text-violet-400">$3,150</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Paquete 3 */}
          <div className="flex-shrink-0 w-64 clay-card p-4 rounded-[24px]">
            <div className="h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-medium">
                  Disponible
                </span>
              </div>
            </div>
            <h3 className="font-bold mb-1">Bali Exótico</h3>
            <p className="text-sm text-slate-400 mb-3">10 noches • Indonesia</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Desde</p>
                <p className="text-lg font-bold text-violet-400">$7,100</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation - Estilo Organic */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="clay-nav px-2 py-2 rounded-full flex items-center justify-around">
          <NavButton 
            icon={<Home className="w-5 h-5" />} 
            label="Inicio" 
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavButton 
            icon={<Package className="w-5 h-5" />} 
            label="Catálogo" 
            active={activeTab === "catalogo"}
            onClick={() => setActiveTab("catalogo")}
          />
          
          {/* Botón principal flotante */}
          <button className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_8px_30px_rgba(139,92,246,0.4)] flex items-center justify-center text-white -mt-6 hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </button>
          
          <NavButton 
            icon={<FileText className="w-5 h-5" />} 
            label="Cotiz." 
            active={activeTab === "cotizaciones"}
            onClick={() => setActiveTab("cotizaciones")}
          />
          <NavButton 
            icon={<MoreHorizontal className="w-5 h-5" />} 
            label="Más" 
            active={activeTab === "mas"}
            onClick={() => setActiveTab("mas")}
          />
        </div>
      </nav>

      {/* Estilos CSS específicos */}
      <style jsx global>{`
        .clay-card {
          background: linear-gradient(145deg, #1a1a22 0%, #141419 100%);
          box-shadow: 
            8px 8px 16px #0a0a0e,
            -8px -8px 16px #24242c,
            inset 0 1px 1px rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.03);
        }
        
        .clay-nav {
          background: linear-gradient(145deg, #1e1e26 0%, #16161b 100%);
          box-shadow: 
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 1px rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all ${
        active 
          ? "text-violet-400 bg-violet-500/10" 
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
