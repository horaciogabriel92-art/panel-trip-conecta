"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { 
  ArrowLeft, 
  User, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  BedDouble,
  ArrowRight,
  Plus,
  X,
  FileText,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import BuscarCliente from '@/components/cotizaciones/BuscarCliente';
import CrearClienteModal from '@/components/cotizaciones/CrearClienteModal';
import { Cliente } from '@/lib/api-clientes';

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
  precio_doble: number;
  precio_triple: number;
  precio_cuadruple: number;
  cupos_disponibles: number;
  imagen_url?: string;
  imagen_principal?: string;
  fecha_salida?: string;
  fecha_inicio?: string;
  duracion_dias?: number;
  hoteles?: Hotel[];
}

interface Pasajero {
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  telefono: string;
  email: string;
}

export default function CotizarPaquete() {
  const params = useParams();
  const router = useRouter();
  const [paquete, setPaquete] = useState<Paquete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cliente CRM
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showCrearCliente, setShowCrearCliente] = useState(false);

  // Configuración de la cotización
  const [config, setConfig] = useState({
    num_pasajeros: 2,
    tipo_habitacion: 'doble' as 'doble' | 'triple' | 'cuadruple',
    fecha_salida: ''
  });

  // Hotel seleccionado
  const [hotelSeleccionado, setHotelSeleccionado] = useState<Hotel | null>(null);

  // Pasajeros adicionales (si hay más de 1)
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);

  useEffect(() => {
    const fetchPaquete = async () => {
      try {
        const res = await api.get(`/paquetes/${params.id}`);
        const paqueteData = res.data;
        setPaquete(paqueteData);
        
        // Seleccionar primer hotel automáticamente si existe
        if (paqueteData.hoteles && paqueteData.hoteles.length > 0) {
          setHotelSeleccionado(paqueteData.hoteles[0]);
        }
        
        // Tomar fecha de salida del paquete automáticamente
        const fechaPaquete = paqueteData.fecha_salida || paqueteData.fecha_inicio;
        if (fechaPaquete) {
          // Formatear fecha a YYYY-MM-DD si viene en otro formato
          const fechaFormateada = new Date(fechaPaquete).toISOString().split('T')[0];
          setConfig(prev => ({ ...prev, fecha_salida: fechaFormateada }));
        }
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

  // Actualizar pasajeros cuando cambia el número
  useEffect(() => {
    const numAdicionales = Math.max(0, config.num_pasajeros - 1);
    setPasajeros(prev => {
      const nuevos = [...prev];
      while (nuevos.length < numAdicionales) {
        nuevos.push({
          nombre: '',
          apellido: '',
          documento: '',
          fecha_nacimiento: '',
          nacionalidad: 'Uruguay',
          telefono: '',
          email: ''
        });
      }
      return nuevos.slice(0, numAdicionales);
    });
  }, [config.num_pasajeros]);

  const calcularPrecio = () => {
    if (!paquete) return 0;
    
    // Si hay hotel seleccionado, usar precios del hotel
    if (hotelSeleccionado) {
      const precioPorPersona = hotelSeleccionado.precios[config.tipo_habitacion] || 0;
      return precioPorPersona * config.num_pasajeros;
    }
    
    // Fallback a precios del paquete (legacy)
    const precioPorPersona = 
      config.tipo_habitacion === 'doble' ? paquete.precio_doble :
      config.tipo_habitacion === 'triple' ? paquete.precio_triple :
      paquete.precio_cuadruple;
    return precioPorPersona * config.num_pasajeros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteSeleccionado) {
      alert('Debes seleccionar un cliente');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Formato CRM nuevo
      const cotizacionData = {
        cliente_id: clienteSeleccionado.id,
        pasajeros_ids: [], // Se asignará el titular automáticamente
        pasajeros_nuevos: pasajeros.map(p => ({
          nombre: p.nombre,
          apellido: p.apellido,
          documento: p.documento,
          fecha_nacimiento: p.fecha_nacimiento,
          nacionalidad: p.nacionalidad,
        })),
        pasajero_titular_id: null,
        paquete_id: params.id,
        hotel_seleccionado_id: hotelSeleccionado?.id,
        tipo_habitacion: config.tipo_habitacion,
        nombre_cotizacion: `Viaje a ${paquete?.destino || 'Destino'} - ${paquete?.titulo || 'Paquete'}`,
        tipo_cotizacion: 'paquete',
        precios: {
          moneda: 'USD',
          subtotal: calcularPrecio(),
          impuestos: 0,
          total: calcularPrecio(),
        },
        num_pasajeros: config.num_pasajeros,
        fecha_salida: config.fecha_salida,
        // No enviamos itinerario/incluye/no_incluye - el backend los extrae del paquete
      };

      const res = await api.post('/cotizaciones/manual', cotizacionData);
      
      alert('Cotización creada exitosamente');
      router.push('/cotizaciones');
    } catch (err: any) {
      console.error('Error creando cotización:', err);
      alert(err.response?.data?.error || 'Error al crear cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!paquete) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Paquete no encontrado</h2>
        <Link href="/paquetes" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const imagen = paquete.imagen_url || paquete.imagen_principal || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/paquetes/${params.id}`} 
          className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)]">Nueva Cotización</h2>
          <p className="text-[var(--muted-foreground)] text-sm">{paquete.nombre || paquete.titulo}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Datos del cliente */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumen del paquete */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <img 
              src={imagen} 
              alt={paquete.nombre} 
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-[var(--foreground)]">{paquete.nombre || paquete.titulo}</h3>
              <p className="text-[var(--muted-foreground)] text-sm">{paquete.destino}</p>
            </div>
          </div>

          {/* Configuración de la cotización */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Configuración del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
                  Pasajeros
                </label>
                <select
                  value={config.num_pasajeros}
                  onChange={(e) => setConfig({...config, num_pasajeros: parseInt(e.target.value)})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} pasajero{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
                  Tipo de Habitación
                </label>
                <select
                  value={config.tipo_habitacion}
                  onChange={(e) => setConfig({...config, tipo_habitacion: e.target.value as any})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                >
                  <option value="doble">Doble</option>
                  <option value="triple">Triple</option>
                  <option value="cuadruple">Cuádruple</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
                  Fecha de Salida
                </label>
                <input
                  type="date"
                  value={config.fecha_salida}
                  onChange={(e) => setConfig({...config, fecha_salida: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Selección de Hotel */}
          {paquete.hoteles && paquete.hoteles.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400" />
                Selección de Hotel
              </h3>
              
              {/* Selector de Hotel */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
                  Hotel
                </label>
                <select
                  value={hotelSeleccionado?.id || ''}
                  onChange={(e) => {
                    const hotel = paquete.hoteles?.find(h => h.id === e.target.value);
                    setHotelSeleccionado(hotel || null);
                  }}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                >
                  {paquete.hoteles.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.nombre} {hotel.ciudad ? `(${hotel.ciudad})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detalles del hotel seleccionado */}
              {hotelSeleccionado && (
                <div className="bg-[var(--muted)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--foreground)]">{hotelSeleccionado.nombre}</span>
                    {hotelSeleccionado.link && (
                      <a 
                        href={hotelSeleccionado.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Ver hotel →
                      </a>
                    )}
                  </div>
                  
                  {hotelSeleccionado.ciudad && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      📍 {hotelSeleccionado.ciudad}
                    </p>
                  )}
                  
                  {/* Precios por tipo de habitación */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border)]">
                    <div className="text-center p-2 bg-[var(--background)] rounded-lg">
                      <p className="text-xs text-[var(--muted-foreground)]">Doble</p>
                      <p className="font-bold text-[var(--foreground)]">${formatCurrency(hotelSeleccionado.precios.doble)}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">por persona</p>
                    </div>
                    {hotelSeleccionado.precios.triple > 0 && (
                      <div className="text-center p-2 bg-[var(--background)] rounded-lg">
                        <p className="text-xs text-[var(--muted-foreground)]">Triple</p>
                        <p className="font-bold text-[var(--foreground)]">${formatCurrency(hotelSeleccionado.precios.triple)}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">por persona</p>
                      </div>
                    )}
                    {hotelSeleccionado.precios.cuadruple > 0 && (
                      <div className="text-center p-2 bg-[var(--background)] rounded-lg">
                        <p className="text-xs text-[var(--muted-foreground)]">Cuádruple</p>
                        <p className="font-bold text-[var(--foreground)]">${formatCurrency(hotelSeleccionado.precios.cuadruple)}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">por persona</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cliente CRM - Buscar o Crear */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Cliente (Titular)
            </h3>
            <BuscarCliente
              onSelect={setClienteSeleccionado}
              onNuevoCliente={() => setShowCrearCliente(true)}
              selectedClienteId={clienteSeleccionado?.id}
            />
          </div>

          {/* Pasajeros adicionales */}
          {pasajeros.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Pasajeros Adicionales
              </h3>
              <div className="space-y-4">
                {pasajeros.map((pasajero, index) => (
                  <div key={index} className="p-4 bg-[var(--muted)] rounded-xl">
                    <h4 className="font-medium text-[var(--foreground)] mb-3">Pasajero {index + 2}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Nombre</label>
                        <input
                          type="text"
                          value={pasajero.nombre}
                          onChange={(e) => {
                            const nuevos = [...pasajeros];
                            nuevos[index].nombre = e.target.value;
                            setPasajeros(nuevos);
                          }}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Apellido</label>
                        <input
                          type="text"
                          value={pasajero.apellido}
                          onChange={(e) => {
                            const nuevos = [...pasajeros];
                            nuevos[index].apellido = e.target.value;
                            setPasajeros(nuevos);
                          }}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Documento</label>
                        <input
                          type="text"
                          value={pasajero.documento}
                          onChange={(e) => {
                            const nuevos = [...pasajeros];
                            nuevos[index].documento = e.target.value;
                            setPasajeros(nuevos);
                          }}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={pasajero.fecha_nacimiento}
                          onChange={(e) => {
                            const nuevos = [...pasajeros];
                            nuevos[index].fecha_nacimiento = e.target.value;
                            setPasajeros(nuevos);
                          }}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Nacionalidad</label>
                        <select
                          value={pasajero.nacionalidad}
                          onChange={(e) => {
                            const nuevos = [...pasajeros];
                            nuevos[index].nacionalidad = e.target.value;
                            setPasajeros(nuevos);
                          }}
                          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                        >
                          <option value="Uruguay">Uruguay</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Brasil">Brasil</option>
                          <option value="Chile">Chile</option>
                          <option value="Paraguay">Paraguay</option>
                          <option value="España">España</option>
                          <option value="Estados Unidos">Estados Unidos</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Columna derecha - Resumen */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Resumen</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Paquete</span>
                <span className="text-[var(--foreground)]">{paquete.destino}</span>
              </div>
              {hotelSeleccionado && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Hotel</span>
                  <span className="text-[var(--foreground)] text-right">{hotelSeleccionado.nombre}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Pasajeros</span>
                <span className="text-[var(--foreground)]">{config.num_pasajeros}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Habitación</span>
                <span className="text-[var(--foreground)] capitalize">{config.tipo_habitacion}</span>
              </div>
              <div className="h-px bg-[var(--muted)] my-3" />
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Precio por persona</span>
                <span className="text-[var(--foreground)]">
                  ${hotelSeleccionado 
                    ? hotelSeleccionado.precios[config.tipo_habitacion] 
                    : (config.tipo_habitacion === 'doble' ? paquete.precio_doble :
                       config.tipo_habitacion === 'triple' ? paquete.precio_triple :
                       paquete.precio_cuadruple)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-[var(--foreground)]">Total</span>
                <span className="text-2xl font-black text-blue-400">${calcularPrecio()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-[var(--foreground)] font-black rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Crear Cotización
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-xs text-[var(--muted-foreground)] text-center mt-4">
              La cotización tendrá una validez de 7 días
            </p>
          </div>
        </div>
      </form>

      {/* Modal Crear Cliente */}
      <CrearClienteModal
        isOpen={showCrearCliente}
        onClose={() => setShowCrearCliente(false)}
        onClienteCreado={(cliente) => {
          setClienteSeleccionado(cliente);
        }}
      />
    </div>
  );
}
