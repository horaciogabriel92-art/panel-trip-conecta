export interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
}

export interface FeatureItem {
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface ExtraButton {
  label: string;
  url: string;
  tipo: string;
}

export interface Seo {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface Hero {
  imagen_url?: string;
  eyebrow?: string;
  titulo?: string;
  subtitulo?: string;
  cta_texto?: string;
  cta_url?: string;
}

export interface CtaFinal {
  imagen_url?: string;
  titulo?: string;
  subtitulo?: string;
  cta_texto?: string;
}

export interface Features {
  titulo?: string;
  subtitulo?: string;
  items?: FeatureItem[];
}

export interface Landing {
  template?: string;
  activo?: boolean;
  titulo?: string;
  descripcion?: string;
  imagen_og?: string;
  whatsapp?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  horarios?: string;
  redes_sociales?: Record<string, string>;
  color_primario?: string;
  color_secundario?: string;
  color_fondo?: string;
  color_texto?: string;
  mostrar_precios?: boolean;
  permitir_pdf?: boolean;
  footer_texto?: string;
  footer_links?: FooterLink[];
  botones_extra?: ExtraButton[];
  seo?: Seo;
  hero?: Hero;
  cta_final?: CtaFinal;
  features?: Features;
}

export interface Paquete {
  id: string;
  titulo: string;
  descripcion?: string;
  destino: string;
  duracion?: number;
  precio_base?: number;
  precio_doble?: number;
  imagen_url?: string;
}

export interface TemplateProps {
  tenant: Tenant;
  landing: Landing;
  paquetes: Paquete[];
  slug: string;
}
