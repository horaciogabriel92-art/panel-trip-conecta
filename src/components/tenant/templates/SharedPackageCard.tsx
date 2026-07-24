import Link from "next/link";
import { createElement } from "react";
import { getIcon } from "./FeatureIcon";
import type { Landing, Paquete } from "./types";

interface SharedPackageCardProps {
  paquete: Paquete;
  landing: Landing;
  slug: string;
  variant?: "list" | "masonry" | "card";
  featured?: boolean;
}

export default function SharedPackageCard({
  paquete,
  landing,
  slug,
  variant = "card",
}: SharedPackageCardProps) {
  const imagen =
    paquete?.imagen_url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800";
  const precioDesde = paquete?.precio_doble || paquete?.precio_base;
  const mostrarPrecios = landing?.mostrar_precios !== false;
  const primary = landing?.color_primario || "#0ea5e9";
  const text = landing?.color_texto || "#0f172a";

  const ArrowRight = getIcon("ArrowRight");
  const Clock = getIcon("Clock");
  const MapPin = getIcon("MapPin");

  if (variant === "list") {
    return (
      <Link
        href={`/${slug}/paquetes/${paquete.id}`}
        className="group block border-b last:border-b-0 border-black/10 py-8 transition-colors hover:bg-black/[0.02]"
        style={{ color: text }}
      >
        <article className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img
              src={imagen}
              alt={paquete.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: primary }}>
              {createElement(Clock, { className: "w-4 h-4" })}
              {paquete.duracion} días
              <span className="mx-1">·</span>
              {createElement(MapPin, { className: "w-4 h-4" })}
              {paquete.destino}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">{paquete.titulo}</h3>
            <p className="text-sm opacity-70 line-clamp-2 mb-4">{paquete.descripcion}</p>
            <div className="mt-auto flex items-center justify-between">
              {mostrarPrecios && precioDesde ? (
                <div>
                  <p className="text-[10px] uppercase font-semibold opacity-50">Desde</p>
                  <p className="text-2xl font-bold" style={{ color: primary }}>
                    ${Number(precioDesde).toLocaleString("es-AR")}
                    <span className="text-base font-normal opacity-60 ml-1">USD</span>
                  </p>
                </div>
              ) : (
                <div />
              )}
              <span
                className="inline-flex items-center gap-1 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity"
                style={{ backgroundColor: primary }}
              >
                Ver detalles
                {createElement(ArrowRight, { className: "w-4 h-4" })}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  const cardBase =
    "group block bg-white rounded-2xl border border-black/10 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl";

  if (variant === "masonry") {
    return (
      <Link
        href={`/${slug}/paquetes/${paquete.id}`}
        className={cardBase}
        style={{ color: text }}
      >
        <article className="flex flex-col h-full">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={imagen}
              alt={paquete.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm text-slate-800">
              {paquete.duracion} días
            </span>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <p className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wide">{paquete.destino}</p>
            <h3 className="text-lg font-bold leading-tight mb-2">{paquete.titulo}</h3>
            <p className="text-sm opacity-70 line-clamp-2 mb-4 flex-1">{paquete.descripcion}</p>
            <div className="flex items-end justify-between pt-4 border-t border-black/10">
              {mostrarPrecios && precioDesde ? (
                <div>
                  <p className="text-[10px] uppercase font-semibold opacity-50">Desde</p>
                  <p className="text-xl font-bold" style={{ color: primary }}>
                    ${Number(precioDesde).toLocaleString("es-AR")}
                  </p>
                </div>
              ) : (
                <div />
              )}
              <span
                className="text-sm font-semibold px-4 py-2 rounded-full border transition-colors hover:text-white"
                style={{ borderColor: primary, color: primary }}
              >
                Ver paquete
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // card (shell)
  return (
    <Link href={`/${slug}/paquetes/${paquete.id}`} className={cardBase} style={{ color: text }}>
      <article className="flex flex-col h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imagen}
            alt={paquete.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wide text-white flex items-center gap-1">
            {createElement(Clock, { className: "w-3 h-3" })}
            {paquete.duracion} días
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: primary }}>
            {paquete.destino}
          </p>
          <h3 className="text-lg font-bold leading-tight mb-2">{paquete.titulo}</h3>
          <p className="text-sm opacity-70 line-clamp-2 mb-4 flex-1">{paquete.descripcion}</p>
          <div className="flex items-end justify-between pt-4 border-t border-black/10">
            {mostrarPrecios && precioDesde ? (
              <div>
                <p className="text-[10px] uppercase font-semibold opacity-50">Desde</p>
                <p className="text-xl font-bold" style={{ color: primary }}>
                  ${Number(precioDesde).toLocaleString("es-AR")}
                  <span className="text-sm font-normal opacity-60 ml-1">USD</span>
                </p>
              </div>
            ) : (
              <div />
            )}
            <span
              className="text-sm font-semibold px-4 py-2 rounded-full border transition-colors hover:text-white"
              style={{ borderColor: primary, color: primary }}
            >
              Ver paquete
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
