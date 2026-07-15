export type MonedaCotizacion =
  | 'USD'   // Dólares estadounidenses
  | 'UYU'   // Pesos uruguayos
  | 'ARS'   // Pesos argentinos
  | 'BRL'   // Reales brasileños
  | 'CLP'   // Pesos chilenos
  | 'COP'   // Pesos colombianos
  | 'PEN'   // Soles peruanos
  | 'MXN'   // Pesos mexicanos
  | 'EUR';  // Euros

export type TipoAlojamiento =
  | 'Hotel'
  | 'Apartamento'
  | 'Hostal'
  | 'Resort'
  | 'Posada'
  | 'Cabaña'
  | 'Otro';

export type TipoHabitacion =
  | 'simple'
  | 'doble'
  | 'triple'
  | 'cuadruple'
  | 'suite';

export type RegimenHabitacion =
  | 'solo_alojamiento'
  | 'desayuno'
  | 'media_pension'
  | 'todo_incluido';

export interface AlojamientoCotizacion {
  id?: string;
  nombre_alojamiento: string;
  tipo_alojamiento: TipoAlojamiento;
  link_hotel?: string;
  ciudad: string;
  pais?: string;
  direccion?: string;
  fecha_checkin: string;
  fecha_checkout: string;
  noches?: number;
  tipo_habitacion?: TipoHabitacion;
  regimen?: RegimenHabitacion;
  precio_noche?: number;
  precio_total?: number;
  precio_por_persona?: number;
  moneda?: MonedaCotizacion;
  es_opcion?: boolean;
  seleccionado?: boolean;
  notas?: string;
}

export interface TransferCotizacion {
  id?: string;
  nombre: string;
  origen?: string;
  destino?: string;
  fecha?: string;
  hora?: string;
  precio_por_persona?: number;
  moneda?: MonedaCotizacion;
  notas?: string;
  orden?: number;
}

export interface SeguroCotizacion {
  id?: string;
  compania: string;
  tipo_cobertura?: string;
  cobertura_detalle?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  precio_por_persona?: number;
  moneda?: MonedaCotizacion;
  notas?: string;
}

export interface ExtraCotizacion {
  id?: string;
  nombre: string;
  descripcion?: string;
  fecha?: string;
  precio_por_persona?: number;
  moneda?: MonedaCotizacion;
  incluido?: boolean;
  orden?: number;
}

export interface PreciosCotizacion {
  moneda: MonedaCotizacion;
  vuelos: number;
  hospedajes: number;
  traslados: number;
  seguros: number;
  extras: number;
  subtotal: number;
  impuestos: number;
  total: number;
  precio_unitario?: number;
}

export interface ServiciosCotizacion {
  alojamientos: AlojamientoCotizacion[];
  transfers: TransferCotizacion[];
  seguros: SeguroCotizacion[];
  extras: ExtraCotizacion[];
}
