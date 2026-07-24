"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import SharedPackageCard from "./SharedPackageCard";
import FeatureIcon from "./FeatureIcon";
import type { TemplateProps, Paquete, FeatureItem } from "./types";

export default function ListaTemplate({ tenant, landing, paquetes, slug }: TemplateProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const primary = landing?.color_primario || "#0ea5e9";
  const text = landing?.color_texto || "#0f172a";
  const bg = landing?.color_fondo || "#ffffff";

  const heroImage =
    landing?.hero?.imagen_url ||
    "https://images.unsplash.com/photo-1542314831-068cd4dbbb9c?w=1920&q=80";
  const ctaImage =
    landing?.cta_final?.imagen_url ||
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80";

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

      {/* Hero */}
      <section className="relative mt-16 min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={heroTitle}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.4) saturate(0.8)" }}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-slate-900/40" />
        <div className="relative z-10 text-center max-w-2xl px-6 py-20 text-white">
          {heroEyebrow && (
            <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: landing?.color_secundario || "#f59e0b" }}>
              {heroEyebrow}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 font-serif">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto mb-8">{heroSubtitle}</p>
          <Link
            href={heroCtaUrl}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: landing?.color_secundario || "#f59e0b", color: "#0f172a" }}
          >
            {heroCta}
            <FeatureIcon name="ArrowRight" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Tabs sticky */}
      <section className="sticky top-16 z-30 border-b border-black/10 py-3" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === cat ? "border-black/20" : "border-transparent hover:bg-black/5"
              }`}
              style={activeFilter === cat ? { backgroundColor: `${primary}15`, color: primary } : {}}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
          <div className="ml-auto flex-shrink-0 relative">
            <FeatureIcon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-full text-sm border border-black/10 bg-black/5 focus:outline-none focus:border-blue-500 w-40 md:w-56"
            />
          </div>
        </div>
      </section>

      {/* Lista de paquetes */}
      <section id="paquetes" className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="flex items-baseline justify-between border-b border-black/10 pb-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-serif">Paquetes disponibles</h2>
          <span className="text-sm opacity-60">
            {filtered.length} experiencia{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            No se encontraron paquetes con los filtros actuales.
          </div>
        ) : (
          <div>
            {filtered.map((paquete) => (
              <SharedPackageCard
                key={paquete.id}
                paquete={paquete}
                landing={landing}
                slug={slug}
                variant="list"
              />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-20 border-t border-black/10" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
        <div className="max-w-7xl mx-auto px-6">
          {(featuresTitle || featuresSubtitle) && (
            <div className="text-center max-w-2xl mx-auto mb-12">
              {featuresTitle && <h2 className="text-2xl md:text-3xl font-bold font-serif mb-3">{featuresTitle}</h2>}
              {featuresSubtitle && <p className="opacity-70">{featuresSubtitle}</p>}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item: FeatureItem, idx: number) => (
              <div key={idx} className="text-center p-4">
                <div
                  className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  <FeatureIcon name={item.icono} className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{item.titulo}</h3>
                <p className="text-sm opacity-70">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={ctaImage} alt="CTA" className="w-full h-full object-cover" style={{ filter: "brightness(0.35)" }} />
        </div>
        <div className="absolute inset-0 z-[1] bg-slate-900/40" />
        <div className="relative z-10 text-center max-w-xl px-6 py-20 text-white">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">{ctaTitle}</h2>
          <p className="opacity-80 mb-8">{ctaSubtitle}</p>
          {landing?.whatsapp && (
            <a
              href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: landing?.color_secundario || "#f59e0b", color: "#0f172a" }}
            >
              {ctaButton}
              <FeatureIcon name="ArrowRight" className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>

      <TenantFooter tenant={tenant} landing={landing} />
    </div>
  );
}
