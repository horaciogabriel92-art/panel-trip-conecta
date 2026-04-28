'use client';

import { useParams } from 'next/navigation';
import CotizacionManualEditor from '@/components/cotizaciones/CotizacionManualEditor';

export default function AdminEditarCotizacionPage() {
  const params = useParams();
  const id = params.id as string;

  return <CotizacionManualEditor cotizacionId={id} isAdmin={true} />;
}
