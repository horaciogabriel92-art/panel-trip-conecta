import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { PUBLIC_API_URL } from "@/lib/publicApi";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import CotizacionForm from "@/components/tenant/CotizacionForm";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

async function fetchPaquete(slug: string, id: string) {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/public/landing/${slug}/paquetes/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[landing] error fetching paquete:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const data = await fetchPaquete(slug, id);
  if (!data) return { title: "No encontrado" };

  const { tenant, landing, paquete } = data;
  const title = landing?.seo?.title || `${paquete?.titulo} — ${landing?.titulo || tenant?.nombre}`;
  const description =
    landing?.seo?.description ||
    paquete?.descripcion?.slice(0, 160) ||
    `Paquete ${paquete?.titulo} en ${paquete?.destino}`;

  return {
    title,
    description,
  };
}

export default async function PaquetePage({ params }: PageProps) {
  const { slug, id } = await params;
  const data = await fetchPaquete(slug, id);
  if (!data) notFound();

  const { tenant, landing, paquete } = data;
  const imagen =
    paquete?.imagen_url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800";

  const dias = Array.isArray(paquete?.itinerario?.dias) ? paquete.itinerario.dias : [];

  const colors = {
    primary: landing?.color_primario || "#0ea5e9",
    bg: landing?.color_fondo || "#ffffff",
    text: landing?.color_texto || "#0f172a",
  };

  return (
    <>
      <TenantHeader tenant={tenant} landing={landing} />
      <main className="flex-1" style={{ backgroundColor: colors.bg, color: colors.text }}>
        {/* Hero del paquete */}
        <section
          className="border-b"
          style={{ backgroundColor: colors.bg, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
            <div className="flex flex-wrap items-center gap-2 text-sm opacity-60 mb-4">
              <Link href={`/${slug}/`} className="hover:underline">
                Inicio
              </Link>
              <span>/</span>
              <span>{paquete?.destino}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="rounded-2xl overflow-hidden border border-black/10 shadow-sm">
                <img
                  src={imagen}
                  alt={paquete?.titulo}
                  className="w-full h-72 md:h-96 object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {paquete?.duracion} días
                  </span>
                  {paquete?.fecha_salida && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/5">
                      Salida: {new Date(paquete.fecha_salida).toLocaleDateString("es-AR")}
                    </span>
                  )}
                </div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: colors.text }}
                >
                  {paquete?.titulo}
                </h1>
                <p className="text-lg opacity-70 mb-6">{paquete?.destino}</p>

                {landing?.mostrar_precios !== false && (
                  <div className="mb-8">
                    <p className="text-sm opacity-60 mb-1">Desde</p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: colors.primary }}
                    >
                      ${
                        Number(
                          paquete?.precio_doble || paquete?.precio_base || 0
                        ).toLocaleString("es-AR")
                      }{" "}
                      <span className="text-base font-normal opacity-60">por persona</span>
                    </p>
                  </div>
                )}

                {landing?.whatsapp && (
                  <a
                    href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Consultar por WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contenido principal */}
        <section className="max-w-7xl mx-auto px-6 py-16" style={{ backgroundColor: colors.bg }}>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Columna izquierda: detalles */}
            <div className="lg:col-span-2 space-y-10">
              {paquete?.descripcion && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 md:p-8">
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.text }}
                  >
                    Descripción
                  </h2>
                  <p className="opacity-70 whitespace-pre-line">{paquete.descripcion}</p>
                </div>
              )}

              {paquete?.incluye?.length > 0 && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 md:p-8">
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.text }}
                  >
                    Incluye
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {paquete.incluye.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm opacity-80">
                        <span
                          className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {paquete?.no_incluye?.length > 0 && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 md:p-8">
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.text }}
                  >
                    No incluye
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {paquete.no_incluye.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm opacity-80">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {dias.length > 0 && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 md:p-8">
                  <h2
                    className="text-xl font-bold mb-6"
                    style={{ color: colors.text }}
                  >
                    Itinerario
                  </h2>
                  <div className="space-y-6">
                    {dias.map((dia: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: colors.text }}>
                            {dia.titulo || `Día ${idx + 1}`}
                          </h3>
                          <p className="text-sm opacity-70 mt-1">{dia.descripcion || ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha: formulario */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CotizacionForm
                  slug={slug}
                  paqueteId={id}
                  paqueteNombre={paquete?.titulo}
                  landing={landing}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <TenantFooter tenant={tenant} landing={landing} />
    </>
  );
}
