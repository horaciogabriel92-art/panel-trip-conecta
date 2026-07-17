'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import AirlineLogo from '@/components/flights/AirlineLogo';
import ServiciosStep from './servicios/ServiciosStep';
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

interface Precios {
  moneda: string;
  vuelos: number;
  hospedajes: number;
  traslados: number;
  seguros: number;
  extras: number;
  subtotal: number;
  impuestos: number;
  total: number;
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
  const [precios, setPrecios] = useState<Precios>({
    moneda: 'USD', vuelos: 0, hospedajes: 0, traslados: 0, seguros: 0, extras: 0, subtotal: 0, impuestos: 0, total: 0
  });
  const [pasajerosIds, setPasajerosIds] = useState<string[]>([]);
  const [margenMonto, setMargenMonto] = useState<number>(0);
  const [notasInternas, setNotasInternas] = useState<string>('');
  const [mostrarDesglosePdf, setMostrarDesglosePdf] = useState<boolean>(true);

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

        setPrecios({
          moneda: data.precio_moneda || 'USD',
          vuelos: Number(pd.precio_vuelos) || 0,
          hospedajes: Number(pd.precio_hospedajes) || 0,
          traslados: Number(pd.precio_traslados) || 0,
          seguros: Number(pd.precio_seguros) || 0,
          extras: Number(pd.precio_extras) || 0,
          subtotal: Number(pd.precio_subtotal) || Number(data.precio_total) || 0,
          impuestos: Number(pd.precio_impuestos) || 0,
          total: Number(data.precio_total) || 0,
        });

        setMargenMonto(Number(data.margen_agencia_monto) || 0);
        setNotasInternas(data.notas_internas || '');
        setMostrarDesglosePdf(data.mostrar_desglose_pdf !== false);

        setPasajerosIds((data.pasajeros || []).map((p: any) => p.id || p.pasajero_id));
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

  useEffect(() => {
    const v = Number(precios.vuelos) || 0;
    const h = Number(precios.hospedajes) || 0;
    const t = Number(precios.traslados) || 0;
    const s = Number(precios.seguros) || 0;
    const e = Number(precios.extras) || 0;
    const i = Number(precios.impuestos) || 0;
    const sub = v + h + t + s + e;
    const total = sub + i;
    setPrecios((prev) => ({ ...prev, subtotal: sub, total }));
  }, [precios.vuelos, precios.hospedajes, precios.traslados, precios.seguros, precios.extras, precios.impuestos]);

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
          moneda: precios.moneda,
          vuelos: Number(precios.vuelos) || 0,
          hospedajes: Number(precios.hospedajes) || 0,
          traslados: Number(precios.traslados) || 0,
          seguros: Number(precios.seguros) || 0,
          extras: Number(precios.extras) || 0,
          subtotal: Number(precios.subtotal) || 0,
          impuestos: Number(precios.impuestos) || 0,
          total: Number(precios.total) || 0,
        },
        pasajeros_ids: pasajerosIds,
        costo_neto: Number(precios.subtotal) || 0,
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
          moneda={precios.moneda as 'USD' | 'UYU'}
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
              value={precios.moneda}
              onChange={(e) => setPrecios({ ...precios, moneda: e.target.value })}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="USD">USD</option>
              <option value="UYU">UYU</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <PriceInput label="Vuelos" value={precios.vuelos} onChange={(v) => setPrecios({ ...precios, vuelos: v })} />
            <PriceInput label="Hospedajes" value={precios.hospedajes} onChange={(v) => setPrecios({ ...precios, hospedajes: v })} />
            <PriceInput label="Transfers" value={precios.traslados} onChange={(v) => setPrecios({ ...precios, traslados: v })} />
            <PriceInput label="Seguros" value={precios.seguros} onChange={(v) => setPrecios({ ...precios, seguros: v })} />
            <PriceInput label="Extras" value={precios.extras} onChange={(v) => setPrecios({ ...precios, extras: v })} />
            <PriceInput label="Impuestos" value={precios.impuestos} onChange={(v) => setPrecios({ ...precios, impuestos: v })} />
          </div>

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
              <p className="text-xs text-[var(--muted-foreground)] uppercase">Subtotal</p>
              <p className="text-lg font-bold text-[var(--foreground)]">${formatCurrency(precios.subtotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted-foreground)] uppercase">Total</p>
              <p className="text-2xl font-black text-emerald-400">${formatCurrency(precios.total)}</p>
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
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500"
      />
    </div>
  );
}
