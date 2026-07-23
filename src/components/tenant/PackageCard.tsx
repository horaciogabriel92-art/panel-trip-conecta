import Link from "next/link";

interface PackageCardProps {
  paquete: any;
  slug: string;
  mostrarPrecios?: boolean;
  landing: any;
}

export default function PackageCard({
  paquete,
  slug,
  mostrarPrecios = true,
  landing,
}: PackageCardProps) {
  const imagen =
    paquete?.imagen_url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800";
  const precioDesde = paquete?.precio_doble || paquete?.precio_base;

  return (
    <Link
      href={`/${slug}/paquetes/${paquete?.id}`}
      className="group block bg-white rounded-2xl border border-black/10 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ borderColor: "rgba(0,0,0,0.1)" }}
    >
      <article className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imagen}
            alt={paquete?.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div
            className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm"
            style={{ color: landing?.color_texto || "#0f172a" }}
          >
            {paquete?.duracion} días
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <p className="text-xs font-medium opacity-60 mb-1">{paquete?.destino}</p>
            <h3
              className="text-lg font-bold leading-tight"
              style={{ color: landing?.color_texto || "#0f172a" }}
            >
              {paquete?.titulo}
            </h3>
          </div>

          <p className="text-sm opacity-70 line-clamp-2 mb-4 flex-1">
            {paquete?.descripcion || "Descubrí este destino increíble con todos los servicios incluidos."}
          </p>

          <div className="flex items-end justify-between pt-4 border-t border-black/10">
            {mostrarPrecios && precioDesde ? (
              <div>
                <p className="text-[10px] uppercase font-semibold opacity-50">Desde</p>
                <p
                  className="text-xl font-bold"
                  style={{ color: landing?.color_primario || "#0ea5e9" }}
                >
                  ${Number(precioDesde).toLocaleString("es-AR")}
                </p>
              </div>
            ) : (
              <div />
            )}
            <span
              className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity group-hover:opacity-100 opacity-90"
              style={{ backgroundColor: landing?.color_primario || "#0ea5e9" }}
            >
              Ver paquete
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
