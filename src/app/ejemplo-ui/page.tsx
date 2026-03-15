"use client";

import { useState } from "react";
import { 
  DollarSign, CheckCircle, Wallet, Users, TrendingUp, Plus, UserPlus, CreditCard, 
  Briefcase, FileText, Search, Shield, User, Plane, Clock, Download, Bell 
} from "lucide-react";

export default function EjemploUIPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "vendedor">("admin");

  return (
    <div className="space-y-8">
      {/* Header con Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Ejemplo de UI/UX</h1>
          <p className="text-slate-400 mt-1">Propuesta de diseño para el Dashboard B2B</p>
        </div>
        
        {/* Tabs en lugar de Switch */}
        <div className="glass rounded-full p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "admin" 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            Vista Admin
          </button>
          <button
            onClick={() => setActiveTab("vendedor")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "vendedor" 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            Vista Vendedor
          </button>
        </div>
      </div>

      {activeTab === "admin" ? <VistaAdmin /> : <VistaVendedor />}
    </div>
  );
}

// ============== VISTA ADMINISTRADOR ==============
function VistaAdmin() {
  return (
    <div className="space-y-8">
      {/* Stats Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<DollarSign className="w-6 h-6 text-blue-400" />}
          iconBg="bg-blue-500/10"
          label="Total Facturado"
          value="$847.5k"
          subtext="USD en ventas confirmadas"
          trend="+23%"
          trendUp
        />
        <StatCard 
          icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          iconBg="bg-green-500/10"
          label="Ventas Cerradas"
          value="156"
          subtext="Este mes"
          trend="+12%"
          trendUp
        />
        <StatCard 
          icon={<Wallet className="w-6 h-6 text-yellow-400" />}
          iconBg="bg-yellow-500/10"
          label="Comisiones por Pagar"
          value="$42.3k"
          subtext="A 8 vendedores"
          highlight
          status="Pendiente"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-purple-400" />}
          iconBg="bg-purple-500/10"
          label="Vendedores"
          value="10"
          subtext="2 con comisiones pendientes"
        />
      </div>

      {/* Gráfico + Acciones Rápidas */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico de Ventas */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Ventas por Mes</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[
              { month: "Ene", height: "45%" },
              { month: "Feb", height: "62%" },
              { month: "Mar", height: "38%" },
              { month: "Abr", height: "85%" },
              { month: "May", height: "55%" },
              { month: "Jun", height: "72%" },
              { month: "Jul", height: "95%", highlight: true },
              { month: "Ago", height: "40%", dim: true },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t transition-all hover:opacity-80 ${
                    bar.highlight 
                      ? "bg-gradient-to-t from-green-500 to-green-400" 
                      : bar.dim 
                        ? "bg-slate-600/50" 
                        : "bg-gradient-to-t from-blue-600 to-blue-400"
                  }`}
                  style={{ height: bar.height }}
                />
                <span className={`text-xs ${bar.highlight ? "text-green-400 font-bold" : "text-slate-500"}`}>
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">Acciones Rápidas</h3>
          <div className="space-y-3">
            <QuickActionButton 
              icon={<Plus className="w-5 h-5" />}
              iconBg="bg-blue-500"
              title="Nuevo Paquete"
              subtitle="Crear oferta de viaje"
              borderColor="border-blue-500/20"
              bgHover="hover:bg-blue-500/20"
            />
            <QuickActionButton 
              icon={<UserPlus className="w-5 h-5" />}
              iconBg="bg-green-500"
              title="Nuevo Vendedor"
              subtitle="Dar acceso al sistema"
              borderColor="border-green-500/20"
              bgHover="hover:bg-green-500/20"
            />
            <QuickActionButton 
              icon={<CreditCard className="w-5 h-5" />}
              iconBg="bg-yellow-500"
              title="Pagar Comisiones"
              subtitle="$42.3k pendientes"
              borderColor="border-yellow-500/20"
              bgHover="hover:bg-yellow-500/20"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Vendedores */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/5">
          <button className="px-6 py-4 text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <Users className="w-4 h-4" />
            Vendedores & Comisiones
          </button>
          <button className="px-6 py-4 text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Paquetes Activos
          </button>
          <button className="px-6 py-4 text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Ventas Recientes
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Rendimiento por Vendedor</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar vendedor..." 
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm w-64 text-slate-300 placeholder:text-slate-500"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                Exportar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="pb-4 pl-4">Vendedor</th>
                  <th className="pb-4">% Comisión</th>
                  <th className="pb-4 text-right">Ventas</th>
                  <th className="pb-4 text-right">Total Vendido</th>
                  <th className="pb-4 text-right">Comisión Total</th>
                  <th className="pb-4 text-right text-yellow-400">Por Pagar</th>
                  <th className="pb-4 text-center">Estado</th>
                  <th className="pb-4 pr-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "María López", email: "maria.lopez@email.com", initials: "ML", color: "from-pink-500 to-rose-600", percent: "12%", sales: 24, total: "$142,500", commission: "$17,100", pending: "$5,200", status: "pendiente" },
                  { name: "Juan Rodríguez", email: "juan.r@email.com", initials: "JR", color: "from-green-500 to-emerald-600", percent: "10%", sales: 18, total: "$98,300", commission: "$9,830", pending: "$3,100", status: "pendiente" },
                  { name: "Ana García", email: "ana.garcia@email.com", initials: "AG", color: "from-purple-500 to-violet-600", percent: "15%", sales: 31, total: "$215,800", commission: "$32,370", pending: "$0", status: "pagada" },
                  { name: "Pedro Silva", email: "pedro.silva@email.com", initials: "PS", color: "from-orange-500 to-red-600", percent: "10%", sales: 12, total: "$67,400", commission: "$6,740", pending: "$2,800", status: "pendiente" },
                  { name: "Laura Martínez", email: "laura.m@email.com", initials: "LM", color: "from-cyan-500 to-blue-600", percent: "12%", sales: 28, total: "$189,200", commission: "$22,704", pending: "$0", status: "pagada" },
                ].map((seller, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${seller.color} flex items-center justify-center font-bold text-sm`}>
                          {seller.initials}
                        </div>
                        <div>
                          <p className="font-semibold">{seller.name}</p>
                          <p className="text-xs text-slate-400">{seller.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-semibold">{seller.percent}</span>
                    </td>
                    <td className="py-4 text-right font-semibold">{seller.sales}</td>
                    <td className="py-4 text-right">{seller.total}</td>
                    <td className="py-4 text-right">{seller.commission}</td>
                    <td className={`py-4 text-right font-bold ${seller.pending === "$0" ? "text-green-400" : "text-yellow-400"}`}>
                      {seller.pending}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        seller.status === "pagada" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {seller.status === "pagada" ? "Al día" : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <button className={`text-sm font-medium ${
                        seller.pending === "$0" 
                          ? "text-slate-500 hover:text-slate-300" 
                          : "text-blue-400 hover:text-blue-300"
                      }`}>
                        {seller.pending === "$0" ? "Ver" : "Pagar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
            <p className="text-sm text-slate-400">Mostrando 5 de 10 vendedores</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg bg-white/5 text-slate-500 text-sm cursor-not-allowed" disabled>Anterior</button>
              <button className="px-3 py-1 rounded-lg bg-blue-600 text-sm">1</button>
              <button className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">2</button>
              <button className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== VISTA VENDEDOR ==============
function VistaVendedor() {
  return (
    <div className="space-y-8">
      {/* Header Vendedor */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl font-bold">
              ML
            </div>
            <div>
              <h2 className="text-2xl font-bold">María López</h2>
              <p className="text-slate-400">Vendedora Senior • Comisión 12%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Desde</p>
            <p className="font-semibold">Marzo 2023</p>
          </div>
        </div>
      </div>

      {/* Stats Vendedor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardVendedor 
          label="Mi Facturación"
          value="$142.5k"
          trend="+18% vs mes anterior"
          iconBg="bg-blue-500/10"
          blurColor="bg-blue-500/10"
        />
        <StatCardVendedor 
          label="Por Comisionar"
          value="$5,200"
          subtext="De 3 ventas pendientes"
          highlight
          iconBg="bg-yellow-500/10"
          blurColor="bg-yellow-500/10"
          valueColor="text-yellow-400"
        />
        <StatCardVendedor 
          label="Comisiones Cobradas"
          value="$11,900"
          subtext="Total histórico"
          iconBg="bg-green-500/10"
          blurColor="bg-green-500/10"
          valueColor="text-green-400"
        />
      </div>

      {/* Mis Ventas + Cotizaciones */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ventas Cerradas */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Mis Ventas Cerradas
            </h3>
            <span className="text-sm text-slate-400">24 ventas</span>
          </div>

          <div className="space-y-4">
            {[
              { title: "París Romántico", client: "Roberto y Ana Gómez", pax: "2 personas • Doble", price: "$8,400", code: "VEN-2024-0089", date: "15 Jul 2024", status: "pagada", commission: "$1,008" },
              { title: "Riviera Maya Todo Incluido", client: "Familia Fernández (4 pax)", pax: "4 personas • Cuádruple", price: "$12,600", code: "VEN-2024-0156", date: "22 Jul 2024", status: "pendiente", commission: "$1,512" },
              { title: "Nueva York Express", client: "Carlos Méndez", pax: "1 persona • Single", price: "$3,200", code: "VEN-2024-0078", date: "10 Jul 2024", status: "pagada", commission: "$384" },
            ].map((sale, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">{sale.title}</p>
                    <p className="text-sm text-slate-400">Cliente: {sale.client}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sale.status === "pagada" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {sale.status === "pagada" ? "Pagada" : "Por cobrar"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{sale.pax}</span>
                  <span className="font-bold">{sale.price}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{sale.code} • {sale.date}</span>
                  <span className={`text-sm font-semibold ${sale.status === "pagada" ? "text-green-400" : "text-yellow-400"}`}>
                    Comisión: {sale.commission}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
            Ver todas mis ventas
          </button>
        </div>

        {/* Cotizaciones Activas */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Cotizaciones Activas
            </h3>
            <span className="text-sm text-slate-400">3 pendientes</span>
          </div>

          <div className="space-y-4">
            {[
              { title: "Bali Exótico", client: "Marta y Luis Rodríguez", pax: "2 pers. • Doble • 10 noches", price: "$14,200", urgent: true, time: "Expira en 4h" },
              { title: "Machu Picchu Aventura", client: "Grupo Estudiantil (8 pax)", pax: "8 pers. • 2 cuádruples • 7 noches", price: "$18,400", time: "Expira en 18h" },
              { title: "Cancún Familiar", client: "Familia Díaz (5 pax)", pax: "5 pers. • Triple + Doble", price: "$16,800", expired: true, time: "Expira en 2h" },
            ].map((quote, i) => (
              <div key={i} className={`p-4 rounded-xl relative overflow-hidden ${
                quote.urgent 
                  ? "bg-yellow-500/5 border border-yellow-500/20" 
                  : quote.expired 
                    ? "bg-white/5 border border-white/5 opacity-60" 
                    : "bg-white/5 border border-white/5"
              }`}>
                {quote.urgent && <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500" />}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">{quote.title}</p>
                    <p className="text-sm text-slate-400">Cliente: {quote.client}</p>
                  </div>
                  {!quote.expired && (
                    <div className="text-right">
                      <span className={`text-xs font-bold ${quote.urgent ? "text-yellow-400 animate-pulse" : "text-slate-400"}`}>
                        {quote.time}
                      </span>
                    </div>
                  )}
                </div>
                {!quote.expired ? (
                  <>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-slate-400">{quote.pax}</span>
                      <span className="font-bold text-xl">{quote.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-semibold transition-colors">
                        Convertir en Venta
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{quote.pax}</span>
                    <span className="font-bold">{quote.price}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Cotización
          </button>
        </div>
      </div>

      {/* Catálogo Rápido */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold">Catálogo de Paquetes</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar destino..." 
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm w-64 text-slate-300 placeholder:text-slate-500"
              />
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300">
              <option>Todos los destinos</option>
              <option>Europa</option>
              <option>Caribe</option>
              <option>América</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "París Romántico", nights: "7 noches • Francia", price: "$4,200", available: true, spots: "12 cupos", bg: "from-blue-600 to-purple-700" },
            { title: "Riviera Maya", nights: "5 noches • México", price: "$3,150", spots: "3", bg: "from-cyan-600 to-blue-700" },
            { title: "Bali Exótico", nights: "10 noches • Indonesia", price: "$7,100", available: true, bg: "from-orange-600 to-red-700" },
          ].map((pkg, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer">
              <div className={`h-48 bg-gradient-to-br ${pkg.bg} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                    pkg.spots === "3" ? "bg-yellow-500/90" : "bg-green-500/90"
                  }`}>
                    {pkg.spots === "3" ? "Últimos 3" : "Disponible"}
                  </span>
                </div>
                {pkg.spots && pkg.spots !== "3" && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs">{pkg.spots}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-lg mb-1">{pkg.title}</h4>
                <p className="text-sm text-slate-400 mb-3">{pkg.nights}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Desde</p>
                    <p className="text-xl font-bold text-blue-400">{pkg.price} <span className="text-sm text-slate-400">/pers.</span></p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors">
                    Cotizar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== COMPONENTES REUTILIZABLES ==============

function StatCard({ icon, iconBg, label, value, subtext, trend, trendUp, highlight, status }: any) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-1 ${trendUp ? "text-green-400" : "text-red-400"}`}>
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
        {status && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "Pendiente" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
          }`}>
            {status}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-black ${highlight ? "text-yellow-400" : ""}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-2">{subtext}</p>
    </div>
  );
}

function QuickActionButton({ icon, iconBg, title, subtitle, borderColor, bgHover }: any) {
  return (
    <button className={`w-full p-4 rounded-xl border ${borderColor} ${bgHover} transition-all flex items-center gap-3 group bg-white/5`}>
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </button>
  );
}

function StatCardVendedor({ label, value, subtext, trend, iconBg, blurColor, valueColor }: any) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${blurColor} rounded-full blur-3xl`} />
      <div className="relative">
        <p className="text-slate-400 text-sm mb-2">{label}</p>
        <p className={`text-4xl font-black ${valueColor || ""}`}>{value}</p>
        {trend && (
          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </p>
        )}
        {subtext && (
          <p className="text-sm text-slate-400 mt-2">{subtext}</p>
        )}
      </div>
    </div>
  );
}
