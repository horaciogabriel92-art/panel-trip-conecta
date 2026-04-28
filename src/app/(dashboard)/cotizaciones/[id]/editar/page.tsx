'use client';

import { useParams } from 'next/navigation';
import CotizacionManualEditor from '@/components/cotizaciones/CotizacionManualEditor';

export default function EditarCotizacionPage() {
  const params = useParams();
  const id = params.id as string;

  return <CotizacionManualEditor cotizacionId={id} isAdmin={false} />;
}
