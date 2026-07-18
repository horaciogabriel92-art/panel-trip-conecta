"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Check, Package, FileText, Download, Palette, Trash2, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface Paso {
  id: string;
  titulo: string;
  descripcion: string;
  icon: any;
  done: boolean;
  href?: string;
  hrefLabel?: string;
  onClick?: () => void;
  actionLabel?: string;
}

export default function OnboardingChecklist() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const [exploroPaquetes, setExploroPaquetes] = useState(false);
  const [creoCotizacion, setCreoCotizacion] = useState(false);
  const [descargoPdf, setDescargoPdf] = useState(false);
  const [marcaConfigurada, setMarcaConfigurada] = useState(false);

  const dismissedKey = `onboarding_dismissed_${user?.id}`;
  const exploradoKey = `onboarding_paquetes_${user?.id}`;
  const pdfKey = `onboarding_pdf_${user?.id}`;

  useEffect(() => {
    if (!user?.id) return;
    if (localStorage.getItem(dismissedKey)) return;

    const verificar = async () => {
      try {
        const [cotRes, tenantRes] = await Promise.all([
          api.get('/cotizaciones'),
          api.get('/config/tenant/me')
        ]);

        const cotizaciones = cotRes.data || [];
        const tieneDemo = cotizaciones.some((c: any) => c.codigo?.startsWith('DEMO-'));
        const tieneReal = cotizaciones.some((c: any) => !c.codigo?.startsWith('DEMO-'));

        // Solo se muestra si el tenant tiene datos de ejemplo (tenant nuevo)
        if (!tieneDemo) {
          setIsLoading(false);
          return;
        }

        setCreoCotizacion(tieneReal);
        setExploroPaquetes(!!localStorage.getItem(exploradoKey));
        setDescargoPdf(!!localStorage.getItem(pdfKey));

        const pdfBrand = tenantRes.data?.configuracion?.pdf_brand;
        setMarcaConfigurada(!!(pdfBrand && (pdfBrand.logo_url || pdfBrand.nombre_marca)));

        setVisible(true);
      } catch (err) {
        console.error('[Onboarding] Error verificando estado:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const dismiss = () => {
    localStorage.setItem(dismissedKey, '1');
    setVisible(false);
  };

  const marcarExplorado = () => {
    localStorage.setItem(exploradoKey, '1');
    setExploroPaquetes(true);
  };

  const eliminarDatosDemo = async () => {
    if (!confirmandoBorrado) {
      setConfirmandoBorrado(true);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await api.delete('/config/demo-data');
      const e = res.data?.eliminados || {};
      toastSuccess(
        `Se eliminaron ${e.cotizaciones || 0} cotizaciones, ${e.clientes || 0} clientes y ${e.paquetes || 0} paquetes de ejemplo`,
        'Datos de ejemplo eliminados'
      );
      setVisible(false);
      localStorage.setItem(dismissedKey, '1');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al eliminar los datos de ejemplo', 'Error');
      setConfirmandoBorrado(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !visible) return null;

  const pasos: Paso[] = [
    {
      id: 'paquetes',
      titulo: 'Explorá los paquetes de ejemplo',
      descripcion: 'Mirá cómo están armados: precios, hoteles, cupos e itinerarios.',
      icon: Package,
      done: exploroPaquetes,
      href: '/paquetes',
      hrefLabel: 'Ver paquetes',
      onClick: marcarExplorado
    },
    {
      id: 'cotizacion',
      titulo: 'Creá tu primera cotización',
      descripcion: 'Desde un paquete o desde cero. Es lo que le enviás a tus clientes.',
      icon: FileText,
      done: creoCotizacion,
      href: '/cotizacion/nueva',
      hrefLabel: 'Crear cotización'
    },
    {
      id: 'pdf',
      titulo: 'Descargá un PDF',
      descripcion: 'Abrí una cotización y descargá el PDF profesional para el cliente.',
      icon: Download,
      done: descargoPdf,
      href: '/cotizaciones',
      hrefLabel: 'Ir a cotizaciones'
    },
    {
      id: 'marca',
      titulo: 'Personalizá tu marca',
      descripcion: 'Logo, nombre y datos de tu agencia en los PDFs que enviás.',
      icon: Palette,
      done: marcaConfigurada,
      href: '/configuracion',
      hrefLabel: 'Personalizar'
    },
    {
      id: 'limpiar',
      titulo: 'Eliminá los datos de ejemplo',
      descripcion: 'Cuando ya te sientas cómodo, borrá todo lo de prueba y empezá en serio.',
      icon: Trash2,
      done: false,
      actionLabel: confirmandoBorrado ? '¿Seguro? Confirmar borrado' : 'Eliminar datos de ejemplo',
      onClick: eliminarDatosDemo
    }
  ];

  const completados = pasos.filter(p => p.done).length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-blue-500/30 bg-blue-500/5 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--foreground)]">Primeros pasos</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              {completados} de {pasos.length} completados — los datos marcados como "Ejemplo" son de prueba
            </p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg transition-colors"
          title="No mostrar más"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-[var(--muted)] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(completados / pasos.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {pasos.map((paso) => {
          const Icon = paso.icon;
          return (
            <div
              key={paso.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                paso.done
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                paso.done ? 'bg-green-500/20' : 'bg-[var(--muted)]'
              }`}>
                {paso.done ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${paso.done ? 'text-green-400 line-through' : 'text-[var(--foreground)]'}`}>
                  {paso.titulo}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{paso.descripcion}</p>
              </div>
              {!paso.done && paso.href && (
                <Link
                  href={paso.href}
                  onClick={paso.onClick}
                  className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {paso.hrefLabel}
                </Link>
              )}
              {!paso.done && !paso.href && paso.onClick && (
                <button
                  onClick={paso.onClick}
                  disabled={isDeleting}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    confirmandoBorrado
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[var(--muted)] hover:bg-red-500/20 text-[var(--muted-foreground)] hover:text-red-400'
                  }`}
                >
                  {isDeleting ? 'Eliminando...' : paso.actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
