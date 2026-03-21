/**
 * Parser de PNR Amadeus - Versión Ultra-Robusta
 * Convierte texto de Amadeus RP/Itinerary a estructura de vuelos
 * Soporta múltiples formatos: AM/PM, 24h, espacios variables, códigos marketing
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
  hora_salida: string; // HH:MM
  hora_llegada: string; // HH:MM
  fecha_llegada: string; // ISO format
  aeronave?: string;
  terminal?: string;
  equipaje?: string;
  notas?: string;
  dias_adicionales?: number; // +1, +2 en la llegada
}

export interface ParseResult {
  success: boolean;
  flights: ParsedFlight[];
  errors: string[];
  rawLines: string[];
  debug?: any; // Para debugging
}

// Mapeo de meses
const MONTHS: Record<string, number> = {
  'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
  'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
};

// Status codes
const STATUS_CODES: Record<string, string> = {
  'HK': 'Confirmed', 'HL': 'Waitlist', 'HN': 'Need', 'HX': 'Cancelled',
  'DK': 'Confirmed', 'NN': 'Need', 'UC': 'Unable to Confirm', 'UN': 'Unable',
  'WL': 'Waitlist', 'KL': 'Confirmed from Waitlist', 'TK': 'Ticketed',
  'XL': 'Cancelled', 'RR': 'Waitlist', 'RQ': 'Request'
};

/**
 * Convierte hora AM/PM a formato 24h
 * Ej: "620P" -> "18:20", "950A" -> "09:50"
 */
function convertAmPmTo24h(timeStr: string): string | null {
  const match = timeStr.match(/^(\d{1,2})(\d{2})([AP])$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'P' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'A' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Convierte hora 24h (HHMM) a formato HH:MM
 */
function convert24hToStandard(timeStr: string): string | null {
  if (timeStr.length !== 4) return null;
  const hours = timeStr.substring(0, 2);
  const minutes = timeStr.substring(2, 4);
  return `${hours}:${minutes}`;
}

/**
 * Parsea cualquier formato de hora
 */
function parseTime(timeStr: string): { time: string; isAmPm: boolean } | null {
  // Limpiar la hora (puede tener +1, +2 adjunto)
  const cleanTime = timeStr.replace(/\+\d+$/, '');
  
  // Intentar formato AM/PM (ej: 620P, 950A, 125P)
  if (/^\d{1,2}\d{2}[AP]$/i.test(cleanTime)) {
    const converted = convertAmPmTo24h(cleanTime);
    if (converted) return { time: converted, isAmPm: true };
  }
  
  // Intentar formato 24h (ej: 2100, 0250)
  if (/^\d{4}$/.test(cleanTime)) {
    const converted = convert24hToStandard(cleanTime);
    if (converted) return { time: converted, isAmPm: false };
  }
  
  return null;
}

/**
 * Extrae días adicionales de la hora de llegada (+1, +2)
 */
function extractDaysOffset(timeStr: string): number {
  const match = timeStr.match(/\+(\d+)$/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Parsea fecha Amadeus a Date
 */
function parseAmadeusDate(dateStr: string, year?: number): Date | null {
  const match = dateStr.match(/^(\d{1,2})([A-Z]{3})$/i);
  if (!match) return null;
  
  const day = parseInt(match[1]);
  const month = MONTHS[match[2].toUpperCase()];
  
  if (month === undefined) return null;
  
  const currentYear = year || new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  let flightYear = currentYear;
  if (month < currentMonth) {
    flightYear = currentYear + 1;
  }
  
  return new Date(flightYear, month, day);
}

function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Normaliza el texto del PNR antes de parsear
 * - Une líneas quebradas de marketing codes
 * - Normaliza espacios
 */
function normalizePNRText(text: string): string {
  // Reemplazar múltiples espacios con un solo espacio
  let normalized = text.replace(/\s+/g, ' ');
  
  // Pero preservar saltos de línea entre segmentos de vuelo
  normalized = text.replace(/[ \t]+/g, ' ');
  
  return normalized;
}

/**
 * PATRÓN 1: Formato estándar con espacio entre aerolínea y número
 * Ej: "  2  UA 978 E 18JUL 4 GRUIAH HK1       1  2100 0510+1 *1A/E*"
 * Ej: "  3  BA 190 Q 14JUN 3 AUSLHR HK2          620P 950A+1 *1A/E*"
 */
const PATTERN_STANDARD = /^(\s*\d+)\s+([A-Z0-9]{2})\s+(\d{1,5})\s+([A-Z])\s+(\d{1,2}[A-Z]{3})\s+(\d)\s+([A-Z]{6})\s+([A-Z]{2}\d+)\s+(\d{1,2}\d{2}[AP]?|\d{4})\s+(\d{1,2}\d{2}[AP]?|\d{4})(?:\+(\d+))?/i;

/**
 * PATRÓN 2: Formato compacto (sin espacio entre aerolínea y número)
 * Ej: "  4  UA1239 E 19JUL 5 IAHLAX HK1       C  0620 0750   *1A/E*"
 * Ej: "G37683 Y 20APR 1 MVDGIG DK1  0250 0530  20APR  E  0 738 M"
 */
const PATTERN_COMPACT = /^(\s*\d+)?\s*([A-Z0-9]{2})(\d{1,5})\s+([A-Z])\s+(\d{1,2}[A-Z]{3})\s+(\d)\s+([A-Z]{6})\s+([A-Z]{2}\d+)\s+(\d{1,2}\d{2}[AP]?|\d{4})\s+(\d{1,2}\d{2}[AP]?|\d{4})/i;

/**
 * PATRÓN 3: Formato alternativo con campos adicionales
 * Ej: "  2  AF 023 T 06AUG 2 JTKCDG HK1  1425P 550A+1 *1A/E*"
 */
const PATTERN_ALT = /^(\s*\d+)\s+([A-Z0-9]{2})\s+(\d{1,5})\s+([A-Z])\s+(\d{1,2}[A-Z]{3})\s+(\d)\s+([A-Z]{6})\s+([A-Z]{2}\d{1,3})\s+(\d{1,2}\d{2}[AP]?|\d{4})\s+(\d{1,2}\d{2}[AP]?|\d{4})(?:\+(\d+))?/i;

/**
 * Detecta si una línea es un segmento de vuelo
 */
function isFlightLine(line: string): boolean {
  // Debe comenzar con número de línea o código de aerolínea
  // y contener elementos clave: fecha, aeropuertos, horas
  
  // Limpiar la línea
  const clean = line.trim();
  
  // Debe tener al menos: número/aerolínea, clase, fecha, origen-destino, status, 2 horas
  const hasDate = /\d{1,2}[A-Z]{3}/.test(clean);
  const hasAirports = /[A-Z]{6}/.test(clean);
  const hasStatus = /\s(HK|DK|NN|HL|HX|UC|UN|WL|KL|TK|XL|RR|RQ)\d*/.test(clean);
  const hasTimes = /(\d{4}|\d{1,2}\d{2}[AP])\s+(\d{4}|\d{1,2}\d{2}[AP])/.test(clean);
  
  return hasDate && hasAirports && hasStatus && hasTimes;
}

/**
 * Intenta parsear una línea con múltiples patrones
 */
function parseFlightLineWithPatterns(line: string, year?: number): ParsedFlight | null {
  const patterns = [
    { name: 'STANDARD', regex: PATTERN_STANDARD },
    { name: 'COMPACT', regex: PATTERN_COMPACT },
    { name: 'ALT', regex: PATTERN_ALT }
  ];
  
  for (const { name, regex } of patterns) {
    const match = line.match(regex);
    if (match) {
      console.log(`✅ Patrón ${name} matched:`, match.slice(0, 10));
      const result = buildFlightFromMatch(match, line, year);
      if (result) return result;
    }
  }
  
  return null;
}

/**
 * Construye objeto flight desde match de regex
 */
function buildFlightFromMatch(match: RegExpMatchArray, originalLine: string, year?: number): ParsedFlight | null {
  try {
    // Determinar índices según el patrón
    // Patrón STANDARD y ALT: 1=linea, 2=aerolinea, 3=vuelo, 4=clase, 5=fecha, 6=dia, 7=origen-destino, 8=status, 9=hora_salida, 10=hora_llegada
    // Patrón COMPACT: puede no tener línea al inicio
    
    let idx = 1;
    const linea = parseInt(match[idx++]);
    const aerolinea_codigo = match[idx++].toUpperCase();
    const numero_vuelo = match[idx++];
    const clase_codigo = match[idx++].toUpperCase();
    const fecha_salida_str = match[idx++].toUpperCase();
    const dia_salida = parseInt(match[idx++]);
    const origen_destino = match[idx++].toUpperCase();
    const status_full = match[idx++];
    const hora_salida_raw = match[idx++];
    const hora_llegada_raw = match[idx++];
    const dias_adicionales = match[idx] ? parseInt(match[idx]) : 0;
    
    // Extraer status y asientos
    const status_match = status_full.match(/^([A-Z]{2})(\d+)?/i);
    const estado_codigo = status_match ? status_match[1].toUpperCase() : 'HK';
    const asientos = status_match && status_match[2] ? parseInt(status_match[2]) : 1;
    
    // Extraer origen y destino
    const origen_codigo = origen_destino.substring(0, 3);
    const destino_codigo = origen_destino.substring(3, 6);
    
    // Parsear horas
    const hora_salida_parsed = parseTime(hora_salida_raw);
    const hora_llegada_parsed = parseTime(hora_llegada_raw);
    
    if (!hora_salida_parsed || !hora_llegada_parsed) {
      throw new Error(`No se pudieron parsear las horas: ${hora_salida_raw}, ${hora_llegada_raw}`);
    }
    
    // Parsear fechas
    const fecha_salida_date = parseAmadeusDate(fecha_salida_str, year);
    if (!fecha_salida_date) {
      throw new Error(`Fecha inválida: ${fecha_salida_str}`);
    }
    
    // Calcular fecha de llegada (considerando +1, +2)
    const diasOffset = dias_adicionales || extractDaysOffset(hora_llegada_raw);
    const fecha_llegada_date = new Date(fecha_salida_date);
    fecha_llegada_date.setDate(fecha_llegada_date.getDate() + diasOffset);
    
    // Obtener info de aeropuertos y aerolíneas
    const origen = getAirportByIATA(origen_codigo);
    const destino = getAirportByIATA(destino_codigo);
    const aerolinea = getAirlineByIATA(aerolinea_codigo);
    
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
      hora_salida: hora_salida_parsed.time,
      hora_llegada: hora_llegada_parsed.time,
      fecha_llegada: formatISODate(fecha_llegada_date),
      dias_adicionales: diasOffset,
    };
  } catch (error) {
    console.error('Error construyendo flight:', error);
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
    rawLines: [],
    debug: { patterns: [] }
  };
  
  if (!text || text.trim().length === 0) {
    result.errors.push('El texto está vacío');
    return result;
  }
  
  const year = new Date().getFullYear();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  result.rawLines = lines;
  
  console.log('🛫 Parseando PNR con', lines.length, 'líneas');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Saltar líneas que no son vuelos
    if (!line || 
        line.startsWith('RP/') || 
        line.startsWith('---') ||
        line.startsWith('1.') || // Nombres de pasajeros
        line.startsWith('AP ') || // Teléfonos
        line.startsWith('TK ') || // Ticketing
        line.startsWith('SSR ') ||
        line.startsWith('OSI ') ||
        line.startsWith('FE ') ||
        line.startsWith('FV ') ||
        line.startsWith('RM ') ||
        line.startsWith('RC ') ||
        line.startsWith('END') ||
        line.startsWith('  ')) { // Líneas de nombres con indentación
      i++;
      continue;
    }
    
    // Intentar parsear como vuelo
    if (isFlightLine(line)) {
      const flight = parseFlightLineWithPatterns(line, year);
      
      if (flight) {
        // Buscar notas en líneas siguientes
        let j = i + 1;
        const notasPartes: string[] = [];
        
        while (j < lines.length) {
          const nextLine = lines[j];
          
          // Si es otra línea de vuelo o RP/, terminar
          if (isFlightLine(nextLine) || nextLine.startsWith('RP/')) {
            break;
          }
          
          // Saltar códigos de marketing
          if (/^\d{3}\s+[A-Z]{2}/.test(nextLine) || 
              /\/(AM|AR|AF|KL|EK|AA|UA|BA|LH|AF|DL)\s+\d+/.test(nextLine)) {
            j++;
            continue;
          }
          
          // Capturar notas útiles
          if (nextLine.includes('SEE RTSVC') || 
              nextLine.includes('OPERATED BY') ||
              nextLine.includes('AIRCRAFT') ||
              (!isFlightLine(nextLine) && !nextLine.match(/^\d{3}\s/))) {
            notasPartes.push(nextLine.trim());
          }
          
          j++;
        }
        
        if (notasPartes.length > 0) {
          flight.notas = notasPartes.join(' | ');
        }
        
        result.flights.push(flight);
        i = j;
        continue;
      } else {
        result.errors.push(`Línea ${i + 1} parece ser vuelo pero no se pudo parsear: ${line.substring(0, 60)}`);
      }
    }
    
    i++;
  }
  
  result.success = result.flights.length > 0;
  
  if (result.flights.length === 0 && result.errors.length === 0) {
    result.errors.push('No se encontraron segmentos de vuelo válidos. Asegúrate de pegar el texto completo del PNR.');
  }
  
  console.log('✅ Parseo completado:', result.flights.length, 'vuelos encontrados');
  return result;
}

/**
 * Valida si el texto parece ser un PNR de Amadeus
 */
export function isValidAmadeusText(text: string): boolean {
  if (!text) return false;
  
  // Buscar patrones típicos
  const hasFlightPattern = /\d+\s+[A-Z0-9]{2}\s*\d{1,5}\s+[A-Z]\s+\d{1,2}[A-Z]{3}/.test(text);
  const hasRPLine = text.includes('RP/');
  const hasStatusCode = /\s(HK|DK|NN|HL|HX|UC|UN)\d*/.test(text);
  
  return hasFlightPattern || hasRPLine || hasStatusCode;
}

/**
 * Obtiene resumen de vuelos
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
    if (flight.dias_adicionales && flight.dias_adicionales > 0) {
      arrTotal += flight.dias_adicionales * 24 * 60;
    } else if (flight.fecha_llegada !== flight.fecha_salida) {
      arrTotal += 24 * 60;
    }
    
    return arrTotal - depTotal;
  } catch {
    return null;
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default {
  parseAmadeusPNR,
  isValidAmadeusText,
  getFlightSummary,
  calculateFlightDuration,
  formatDuration
};
