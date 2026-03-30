"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function VentaRedirect() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToCotizacion = async () => {
      try {
        // Obtener la venta para conseguir el cotizacion_id
        const { data: venta } = await api.get(`/ventas/${params.id}`);
        
        if (venta?.cotizacion_id) {
          // Redirigir a la vista de cotización (vista consolidada)
          router.replace(`/admin/cotizaciones/${venta.cotizacion_id}`);
        } else {
          setError('No se encontró la cotización asociada a esta venta');
        }
      } catch (err: any) {
        console.error('Error redirigiendo:', err);
        setError(err.response?.data?.error || 'Error al cargar la venta');
      }
    };

    if (params.id) {
      redirectToCotizacion();
    }
  }, [params.id, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-[var(--muted-foreground)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--muted-foreground)]">Redirigiendo...</p>
      </div>
    </div>
  );
}
