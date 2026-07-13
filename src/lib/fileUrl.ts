const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : '';

/**
 * Convierte una URL de comprobante en URL pública absoluta.
 * Si ya es absoluta, la devuelve tal cual.
 * Si es relativa a /uploads/, le antepone el dominio de la API.
 */
export function getComprobantePublicUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}
