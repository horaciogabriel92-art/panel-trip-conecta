"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Plane, 
  Hotel, 
  FileText, 
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { parseAmadeusPNR } from '@/lib/amadeus-parser';
import api from '@/lib/api';

// ============================================
// TIPOS
// ============================================
interface Vendedor {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  nacionalidad: string;
}

interface Hospedaje {
  id: number;
  nombre_hotel: string;
  link_hotel?: string;
  ciudad: string;
  fecha_checkin: string;
  fecha_checkout: string;
  tipo_habitacion: 'simple' | 'doble' | 'triple' | 'cuadruple' | 'suite';
  regimen: 'solo_alojamiento' | 'desayuno' | 'media_pension' | 'todo_incluido';
  noches: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AdminNuevaCotizacion() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<string>('');

  // Datos del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    nacionalidad: 'Uruguay',
  });

  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  
  // Vuelos
  const [amadeusText, setAmadeusText] = useState('');
  const [parsedFlights, setParsedFlights] = useState<any[]>([]);
  const [parseError, setParseError] = useState('');
  const [useAmadeus, setUseAmadeus] = useState(true);

  // Hospedaje
  const [hospedajes, setHospedajes] = useState<Hospedaje[]>([]);

  // Datos de la cotización
  const [nombreCotizacion, setNombreCotizacion] = useState('');
  
  // Itinerario y condiciones
  const [itinerario, setItinerario] = useState('');
  const [incluye, setIncluye] = useState<string[]>(['Traslados aeropuerto-hotel-aeropuerto']);
  const [noIncluye, setNoIncluye] = useState<string[]>(['Gastos personales', 'Propinas']);
  const [politicasCancelacion, setPoliticasCancelacion] = useState('');

  // Precios
  const [precios, setPrecios] = useState({
    moneda: 'USD' as 'USD' | 'UYU',
    subtotal: '',
    impuestos: '',
    total: '',
  });

  const totalPasajeros = 1 + pasajeros.length;

  // Cargar vendedores al inicio
  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const res = await api.get('/auth/users');
        const soloVendedores = res.data
          .filter((u: any) => u.rol === 'vendedor' && u.activo)
          .map((u: any) => ({
            id: u.id,
            nombre: u.nombre,
            apellido: u.apellido,
            email: u.email,
          }));
        setVendedores(soloVendedores);
      } catch (err) {
        console.error('Error cargando vendedores:', err);
      }
    };
    fetchVendedores();
  }, []);

  // ============================================
  // PASOS DEL WIZARD
  // ============================================
  const steps = [
    { id: 1, label: 'Vendedor', icon: Users },
    { id: 2, label: 'Cliente', icon: User },
    { id: 3, label: 'Vuelos', icon: Plane },
    { id: 4, label: 'Hospedaje', icon: Hotel },
    { id: 5, label: 'Itinerario', icon: FileText },
    { id: 6, label: 'Precios', icon: DollarSign },
  ];

  // ============================================
  // HANDLERS
  // ============================================
  const handleParseAmadeus = () => {
    setParseError('');
    
    if (!amadeusText.trim()) {
      setParseError('Por favor ingresa el código de Amadeus');
      return;
    }

    const result = parseAmadeusPNR(amadeusText);
    
    if (result.success && result.flights.length > 0) {
      setParsedFlights(result.flights);
    } else {
      setParseError(result.errors[0] || 'No se pudieron parsear los vuelos. Verifica el formato.');
      setParsedFlights([]);
    }
  };

  const handleAddPasajero = () => {
    const newId = pasajeros.length + 1;
    setPasajeros([...pasajeros, {
      id: newId,
      nombre: '',
      apellido: '',
      documento: '',
      fecha_nacimiento: '',
      nacionalidad: 'Uruguay',
    }]);
  };

  const handleRemovePasajero = (id: number) => {
    setPasajeros(pasajeros.filter(p => p.id !== id));
  };

  const handleAddHospedaje = () => {
    const newId = hospedajes.length + 1;
    setHospedajes([...hospedajes, {
      id: newId,
      nombre_hotel: '',
      link_hotel: '',
      ciudad: '',
      fecha_checkin: '',
      fecha_checkout: '',
      tipo_habitacion: 'doble',
      regimen: 'desayuno',
      noches: 1,
    }]);
  };

  const handleRemoveHospedaje = (id: number) => {
    setHospedajes(hospedajes.filter(h => h.id !== id));
  };

  const handleAddIncluye = () => {
    setIncluye([...incluye, '']);
  };

  const handleRemoveIncluye = (index: number) => {
    setIncluye(incluye.filter((_, i) => i !== index));
  };

  const handleAddNoIncluye = () => {
    setNoIncluye([...noIncluye, '']);
  };

  const handleRemoveNoIncluye = (index: number) => {
    setNoIncluye(noIncluye.filter((_, i) => i !== index));
  };

  // Calcular total automáticamente
  useEffect(() => {
    const subtotal = parseFloat(precios.subtotal) || 0;
    const impuestos = parseFloat(precios.impuestos) || 0;
    setPrecios(prev => ({
      ...prev,
      total: (subtotal + impuestos).toFixed(2),
    }));
  }, [precios.subtotal, precios.impuestos]);

  const handleSubmit = async () => {
    if (!vendedorSeleccionado) {
      alert('Debes seleccionar un vendedor');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cotizacionData = {
        vendedor_id: vendedorSeleccionado,
        nombre_cotizacion: nombreCotizacion || `Viaje a ${hospedajes[0]?.ciudad || parsedFlights[0]?.destino_ciudad || 'Destino'}`,
        cliente,
        pasajeros,
        vuelos: useAmadeus ? parsedFlights : [],
        hospedaje: hospedajes,
        itinerario_manual: itinerario,
        incluye: incluye.filter(i => i.trim() !== ''),
        no_incluye: noIncluye.filter(i => i.trim() !== ''),
        politicas_cancelacion: politicasCancelacion,
        precios: {
          moneda: precios.moneda,
          subtotal: parseFloat(precios.subtotal) || 0,
          impuestos: parseFloat(precios.impuestos) || 0,
          total: parseFloat(precios.total) || 0,
        },
        origen_datos: useAmadeus && amadeusText ? 'amadeus' : 'manual',
        amadeus_pnr_raw: useAmadeus ? amadeusText : null,
      };

      console.log('Enviando datos:', cotizacionData);
      const response = await api.post('/cotizaciones/manual', cotizacionData);
      
      console.log('Respuesta:', response.data);
      alert('Cotización creada exitosamente');
      router.push('/admin/cotizaciones');
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Response:', error.response);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message || 'Error desconocido';
      alert('Error al crear cotización: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER STEPS
  // ============================================
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Seleccionar Vendedor
        </h3>
        <p className="text-[var(--muted-foreground)] text-sm mb-4">
          Selecciona el vendedor al que se asignará esta cotización.
        </p>
        
        {vendedores.length === 0 ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm">
              No hay vendedores activos disponibles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {vendedores.map((v) => (
              <button
                key={v.id}
                onClick={() => setVendedorSeleccionado(v.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  vendedorSeleccionado === v.id
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-[var(--muted)] border-[var(--border)] hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    vendedorSeleccionado === v.id ? 'bg-blue-500' : 'bg-[var(--muted)]'
                  }`}>
                    <span className="font-bold text-lg">
                      {v.nombre[0]}{v.apellido[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--foreground)]">{v.nombre} {v.apellido}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{v.email}</p>
                  </div>
                  {vendedorSeleccionado === v.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[var(--foreground)]" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Nombre de la Cotización */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          Nombre de la Cotización
        </h3>
        <div>
          <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
            Nombre del viaje *
          </label>
          <input
            type="text"
            value={nombreCotizacion}
            onChange={(e) => setNombreCotizacion(e.target.value)}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
            placeholder="Ej: Viaje a Madrid - Semana Santa"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Este nombre aparecerá en el PDF y en la lista de cotizaciones
          </p>
        </div>
      </div>

      {/* Cliente Titular */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Pasajero 1 (Titular)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Nombre *</label>
            <input
              type="text"
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
              placeholder="Ej: Juan"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Apellido *</label>
            <input
              type="text"
              value={cliente.apellido}
              onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
              placeholder="Ej: Pérez"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Documento</label>
            <input
              type="text"
              value={cliente.documento}
              onChange={(e) => setCliente({ ...cliente, documento: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
              placeholder="CI / Pasaporte"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Fecha de Nacimiento</label>
            <input
              type="date"
              value={cliente.fecha_nacimiento}
              onChange={(e) => setCliente({ ...cliente, fecha_nacimiento: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Email *</label>
            <input
              type="email"
              value={cliente.email}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
              placeholder="juan@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Teléfono</label>
            <input
              type="tel"
              value={cliente.telefono}
              onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
              placeholder="099 123 456"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Nacionalidad</label>
            <select
              value={cliente.nacionalidad}
              onChange={(e) => setCliente({ ...cliente, nacionalidad: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
            >
              <option value="Uruguay" className="bg-[var(--background)]">Uruguay</option>
              <option value="Argentina" className="bg-[var(--background)]">Argentina</option>
              <option value="Brasil" className="bg-[var(--background)]">Brasil</option>
              <option value="Chile" className="bg-[var(--background)]">Chile</option>
              <option value="Paraguay" className="bg-[var(--background)]">Paraguay</option>
              <option value="Otro" className="bg-[var(--background)]">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pasajeros Adicionales */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Pasajeros Adicionales</h3>
          <button
            onClick={handleAddPasajero}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {pasajeros.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-center py-4">No hay pasajeros adicionales</p>
        ) : (
          <div className="space-y-4">
            {pasajeros.map((pasajero, index) => (
              <div key={pasajero.id} className="bg-[var(--muted)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[var(--muted-foreground)]">Pasajero {index + 2}</span>
                  <button
                    onClick={() => handleRemovePasajero(pasajero.id)}
                    className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={pasajero.nombre}
                    onChange={(e) => {
                      const updated = [...pasajeros];
                      updated[index].nombre = e.target.value;
                      setPasajeros(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-blue-500"
                    placeholder="Nombre *"
                  />
                  <input
                    type="text"
                    value={pasajero.apellido}
                    onChange={(e) => {
                      const updated = [...pasajeros];
                      updated[index].apellido = e.target.value;
                      setPasajeros(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-blue-500"
                    placeholder="Apellido *"
                  />
                  <input
                    type="text"
                    value={pasajero.documento}
                    onChange={(e) => {
                      const updated = [...pasajeros];
                      updated[index].documento = e.target.value;
                      setPasajeros(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-blue-500"
                    placeholder="Documento *"
                  />
                  <input
                    type="date"
                    value={pasajero.fecha_nacimiento}
                    onChange={(e) => {
                      const updated = [...pasajeros];
                      updated[index].fecha_nacimiento = e.target.value;
                      setPasajeros(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Toggle: Amadeus vs Manual */}
      <div className="flex gap-2 p-1 bg-[var(--muted)] rounded-xl">
        <button
          onClick={() => setUseAmadeus(true)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            useAmadeus 
              ? 'bg-blue-500 text-[var(--foreground)]' 
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Pegar desde Amadeus
        </button>
        <button
          onClick={() => setUseAmadeus(false)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            !useAmadeus 
              ? 'bg-blue-500 text-[var(--foreground)]' 
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Ingresar Manual
        </button>
      </div>

      {useAmadeus ? (
        /* AMADEUS PASTE BOX */
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            Código Amadeus
          </h3>
          <p className="text-[var(--muted-foreground)] text-sm mb-4">
            Pega aquí el itinerario de Amadeus (formato RP/). El sistema detectará automáticamente los vuelos.
          </p>
          
          <textarea
            value={amadeusText}
            onChange={(e) => setAmadeusText(e.target.value)}
            placeholder={`Ejemplo:
RP/DZOUY2100/
  1  UX 046 T 16MAY 6 MVDMAD DK1  1220 0510  17MAY  E  0 789 M
     SEE RTSVC
  2  UX 045 N 01JUN 1 MADMVD DK1  2355 0735  02JUN  E  0 789 M
     SEE RTSVC`}
            className="w-full h-48 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] text-sm font-mono outline-none focus:border-teal-500 resize-none"
          />
          
          {parseError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {parseError}
            </div>
          )}
          
          <button
            onClick={handleParseAmadeus}
            disabled={!amadeusText.trim()}
            className="mt-4 w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-teal-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Detectar Vuelos Automáticamente
          </button>

          {/* Resultados parseados */}
          {parsedFlights.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-bold text-[var(--muted-foreground)]">
                ✓ {parsedFlights.length} vuelo(s) detectado(s)
              </h4>
              {parsedFlights.map((flight, idx) => (
                <div key={idx} className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-teal-400 font-bold">
                      {flight.aerolinea_codigo} {flight.numero_vuelo}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">Clase {flight.clase_codigo}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-[var(--foreground)] font-bold">{flight.origen_codigo}</p>
                      <p className="text-[var(--muted-foreground)] text-xs">{flight.hora_salida}</p>
                    </div>
                    <div className="flex-1 h-px bg-white/20 relative">
                      <Plane className="w-4 h-4 text-[var(--muted-foreground)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                      <p className="text-[var(--foreground)] font-bold">{flight.destino_codigo}</p>
                      <p className="text-[var(--muted-foreground)] text-xs">{flight.hora_llegada}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MANUAL ENTRY - TODO */
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Ingreso Manual</h3>
          <p className="text-[var(--muted-foreground)] text-sm mb-4">
            Función en desarrollo. Por favor usa la opción de Amadeus o selecciona un paquete del catálogo.
          </p>
          <button
            onClick={() => setUseAmadeus(true)}
            className="text-teal-400 hover:text-teal-300 text-sm font-bold"
          >
            ← Volver a Amadeus
          </button>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Hotel className="w-5 h-5 text-purple-400" />
            Hospedaje
          </h3>
          <button
            onClick={handleAddHospedaje}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Agregar Hotel
          </button>
        </div>

        {hospedajes.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-[var(--border)] rounded-xl">
            <Hotel className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3" />
            <p className="text-[var(--muted-foreground)]">No hay hoteles agregados</p>
            <p className="text-[var(--muted-foreground)] text-sm">Agrega al menos un hospedaje</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hospedajes.map((hotel, index) => (
              <div key={hotel.id} className="bg-[var(--muted)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[var(--muted-foreground)]">Hotel {index + 1}</span>
                  <button
                    onClick={() => handleRemoveHospedaje(hotel.id)}
                    className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={hotel.nombre_hotel}
                    onChange={(e) => {
                      const updated = [...hospedajes];
                      updated[index].nombre_hotel = e.target.value;
                      setHospedajes(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-purple-500"
                    placeholder="Nombre del hotel"
                  />
                  <input
                    type="url"
                    value={hotel.link_hotel || ''}
                    onChange={(e) => {
                      const updated = [...hospedajes];
                      updated[index].link_hotel = e.target.value;
                      setHospedajes(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-purple-500"
                    placeholder="Link web del hotel (opcional)"
                  />
                  <input
                    type="text"
                    value={hotel.ciudad}
                    onChange={(e) => {
                      const updated = [...hospedajes];
                      updated[index].ciudad = e.target.value;
                      setHospedajes(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-purple-500"
                    placeholder="Ciudad"
                  />
                  <input
                    type="date"
                    value={hotel.fecha_checkin}
                    onChange={(e) => {
                      const updated = [...hospedajes];
                      updated[index].fecha_checkin = e.target.value;
                      setHospedajes(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-purple-500"
                  />
                  <input
                    type="date"
                    value={hotel.fecha_checkout}
                    onChange={(e) => {
                      const updated = [...hospedajes];
                      updated[index].fecha_checkout = e.target.value;
                      setHospedajes(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-purple-500"
                  />
                  <select
                    value={hotel.tipo_habitacion}
                    onChange={(e) => {
                      const updated = [...hospedajes];
                      updated[index].tipo_habitacion = e.target.value as any;
                      setHospedajes(updated);
                    }}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-purple-500"
                  >
                    <option value="simple" className="bg-[var(--background)]">Simple</option>
                    <option value="doble" className="bg-[var(--background)]">Doble</option>
                    <option value="triple" className="bg-[var(--background)]">Triple</option>
                    <option value="cuadruple" className="bg-[var(--background)]">Cuádruple</option>
                    <option value="suite" className="bg-[var(--background)]">Suite</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Itinerario */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Itinerario Detallado
        </h3>
        <textarea
          value={itinerario}
          onChange={(e) => setItinerario(e.target.value)}
          placeholder="Describe el itinerario día por día..."
          className="w-full h-40 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] text-sm outline-none focus:border-amber-500 resize-none"
        />
      </div>

      {/* Incluye */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] text-green-400">El paquete incluye</h3>
          <button
            onClick={handleAddIncluye}
            className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
        <div className="space-y-2">
          {incluye.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...incluye];
                  updated[index] = e.target.value;
                  setIncluye(updated);
                }}
                className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-green-500"
                placeholder="Ej: Aéreos ida y vuelta"
              />
              <button
                onClick={() => handleRemoveIncluye(index)}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* No Incluye */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] text-red-400">El paquete NO incluye</h3>
          <button
            onClick={handleAddNoIncluye}
            className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
        <div className="space-y-2">
          {noIncluye.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-red-400">✗</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...noIncluye];
                  updated[index] = e.target.value;
                  setNoIncluye(updated);
                }}
                className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-red-500"
                placeholder="Ej: Gastos personales"
              />
              <button
                onClick={() => handleRemoveNoIncluye(index)}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Políticas de Cancelación */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Políticas de Cancelación</h3>
        <textarea
          value={politicasCancelacion}
          onChange={(e) => setPoliticasCancelacion(e.target.value)}
          placeholder="Condiciones de cancelación y reembolso..."
          className="w-full h-24 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] text-sm outline-none focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Precios
        </h3>

        {/* Moneda */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Moneda</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPrecios({ ...precios, moneda: 'USD' })}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                precios.moneda === 'USD'
                  ? 'bg-blue-500 text-[var(--foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              USD (Dólares)
            </button>
            <button
              onClick={() => setPrecios({ ...precios, moneda: 'UYU' })}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                precios.moneda === 'UYU'
                  ? 'bg-blue-500 text-[var(--foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              $ (Pesos Uruguayos)
            </button>
          </div>
        </div>

        {/* Montos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Subtotal</label>
            <input
              type="number"
              value={precios.subtotal}
              onChange={(e) => setPrecios({ ...precios, subtotal: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-green-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Impuestos</label>
            <input
              type="number"
              value={precios.impuestos}
              onChange={(e) => setPrecios({ ...precios, impuestos: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-green-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Total</label>
            <input
              type="text"
              value={precios.total}
              readOnly
              className="w-full bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 font-bold outline-none"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-6 p-4 bg-[var(--muted)] rounded-xl">
          <h4 className="text-sm font-bold text-[var(--muted-foreground)] mb-3">Resumen de la Cotización</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Vendedor:</span>
              <span className="text-[var(--foreground)]">
                {vendedores.find(v => v.id === vendedorSeleccionado)?.nombre} {vendedores.find(v => v.id === vendedorSeleccionado)?.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Pasajeros:</span>
              <span className="text-[var(--foreground)]">{totalPasajeros}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Vuelos:</span>
              <span className="text-[var(--foreground)]">
                {parsedFlights.length} segmentos
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Hoteles:</span>
              <span className="text-[var(--foreground)]">{hospedajes.length}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2">
              <span className="text-[var(--muted-foreground)] font-bold">Total:</span>
              <span className="text-green-400 font-bold text-lg">
                {precios.moneda === 'USD' ? '$' : '$U'} {precios.total || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">Nueva Cotización (Admin)</h1>
        <p className="text-[var(--muted-foreground)]">Crea una cotización y asígnala a un vendedor</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                  ${isActive ? 'bg-blue-500/20 text-blue-400' : ''}
                  ${isCompleted ? 'text-green-400' : ''}
                  ${!isActive && !isCompleted ? 'text-[var(--muted-foreground)]' : ''}
                `}>
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                    ${isActive ? 'bg-blue-500 text-[var(--foreground)]' : ''}
                    ${isCompleted ? 'bg-green-500 text-[var(--foreground)]' : ''}
                    ${!isActive && !isCompleted ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' : ''}
                  `}>
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="hidden md:block font-bold text-sm">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-px mx-4
                    ${isCompleted ? 'bg-green-500/50' : 'bg-[var(--muted)]'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] font-bold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <div className="text-[var(--muted-foreground)] text-sm">
            Paso {currentStep} de {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold rounded-xl transition-colors"
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !vendedorSeleccionado}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] font-bold rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Crear Cotización
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
