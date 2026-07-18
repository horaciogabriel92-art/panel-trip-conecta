'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import AirlineLogo from '@/components/flights/AirlineLogo';
import ServiciosStep from './servicios/ServiciosStep';
import { useCotizacionPricing, toMoney, calcularTotalesDesdeServicios } from '@/components/cotizaciones/hooks/useCotizacionPricing';
import type { AlojamientoCotizacion, TransferCotizacion, SeguroCotizacion, ExtraCotizacion } from '@/types/cotizacion';
import {
  ArrowLeft, Save, Plus, Trash2, Plane, Hotel, FileText,
  DollarSign, Users, Calendar, MapPin, CheckCircle, Loader2,
  BedDouble, Bus, Shield, Ticket
} from 'lucide-react';

interface Vuelo {
  id?: string;
  tipo_trayecto?: string;
  aerolinea_codigo?: string;
  aerolinea_nombre?: string;
  numero_vuelo?: string;
  origen_codigo?: string;
  origen_nombre?: string;
  destino_codigo?: string;
  destino_nombre?: string;
  fecha_salida?: string;
  hora_salida?: string;
  fecha_llegada?: string;
  hora_llegada?: string;
  clase_codigo?: string;
  clase_nombre?: string;
  duracion_minutos?: number;
  es_escala?: boolean;
}

interface Hospedaje extends AlojamientoCotizacion {
  id?: string;
}

interface Pasajero {
  id: string;
  nombre: string;
  apellido: string;
  documento?: string;
  es_titular?: boolean;
}

interface CotizacionData {
  id: string;
  codigo: string;
  nombre_cotizacion?: string;
  destino_principal?: string;
  estado: string;
  cliente_id?: string;
  vendedor_id?: string;
  precio_total?: number;
  precio_moneda?: string;
  itinerario?: any;
  paquete_data?: any;
  num_pasajeros?: number;
  vuelos?: Vuelo[];
  hospedajes?: Hospedaje[];
  pasajeros?: Pasajero[];
}

interface VendedorOption {
  id: string;
  nombre: string;
  apellido: string;
}

interface Props {
  cotizacionId: string;
  isAdmin?: boolean;
}

export default function CotizacionManualEditor({ cotizacionId, isAdmin = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cotizacion, setCotizacion] = useState<CotizacionData | null>(null);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);

  // Form states
  const [nombreCotizacion, setNombreCotizacion] = useState('');
  const [destino, setDestino] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [alojamientos, setAlojamientos] = useState<Hospedaje[]>([]);
  const [transfers, setTransfers] = useState<TransferCotizacion[]>([]);
  const [seguros, setSeguros] = useState<SeguroCotizacion[]>([]);
  const [extras, setExtras] = useState<ExtraCotizacion[]>([]);
  const [itinerario, setItinerario] = useState('');
  const [incluye, setIncluye] = useState<string[]>([]);
  const [noIncluye, setNoIncluye] = useState<string[]>([]);
  const [politicas, setPoliticas] = useState('');
  const [moneda, setMoneda] = useState<'USD' | 'UYU'>('USD');
  const [pasajerosActuales, setPasajerosActuales] = useState<Array<{
    pasajero_id: string;
    nombre: string;
    apellido: string;
    documento?: string;
    es_titular?: boolean;
  }>>([]);
  const [pasajerosNuevos, setPasajerosNuevos] = useState<Array<{
    nombre: string;
    apellido: string;
    documento: string;
    fecha_nacimiento: string;
    nacionalidad: string;
  }>>([]);
  const [pasajerosFrecuentes, setPasajerosFrecuentes] = useState<any[]>([]);
  const [showNuevoPasajero, setShowNuevoPasajero] = useState(false);
  const [nuevoPasajero, setNuevoPasajero] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    fecha_nacimiento: '',
    nacionalidad: 'Uruguay',
  });
  const [margenMonto, setMargenMonto] = useState<number>(0);
  const [notasInternas, setNotasInternas] = useState<string>('');
  const [mostrarDesglosePdf, setMostrarDesglosePdf] = useState<boolean>(true);
  // Overrides manuales del desglose (por persona). Si un campo no está acá, se usa el calculado.
  const [desgloseEdit, setDesgloseEdit] = useState<{
    vuelos?: number;
    hospedajes?: number;
    traslados?: number;
    seguros?: number;
    extras?: number;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/cotizaciones/${cotizacionId}`);
        const data = res.data;
        setCotizacion(data);

        // Populate form
        setNombreCotizacion(data.nombre_cotizacion || '');
        setDestino(data.destino_principal || '');
        setVendedorId(data.vendedor_id || '');
        setVuelos(data.vuelos || []);
        setAlojamientos((data.hospedajes || []).map((h: any) => ({
          ...h,
          nombre_alojamiento: h.nombre_alojamiento || h.nombre_hotel,
          tipo_alojamiento: h.tipo_alojamiento || 'Hotel',
          es_opcion: h.es_opcion ?? (data.hospedajes?.length > 1),
          seleccionado: h.seleccionado ?? false,
        })));
        setTransfers(data.traslados || []);
        setSeguros(data.seguros || []);
        setExtras(data.extras || []);

        const itin = typeof data.itinerario === 'string' ? data.itinerario : (data.itinerario?.texto || '');
        setItinerario(itin);

        const pd = data.paquete_data || {};
        setIncluye(pd.incluye || data.incluye || ['Traslados aeropuerto-hotel-aeropuerto']);
        setNoIncluye(pd.no_incluye || data.no_incluye || ['Gastos personales', 'Propinas']);
        setPoliticas(pd.politicas_cancelacion || data.politicas_cancelacion || '');

        setMoneda(data.precio_moneda || 'USD');

        setMargenMonto(Number(data.margen_agencia_monto) || 0);
        setNotasInternas(data.notas_internas || '');
        setMostrarDesglosePdf(data.mostrar_desglose_pdf !== false);

        const vinculados = (data.pasajeros || []).map((p: any) => ({
          pasajero_id: p.pasajero_id || p.pasajero?.id || p.id,
          nombre: p.nombre_snapshot || p.pasajero?.nombre || '',
          apellido: p.apellido_snapshot || p.pasajero?.apellido || '',
          documento: p.documento_snapshot || p.pasajero?.documento || '',
          es_titular: p.es_titular || false,
        })).filter((p: any) => p.pasajero_id);
        setPasajerosActuales(vinculados);

        // Pasajeros frecuentes del cliente (para re-agregar existentes)
        if (data.cliente_id) {
          try {
            const resP = await api.get(`/clientes/${data.cliente_id}/pasajeros`);
            const lista = Array.isArray(resP.data) ? resP.data : (resP.data?.data || []);
            setPasajerosFrecuentes(lista);
          } catch {
            setPasajerosFrecuentes([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      api.get('/auth/users').then((res) => {
        setVendedores((res.data || []).filter((u: any) => u.rol === 'vendedor'));
      }).catch(console.error);
    }

    fetchData();
  }, [cotizacionId, isAdmin]);

  const numPasajeros = Math.max(1, pasajerosActuales.length + pasajerosNuevos.length);

  const { values } = useCotizacionPricing({
    vuelos,
    alojamientos,
    transfers,
    seguros,
    extras,
    numPasajeros,
    moneda,
  });

  // Valores efectivos: override manual ?? calculado desde servicios
  const vuelosVal = desgloseEdit.vuelos ?? values.vuelos;
  const hospedajesVal = desgloseEdit.hospedajes ?? values.hospedajes;
  const trasladosVal = desgloseEdit.traslados ?? values.traslados;
  const segurosVal = desgloseEdit.seguros ?? values.seguros;
  const extrasVal = desgloseEdit.extras ?? values.extras;

  const subtotalCalculado = vuelosVal + hospedajesVal + trasladosVal + segurosVal + extrasVal;
  const totalCalculado = subtotalCalculado * numPasajeros;

  const addVuelo = () => {
    setVuelos([...vuelos, { tipo_trayecto: 'ida', es_escala: false }]);
  };

  const removeVuelo = (index: number) => {
    setVuelos(vuelos.filter((_, i) => i !== index));
  };

  const updateVuelo = (index: number, field: keyof Vuelo, value: any) => {
    const updated = [...vuelos];
    updated[index] = { ...updated[index], [field]: value };
    setVuelos(updated);
  };

  const addIncluye = () => setIncluye([...incluye, '']);
  const removeIncluye = (i: number) => setIncluye(incluye.filter((_, idx) => idx !== i));
  const updateIncluye = (i: number, val: string) => {
    const updated = [...incluye];
    updated[i] = val;
    setIncluye(updated);
  };

  const addNoIncluye = () => setNoIncluye([...noIncluye, '']);
  const removeNoIncluye = (i: number) => setNoIncluye(noIncluye.filter((_, idx) => idx !== i));
  const updateNoIncluye = (i: number, val: string) => {
    const updated = [...noIncluye];
    updated[i] = val;
    setNoIncluye(updated);
  };

  const quitarPasajeroActual = (pasajeroId: string) => {
    setPasajerosActuales((prev) => prev.filter((p) => p.pasajero_id !== pasajeroId || p.es_titular));
  };

  const agregarPasajeroFrecuente = (p: any) => {
    if (pasajerosActuales.some((a) => a.pasajero_id === p.id)) return;
    setPasajerosActuales((prev) => [
      ...prev,
      {
        pasajero_id: p.id,
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        documento: p.documento || '',
        es_titular: false,
      },
    ]);
  };

  const agregarPasajeroNuevo = () => {
    if (!nuevoPasajero.nombre.trim() || !nuevoPasajero.apellido.trim()) return;
    setPasajerosNuevos((prev) => [...prev, { ...nuevoPasajero }]);
    setNuevoPasajero({ nombre: '', apellido: '', documento: '', fecha_nacimiento: '', nacionalidad: 'Uruguay' });
    setShowNuevoPasajero(false);
  };

  const quitarPasajeroNuevo = (index: number) => {
    setPasajerosNuevos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        nombre_cotizacion: nombreCotizacion,
        destino_principal: destino,
        vuelos: vuelos.map((v, idx) => ({ ...v, orden: idx + 1 })),
        hospedajes: alojamientos,
        traslados: transfers,
        seguros: seguros,
        extras: extras,
        itinerario,
        incluye: incluye.filter(Boolean),
        no_incluye: noIncluye.filter(Boolean),
        politicas_cancelacion: politicas,
        precios: {
          moneda,
          vuelos: vuelosVal,
          hospedajes: hospedajesVal,
          traslados: trasladosVal,
          seguros: segurosVal,
          extras: extrasVal,
          subtotal: subtotalCalculado,
          impuestos: 0,
          total: totalCalculado,
        },
        pasajeros_ids: pasajerosActuales.map((p) => p.pasajero_id),
        pasajeros_nuevos: pasajerosNuevos,
        num_pasajeros: numPasajeros,
        costo_neto: subtotalCalculado,
        margen_agencia_porcentaje: 0,
        margen_agencia_monto: Number(margenMonto) || 0,
        comision_vendedor_porcentaje: 0,
        comision_vendedor_monto_estimado: 0,
        notas_internas: notasInternas,
        mostrar_desglose_pdf: mostrarDesglosePdf,
      };

      if (isAdmin && vendedorId) {
        payload.vendedor_id = vendedorId;
      }

      await api.put(`/cotizaciones/${cotizacionId}/manual`, payload);
      router.push(isAdmin ? `/admin/cotizaciones/${cotizacionId}` : `/cotizaciones/${cotizacionId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!cotizacion) {
    return <div className="text-center py-20 text-[var(--muted-foreground)]">Cotización no encontrada</div>;
  }

  const backUrl = isAdmin ? `/admin/cotizaciones/${cotizacionId}` : `/cotizaciones/${cotizacionId}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={backUrl} className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--border)] transition-all">
            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Editar Cotización</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{cotizacion.codigo}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>

      {/* General */}
      <Section title="Información General" icon={<FileText className="w-5 h-5 text-blue-400" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Nombre de la Cotización</label>
            <input
              type="text"
              value={nombreCotizacion}
              onChange={(e) => setNombreCotizacion(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              placeholder="Ej: Viaje a Madrid"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Destino Principal</label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              placeholder="Ej: Madrid, España"
            />
          </div>
          {isAdmin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Vendedor</label>
              <select
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              >
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nombre} {v.apellido}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Section>

      {/* Pasajeros */}
      <Section title={`Pasajeros (${numPasajeros})`} icon={<Users className="w-5 h-5 text-indigo-400" />}>
        <div className="space-y-4">
          {/* Vinculados actuales */}
          <div className="space-y-2">
            {pasajerosActuales.map((p) => (
              <div key={p.pasajero_id} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">{p.nombre} {p.apellido}</span>
                  {p.documento && <span className="text-xs text-[var(--muted-foreground)]">Doc: {p.documento}</span>}
                  {p.es_titular && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold">Titular</span>
                  )}
                </div>
                {!p.es_titular && (
                  <button type="button" onClick={() => quitarPasajeroActual(p.pasajero_id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {/* Nuevos (aún no guardados) */}
            {pasajerosNuevos.map((p, idx) => (
              <div key={`nuevo-${idx}`} className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">{p.nombre} {p.apellido}</span>
                  {p.documento && <span className="text-xs text-[var(--muted-foreground)]">Doc: {p.documento}</span>}
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">Nuevo</span>
                </div>
                <button type="button" onClick={() => quitarPasajeroNuevo(idx)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Agregar existente */}
          {pasajerosFrecuentes.filter((f: any) => !pasajerosActuales.some((a) => a.pasajero_id === f.id)).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Agregar pasajero del cliente</p>
              {pasajerosFrecuentes
                .filter((f: any) => !pasajerosActuales.some((a) => a.pasajero_id === f.id))
                .map((f: any) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => agregarPasajeroFrecuente(f)}
                    className="w-full flex items-center justify-between p-3 bg-[var(--muted)] hover:bg-[var(--border)] rounded-xl transition-all text-left"
                  >
                    <span className="text-sm text-[var(--foreground)]">{f.nombre} {f.apellido}</span>
                    <Plus className="w-4 h-4 text-emerald-400" />
                  </button>
                ))}
            </div>
          )}

          {/* Crear nuevo */}
          {showNuevoPasajero ? (
            <div className="p-4 bg-[var(--muted)] rounded-xl space-y-3 border border-[var(--border)]">
              <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Nuevo pasajero</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="Nombre *"
                  value={nuevoPasajero.nombre}
                  onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, nombre: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
                <input
                  placeholder="Apellido *"
                  value={nuevoPasajero.apellido}
                  onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, apellido: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
                <input
                  placeholder="Documento"
                  value={nuevoPasajero.documento}
                  onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, documento: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
                <input
                  type="date"
                  value={nuevoPasajero.fecha_nacimiento}
                  onChange={(e) => setNuevoPasajero({ ...nuevoPasajero, fecha_nacimiento: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={agregarPasajeroNuevo}
                  disabled={!nuevoPasajero.nombre.trim() || !nuevoPasajero.apellido.trim()}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 rounded-lg text-sm font-bold transition-all"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowNuevoPasajero(false)}
                  className="px-4 py-2 bg-[var(--background)] text-[var(--muted-foreground)] rounded-lg text-sm transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNuevoPasajero(true)}
              className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-all"
            >
              <Plus className="w-4 h-4" /> Crear pasajero nuevo
            </button>
          )}

          <p className="text-xs text-[var(--muted-foreground)]">
            El total se recalcula automáticamente: costo por persona × {numPasajeros} pasajero{numPasajeros !== 1 ? 's' : ''}.
          </p>
        </div>
      </Section>

      {/* Vuelos */}
      <Section title="Vuelos" icon={<Plane className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          {vuelos.map((v, idx) => (
            <div key={idx} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Vuelo {idx + 1}</span>
                <button onClick={() => removeVuelo(idx)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input placeholder="Aerolínea" value={v.aerolinea_nombre || ''} onChange={(e) => updateVuelo(idx, 'aerolinea_nombre', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Código IATA" value={v.aerolinea_codigo || ''} onChange={(e) => updateVuelo(idx, 'aerolinea_codigo', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="N° Vuelo" value={v.numero_vuelo || ''} onChange={(e) => updateVuelo(idx, 'numero_vuelo', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <select value={v.tipo_trayecto || 'ida'} onChange={(e) => updateVuelo(idx, 'tipo_trayecto', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none">
                  <option value="ida">Ida</option>
                  <option value="vuelta">Vuelta</option>
                </select>
                <input placeholder="Origen" value={v.origen_nombre || ''} onChange={(e) => updateVuelo(idx, 'origen_nombre', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Destino" value={v.destino_nombre || ''} onChange={(e) => updateVuelo(idx, 'destino_nombre', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input type="date" value={v.fecha_salida || ''} onChange={(e) => updateVuelo(idx, 'fecha_salida', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input type="time" value={v.hora_salida || ''} onChange={(e) => updateVuelo(idx, 'hora_salida', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
              </div>
            </div>
          ))}
          <button onClick={addVuelo} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-all">
            <Plus className="w-4 h-4" /> Agregar vuelo
          </button>
        </div>
      </Section>

      {/* Servicios del viaje */}
      <Section title="Servicios del viaje" icon={<Hotel className="w-5 h-5 text-purple-400" />}>
        <ServiciosStep
          alojamientos={alojamientos}
          transfers={transfers}
          seguros={seguros}
          extras={extras}
          moneda={moneda}
          onChange={({ alojamientos: a, transfers: t, seguros: s, extras: e }) => {
            setAlojamientos(a);
            setTransfers(t);
            setSeguros(s);
            setExtras(e);
          }}
        />
      </Section>

      {/* Itinerario */}
      <Section title="Itinerario y Servicios" icon={<MapPin className="w-5 h-5 text-orange-400" />}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Itinerario</label>
            <textarea
              value={itinerario}
              onChange={(e) => setItinerario(e.target.value)}
              rows={4}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500 resize-none"
              placeholder="Describe el itinerario día por día..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Incluye</label>
              {incluye.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input value={item} onChange={(e) => updateIncluye(i, e.target.value)} className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                  <button onClick={() => removeIncluye(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addIncluye} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium"><Plus className="w-4 h-4" /> Agregar</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">No Incluye</label>
              {noIncluye.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input value={item} onChange={(e) => updateNoIncluye(i, e.target.value)} className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                  <button onClick={() => removeNoIncluye(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addNoIncluye} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium"><Plus className="w-4 h-4" /> Agregar</button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Políticas de Cancelación</label>
            <textarea
              value={politicas}
              onChange={(e) => setPoliticas(e.target.value)}
              rows={3}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>
      </Section>

      {/* Precios */}
      <Section title="Precios" icon={<DollarSign className="w-5 h-5 text-green-400" />}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Moneda</label>
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value as 'USD' | 'UYU')}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="USD">USD</option>
              <option value="UYU">UYU</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <PriceInput label="Vuelos" value={vuelosVal} onChange={(v) => setDesgloseEdit((p) => ({ ...p, vuelos: v }))} />
            <PriceInput label="Hospedajes" value={hospedajesVal} onChange={(v) => setDesgloseEdit((p) => ({ ...p, hospedajes: v }))} />
            <PriceInput label="Transfers" value={trasladosVal} onChange={(v) => setDesgloseEdit((p) => ({ ...p, traslados: v }))} />
            <PriceInput label="Seguros" value={segurosVal} onChange={(v) => setDesgloseEdit((p) => ({ ...p, seguros: v }))} />
            <PriceInput label="Extras" value={extrasVal} onChange={(v) => setDesgloseEdit((p) => ({ ...p, extras: v }))} />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Valores por persona. Se calculan desde los servicios, pero podés editarlos manualmente.
          </p>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-[var(--muted)] rounded-xl">
            <input
              type="checkbox"
              checked={mostrarDesglosePdf}
              onChange={(e) => setMostrarDesglosePdf(e.target.checked)}
              className="w-5 h-5 rounded border-[var(--border)] text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Mostrar desglose de precios en PDF</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                El cliente verá vuelos, hospedajes, transfers, seguros y extras por separado.
              </p>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Comisión / margen interno</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={margenMonto || ''}
                onChange={(e) => setMargenMonto(Number(e.target.value))}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Monto interno para reportes. No se suma al total del cliente.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Notas internas</label>
            <textarea
              value={notasInternas}
              onChange={(e) => setNotasInternas(e.target.value)}
              rows={3}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500 resize-none"
              placeholder="Notas internas sobre comisión, condiciones especiales, etc. (no visible para el cliente)"
            />
          </div>

          <div className="glass-card p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase">Costo neto por persona</p>
              <p className="text-lg font-bold text-[var(--foreground)]">${formatCurrency(subtotalCalculado)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted-foreground)] uppercase">Total final</p>
              <p className="text-2xl font-black text-emerald-400">${formatCurrency(totalCalculado)}</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-bold text-[var(--foreground)]">{title}</h3>
        </div>
        <span className="text-[var(--muted-foreground)] text-sm">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function PriceInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">{label}</label>
      <input
        type="number"
        min={0}
        step="0.01"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
        className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
      />
    </div>
  );
}
