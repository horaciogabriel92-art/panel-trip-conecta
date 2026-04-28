import api from './api';

export interface FiltrosReporte {
  fechaDesde: string;
  fechaHasta: string;
  vendedorId: string;
}

export interface PipelineResumen {
  total_cotizaciones: number;
  enviadas: number;
  vendidas: number;
  perdidas: number;
  nuevas: number;
  tasa_conversion: number;
  ticket_promedio_cotizado: number;
  ticket_promedio_vendido: number;
}

export interface PipelineMes {
  mes: string;
  total: number;
  enviadas: number;
  vendidas: number;
  perdidas: number;
  nuevas: number;
  monto: number;
}

export interface PipelineVendedor {
  vendedor_id: string;
  vendedor_nombre: string;
  total: number;
  enviadas: number;
  vendidas: number;
  perdidas: number;
  nuevas: number;
  monto: number;
}

export interface PipelineReport {
  resumen: PipelineResumen;
  por_mes: PipelineMes[];
  por_vendedor: PipelineVendedor[];
}

export interface CobranzaResumen {
  total_vendido: number;
  total_cobrado: number;
  saldo_pendiente: number;
  pagos_iniciales: number;
  pagos_adicionales: number;
}

export interface MedioPago {
  medio: string;
  monto: number;
}

export interface VentaPendiente {
  id: string;
  codigo: string;
  cliente_nombre: string;
  precio_total: number;
  pagado: number;
  pendiente: number;
  dias_atraso: number;
  fecha_creacion: string;
}

export interface EvolucionMensual {
  mes: string;
  vendido: number;
  cobrado: number;
}

export interface CobranzaReport {
  resumen: CobranzaResumen;
  medios_pago: MedioPago[];
  ventas_pendientes: VentaPendiente[];
  evolucion_mensual: EvolucionMensual[];
}

export interface VendedorRanking {
  vendedor_id: string;
  vendedor_nombre: string;
  vendedor_email: string;
  activo: boolean;
  cotizaciones: number;
  ventas: number;
  conversion_pct: number;
  total_vendido: number;
  comisiones_generadas: number;
  comisiones_pagadas: number;
  comisiones_pendientes: number;
}

export interface VendedoresReport {
  vendedores: VendedorRanking[];
  totales: {
    total_cotizaciones: number;
    total_ventas: number;
    total_vendido: number;
    total_comisiones_generadas: number;
    total_comisiones_pagadas: number;
  };
}

export interface DestinoTop {
  destino: string;
  cantidad: number;
  monto: number;
}

export interface PaqueteTop {
  paquete: string;
  cantidad: number;
  monto: number;
}

export interface AerolineaTop {
  codigo: string;
  nombre: string;
  cantidad: number;
  monto: number;
}

export interface HospedajeCiudad {
  ciudad: string;
  noches: number;
  monto: number;
  cantidad: number;
}

export interface ProductosReport {
  destinos: DestinoTop[];
  paquetes: PaqueteTop[];
  aerolineas: AerolineaTop[];
  hospedajes_ciudad: HospedajeCiudad[];
}

export interface NuevosClientesMes {
  mes: string;
  cantidad: number;
}

export interface FuenteLead {
  fuente: string;
  total: number;
  con_venta: number;
  conversion_pct: number;
}

export interface ClienteDormido {
  id: string;
  nombre: string;
  fecha_ultima_interaccion: string | null;
  dias_inactivo: number;
  ultima_cotizacion: string | null;
  estado: string;
}

export interface DistribucionEstado {
  estado: string;
  cantidad: number;
}

export interface CRMReport {
  nuevos_clientes_mes: NuevosClientesMes[];
  fuentes_lead: FuenteLead[];
  clientes_dormidos: ClienteDormido[];
  distribucion_estados: DistribucionEstado[];
  resumen: {
    nuevos_clientes_periodo: number;
    total_clientes: number;
    clientes_dormidos_count: number;
  };
}

function mapFiltros(filtros: FiltrosReporte) {
  return {
    fecha_desde: filtros.fechaDesde,
    fecha_hasta: filtros.fechaHasta,
    vendedor_id: filtros.vendedorId || undefined,
  };
}

export const reportesAPI = {
  getPipeline: async (filtros: FiltrosReporte): Promise<PipelineReport> => {
    const response = await api.get('/reportes/pipeline', { params: mapFiltros(filtros) });
    return response.data;
  },
  getCobranza: async (filtros: FiltrosReporte): Promise<CobranzaReport> => {
    const response = await api.get('/reportes/cobranza', { params: mapFiltros(filtros) });
    return response.data;
  },
  getVendedores: async (filtros: FiltrosReporte): Promise<VendedoresReport> => {
    const response = await api.get('/reportes/vendedores', { params: mapFiltros(filtros) });
    return response.data;
  },
  getProductos: async (filtros: FiltrosReporte): Promise<ProductosReport> => {
    const response = await api.get('/reportes/productos', { params: mapFiltros(filtros) });
    return response.data;
  },
  getCRM: async (filtros: FiltrosReporte): Promise<CRMReport> => {
    const response = await api.get('/reportes/crm', { params: mapFiltros(filtros) });
    return response.data;
  },
};

export default reportesAPI;
