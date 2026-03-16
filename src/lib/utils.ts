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
