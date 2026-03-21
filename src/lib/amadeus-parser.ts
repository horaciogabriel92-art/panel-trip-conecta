/**
 * Parser de PNR Amadeus
 * Convierte texto de Amadeus RP/Itinerary a estructura de vuelos
 */

import { getAirportByIATA, getAirlineByIATA, getAirportDisplay, getAirlineDisplay } from './airports';

// Interfaces
export interface ParsedFlight {
  linea: number;
  aerolinea_codigo: string;
  aerolinea_nombre: string;
  numero_vuelo: string;
  clase_codigo: string;
  fecha_salida: string; // ISO format: YYYY-MM-DD
  fecha_salida_original: string; // Original: 16MAY
  dia_salida: number;
  origen_codigo: string;
  origen_nombre: string;
  origen_ciudad: string;
  destino_codigo: string;
  destino_nombre: string;
  destino_ciudad: string;
  estado_codigo: string;
  asientos: number;
  hora_salida: string; // HHMM
  hora_llegada: string; // HHMM
  fecha_llegada: string; // ISO format
  aeronave?: string;
  terminal?: string;
  equipaje?: string;
  notas?: string;
}

export interface ParseResult {
  success: boolean;
  flights: ParsedFlight[];
  errors: string[];
  rawLines: string[];
}

// Regex para línea de vuelo Amadeus
// Ejemplo: "  1  UX 046 T 16MAY 6 MVDMAD DK1  1220 0510  17MAY  E  0 789 M"
const FLIGHT_LINE_REGEX = /^\s*(\d+)\s+([A-Z0-9]{2})\s+(\d{1,4})\s+([A-Z])\s+(\d{1,2}[A-Z]{3})\s+(\d)\s+([A-Z]{6})\s+([A-Z]{2}\d+)\s+(\d{4})\s+(\d{4})\s+(\d{1,2}[A-Z]{3})(?:\s+([A-Z]))?(?:\s+(\d))?\s*(\d{3}|\d{2}[A-Z]\d|\d[A-Z]\d{2})?\s*([A-Z])?/i;

// Regex alternativo más flexible para diferentes formatos
const FLIGHT_LINE_REGEX_ALT = /^\s*(\d+)\s+([A-Z0-9]{2})\s+(\d{1,4})\s+([A-Z])\s+(\d{1,2}[A-Z]{3})\s+(\d)\s+([A-Z]{6})\s+([A-Z]{2}\d+)\s+(\d{4})\s+(\d{4})/i;

// Mapeo de meses
const MONTHS: Record<string, number> = {
  'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
  'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
};

// Mapeo de códigos de estado
const STATUS_CODES: Record<string, string> = {
  'HK': 'Confirmed',
  'HL': 'Waitlist',
  'HN': 'Need',
  'HX': 'Cancelled',
  'DK': 'Confirmed',
  'NN': 'Need',
  'UC': 'Unable to Confirm',
  'UN': 'Unable',
  'WL': 'Waitlist',
  'KL': 'Confirmed from Waitlist',
  'TK': 'Ticketed',
  'XL': 'Cancelled'
};

/**
 * Parsea una fecha en formato Amadeus (16MAY) a objeto Date
 */
function parseAmadeusDate(dateStr: string, year?: number): Date | null {
  const match = dateStr.match(/^(\d{1,2})([A-Z]{3})$/i);
  if (!match) return null;
  
  const day = parseInt(match[1]);
  const month = MONTHS[match[2].toUpperCase()];
  
  if (month === undefined) return null;
  
  // Si no se proporciona año, usar el año actual
  // Si el mes ya pasó, asumir año siguiente
  const currentYear = year || new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  let flightYear = currentYear;
  if (month < currentMonth) {
    flightYear = currentYear + 1;
  }
  
  return new Date(flightYear, month, day);
}

/**
 * Formatea fecha a ISO (YYYY-MM-DD)
 */
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formatea hora Amadeus (1220) a formato legible (12:20)
 */
function formatTime(timeStr: string): string {
  if (timeStr.length !== 4) return timeStr;
  const hours = timeStr.substring(0, 2);
  const minutes = timeStr.substring(2, 4);
  return `${hours}:${minutes}`;
}

/**
 * Detecta si una línea es un segmento de vuelo válido
 */
function isFlightLine(line: string): boolean {
  return FLIGHT_LINE_REGEX_ALT.test(line);
}

/**
 * Parsea una línea individual de vuelo
 */
function parseFlightLine(line: string, year?: number): ParsedFlight | null {
  const match = line.match(FLIGHT_LINE_REGEX) || line.match(FLIGHT_LINE_REGEX_ALT);
  
  if (!match) return null;
  
  try {
    const linea = parseInt(match[1]);
    const aerolinea_codigo = match[2].toUpperCase();
    const numero_vuelo = match[3];
    const clase_codigo = match[4].toUpperCase();
    const fecha_salida_str = match[5].toUpperCase();
    const dia_salida = parseInt(match[6]);
    const origen_destino = match[7].toUpperCase();
    const estado_codigo = match[8].substring(0, 2).toUpperCase();
    const asientos = parseInt(match[8].substring(2)) || 1;
    const hora_salida = match[9];
    const hora_llegada = match[10];
    const fecha_llegada_str = match[11]?.toUpperCase();
    
    // Extraer origen y destino (primeros 3 y últimos 3 caracteres)
    const origen_codigo = origen_destino.substring(0, 3);
    const destino_codigo = origen_destino.substring(3, 6);
    
    // Parsear fechas
    const fecha_salida_date = parseAmadeusDate(fecha_salida_str, year);
    const fecha_llegada_date = fecha_llegada_str 
      ? parseAmadeusDate(fecha_llegada_str, year)
      : fecha_salida_date;
    
    if (!fecha_salida_date) {
      throw new Error(`Fecha inválida: ${fecha_salida_str}`);
    }
    
    // Obtener info de aeropuertos y aerolíneas
    const origen = getAirportByIATA(origen_codigo);
    const destino = getAirportByIATA(destino_codigo);
    const aerolinea = getAirlineByIATA(aerolinea_codigo);
    
    // Extraer información adicional si existe (aeronave, terminal, etc.)
    const aeronave = match[13] || undefined;
    const equipaje = match[14] || undefined;
    
    return {
      linea,
      aerolinea_codigo,
      aerolinea_nombre: aerolinea?.name || aerolinea_codigo,
      numero_vuelo,
      clase_codigo,
      fecha_salida: formatISODate(fecha_salida_date),
      fecha_salida_original: fecha_salida_str,
      dia_salida,
      origen_codigo,
      origen_nombre: origen?.name || origen_codigo,
      origen_ciudad: origen?.city || origen_codigo,
      destino_codigo,
      destino_nombre: destino?.name || destino_codigo,
      destino_ciudad: destino?.city || destino_codigo,
      estado_codigo,
      asientos,
      hora_salida: formatTime(hora_salida),
      hora_llegada: formatTime(hora_llegada),
      fecha_llegada: fecha_llegada_date ? formatISODate(fecha_llegada_date) : formatISODate(fecha_salida_date),
      aeronave,
      equipaje,
    };
  } catch (error) {
    console.error('Error parseando línea de vuelo:', error);
    return null;
  }
}

/**
 * Función principal: Parsea texto completo de Amadeus
 */
export function parseAmadeusPNR(text: string): ParseResult {
  const result: ParseResult = {
    success: false,
    flights: [],
    errors: [],
    rawLines: []
  };
  
  if (!text || text.trim().length === 0) {
    result.errors.push('El texto está vacío');
    return result;
  }
  
  // Limpiar el texto
  const cleanText = text.trim();
  
  // Detectar año (usar año actual o extraer del texto si tiene fecha completa)
  const year = new Date().getFullYear();
  
  // Dividir en líneas y procesar cada una
  const lines = cleanText.split('\n');
  result.rawLines = lines.map(l => l.trim()).filter(l => l.length > 0);
  
  // Procesar cada línea buscando segmentos de vuelo
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Saltar líneas vacías o headers
    if (!line || line.startsWith('RP/') || line.startsWith('---')) {
      continue;
    }
    
    // Intentar parsear como línea de vuelo
    if (isFlightLine(line)) {
      const flight = parseFlightLine(line, year);
      if (flight) {
        // Buscar notas adicionales en la siguiente línea (SEE RTSVC, etc.)
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !isFlightLine(nextLine) && !nextLine.startsWith('RP/')) {
          flight.notas = nextLine;
          i++; // Saltar la línea de notas
        }
        
        result.flights.push(flight);
      } else {
        result.errors.push(`No se pudo parsear línea ${i + 1}: ${line.substring(0, 50)}...`);
      }
    }
  }
  
  result.success = result.flights.length > 0;
  
  if (result.flights.length === 0 && result.errors.length === 0) {
    result.errors.push('No se encontraron segmentos de vuelo válidos en el texto');
  }
  
  return result;
}

/**
 * Valida si el texto parece ser un PNR de Amadeus
 */
export function isValidAmadeusText(text: string): boolean {
  if (!text) return false;
  
  // Buscar patrones típicos de Amadeus
  const hasFlightPattern = /\d{1,2}\s+[A-Z0-9]{2}\s+\d{1,4}\s+[A-Z]\s+\d{1,2}[A-Z]{3}/.test(text);
  const hasRPLine = text.includes('RP/');
  
  return hasFlightPattern || hasRPLine;
}

/**
 * Obtiene un resumen de los vuelos parseados
 */
export function getFlightSummary(flights: ParsedFlight[]): string {
  if (flights.length === 0) return 'No hay vuelos';
  
  const segments = flights.map(f => 
    `${f.origen_ciudad} → ${f.destino_ciudad} (${f.aerolinea_codigo}${f.numero_vuelo})`
  );
  
  return segments.join(', ');
}

/**
 * Calcula duración del vuelo en minutos
 */
export function calculateFlightDuration(flight: ParsedFlight): number | null {
  try {
    const [depHours, depMinutes] = flight.hora_salida.split(':').map(Number);
    const [arrHours, arrMinutes] = flight.hora_llegada.split(':').map(Number);
    
    let depTotal = depHours * 60 + depMinutes;
    let arrTotal = arrHours * 60 + arrMinutes;
    
    // Si la llegada es al día siguiente
    if (flight.fecha_llegada !== flight.fecha_salida) {
      arrTotal += 24 * 60;
    }
    
    return arrTotal - depTotal;
  } catch {
    return null;
  }
}

/**
 * Formatea duración en horas y minutos
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Exportar todo
export default {
  parseAmadeusPNR,
  isValidAmadeusText,
  getFlightSummary,
  calculateFlightDuration,
  formatDuration
};
