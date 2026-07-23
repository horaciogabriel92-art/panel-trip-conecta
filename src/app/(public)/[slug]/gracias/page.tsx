import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { PUBLIC_API_URL } from "@/lib/publicApi";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";

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
  return {
    title: `Gracias — ${landing?.titulo || tenant?.nombre}`,
    description: "Consulta enviada correctamente",
  };
}

export default async function GraciasPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchLanding(slug);
  if (!data) notFound();

  const { tenant, landing } = data;
  const colors = {
    primary: landing?.color_primario || "#0ea5e9",
    bg: landing?.color_fondo || "#ffffff",
    text: landing?.color_texto || "#0f172a",
  };

  return (
    <>
      <TenantHeader tenant={tenant} landing={landing} />
      <main className="flex-1" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <section className="max-w-7xl mx-auto px-6 py-24 text-center" style={{ backgroundColor: colors.bg }}>
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-black/10 p-10 md:p-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              ✓
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              ¡Consulta enviada!
            </h1>
            <p className="opacity-70 mb-8">
              Un asesor de {landing?.titulo || tenant?.nombre} se pondrá en contacto con vos a la
              brevedad.
            </p>
            <Link
              href={`/${slug}/`}
              className="inline-flex items-center justify-center font-semibold px-6 py-3 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Volver al catálogo
            </Link>
          </div>
        </section>
      </main>
      <TenantFooter tenant={tenant} landing={landing} />
    </>
  );
}
