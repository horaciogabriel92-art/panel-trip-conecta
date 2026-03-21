"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Package, 
  Plane, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NuevaCotizacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NuevaCotizacionModal({ isOpen, onClose }: NuevaCotizacionModalProps) {
  const router = useRouter();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCatalogo = () => {
    router.push('/paquetes');
    onClose();
  };

  const handleSelectDesdeCero = () => {
    router.push('/cotizacion/nueva');
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white">Nueva Cotización</h2>
            <p className="text-slate-400 text-sm mt-1">
              Elige cómo quieres crear la cotización
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
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
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-4 rounded-xl transition-colors
                ${hoveredOption === 'catalogo' ? 'bg-blue-500/20' : 'bg-white/10'}
              `}>
                <Package className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  Desde Catálogo
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Selecciona un paquete turístico pre-armado de nuestro catálogo
                </p>
              </div>
              <ChevronRight className={`
                w-6 h-6 transition-all
                ${hoveredOption === 'catalogo' 
                  ? 'text-blue-400 translate-x-1' 
                  : 'text-slate-600'
                }
              `} />
            </div>
            
            {/* Badge recomendado */}
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full">
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
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-4 rounded-xl transition-colors
                ${hoveredOption === 'cero' ? 'bg-teal-500/20' : 'bg-white/10'}
              `}>
                <Plane className="w-8 h-8 text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  Desde Cero
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Crea una cotización personalizada con vuelos, hoteles y servicios
                </p>
              </div>
              <ChevronRight className={`
                w-6 h-6 transition-all
                ${hoveredOption === 'cero' 
                  ? 'text-teal-400 translate-x-1' 
                  : 'text-slate-600'
                }
              `} />
            </div>
            
            {/* Badge nuevo */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs font-bold rounded-full">
                Nuevo
              </span>
            </div>
          </button>
        </div>

        {/* Features comparison */}
        <div className="px-6 pb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-3 font-medium">
              ¿Cuál elegir?
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <p className="text-blue-400 font-bold flex items-center gap-2">
                  <Package className="w-3 h-3" />
                  Desde Catálogo
                </p>
                <ul className="text-slate-400 space-y-1 ml-5">
                  <li>• Paquetes pre-configurados</li>
                  <li>• Precios ya definidos</li>
                  <li>• Ideal para ventas rápidas</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-teal-400 font-bold flex items-center gap-2">
                  <Plane className="w-3 h-3" />
                  Desde Cero
                </p>
                <ul className="text-slate-400 space-y-1 ml-5">
                  <li>• Vuelos personalizados (Amadeus)</li>
                  <li>• Hoteles a elección</li>
                  <li>• Cotizaciones complejas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
          <p className="text-slate-500 text-xs">
            Puedes cambiar de opinión más tarde
          </p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NuevaCotizacionModal;
