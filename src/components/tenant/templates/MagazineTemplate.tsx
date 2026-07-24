"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import SharedPackageCard from "./SharedPackageCard";
import FeatureIcon from "./FeatureIcon";
import type { TemplateProps, Paquete, FeatureItem } from "./types";

export default function MagazineTemplate({ tenant, landing, paquetes, slug }: TemplateProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);

  const primary = landing?.color_primario || "#0ea5e9";
  const text = landing?.color_texto || "#0f172a";
  const bg = landing?.color_fondo || "#ffffff";

  const heroImage =
    landing?.hero?.imagen_url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80";
  const ctaImage =
    landing?.cta_final?.imagen_url ||
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80";

  const heroTitle = landing?.hero?.titulo || landing?.titulo || tenant?.nombre;
  const heroSubtitle =
    landing?.hero?.subtitulo || landing?.descripcion || `Descubrí los mejores paquetes de ${tenant?.nombre}.`;
  const heroEyebrow = landing?.hero?.eyebrow || "";
  const heroCta = landing?.hero?.cta_texto || "Ver destacados";
  const heroCtaUrl = landing?.hero?.cta_url || "#destacados";

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

  const destacados = useMemo(() => {
    return (paquetes || []).slice(0, 4);
  }, [paquetes]);

  const scrollFeatured = (dir: number) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg, color: text }}>
      <TenantHeader tenant={tenant} landing={landing} variant="transparent" />

      {/* Hero split 50/50 */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="relative h-[50vh] lg:h-auto">
          <img
            src={heroImage}
            alt={heroTitle}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.85)" }}
          />
          <div className="absolute inset-0 bg-slate-900/20" />
        </div>
        <div className="flex flex-col justify-center px-8 md:px-16 py-20 lg:py-0" style={{ backgroundColor: bg }}>
          {heroEyebrow && (
            <span
              className="w-fit inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border"
              style={{ borderColor: primary, color: primary }}
            >
              {heroEyebrow}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-serif">
            {heroTitle}
          </h1>
          <p className="text-lg opacity-70 max-w-md mb-8">{heroSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={heroCtaUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition-transform hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: primary }}
            >
              {heroCta}
              <FeatureIcon name="ArrowRight" className="w-4 h-4" />
            </Link>
            {landing?.whatsapp && (
              <a
                href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold border transition-transform hover:-translate-y-0.5"
                style={{ borderColor: text, color: text }}
              >
                Contactar asesor
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Carrusel destacados */}
      {destacados.length > 0 && (
        <section id="destacados" className="py-20 border-t border-black/10" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-serif">Destacados de la temporada</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollFeatured(-1)}
                  className="w-11 h-11 rounded-full border border-black/10 bg-white flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label="Anterior"
                >
                  <FeatureIcon name="ChevronLeft" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollFeatured(1)}
                  className="w-11 h-11 rounded-full border border-black/10 bg-white flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label="Siguiente"
                >
                  <FeatureIcon name="ChevronRight" className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div
              ref={trackRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
            >
              {destacados.map((paquete) => (
                <div key={paquete.id} className="snap-start flex-shrink-0 w-[300px] md:w-[320px]">
                  <SharedPackageCard paquete={paquete} landing={landing} slug={slug} variant="masonry" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Masonry + sidebar */}
      <section id="paquetes" className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
          <aside className="lg:sticky lg:top-24 space-y-6">
            <h3 className="text-xl font-bold font-serif pb-3 border-b border-black/10">Explorar</h3>
            <div className="relative">
              <FeatureIcon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar destino..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-black/10 bg-black/5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-row lg:flex-col flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeFilter === cat ? "text-white" : "hover:bg-black/5"
                  }`}
                  style={activeFilter === cat ? { backgroundColor: primary } : {}}
                >
                  <span>{cat === "all" ? "Todos los paquetes" : cat}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeFilter === cat ? "bg-white/20" : "bg-black/10"
                    }`}
                  >
                    {cat === "all" ? paquetes.length : paquetes.filter((p: Paquete) => p.destino === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-serif">Paquetes disponibles</h2>
              <span className="text-sm opacity-60">{filtered.length} experiencias</span>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 opacity-60">No se encontraron paquetes.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((paquete) => (
                  <SharedPackageCard
                    key={paquete.id}
                    paquete={paquete}
                    landing={landing}
                    slug={slug}
                    variant="masonry"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features numeradas */}
      <section className="py-20 border-t border-black/10" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            {featuresTitle && <h2 className="text-2xl md:text-3xl font-bold font-serif mb-3">{featuresTitle}</h2>}
            {featuresSubtitle && <p className="opacity-70">{featuresSubtitle}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item: FeatureItem, idx: number) => (
              <div key={idx} className="text-center p-4">
                <p className="text-5xl font-bold mb-3 opacity-20" style={{ color: primary }}>
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <h3 className="font-bold text-lg mb-2">{item.titulo}</h3>
                <p className="text-sm opacity-70">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
        <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden bg-slate-900">
          <div
            className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-10 md:p-16 text-white">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">{ctaTitle}</h2>
              <p className="opacity-70 text-lg mb-8">{ctaSubtitle}</p>
              {landing?.whatsapp && (
                <a
                  href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold bg-white transition-transform hover:-translate-y-0.5"
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
