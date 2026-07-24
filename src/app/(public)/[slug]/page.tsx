import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PUBLIC_API_URL } from "@/lib/publicApi";
import TemplateRenderer from "@/components/tenant/templates/TemplateRenderer";

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

  return (
    <TemplateRenderer
      tenant={tenant}
      landing={landing}
      paquetes={paquetes}
      slug={slug}
    />
  );
}
