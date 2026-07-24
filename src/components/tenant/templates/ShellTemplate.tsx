"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import SharedPackageCard from "./SharedPackageCard";
import FeatureIcon from "./FeatureIcon";
import type { TemplateProps, Paquete, FeatureItem } from "./types";

export default function ShellTemplate({ tenant, landing, paquetes, slug }: TemplateProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const primary = landing?.color_primario || "#0ea5e9";
  const text = landing?.color_texto || "#0f172a";
  const bg = landing?.color_fondo || "#ffffff";

  const heroImage =
    landing?.hero?.imagen_url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80";
  const ctaImage =
    landing?.cta_final?.imagen_url ||
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80";

  const heroTitle = landing?.hero?.titulo || landing?.titulo || tenant?.nombre;
  const heroSubtitle =
    landing?.hero?.subtitulo || landing?.descripcion || `Descubrí los mejores paquetes de ${tenant?.nombre}.`;
  const heroEyebrow = landing?.hero?.eyebrow || "";
  const heroCta = landing?.hero?.cta_texto || "Ver catálogo";
  const heroCtaUrl = landing?.hero?.cta_url || "#paquetes";

  const ctaTitle = landing?.cta_final?.titulo || "¿Buscás algo exclusivo?";
  const ctaSubtitle =
    landing?.cta_final?.subtitulo ||
    "Armamos tu viaje a medida. Contanos tu idea y diseñamos un itinerario exclusivo adaptado a tu estilo.";
  const ctaButton = landing?.cta_final?.cta_texto || "Solicitar cotización";

  const features = landing?.features?.items || [];
  const featuresTitle = landing?.features?.titulo || "¿Por qué elegirnos?";
  const featuresSubtitle = landing?.features?.subtitulo || "";

  const categorias = useMemo(() => {
    const cats = [...new Set((paquetes || []).map((p: Paquete) => p.destino).filter(Boolean))];
    return ["all", ...cats.slice(0, 6)];
  }, [paquetes]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (paquetes || []).filter((p: Paquete) => {
      const matchesFilter = activeFilter === "all" || p.destino === activeFilter;
      const matchesSearch =
        !q ||
        p.titulo?.toLowerCase().includes(q) ||
        p.destino?.toLowerCase().includes(q) ||
        (p.descripcion || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [paquetes, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg, color: text }}>
      <TenantHeader tenant={tenant} landing={landing} />

      {/* Hero full width */}
      <section className="relative mt-16 min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={heroTitle}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.65)" }}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-slate-900/35" />
        <div className="relative z-10 text-center max-w-3xl px-6 py-24 text-white">
          {heroEyebrow && (
            <span
              className="inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border"
              style={{ borderColor: landing?.color_secundario || "#f59e0b", color: landing?.color_secundario || "#f59e0b" }}
            >
              {heroEyebrow}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10">{heroSubtitle}</p>
          <Link
            href={heroCtaUrl}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-transform hover:-translate-y-0.5 shadow-lg"
            style={{ backgroundColor: primary, color: "#ffffff" }}
          >
            {heroCta}
            <FeatureIcon name="ArrowRight" className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Search bar flotante */}
      <section className="relative z-20 -mt-10 px-6 mb-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-black/10 p-6">
          <div className="relative mb-4">
            <FeatureIcon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar destino..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base border border-black/10 bg-black/5 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeFilter === cat
                    ? "text-white"
                    : "bg-black/5 hover:border-black/20"
                }`}
                style={activeFilter === cat ? { backgroundColor: primary, borderColor: primary } : {}}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de paquetes */}
      <section id="paquetes" className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Paquetes disponibles</h2>
          <p className="opacity-70">Explorá nuestras experiencias y encontrá tu próximo viaje.</p>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 opacity-60">No se encontraron paquetes con los filtros actuales.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((paquete) => (
              <SharedPackageCard key={paquete.id} paquete={paquete} landing={landing} slug={slug} variant="card" />
            ))}
          </div>
        )}
      </section>

      {/* Features cards */}
      <section className="py-20 border-t border-black/10" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{featuresTitle}</h2>
            <p className="opacity-70">{featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item: FeatureItem, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-black/10 bg-white transition-all hover:-translate-y-2 hover:shadow-lg"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  <FeatureIcon name={item.icono} className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.titulo}</h3>
                <p className="text-sm opacity-70">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
        <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden bg-slate-900">
          <div
            className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute -bottom-1/3 -left-1/4 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
            style={{ backgroundColor: landing?.color_secundario || "#f59e0b" }}
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-10 md:p-16 text-white">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{ctaTitle}</h2>
              <p className="opacity-70 text-lg">{ctaSubtitle}</p>
              {landing?.whatsapp && (
                <a
                  href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-full font-semibold bg-white transition-transform hover:-translate-y-0.5"
                  style={{ color: "#0f172a" }}
                >
                  {ctaButton}
                  <FeatureIcon name="ArrowRight" className="w-5 h-5" />
                </a>
              )}
            </div>
            <div className="hidden lg:block relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img src={ctaImage} alt="CTA" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <TenantFooter tenant={tenant} landing={landing} />
    </div>
  );
}
