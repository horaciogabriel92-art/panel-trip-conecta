import Link from "next/link";

interface TenantHeaderProps {
  tenant: any;
  landing: any;
}

export default function TenantHeader({ tenant, landing }: TenantHeaderProps) {
  const whatsappUrl = landing?.whatsapp
    ? `https://wa.me/${landing.whatsapp.replace(/\D/g, '')}`
    : null;

  const navLinks = [
    { label: "Paquetes", href: `/${tenant?.slug}/` },
    ...((landing?.botones_extra || [])
      .filter((b: any) => b.label && b.url)
      .slice(0, 2)),
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: landing?.color_fondo || "#ffffff",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${tenant?.slug}/`} className="flex items-center gap-3 min-w-0">
          {landing?.imagen_og || tenant?.logo_url ? (
            <img
              src={landing?.imagen_og || tenant?.logo_url}
              alt={landing?.titulo || tenant?.nombre}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: landing?.color_primario || "#0ea5e9" }}
            >
              {(landing?.titulo || tenant?.nombre || "A").charAt(0)}
            </div>
          )}
          <span
            className="font-semibold text-base truncate hidden sm:block"
            style={{ color: landing?.color_texto || "#0f172a" }}
          >
            {landing?.titulo || tenant?.nombre}
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {navLinks.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: landing?.color_texto || "#0f172a" }}
            >
              {link.label}
            </Link>
          ))}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
              style={{ backgroundColor: landing?.color_primario || "#0ea5e9" }}
            >
              WhatsApp
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
