'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import AirlineLogo from '@/components/flights/AirlineLogo';
import {
  ArrowLeft, Save, Plus, Trash2, Plane, Hotel, FileText,
  DollarSign, Users, Calendar, MapPin, CheckCircle, Loader2
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

interface Hospedaje {
  id?: string;
  nombre_hotel?: string;
  link_hotel?: string;
  ciudad?: string;
  pais?: string;
  fecha_checkin?: string;
  fecha_checkout?: string;
  noches?: number;
  tipo_habitacion?: string;
  regimen?: string;
  precio_noche?: number;
  precio_total?: number;
  moneda?: string;
  notas?: string;
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
  const [hospedajes, setHospedajes] = useState<Hospedaje[]>([]);
  const [itinerario, setItinerario] = useState('');
  const [incluye, setIncluye] = useState<string[]>([]);
  const [noIncluye, setNoIncluye] = useState<string[]>([]);
  const [politicas, setPoliticas] = useState('');
  const [precios, setPrecios] = useState<Precios>({
    moneda: 'USD', vuelos: 0, hospedajes: 0, extras: 0, subtotal: 0, impuestos: 0, total: 0
  });
  const [pasajerosIds, setPasajerosIds] = useState<string[]>([]);

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
        setHospedajes(data.hospedajes || []);

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
          extras: Number(pd.precio_extras) || 0,
          subtotal: Number(pd.precio_subtotal) || Number(data.precio_total) || 0,
          impuestos: Number(pd.precio_impuestos) || 0,
          total: Number(data.precio_total) || 0,
        });

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
    const e = Number(precios.extras) || 0;
    const i = Number(precios.impuestos) || 0;
    const sub = v + h + e;
    const total = sub + i;
    setPrecios((prev) => ({ ...prev, subtotal: sub, total }));
  }, [precios.vuelos, precios.hospedajes, precios.extras, precios.impuestos]);

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

  const addHospedaje = () => {
    setHospedajes([...hospedajes, { moneda: 'USD' }]);
  };

  const removeHospedaje = (index: number) => {
    setHospedajes(hospedajes.filter((_, i) => i !== index));
  };

  const updateHospedaje = (index: number, field: keyof Hospedaje, value: any) => {
    const updated = [...hospedajes];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-calc noches si checkin y checkout
    if ((field === 'fecha_checkin' || field === 'fecha_checkout') && updated[index].fecha_checkin && updated[index].fecha_checkout) {
      const checkin = new Date(updated[index].fecha_checkin!);
      const checkout = new Date(updated[index].fecha_checkout!);
      const diff = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
      updated[index].noches = diff > 0 ? diff : 0;
    }
    setHospedajes(updated);
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
        hospedajes,
        itinerario,
        incluye: incluye.filter(Boolean),
        no_incluye: noIncluye.filter(Boolean),
        politicas_cancelacion: politicas,
        precios: {
          moneda: precios.moneda,
          vuelos: Number(precios.vuelos) || 0,
          hospedajes: Number(precios.hospedajes) || 0,
          extras: Number(precios.extras) || 0,
          subtotal: Number(precios.subtotal) || 0,
          impuestos: Number(precios.impuestos) || 0,
          total: Number(precios.total) || 0,
        },
        pasajeros_ids: pasajerosIds,
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

      {/* Hospedajes */}
      <Section title="Hospedajes" icon={<Hotel className="w-5 h-5 text-purple-400" />}>
        <div className="space-y-3">
          {hospedajes.map((h, idx) => (
            <div key={idx} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Hotel {idx + 1}</span>
                <button onClick={() => removeHospedaje(idx)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input placeholder="Nombre del hotel" value={h.nombre_hotel || ''} onChange={(e) => updateHospedaje(idx, 'nombre_hotel', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Ciudad" value={h.ciudad || ''} onChange={(e) => updateHospedaje(idx, 'ciudad', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input type="date" placeholder="Check-in" value={h.fecha_checkin || ''} onChange={(e) => updateHospedaje(idx, 'fecha_checkin', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input type="date" placeholder="Check-out" value={h.fecha_checkout || ''} onChange={(e) => updateHospedaje(idx, 'fecha_checkout', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Noches" type="number" value={h.noches || ''} onChange={(e) => updateHospedaje(idx, 'noches', Number(e.target.value))} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Tipo habitación" value={h.tipo_habitacion || ''} onChange={(e) => updateHospedaje(idx, 'tipo_habitacion', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Régimen" value={h.regimen || ''} onChange={(e) => updateHospedaje(idx, 'regimen', e.target.value)} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
                <input placeholder="Precio total" type="number" value={h.precio_total || ''} onChange={(e) => updateHospedaje(idx, 'precio_total', Number(e.target.value))} className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
              </div>
            </div>
          ))}
          <button onClick={addHospedaje} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-all">
            <Plus className="w-4 h-4" /> Agregar hospedaje
          </button>
        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PriceInput label="Vuelos" value={precios.vuelos} onChange={(v) => setPrecios({ ...precios, vuelos: v })} />
            <PriceInput label="Hospedajes" value={precios.hospedajes} onChange={(v) => setPrecios({ ...precios, hospedajes: v })} />
            <PriceInput label="Extras" value={precios.extras} onChange={(v) => setPrecios({ ...precios, extras: v })} />
            <PriceInput label="Impuestos" value={precios.impuestos} onChange={(v) => setPrecios({ ...precios, impuestos: v })} />
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
