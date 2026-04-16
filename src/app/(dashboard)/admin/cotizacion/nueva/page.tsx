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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import BuscarCliente from '@/components/cotizaciones/BuscarCliente';
import CrearClienteModal from '@/components/cotizaciones/CrearClienteModal';
import { Cliente, clientesAPI } from '@/lib/api-clientes';

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
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<string>('');

  // Cliente CRM
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showCrearCliente, setShowCrearCliente] = useState(false);

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
  const [pasajerosFrecuentes, setPasajerosFrecuentes] = useState<any[]>([]);
  const [pasajerosSeleccionadosIds, setPasajerosSeleccionadosIds] = useState<string[]>([]);
  
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

  // Precios - Desglosado
  const [precios, setPrecios] = useState({
    moneda: 'USD' as 'USD' | 'UYU',
    vuelos: '',
    hospedajes: '',
    extras: '',
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

  // Sincronizar datos del cliente seleccionado al formulario
  useEffect(() => {
    if (clienteSeleccionado) {
      setCliente({
        nombre: clienteSeleccionado.nombre || '',
        apellido: clienteSeleccionado.apellido || '',
        documento: clienteSeleccionado.documento || '',
        email: clienteSeleccionado.email || '',
        telefono: clienteSeleccionado.telefono || '',
        fecha_nacimiento: clienteSeleccionado.fecha_nacimiento || '',
        nacionalidad: clienteSeleccionado.nacionalidad || 'Uruguay',
      });
    }
  }, [clienteSeleccionado]);

  // Cargar pasajeros frecuentes del cliente seleccionado
  useEffect(() => {
    const fetchPasajeros = async () => {
      if (clienteSeleccionado?.id) {
        try {
          const res = await clientesAPI.getPasajeros(clienteSeleccionado.id);
          setPasajerosFrecuentes(res.data || []);
          setPasajerosSeleccionadosIds([]);
        } catch (err) {
          console.error('Error cargando pasajeros frecuentes:', err);
          setPasajerosFrecuentes([]);
        }
      } else {
        setPasajerosFrecuentes([]);
        setPasajerosSeleccionadosIds([]);
      }
    };
    fetchPasajeros();
  }, [clienteSeleccionado?.id]);

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

  // Calcular subtotal y total automáticamente
  useEffect(() => {
    const vuelos = parseFloat(precios.vuelos) || 0;
    const hospedajes = parseFloat(precios.hospedajes) || 0;
    const extras = parseFloat(precios.extras) || 0;
    const subtotal = vuelos + hospedajes + extras;
    const impuestos = parseFloat(precios.impuestos) || 0;
    setPrecios(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      total: (subtotal + impuestos).toFixed(2),
    }));
  }, [precios.vuelos, precios.hospedajes, precios.extras, precios.impuestos]);

  const handleSubmit = async () => {
    // Si no seleccionó vendedor, usar el ID del admin actual
    const vendedorIdFinal = vendedorSeleccionado || user?.id;
    
    if (!vendedorIdFinal) {
      toastError('No se pudo determinar el vendedor', 'Falta información');
      return;
    }

    // Validar que haya un cliente seleccionado o datos manuales del titular
    const tieneClienteManual = cliente.nombre.trim() && cliente.apellido.trim();
    if (!clienteSeleccionado && !tieneClienteManual) {
      toastError('Debes seleccionar un cliente existente o completar los datos del titular', 'Cliente requerido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cotizacionData: any = {
        vendedor_id: vendedorIdFinal,
        nombre_cotizacion: nombreCotizacion || `Viaje a ${hospedajes[0]?.ciudad || parsedFlights[0]?.destino_ciudad || 'Destino'}`,
        pasajeros_ids: pasajerosSeleccionadosIds,
        pasajeros_nuevos: pasajeros.map(p => ({
          nombre: p.nombre,
          apellido: p.apellido,
          documento: p.documento,
          fecha_nacimiento: p.fecha_nacimiento,
          nacionalidad: p.nacionalidad,
        })),
        vuelos: useAmadeus ? parsedFlights : [],
        hospedajes: hospedajes.map(h => ({
          nombre_hotel: h.nombre_hotel,
          link_hotel: h.link_hotel,
          ciudad: h.ciudad,
          fecha_checkin: h.fecha_checkin,
          fecha_checkout: h.fecha_checkout,
          tipo_habitacion: h.tipo_habitacion,
          regimen: h.regimen,
          noches: h.noches,
        })),
        itinerario_manual: itinerario,
        incluye: incluye.filter(i => i.trim() !== ''),
        no_incluye: noIncluye.filter(i => i.trim() !== ''),
        politicas_cancelacion: politicasCancelacion,
        precios: {
          moneda: precios.moneda,
          vuelos: parseFloat(precios.vuelos) || 0,
          hospedajes: parseFloat(precios.hospedajes) || 0,
          extras: parseFloat(precios.extras) || 0,
          subtotal: parseFloat(precios.subtotal) || 0,
          impuestos: parseFloat(precios.impuestos) || 0,
          total: parseFloat(precios.total) || 0,
        },
        origen_datos: useAmadeus && amadeusText ? 'amadeus' : 'manual',
        amadeus_pnr_raw: useAmadeus ? amadeusText : null,
      };

      if (clienteSeleccionado) {
        cotizacionData.cliente_id = clienteSeleccionado.id;
      } else {
        cotizacionData.cliente_nuevo = {
          tipo_documento: 'CI',
          documento: cliente.documento,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          telefono: cliente.telefono,
          fecha_nacimiento: cliente.fecha_nacimiento,
          nacionalidad: cliente.nacionalidad,
        };
      }

      console.log('Enviando datos:', cotizacionData);
      const response = await api.post('/cotizaciones/manual', cotizacionData);
      
      console.log('Respuesta:', response.data);
      toastSuccess('Cotización creada exitosamente', '¡Listo!');
      router.push('/admin/cotizaciones');
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Response:', error.response);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message || 'Error desconocido';
      toastError(errorMsg, 'Error al crear cotización');
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
          <span className="text-blue-400">Si no seleccionas ninguno, se asignará a ti.</span>
        </p>
        
        {/* Opción: Asignar a mí mismo */}
        <button
          onClick={() => setVendedorSeleccionado('')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            !vendedorSeleccionado
              ? 'bg-blue-500/20 border-blue-500'
              : 'bg-[var(--muted)] border-[var(--border)] hover:border-white/30'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              !vendedorSeleccionado ? 'bg-blue-500' : 'bg-[var(--muted)]'
            }`}>
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--foreground)]">Yo (Administrador)</p>
              <p className="text-sm text-[var(--muted-foreground)] break-all">{user?.email}</p>
            </div>
            {!vendedorSeleccionado && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-[var(--foreground)]" />
              </div>
            )}
          </div>
        </button>
        
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
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    vendedorSeleccionado === v.id ? 'bg-blue-500' : 'bg-[var(--muted)]'
                  }`}>
                    <span className="font-bold text-lg">
                      {v.nombre[0]}{v.apellido[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--foreground)] break-words">{v.nombre} {v.apellido}</p>
                    <p className="text-sm text-[var(--muted-foreground)] break-all">{v.email}</p>
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
          Cliente (Titular)
        </h3>

        {/* Buscar o Crear Cliente */}
        <div className="mb-6">
          <BuscarCliente
            onSelect={setClienteSeleccionado}
            onNuevoCliente={() => setShowCrearCliente(true)}
            selectedClienteId={clienteSeleccionado?.id}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Nombre *</label>
            <input
              type="text"
              value={cliente.nombre}
              readOnly={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="Ej: Juan"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Apellido *</label>
            <input
              type="text"
              value={cliente.apellido}
              readOnly={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="Ej: Pérez"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Documento</label>
            <input
              type="text"
              value={cliente.documento}
              readOnly={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, documento: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="CI / Pasaporte"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Fecha de Nacimiento</label>
            <input
              type="date"
              value={cliente.fecha_nacimiento}
              readOnly={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, fecha_nacimiento: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Email *</label>
            <input
              type="email"
              value={cliente.email}
              readOnly={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="juan@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Teléfono</label>
            <input
              type="tel"
              value={cliente.telefono}
              readOnly={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="099 123 456"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Nacionalidad</label>
            <select
              value={cliente.nacionalidad}
              disabled={!!clienteSeleccionado}
              onChange={(e) => setCliente({ ...cliente, nacionalidad: e.target.value })}
              className={`w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 ${clienteSeleccionado ? 'opacity-70 cursor-not-allowed' : ''}`}
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

      {/* Pasajeros Frecuentes */}
      {pasajerosFrecuentes.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Pasajeros frecuentes</h3>
          <div className="space-y-2">
            {pasajerosFrecuentes.map((p: any) => (
              <label key={p.id} className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={pasajerosSeleccionadosIds.includes(p.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPasajerosSeleccionadosIds((prev) => [...prev, p.id]);
                    } else {
                      setPasajerosSeleccionadosIds((prev) => prev.filter((id) => id !== p.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-[var(--border)]"
                />
                <div>
                  <p className="font-medium text-[var(--foreground)]">{p.nombre} {p.apellido}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Doc: {p.documento}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

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
          Precios Desglosados
        </h3>

        {/* Moneda */}
        <div className="mb-6">
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

        {/* Desglose de Precios */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-bold text-[var(--foreground)]">Desglose de Servicios</h4>
          
          {/* Vuelos */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Plane className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">Vuelos</label>
              <input
                type="number"
                value={precios.vuelos}
                onChange={(e) => setPrecios({ ...precios, vuelos: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>

          {/* Hospedajes */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Hotel className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">Hospedajes</label>
              <input
                type="number"
                value={precios.hospedajes}
                onChange={(e) => setPrecios({ ...precios, hospedajes: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-purple-500"
                placeholder="0.00"
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>

          {/* Extras */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Plus className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">Traslados, Excursiones, Extras</label>
              <input
                type="number"
                value={precios.extras}
                onChange={(e) => setPrecios({ ...precios, extras: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-orange-500"
                placeholder="0.00"
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>
        </div>

        {/* Subtotal (auto-calculado) */}
        <div className="flex justify-between items-center p-3 border-t border-[var(--border)]">
          <span className="text-[var(--muted-foreground)]">Subtotal</span>
          <span className="text-[var(--foreground)] font-medium">
            {precios.moneda === 'USD' ? '$' : '$U'} {precios.subtotal || '0.00'}
          </span>
        </div>

        {/* Impuestos */}
        <div className="flex flex-wrap items-center gap-4 p-3 border-t border-[var(--border)]">
          <span className="text-[var(--muted-foreground)] flex-1">Impuestos</span>
          <input
            type="number"
            value={precios.impuestos}
            onChange={(e) => setPrecios({ ...precios, impuestos: e.target.value })}
            className="w-32 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-1 text-right text-[var(--foreground)] outline-none focus:border-green-500"
            placeholder="0.00"
          />
          <span className="text-[var(--muted-foreground)] w-8">{precios.moneda === 'USD' ? '$' : '$U'}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl mt-4">
          <span className="text-[var(--foreground)] font-bold text-lg">TOTAL</span>
          <span className="text-green-400 font-black text-2xl">
            {precios.moneda === 'USD' ? '$' : '$U'} {precios.total || '0.00'}
          </span>
        </div>

        {/* Resumen */}
        <div className="mt-6 p-4 bg-[var(--muted)] rounded-xl">
          <h4 className="text-sm font-bold text-[var(--muted-foreground)] mb-3">Resumen de la Cotización</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Vendedor:</span>
              <span className="text-[var(--foreground)]">
                {vendedorSeleccionado 
                  ? `${vendedores.find(v => v.id === vendedorSeleccionado)?.nombre} ${vendedores.find(v => v.id === vendedorSeleccionado)?.apellido}`
                  : 'Yo (Admin)'}
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
              <span className="text-[var(--muted-foreground)] font-bold">Precio por persona:</span>
              <span className="text-green-400 font-bold text-lg">
                {precios.moneda === 'USD' ? '$' : '$U'} {totalPasajeros > 0 && precios.total ? (parseFloat(precios.total) / totalPasajeros).toFixed(2) : '0.00'}
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
        <h1 className="text-2xl md:text-3xl font-black text-[var(--foreground)] mb-2">Nueva Cotización (Admin)</h1>
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
              disabled={isSubmitting}
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

      {/* Modal Crear Cliente */}
      <CrearClienteModal
        isOpen={showCrearCliente}
        onClose={() => setShowCrearCliente(false)}
        onClienteCreado={(cliente) => {
          setClienteSeleccionado(cliente);
          setShowCrearCliente(false);
        }}
      />
    </div>
  );
}
