'use client';

import { useState } from 'react';
import { Plane } from 'lucide-react';

interface AirlineLogoProps {
  iataCode?: string;
  size?: number;
  className?: string;
}

export function AirlineLogo({ iataCode, size = 24, className = '' }: AirlineLogoProps) {
  const [error, setError] = useState(false);

  const code = (iataCode || '').trim().toUpperCase();
  const src = code ? `https://images.kiwi.com/airlines/64/${code}.png` : '';

  if (!code || error) {
    return (
      <div
        className={`rounded-full bg-[var(--muted)] flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title={code || 'Aerolínea desconocida'}
      >
        <Plane className="text-[var(--muted-foreground)]" style={{ width: size * 0.55, height: size * 0.55 }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${code} logo`}
      className={`object-contain rounded-sm ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
      title={code}
    />
  );
}

export default AirlineLogo;
