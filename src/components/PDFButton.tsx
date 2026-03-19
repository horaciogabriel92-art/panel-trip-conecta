'use client';

import { useState } from 'react';
import { pdfAPI } from '@/lib/api';
import { FileText, Download, RefreshCw, Loader2 } from 'lucide-react';

interface PDFButtonProps {
  cotizacionId: string;
  cotizacionCodigo: string;
  className?: string;
}

export function PDFButton({ cotizacionId, cotizacionCodigo, className = '' }: PDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerarPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      await pdfAPI.generar(cotizacionId);
      await handleDescargarPDF();
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      const blob = await pdfAPI.descargar(cotizacionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `COT-${cotizacionCodigo}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error al descargar');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerarPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      await pdfAPI.regenerar(cotizacionId);
      await handleDescargarPDF();
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error al regenerar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleGenerarPDF}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {loading ? 'Generando...' : 'Generar PDF'}
        </button>

        <button
          onClick={handleDescargarPDF}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          title="Descargar PDF"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </button>

        <button
          onClick={handleRegenerarPDF}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          title="Regenerar PDF"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
