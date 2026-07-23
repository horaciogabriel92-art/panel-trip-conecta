interface TenantFooterProps {
  tenant: any;
  landing: any;
}

export default function TenantFooter({ tenant, landing }: TenantFooterProps) {
  const redes = landing?.redes_sociales || {};
  const footerLinks = landing?.footer_links || [];
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: "rgba(0,0,0,0.02)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {tenant?.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.nombre}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: landing?.color_primario || "#0ea5e9" }}
                >
                  {(landing?.titulo || tenant?.nombre || "A").charAt(0)}
                </div>
              )}
              <span
                className="font-semibold"
                style={{ color: landing?.color_texto || "#0f172a" }}
              >
                {landing?.titulo || tenant?.nombre}
              </span>
            </div>
            {landing?.direccion && (
              <p className="text-sm opacity-80">{landing.direccion}</p>
            )}
            {landing?.horarios && (
              <p className="text-sm opacity-80">{landing.horarios}</p>
            )}
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4
              className="font-semibold text-sm uppercase tracking-wide"
              style={{ color: landing?.color_texto || "#0f172a" }}
            >
              Contacto
            </h4>
            {landing?.telefono && <p className="text-sm opacity-80">Tel: {landing.telefono}</p>}
            {landing?.whatsapp && <p className="text-sm opacity-80">WhatsApp: {landing.whatsapp}</p>}
            {landing?.email && <p className="text-sm opacity-80">{landing.email}</p>}
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4
              className="font-semibold text-sm uppercase tracking-wide"
              style={{ color: landing?.color_texto || "#0f172a" }}
            >
              Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {Object.keys(redes).length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {Object.entries(redes).map(([key, url]: [string, any]) =>
                  url ? (
                    <a
                      key={key}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium opacity-80 hover:opacity-100 capitalize"
                    >
                      {key}
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className="border-t mt-10 pt-6 text-center text-xs opacity-60"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <p>
            © {year} {landing?.titulo || tenant?.nombre}.{" "}
            {landing?.footer_texto || "Todos los derechos reservados."}
          </p>
          <p className="mt-1">Powered by Quotix</p>
        </div>
      </div>
    </footer>
  );
}
