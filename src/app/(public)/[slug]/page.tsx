import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PUBLIC_API_URL } from "@/lib/publicApi";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import PackageCard from "@/components/tenant/PackageCard";
import FilterButtons from "@/components/tenant/FilterButtons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchLanding(slug: string) {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/public/landing/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[landing] error fetching landing:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchLanding(slug);
  if (!data) return { title: "No encontrado" };

  const { tenant, landing } = data;
  const title = landing?.seo?.title || `${landing?.titulo || tenant?.nombre} — Paquetes turísticos`;
  const description =
    landing?.seo?.description ||
    landing?.descripcion ||
    `Catálogo de paquetes turísticos de ${tenant?.nombre}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [landing?.imagen_og || tenant?.logo_url || "https://www.quotixos.com/og-image.png"],
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchLanding(slug);
  if (!data) notFound();

  const { tenant, landing, paquetes = [] } = data;
  const destinos = [
    ...new Set((paquetes || []).map((p: any) => p.destino).filter(Boolean)),
  ] as string[];

  const colors = {
    primary: landing?.color_primario || "#0ea5e9",
    secondary: landing?.color_secundario || "#6366f1",
    bg: landing?.color_fondo || "#ffffff",
    text: landing?.color_texto || "#0f172a",
  };

  return (
    <>
      <TenantHeader tenant={tenant} landing={landing} />
      <main className="flex-1" style={{ backgroundColor: colors.bg, color: colors.text }}>
        {/* Hero */}
        <section
          className="border-b"
          style={{ backgroundColor: colors.bg, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
            <h1
              className="text-3xl md:text-5xl font-extrabold max-w-3xl mx-auto mb-5"
              style={{ color: colors.text }}
            >
              {landing?.titulo || tenant?.nombre}
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-70">
              {landing?.descripcion ||
                `Descubrí los mejores paquetes turísticos de ${tenant?.nombre}.`}
            </p>
            {landing?.whatsapp && (
              <a
                href={`https://wa.me/${landing.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 font-semibold px-6 py-3 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Consultar por WhatsApp
              </a>
            )}
          </div>
        </section>

        {/* Filtros y catálogo */}
        <section className="max-w-7xl mx-auto px-6 py-16" style={{ backgroundColor: colors.bg }}>
          {paquetes.length === 0 ? (
            <div className="text-center py-20">
              <p className="opacity-60">Todavía no hay paquetes publicados.</p>
            </div>
          ) : (
            <>
              <FilterButtons destinos={destinos} landing={landing} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="paquetes-grid">
                {paquetes.map((paquete: any) => (
                  <div key={paquete.id} className="paquete-card" data-destino={paquete.destino}>
                    <PackageCard
                      paquete={paquete}
                      slug={slug}
                      mostrarPrecios={landing?.mostrar_precios !== false}
                      landing={landing}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <TenantFooter tenant={tenant} landing={landing} />
    </>
  );
}
