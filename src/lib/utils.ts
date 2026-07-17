import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safe number formatter that handles undefined/null
export function formatCurrency(value: number | string | undefined | null, decimals = 0): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('es-AR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return value.toLocaleString('es-AR');
}

// Monedas soportadas
export const MONEDAS: { codigo: string; nombre: string; simbolo: string; locale: string }[] = [
  { codigo: 'USD', nombre: 'USD (Dólares)', simbolo: '$', locale: 'en-US' },
  { codigo: 'UYU', nombre: '$ (Pesos Uruguayos)', simbolo: '$U', locale: 'es-UY' },
  { codigo: 'ARS', nombre: 'ARS (Pesos Argentinos)', simbolo: '$', locale: 'es-AR' },
  { codigo: 'BRL', nombre: 'BRL (Reales Brasileños)', simbolo: 'R$', locale: 'pt-BR' },
  { codigo: 'CLP', nombre: 'CLP (Pesos Chilenos)', simbolo: '$', locale: 'es-CL' },
  { codigo: 'COP', nombre: 'COP (Pesos Colombianos)', simbolo: '$', locale: 'es-CO' },
  { codigo: 'PEN', nombre: 'PEN (Soles Peruanos)', simbolo: 'S/', locale: 'es-PE' },
  { codigo: 'MXN', nombre: 'MXN (Pesos Mexicanos)', simbolo: '$', locale: 'es-MX' },
  { codigo: 'EUR', nombre: 'EUR (Euros)', simbolo: '€', locale: 'es-ES' },
];

export function getSimboloMoneda(codigo?: string): string {
  return MONEDAS.find((m) => m.codigo === codigo)?.simbolo || '$';
}

export function getNombreMoneda(codigo?: string): string {
  return MONEDAS.find((m) => m.codigo === codigo)?.nombre || codigo || 'USD';
}

// Helper para inputs de precio: convierte string vacío a undefined y
// rechaza valores no numéricos (NaN). Devuelve un número válido o undefined.
export function parsePrecioInput(value: string): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const normalized = value.trim().replace(',', '.');
  const num = Number(normalized);
  if (!Number.isFinite(num)) return undefined;
  return num;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
