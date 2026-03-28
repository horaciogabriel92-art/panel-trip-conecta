"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  ImageIcon,
  FileText,
  Download,
  ArrowRight,
  Package,
  Plane
} from 'lucide-react';
import Link from 'next/link';

interface Hotel {
  id: string;
  nombre: string;
  link?: string;
  ciudad?: string;
  precios: {
    doble: number;
    triple: number;
    cuadruple: number;
  };
}

interface Paquete {
  id: string;
  nombre: string;
  titulo: string;
  destino: string;
  tipo: string;
  descripcion: string;
  precio_doble: number;
  precio_triple: number;
  precio_cuadruple: number;
  duracion: number;
  duracion_dias: number;
  cupos_disponibles: number;
  cupos_totales: number;
  fecha_salida?: string;
  imagen_url?: string;
  imagen_principal?: string;
  incluye: string[];
  no_incluye: string[];
  itinerario?: { texto?: string; dias?: any[] } | any[];
  galeria?: any[];
  recursos_vendedores?: any[];
  vuelos?: any[];
  hoteles?: Hotel[];
  status: string;
  estado: string;
}

export default function PaqueteDetalle() {
  const params = useParams();
  const router = useRouter();
  const [paquete, setPaquete] = useState<Paquete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerario' | 'recursos'>('itinerario');

  useEffect(() => {
    const fetchPaquete = async () => {
      try {
        const res = await api.get(`/paquetes/${params.id}`);
        setPaquete(res.data);
      } catch (err) {
        console.error('Error cargando paquete:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchPaquete();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!paquete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Paquete no encontrado</h2>
          <p className="text-[var(--muted-foreground)] mb-6">El paquete que buscas no existe o ha sido eliminado.</p>
          <Link href="/paquetes" className="text-blue-400 hover:text-blue-300">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const imagen = paquete.imagen_url || paquete.imagen_principal || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800';
  const dias = paquete.duracion || paquete.duracion_dias || 7;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <Link 
          href="/paquetes" 
          className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)]">{paquete.nombre || paquete.titulo}</h2>
          <p className="text-[var(--muted-foreground)] text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {paquete.destino}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Imagen y precios */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagen principal */}
          <div className="relative h-80 rounded-3xl overflow-hidden">
            <img 
              src={imagen} 
              alt={paquete.nombre} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-blue-600 rounded-full text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                {paquete.tipo}
              </span>
            </div>
            <div className="absolute bottom-4 left-6">
              <div className="flex items-center gap-4 text-[var(--foreground)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{dias} días / {dias - 1} noches</span>
                </div>
                {paquete.fecha_salida && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Salida: {new Date(paquete.fecha_salida).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs de contenido - Solo 2 pestañas: Itinerario y Recursos */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex border-b border-[var(--border)]">
              {['itinerario', 'recursos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab 
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' 
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {tab === 'itinerario' && 'Itinerario'}
                  {tab === 'recursos' && 'Recursos'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'itinerario' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Itinerario</h3>
                    <div className="text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                      {(() => {
                        // Extraer texto de itinerario (puede ser string o objeto)
                        if (typeof paquete.itinerario === 'string' && paquete.itinerario) {
                          return paquete.itinerario;
                        }
                        if (paquete.itinerario && typeof paquete.itinerario === 'object' && !Array.isArray(paquete.itinerario)) {
                          return (paquete.itinerario as { texto?: string }).texto || '';
                        }
                        // Fallback a descripcion (legacy)
                        return paquete.descripcion || "Sin itinerario disponible.";
                      })()}
                    </div>
                  </div>

                  {paquete.incluye && paquete.incluye.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Incluye
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {paquete.incluye.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-[var(--foreground)] text-sm">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {paquete.no_incluye && paquete.no_incluye.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        No Incluye
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {paquete.no_incluye.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-[var(--foreground)] text-sm">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vuelos */}
                  {paquete.vuelos && paquete.vuelos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-blue-400" />
                        Vuelos
                      </h3>
                      <div className="space-y-3">
                        {paquete.vuelos.map((vuelo: any, i: number) => (
                          <div key={i} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase">
                                {vuelo.tipo === 'ida' ? 'Vuelo de Ida' : 'Vuelo de Vuelta'}
                              </span>
                              {vuelo.numero_vuelo && (
                                <span className="text-sm text-[var(--muted-foreground)]">{vuelo.numero_vuelo}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-[var(--muted-foreground)] text-xs">Origen</p>
                                <p className="text-[var(--foreground)] font-medium">{vuelo.origen_nombre || vuelo.origen_codigo || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[var(--muted-foreground)] text-xs">Destino</p>
                                <p className="text-[var(--foreground)] font-medium">{vuelo.destino_nombre || vuelo.destino_codigo || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[var(--muted-foreground)] text-xs">Fecha</p>
                                <p className="text-[var(--foreground)]">{vuelo.fecha_salida || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[var(--muted-foreground)] text-xs">Horario</p>
                                <p className="text-[var(--foreground)]">{vuelo.hora_salida || '--:--'} - {vuelo.hora_llegada || '--:--'}</p>
                              </div>
                              {vuelo.aerolinea_nombre && (
                                <div>
                                  <p className="text-[var(--muted-foreground)] text-xs">Aerolínea</p>
                                  <p className="text-[var(--foreground)]">{vuelo.aerolinea_nombre}</p>
                                </div>
                              )}
                              {vuelo.clase && (
                                <div>
                                  <p className="text-[var(--muted-foreground)] text-xs">Clase</p>
                                  <p className="text-[var(--foreground)]">{vuelo.clase}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hoteles */}
                  {paquete.hoteles && paquete.hoteles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                        🏨 Hoteles
                      </h3>
                      <div className="space-y-3">
                        {paquete.hoteles.map((hotel: Hotel, i: number) => (
                          <div key={hotel.id} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-[var(--foreground)]">{hotel.nombre}</h4>
                              {hotel.link && (
                                <a 
                                  href={hotel.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                  Ver hotel →
                                </a>
                              )}
                            </div>
                            
                            {hotel.ciudad && (
                              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                                📍 {hotel.ciudad}
                              </p>
                            )}
                            
                            {/* Precios por habitación */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 bg-[var(--background)] rounded-lg">
                                <p className="text-xs text-[var(--muted-foreground)]">Doble</p>
                                <p className="font-bold text-[var(--foreground)]">${hotel.precios.doble}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">por persona</p>
                              </div>
                              {hotel.precios.triple > 0 && (
                                <div className="text-center p-2 bg-[var(--background)] rounded-lg">
                                  <p className="text-xs text-[var(--muted-foreground)]">Triple</p>
                                  <p className="font-bold text-[var(--foreground)]">${hotel.precios.triple}</p>
                                  <p className="text-xs text-[var(--muted-foreground)]">por persona</p>
                                </div>
                              )}
                              {hotel.precios.cuadruple > 0 && (
                                <div className="text-center p-2 bg-[var(--background)] rounded-lg">
                                  <p className="text-xs text-[var(--muted-foreground)]">Cuádruple</p>
                                  <p className="font-bold text-[var(--foreground)]">${hotel.precios.cuadruple}</p>
                                  <p className="text-xs text-[var(--muted-foreground)]">por persona</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recursos' && (
                <div className="space-y-4">
                  {paquete.recursos_vendedores && paquete.recursos_vendedores.length > 0 ? (
                    paquete.recursos_vendedores.map((recurso: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            {recurso.tipo === 'imagen' ? <ImageIcon className="w-5 h-5 text-blue-400" /> :
                             recurso.tipo === 'video' ? <FileText className="w-5 h-5 text-purple-400" /> :
                             <FileText className="w-5 h-5 text-green-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)]">{recurso.nombre}</p>
                            <p className="text-xs text-[var(--muted-foreground)] uppercase">{recurso.tipo}</p>
                          </div>
                        </div>
                        <a 
                          href={recurso.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-[var(--muted)] rounded-lg hover:bg-blue-600 transition-all"
                        >
                          <Download className="w-4 h-4 text-[var(--foreground)]" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--muted-foreground)] text-center py-8">No hay recursos disponibles.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Precios y acción */}
        <div className="space-y-6">
          {/* Precios */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Precios por Persona</h3>
            <div className="space-y-3">
              {paquete.precio_doble > 0 && (
                <div className="flex justify-between items-center p-3 bg-[var(--muted)] rounded-xl">
                  <span className="text-[var(--muted-foreground)]">Doble</span>
                  <span className="text-xl font-black text-[var(--foreground)]">${paquete.precio_doble}</span>
                </div>
              )}
              {paquete.precio_triple > 0 && (
                <div className="flex justify-between items-center p-3 bg-[var(--muted)] rounded-xl">
                  <span className="text-[var(--muted-foreground)]">Triple</span>
                  <span className="text-xl font-black text-[var(--foreground)]">${paquete.precio_triple}</span>
                </div>
              )}
              {paquete.precio_cuadruple > 0 && (
                <div className="flex justify-between items-center p-3 bg-[var(--muted)] rounded-xl">
                  <span className="text-[var(--muted-foreground)]">Cuádruple</span>
                  <span className="text-xl font-black text-[var(--foreground)]">${paquete.precio_cuadruple}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cupos */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-[var(--foreground)]">Cupos Disponibles</h3>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-[var(--foreground)] mb-2">{paquete.cupos_disponibles}</p>
              <p className="text-[var(--muted-foreground)] text-sm">de {paquete.cupos_totales} totales</p>
            </div>
          </div>

          {/* Botón Cotizar */}
          <Link 
            href={`/paquetes/${paquete.id}/cotizar`}
            className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-black rounded-2xl text-center transition-all flex items-center justify-center gap-2"
          >
            Cotizar Ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
