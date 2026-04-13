"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Package, 
  Plane, 
  ChevronRight,
  Sparkles,
  User
} from 'lucide-react';

interface AdminNuevaCotizacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNuevaCotizacionModal({ isOpen, onClose }: AdminNuevaCotizacionModalProps) {
  const router = useRouter();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCatalogo = () => {
    router.push('/paquetes');
    onClose();
  };

  const handleSelectDesdeCero = () => {
    router.push('/admin/cotizacion/nueva');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Nueva Cotización</h2>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">
              Elige cómo quieres crear la cotización como administrador
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Desde Catálogo */}
          <button
            onClick={handleSelectCatalogo}
            onMouseEnter={() => setHoveredOption('catalogo')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`
              relative group p-6 rounded-2xl border-2 text-left transition-all duration-300
              ${hoveredOption === 'catalogo' 
                ? 'bg-blue-500/10 border-blue-500/50 scale-[1.02]' 
                : 'bg-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-4 rounded-xl transition-colors
                ${hoveredOption === 'catalogo' ? 'bg-blue-500/20' : 'bg-[var(--background)]'}
              `}>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                  Desde Catálogo
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                  Selecciona un paquete turístico pre-armado y asigna un vendedor
                </p>
              </div>
              <ChevronRight className={`
                w-6 h-6 transition-all
                ${hoveredOption === 'catalogo' 
                  ? 'text-blue-500 translate-x-1' 
                  : 'text-[var(--muted-foreground)]'
                }
              `} />
            </div>
            
            {/* Badge recomendado */}
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-full">
                Rápido
              </span>
            </div>
          </button>

          {/* Option 2: Desde Cero */}
          <button
            onClick={handleSelectDesdeCero}
            onMouseEnter={() => setHoveredOption('cero')}
            onMouseLeave={() => setHoveredOption(null)}
            className={`
              relative group p-6 rounded-2xl border-2 text-left transition-all duration-300
              ${hoveredOption === 'cero' 
                ? 'bg-teal-500/10 border-teal-500/50 scale-[1.02]' 
                : 'bg-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-4 rounded-xl transition-colors
                ${hoveredOption === 'cero' ? 'bg-teal-500/20' : 'bg-[var(--background)]'}
              `}>
                <Plane className="w-8 h-8 text-teal-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                  Desde Cero
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                  Crea cotización personalizada con vuelos, hoteles y asigna vendedor
                </p>
              </div>
              <ChevronRight className={`
                w-6 h-6 transition-all
                ${hoveredOption === 'cero' 
                  ? 'text-teal-500 translate-x-1' 
                  : 'text-[var(--muted-foreground)]'
                }
              `} />
            </div>
            
            {/* Badge admin */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <User className="w-3 h-3 text-teal-500" />
              <span className="px-2 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-300 text-xs font-bold rounded-full">
                Admin
              </span>
            </div>
          </button>
        </div>

        {/* Features comparison */}
        <div className="px-6 pb-6">
          <div className="bg-[var(--muted)] rounded-xl p-4">
            <p className="text-[var(--foreground)] text-sm mb-3 font-medium">
              ¿Cuál elegir?
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <p className="text-blue-500 font-bold flex items-center gap-2">
                  <Package className="w-3 h-3" />
                  Desde Catálogo
                </p>
                <ul className="text-[var(--muted-foreground)] space-y-1 ml-5">
                  <li>• Paquetes pre-configurados</li>
                  <li>• Precios ya definidos</li>
                  <li>• Asigna cualquier vendedor</li>
                  <li>• Ideal para ventas rápidas</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-teal-500 font-bold flex items-center gap-2">
                  <Plane className="w-3 h-3" />
                  Desde Cero
                </p>
                <ul className="text-[var(--muted-foreground)] space-y-1 ml-5">
                  <li>• Vuelos personalizados (Amadeus)</li>
                  <li>• Hoteles a elección</li>
                  <li>• Asigna vendedor específico</li>
                  <li>• Cotizaciones complejas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--muted)] border-t border-[var(--border)] flex justify-between items-center">
          <p className="text-[var(--muted-foreground)] text-xs">
            Como administrador puedes asignar cualquier vendedor
          </p>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminNuevaCotizacionModal;
