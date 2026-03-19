'use client';

import { useState, useEffect } from 'react';
import { pdfAPI } from '@/lib/api';
import { FileText, Download, RefreshCw, Loader2, Clock, Users } from 'lucide-react';

interface PDFButtonProps {
  cotizacionId: string;
  cotizacionCodigo: string;
  className?: string;
}

interface QueueStatus {
  queueLength: number;
  activeJobs: number;
  poolSize: number;
  availableBrowsers: number;
  maxConcurrent: number;
}

export function PDFButton({ cotizacionId, cotizacionCodigo, className = '' }: PDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [showQueueInfo, setShowQueueInfo] = useState(false);

  // Verificar estado de la cola periódicamente cuando está cargando
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(async () => {
      try {
        const status = await pdfAPI.getQueueStatus();
        setQueueStatus(status.data);
      } catch (e) {
        // Ignorar errores de polling
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerarPDF = async () => {
    setLoading(true);
    setError(null);
    setShowQueueInfo(true);

    try {
      // 1. Generar el PDF en el servidor (ahora va a la cola)
      const response = await pdfAPI.generar(cotizacionId);
      
      if (response.success) {
        // 2. Descargar el archivo
        await handleDescargarPDF();
      }
    } catch (err: any) {
      console.error('Error generando PDF:', err);
      setError(err.response?.data?.error || 'Error al generar el PDF');
    } finally {
      setLoading(false);
      setTimeout(() => setShowQueueInfo(false), 3000);
    }
  };

  const handleDescargarPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      const blob = await pdfAPI.descargar(cotizacionId);
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `COT-${cotizacionCodigo}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error descargando PDF:', err);
      setError(err.response?.data?.error || 'Error al descargar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerarPDF = async () => {
    setLoading(true);
    setError(null);
    setShowQueueInfo(true);

    try {
      await pdfAPI.regenerar(cotizacionId);
      await handleDescargarPDF();
    } catch (err: any) {
      console.error('Error regenerando PDF:', err);
      setError(err.response?.data?.error || 'Error al regenerar el PDF');
    } finally {
      setLoading(false);
      setTimeout(() => setShowQueueInfo(false), 3000);
    }
  };

  // Calcular tiempo estimado de espera
  const getEstimatedWait = () => {
    if (!queueStatus) return null;
    const position = queueStatus.queueLength;
    if (position === 0) return 'Procesando...';
    
    // Estimado: ~5 segundos por PDF en promedio
    const seconds = position * 5;
    if (seconds < 60) return `~${seconds} seg`;
    return `~${Math.ceil(seconds / 60)} min`;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleGenerarPDF}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Descargar PDF existente"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleRegenerarPDF}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Regenerar PDF"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Animación de carga con info de cola */}
      {loading && showQueueInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-pulse">
          <div className="flex items-center gap-2 text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">
              {queueStatus && queueStatus.queueLength > 0 
                ? 'En cola de espera...' 
                : 'Generando PDF...'}
            </span>
          </div>
          
          {queueStatus && (
            <div className="mt-2 text-sm text-blue-600 space-y-1">
              {queueStatus.queueLength > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posición en cola: {queueStatus.queueLength}</span>
                  <span className="text-blue-500">({getEstimatedWait()})</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>PDFs activos: {queueStatus.activeJobs}/{queueStatus.maxConcurrent}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
