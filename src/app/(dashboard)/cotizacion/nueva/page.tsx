"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  User, 
  Plane, 
  Briefcase, 
  FileText, 
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Check,
  X,
  BedDouble,
  Bus,
  Shield,
  Ticket
} from 'lucide-react';
import { parseAmadeusPNR, isValidAmadeusText, ParsedFlight } from '@/lib/amadeus-parser';
import { AirlineLogo } from '@/components/flights/AirlineLogo';
import { getAirportDisplay, getAirlineDisplay } from '@/lib/airports';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import BuscarCliente from '@/components/cotizaciones/BuscarCliente';
import CrearClienteModal from '@/components/cotizaciones/CrearClienteModal';
import ManualFlightForm from '@/components/cotizaciones/ManualFlightForm';
import ServiciosStep from '@/components/cotizaciones/servicios/ServiciosStep';
import { Cliente, clientesAPI } from '@/lib/api-clientes';
import type { AlojamientoCotizacion, TransferCotizacion, SeguroCotizacion, ExtraCotizacion } from '@/types/cotizacion';

// ============================================
// TIPOS
// ============================================
interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  nacionalidad: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function NuevaCotizacionManual() {
  const router = useRouter();
  const t = useTranslations('cotizaciones');
  const locale = useLocale();
  const { success: toastSuccess, error: toastError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cliente CRM
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showCrearCliente, setShowCrearCliente] = useState(false);

  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [pasajerosFrecuentes, setPasajerosFrecuentes] = useState<any[]>([]);
  const [pasajerosSeleccionadosIds, setPasajerosSeleccionadosIds] = useState<string[]>([]);
  
  // Vuelos
  const [amadeusText, setAmadeusText] = useState('');
  const [parsedFlights, setParsedFlights] = useState<ParsedFlight[]>([]);
  const [parseError, setParseError] = useState('');
  const [vuelosManuales, setVuelosManuales] = useState<any[]>([]);
  const [useAmadeus, setUseAmadeus] = useState(true);

  // Servicios del viaje
  const [alojamientos, setAlojamientos] = useState<AlojamientoCotizacion[]>([]);
  const [transfers, setTransfers] = useState<TransferCotizacion[]>([]);
  const [seguros, setSeguros] = useState<SeguroCotizacion[]>([]);
  const [extras, setExtras] = useState<ExtraCotizacion[]>([]);

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
    traslados: '',
    seguros: '',
    extras: '',
    subtotal: '',
    impuestos: '',
    total: '',
  });

  const totalPasajeros = 1 + pasajeros.length;

  // ============================================
  // PASOS DEL WIZARD
  // ============================================
  const steps = [
    { id: 1, label: t('new.steps.cliente'), icon: User },
    { id: 2, label: t('new.steps.vuelos'), icon: Plane },
    { id: 3, label: t('new.steps.servicios'), icon: Briefcase },
    { id: 4, label: t('new.steps.itinerario'), icon: FileText },
    { id: 5, label: t('new.steps.precios'), icon: DollarSign },
  ];

  // ============================================
  // HANDLERS
  // ============================================
  const handleParseAmadeus = () => {
    setParseError('');
    
    if (!amadeusText.trim()) {
      setParseError(t('new.flights.parseErrorEmpty'));
      return;
    }

    const result = parseAmadeusPNR(amadeusText);
    
    if (result.success && result.flights.length > 0) {
      setParsedFlights(result.flights);
    } else {
      setParseError(result.errors[0] || t('new.flights.parseError'));
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
    const traslados = parseFloat(precios.traslados) || 0;
    const seguros = parseFloat(precios.seguros) || 0;
    const extras = parseFloat(precios.extras) || 0;
    const impuestos = parseFloat(precios.impuestos) || 0;
    
    const subtotal = vuelos + hospedajes + traslados + seguros + extras;
    const total = subtotal + impuestos;
    
    setPrecios(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
    }));
  }, [precios.vuelos, precios.hospedajes, precios.traslados, precios.seguros, precios.extras, precios.impuestos]);

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

  const handleSubmit = async () => {
    if (!clienteSeleccionado) {
      toastError(t('new.errors.selectClient'), t('new.errors.clientRequired'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Formato CRM nuevo
      const cotizacionData = {
        cliente_id: clienteSeleccionado.id,
        pasajeros_ids: pasajerosSeleccionadosIds,
        pasajeros_nuevos: pasajeros.map(p => ({
          nombre: p.nombre,
          apellido: p.apellido,
          documento: p.documento,
          fecha_nacimiento: p.fecha_nacimiento,
          nacionalidad: p.nacionalidad,
        })),
        pasajero_titular_id: null, // Se asignará automáticamente
        nombre_cotizacion: nombreCotizacion || `Viaje a ${alojamientos[0]?.ciudad || parsedFlights[0]?.destino_ciudad || 'Destino'}`,
        vuelos: useAmadeus ? parsedFlights : vuelosManuales,
        hospedajes: alojamientos,
        traslados: transfers,
        seguros: seguros,
        extras: extras,
        itinerario: { texto: itinerario, dias: [] },
        incluye: incluye.filter(i => i.trim() !== ''),
        no_incluye: noIncluye.filter(i => i.trim() !== ''),
        politicas_cancelacion: politicasCancelacion,
        precios: {
          moneda: precios.moneda,
          vuelos: parseFloat(precios.vuelos) || 0,
          hospedajes: parseFloat(precios.hospedajes) || 0,
          traslados: parseFloat(precios.traslados) || 0,
          seguros: parseFloat(precios.seguros) || 0,
          extras: parseFloat(precios.extras) || 0,
          subtotal: parseFloat(precios.subtotal) || 0,
          impuestos: parseFloat(precios.impuestos) || 0,
          total: parseFloat(precios.total) || 0,
        },
        origen_datos: useAmadeus && amadeusText ? 'amadeus_pnr' : 'manual',
        amadeus_pnr_raw: useAmadeus ? amadeusText : null,
      };

      const response = await api.post('/cotizaciones/manual', cotizacionData);
      toastSuccess(t('new.success.created'), t('new.success.ready'));
      router.push('/cotizaciones');
    } catch (error: any) {
      console.error('Error al crear cotización:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message || 'Error desconocido';
      toastError(errorMsg, t('new.errors.conversionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER STEPS
  // ============================================
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Nombre de la Cotización */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          {t('new.quoteName.title')}
        </h3>
        <div>
          <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
            {t('new.quoteName.label')}
          </label>
          <input
            type="text"
            value={nombreCotizacion}
            onChange={(e) => setNombreCotizacion(e.target.value)}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
            placeholder={t('new.quoteName.placeholder')}
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {t('new.quoteName.hint')}
          </p>
        </div>
      </div>

      {/* Cliente CRM - Buscar o Crear */}
      <div className="glass-card rounded-2xl p-6 relative z-20">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          {t('new.client.title')}
        </h3>
        <BuscarCliente
          onSelect={setClienteSeleccionado}
          onNuevoCliente={() => setShowCrearCliente(true)}
          selectedClienteId={clienteSeleccionado?.id}
        />
      </div>

      {/* Pasajeros Frecuentes */}
      {pasajerosFrecuentes.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            {t('new.client.frequentPassengers')}
          </h3>
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
          <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            {t('new.client.additionalPassengers')}
          </h3>
          <button
            onClick={handleAddPasajero}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            {t('new.client.addPassenger')}
          </button>
        </div>

        {pasajeros.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-center py-4">{t('new.client.noAdditional')}</p>
        ) : (
          <div className="space-y-4">
            {pasajeros.map((pasajero, index) => (
              <div key={pasajero.id} className="bg-[var(--muted)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[var(--foreground)]">{t('new.client.passengerN', { number: index + 2 })}</span>
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
                    placeholder={t('new.client.firstName')}
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
                    placeholder={t('new.client.lastName')}
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
                    placeholder={t('new.client.document')}
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
                <div className="mt-3">
                  <select
                    value={pasajero.nacionalidad}
                    onChange={(e) => {
                      const updated = [...pasajeros];
                      updated[index].nacionalidad = e.target.value;
                      setPasajeros(updated);
                    }}
                    className="w-full md:w-1/2 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Uruguay" className="bg-[var(--background)]">Uruguay</option>
                    <option value="Argentina" className="bg-[var(--background)]">Argentina</option>
                    <option value="Brasil" className="bg-[var(--background)]">Brasil</option>
                    <option value="Chile" className="bg-[var(--background)]">Chile</option>
                    <option value="Paraguay" className="bg-[var(--background)]">Paraguay</option>
                    <option value="Estados Unidos" className="bg-[var(--background)]">Estados Unidos</option>
                    <option value="España" className="bg-[var(--background)]">España</option>
                    <option value="Otro" className="bg-[var(--background)]">Otro</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
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
          {t('new.flights.amadeusTab')}
        </button>
        <button
          onClick={() => setUseAmadeus(false)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            !useAmadeus 
              ? 'bg-blue-500 text-[var(--foreground)]' 
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          {t('new.flights.manualTab')}
        </button>
      </div>

      {useAmadeus ? (
        /* AMADEUS PASTE BOX */
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            {t('new.flights.amadeusTitle')}
          </h3>
          <p className="text-[var(--muted-foreground)] text-sm mb-4">
            {t('new.flights.amadeusDescription')}
          </p>
          
          <textarea
            value={amadeusText}
            onChange={(e) => setAmadeusText(e.target.value)}
            placeholder={t('new.flights.amadeusPlaceholder')}
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
            {t('new.flights.detectFlights')}
          </button>

          {/* Resultados parseados */}
          {parsedFlights.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-bold text-[var(--foreground)]">
                ✓ {parsedFlights.length} {t('new.flights.detectedFlights')}
              </h4>
              {parsedFlights.map((flight, idx) => (
                <div key={idx} className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AirlineLogo iataCode={flight.aerolinea_codigo} size={20} />
                      <span className="text-teal-400 font-bold">
                        {flight.aerolinea_codigo} {flight.numero_vuelo}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">{t('new.flights.class')} {flight.clase_codigo}</span>
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
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    {new Date(flight.fecha_salida).toLocaleDateString(locale, { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MANUAL ENTRY */
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">{t('new.flights.manualEntry')}</h3>
          <ManualFlightForm flights={vuelosManuales} onChange={setVuelosManuales} />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <ServiciosStep
          alojamientos={alojamientos}
          transfers={transfers}
          seguros={seguros}
          extras={extras}
          moneda={precios.moneda}
          onChange={({ alojamientos: a, transfers: tr, seguros: s, extras: e }) => {
            setAlojamientos(a);
            setTransfers(tr);
            setSeguros(s);
            setExtras(e);
          }}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Itinerario */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          {t('new.itinerary.detailedItinerary')}
        </h3>
        <textarea
          value={itinerario}
          onChange={(e) => setItinerario(e.target.value)}
          placeholder={t('new.itinerary.placeholder')}
          className="w-full h-40 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] text-sm outline-none focus:border-amber-500 resize-none"
        />
      </div>

      {/* Incluye */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] text-green-400">{t('new.itinerary.includesTitle')}</h3>
          <button
            onClick={handleAddIncluye}
            className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {t('new.itinerary.includesAdd')}
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
                placeholder={t('new.itinerary.includesPlaceholder')}
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
          <h3 className="text-lg font-bold text-[var(--foreground)] text-red-400">{t('new.itinerary.notIncludesTitle')}</h3>
          <button
            onClick={handleAddNoIncluye}
            className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {t('new.itinerary.notIncludesAdd')}
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
                placeholder={t('new.itinerary.notIncludesPlaceholder')}
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
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">{t('new.itinerary.cancellationPolicies')}</h3>
        <textarea
          value={politicasCancelacion}
          onChange={(e) => setPoliticasCancelacion(e.target.value)}
          placeholder={t('new.itinerary.cancellationPlaceholder')}
          className="w-full h-24 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] text-sm outline-none focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          {t('new.prices.title')}
        </h3>

        {/* Moneda */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">{t('new.prices.currency')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPrecios({ ...precios, moneda: 'USD' })}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                precios.moneda === 'USD'
                  ? 'bg-blue-500 text-[var(--foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {t('new.prices.usd')}
            </button>
            <button
              onClick={() => setPrecios({ ...precios, moneda: 'UYU' })}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                precios.moneda === 'UYU'
                  ? 'bg-blue-500 text-[var(--foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {t('new.prices.uyu')}
            </button>
          </div>
        </div>

        {/* Desglose de Precios */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-bold text-[var(--foreground)]">{t('new.prices.serviceBreakdown')}</h4>
          
          {/* Vuelos */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Plane className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">{t('new.prices.flights')}</label>
              <input
                type="number"
                value={precios.vuelos}
                onChange={(e) => setPrecios({ ...precios, vuelos: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-blue-500"
                placeholder={t('new.prices.pricePlaceholder')}
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>

          {/* Hospedajes */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <BedDouble className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">{t('new.prices.accommodation')}</label>
              <input
                type="number"
                value={precios.hospedajes}
                onChange={(e) => setPrecios({ ...precios, hospedajes: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-purple-500"
                placeholder={t('new.prices.pricePlaceholder')}
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>

          {/* Traslados */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Bus className="w-5 h-5 text-cyan-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">{t('new.prices.transfers')}</label>
              <input
                type="number"
                value={precios.traslados}
                onChange={(e) => setPrecios({ ...precios, traslados: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-cyan-500"
                placeholder={t('new.prices.pricePlaceholder')}
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>

          {/* Seguros */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Shield className="w-5 h-5 text-rose-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">{t('new.prices.insurance')}</label>
              <input
                type="number"
                value={precios.seguros}
                onChange={(e) => setPrecios({ ...precios, seguros: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-rose-500"
                placeholder={t('new.prices.pricePlaceholder')}
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>

          {/* Extras */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
            <Ticket className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)]">{t('new.prices.extras')}</label>
              <input
                type="number"
                value={precios.extras}
                onChange={(e) => setPrecios({ ...precios, extras: e.target.value })}
                className="w-full bg-transparent border-b border-[var(--border)] py-1 text-[var(--foreground)] outline-none focus:border-orange-500"
                placeholder={t('new.prices.pricePlaceholder')}
              />
            </div>
            <span className="text-[var(--muted-foreground)]">{precios.moneda === 'USD' ? '$' : '$U'}</span>
          </div>
        </div>

        {/* Subtotal (auto-calculado) */}
        <div className="flex justify-between items-center p-3 border-t border-[var(--border)]">
          <span className="text-[var(--muted-foreground)]">{t('new.prices.subtotal')}</span>
          <span className="text-[var(--foreground)] font-medium">
            {precios.moneda === 'USD' ? '$' : '$U'} {precios.subtotal || '0.00'}
          </span>
        </div>

        {/* Impuestos */}
        <div className="flex flex-wrap items-center gap-4 p-3 border-t border-[var(--border)]">
          <span className="text-[var(--muted-foreground)] flex-1">{t('new.prices.taxes')}</span>
          <input
            type="number"
            value={precios.impuestos}
            onChange={(e) => setPrecios({ ...precios, impuestos: e.target.value })}
            className="w-32 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-1 text-right text-[var(--foreground)] outline-none focus:border-green-500"
            placeholder={t('new.prices.pricePlaceholder')}
          />
          <span className="text-[var(--muted-foreground)] w-8">{precios.moneda === 'USD' ? '$' : '$U'}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl mt-4">
          <span className="text-[var(--foreground)] font-bold text-lg">{t('new.prices.total')}</span>
          <span className="text-green-400 font-black text-2xl">
            {precios.moneda === 'USD' ? '$' : '$U'} {precios.total || '0.00'}
          </span>
        </div>

        {/* Resumen de servicios */}
        <div className="mt-6 p-4 bg-[var(--muted)] rounded-xl">
          <h4 className="text-sm font-bold text-[var(--foreground)] mb-3">{t('new.prices.serviceSummary')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('new.prices.passengers')}:</span>
              <span className="text-[var(--foreground)]">{totalPasajeros}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('new.prices.flights')}:</span>
              <span className="text-[var(--foreground)]">
                {useAmadeus ? parsedFlights.length : vuelosManuales.length} {t('new.prices.segments')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('new.prices.accommodation')}:</span>
              <span className="text-[var(--foreground)]">{alojamientos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('new.prices.transfers')}:</span>
              <span className="text-[var(--foreground)]">{transfers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('new.prices.insurance')}:</span>
              <span className="text-[var(--foreground)]">{seguros.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('new.prices.extras')}:</span>
              <span className="text-[var(--foreground)]">{extras.length}</span>
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
        <h1 className="text-2xl md:text-3xl font-black text-[var(--foreground)] mb-2">{t('new.title')}</h1>
        <p className="text-[var(--muted-foreground)]">{t('new.subtitle')}</p>
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
      </div>

      {/* Modal Crear Cliente */}
      <CrearClienteModal
        isOpen={showCrearCliente}
        onClose={() => setShowCrearCliente(false)}
        onClienteCreado={(cliente) => {
          setClienteSeleccionado(cliente);
        }}
      />

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] font-bold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('new.navigation.previous')}
          </button>

          <div className="text-[var(--muted-foreground)] text-sm">
            {t('new.navigation.stepOf', { current: currentStep, total: steps.length })}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold rounded-xl transition-colors"
            >
              {t('new.navigation.next')}
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
                  {t('new.navigation.saving')}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {t('new.navigation.createQuote')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
