/**
 * Parser de PNR Amadeus - Versión robusta y completa
 * Convierte texto de Amadeus RP/Itinerary a estructura de vuelos, pasajeros y datos de reserva.
 * Soporta: múltiples formatos de hora (AM/PM, 24h), +1/+2 días, marketing codes,
 * líneas wrapping, códigos de vuelo de hasta 5 dígitos, pasajeros, agencia y localizador.
 */

import { getAirportByIATA, getAirlineByIATA } from './airports';

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
  estado_nombre: string;
  asientos: number;
  hora_salida: string; // HH:MM
  hora_llegada: string; // HH:MM
  fecha_llegada: string; // ISO format
  aeronave?: string;
  terminal?: string;
  equipaje?: string;
  notas?: string;
  operado_por?: string;
  marketing_codes?: string[];
  dias_adicionales?: number;
  precio_por_persona?: number;
}

export interface ParsedPassenger {
  numero: number;
  nombre: string;
  apellido: string;
  titulo?: string;
  tipo?: 'ADT' | 'CHD' | 'INF';
}

export interface ParsedAgency {
  telefono?: string;
  nombre?: string;
}

export interface ParsedRecordLocator {
  locator?: string;
  pnr?: string;
  issuing_airline?: string;
  issuing_date?: string;
  issuing_time?: string;
}

export interface ParseResult {
  success: boolean;
  flights: ParsedFlight[];
  passengers: ParsedPassenger[];
  agency?: ParsedAgency;
  recordLocator?: ParsedRecordLocator;
  errors: string[];
  rawLines: string[];
  debug?: any;
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
  'XL': 'Cancelled', 'RR': 'Waitlist', 'RQ': 'Request', 'SS': 'Sold',
  'SA': 'Space Available', 'SB': 'Space Available'
};

/**
 * Convierte hora AM/PM a formato 24h
 * Ej: "620P" -> "18:20", "950A" -> "09:50", "1425P" -> "14:25"
 */
function convertAmPmTo24h(timeStr: string): string | null {
  // Formato HMM A o HHMM A
  const match = timeStr.match(/^(\d{1,2})(\d{2})([AP])$/i);
  if (!match) return null;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  // Validar rango
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  if (ampm === 'P' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'A' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Convierte hora 24h (HHMM) a formato HH:MM
 */
function convert24hToStandard(timeStr: string): string | null {
  if (timeStr.length !== 4) return null;
  const hours = parseInt(timeStr.substring(0, 2));
  const minutes = parseInt(timeStr.substring(2, 4));

  // Validar rango
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parsea cualquier formato de hora
 */
function parseTime(timeStr: string): { time: string; isAmPm: boolean } | null {
  // Limpiar la hora (puede tener +1, +2 adjunto)
  const cleanTime = timeStr.replace(/\+\d+$/, '');

  // Intentar formato AM/PM (ej: 620P, 950A, 125P, 1425P, 1035A)
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
 * Valida si un string parece ser una hora válida
 */
function isValidTime(timeStr: string): boolean {
  const cleanTime = timeStr.replace(/\+\d+$/, '');
  return parseTime(cleanTime) !== null;
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
  // Si el mes es anterior al actual, asumimos el año siguiente
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
 * - Une líneas quebradas (marketing codes, notas)
 * - Normaliza espacios
 */
function normalizePNRText(text: string): string {
  // Reemplazar tabs por espacios
  let normalized = text.replace(/\t/g, ' ');

  // Reemplazar múltiples espacios con un solo espacio
  normalized = normalized.replace(/[ \t]+/g, ' ');

  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const merged: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Solo unir líneas que son claramente continuación de marketing codes.
    // Patrones de continuación:
    //  - "010 EK 3744 /KL 9445" (marketing codes, posiblemente partido)
    //  - "      42" o "     6" (números sueltos que completan un marketing code)
    const isMarketingContinuation =
      /^\d{3}\s+[A-Z]{2}\s+\d+/.test(line) || // "010 AA 1234"
      (/^\d{1,3}\s*$/.test(line) && merged.length > 0 && /\d{3}\s+[A-Z]{2}\s+\d+/.test(merged[merged.length - 1])); // "42" o "6" continuando marketing

    if (isMarketingContinuation && merged.length > 0) {
      merged[merged.length - 1] += ' ' + line.trim();
      continue;
    }

    merged.push(line);
  }

  return merged.join('\n');
}

/**
 * Detecta si una línea es un segmento de vuelo
 * Versión flexible que busca los componentes clave
 */
function isFlightLine(line: string): boolean {
  const clean = line.trim();

  // Debe tener fecha DDMMM
  const hasDate = /\d{1,2}[A-Z]{3}/.test(clean);
  // Debe tener aeropuertos (XXXYYY o XXX YYY)
  const hasAirports = /[A-Z]{6}/.test(clean) || /[A-Z]{3}\s+[A-Z]{3}/.test(clean);
  // Debe tener status GDS
  const hasStatus = /\b(HK|DK|NN|HL|HX|UC|UN|WL|KL|TK|XL|RR|RQ|SS|SA|SB)\d*\b/.test(clean);
  // Debe tener dos horas (formato 24h o AM/PM)
  const hasTimes = /(\d{4}|\d{1,2}\d{2}[AP])\s+(\d{4}|\d{1,2}\d{2}[AP])/.test(clean);

  return hasDate && hasAirports && hasStatus && hasTimes;
}

/**
 * Extrae la fecha de salida del segmento
 */
function extractDate(line: string): { dateStr: string; index: number } | null {
  const match = line.match(/(\d{1,2}[A-Z]{3})/);
  if (match) {
    return { dateStr: match[1].toUpperCase(), index: match.index || 0 };
  }
  return null;
}

/**
 * Extrae origen y destino del segmento
 * Busca 6 letras consecutivas o XXX YYY separados por espacios
 */
function extractAirports(line: string): { origen: string; destino: string } | null {
  // Intentar patrón 6 letras consecutivas
  const match6 = line.match(/\b([A-Z]{6})\b/);
  if (match6) {
    const airports = match6[1];
    return { origen: airports.substring(0, 3), destino: airports.substring(3, 6) };
  }

  // Intentar patrón XXX YYY
  const matchSeparated = line.match(/\b([A-Z]{3})\s+([A-Z]{3})\b/);
  if (matchSeparated) {
    return { origen: matchSeparated[1], destino: matchSeparated[2] };
  }

  return null;
}

/**
 * Extrae status y asientos
 */
function extractStatus(line: string): { estado: string; asientos: number } | null {
  const match = line.match(/\b(HK|DK|NN|HL|HX|UC|UN|WL|KL|TK|XL|RR|RQ|SS|SA|SB)(\d*)\b/i);
  if (match) {
    return {
      estado: match[1].toUpperCase(),
      asientos: match[2] ? parseInt(match[2]) : 1
    };
  }
  return null;
}

/**
 * Extrae horas de salida y llegada de la línea
 */
function extractTimes(line: string): { salida: string; llegada: string; diasOffset: number } | null {
  // Buscar un par de horas consecutivas (salida y llegada).
  // Soporta: "0250 0530", "2100 0510+1", "620P 950A+1", "1425P 550A+1"
  const pairMatch = line.match(/(\d{4}|\d{1,2}\d{2}[AP])(\+\d+)?\s+(\d{4}|\d{1,2}\d{2}[AP])(\+\d+)?/i);
  if (pairMatch) {
    const horaSalidaRaw = pairMatch[1] + (pairMatch[2] || '');
    const horaLlegadaRaw = pairMatch[3] + (pairMatch[4] || '');

    const salidaParsed = parseTime(horaSalidaRaw);
    const llegadaParsed = parseTime(horaLlegadaRaw);

    if (salidaParsed && llegadaParsed) {
      return {
        salida: salidaParsed.time,
        llegada: llegadaParsed.time,
        diasOffset: extractDaysOffset(horaLlegadaRaw)
      };
    }
  }

  // Fallback: buscar las dos últimas horas válidas en la línea
  const timeMatches = line.match(/(\d{4}|\d{1,2}\d{2}[AP])(\+\d+)?/gi);
  if (!timeMatches) return null;

  const validTimes = timeMatches.filter(isValidTime);
  if (validTimes.length < 2) return null;

  const horaSalidaRaw = validTimes[validTimes.length - 2];
  const horaLlegadaRaw = validTimes[validTimes.length - 1];

  const salidaParsed = parseTime(horaSalidaRaw);
  const llegadaParsed = parseTime(horaLlegadaRaw);

  if (!salidaParsed || !llegadaParsed) return null;

  return {
    salida: salidaParsed.time,
    llegada: llegadaParsed.time,
    diasOffset: extractDaysOffset(horaLlegadaRaw)
  };
}

/**
 * Extrae aerolínea y número de vuelo
 */
function extractFlightNumber(line: string): { aerolinea: string; numero: string } | null {
  // Código IATA de aerolínea: 2 caracteres alfanuméricos con al menos una letra,
  // seguido de número de vuelo de 1 a 5 dígitos y clase de servicio.
  // Puede tener espacio o no entre aerolínea y número.
  const patterns = [
    // 2 chars airline, optional space, flight number, space, class
    /\b([A-Z]\d|\d[A-Z]|[A-Z]{2})\s?(\d{1,5})\s+[A-Z]\b/,
    // 3 chars airline (rare/non-standard)
    /\b([A-Z0-9]{3})\s?(\d{1,5})\s+[A-Z]\b/,
  ];

  for (const pattern of patterns) {
    const matches = line.match(pattern);
    if (matches) {
      return { aerolinea: matches[1].toUpperCase(), numero: matches[2] };
    }
  }
  return null;
}

/**
 * Extrae clase de servicio (letra antes de la fecha)
 */
function extractClass(line: string): string | null {
  const dateMatch = extractDate(line);
  if (!dateMatch) return null;

  // Buscar una letra mayúscula justo antes de la fecha
  const beforeDate = line.substring(0, dateMatch.index).trim();
  const classMatch = beforeDate.match(/\b([A-Z])\s*$/);
  if (classMatch) return classMatch[1];

  return null;
}

/**
 * Extrae número de línea del segmento
 */
function extractLineNumber(line: string): number {
  const match = line.match(/^(\s*\d+)\s+/);
  if (match) {
    return parseInt(match[1].trim());
  }
  return 0;
}

/**
 * Extrae aeronave de la línea (última parte)
 */
function extractAircraft(line: string): string | undefined {
  // En Amadeus la aeronave suele aparecer después de "E 0" o "E" al final de la línea
  // Ej: "... 20APR  E  0 738 M" o "... 20APR  E  0 738" o "... 744 E0M"

  const patterns = [
    /\bE\s+0\s+([A-Z0-9]{2,4})(?:\s+[A-Z])?$/,
    /\bE\s+0\s+([A-Z0-9]{2,4})/,
    /\bE\s+([A-Z0-9]{2,4})\s*$/,
    /\b(\d{3})\s+M$/,
    /\b(\d{3})\s+E\d{2}M$/,
    /\b([7A-Z]\d{2,3}|\d{3})\s*[A-Z]?$/,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

/**
 * Intenta parsear una línea como vuelo usando extracción por componentes
 */
function parseFlightLine(line: string, year?: number): ParsedFlight | null {
  try {
    if (!isFlightLine(line)) return null;

    const linea = extractLineNumber(line);
    const flightNumber = extractFlightNumber(line);
    if (!flightNumber) return null;

    const clase = extractClass(line) || 'Y';
    const dateInfo = extractDate(line);
    if (!dateInfo) return null;

    const airports = extractAirports(line);
    if (!airports) return null;

    const statusInfo = extractStatus(line);
    if (!statusInfo) return null;

    const times = extractTimes(line);
    if (!times) return null;

    const fecha_salida_date = parseAmadeusDate(dateInfo.dateStr, year);
    if (!fecha_salida_date) return null;

    const diasOffset = times.diasOffset;
    const fecha_llegada_date = new Date(fecha_salida_date);
    fecha_llegada_date.setDate(fecha_llegada_date.getDate() + diasOffset);

    const origen = getAirportByIATA(airports.origen);
    const destino = getAirportByIATA(airports.destino);
    const aerolinea = getAirlineByIATA(flightNumber.aerolinea);

    return {
      linea,
      aerolinea_codigo: flightNumber.aerolinea,
      aerolinea_nombre: aerolinea?.name || flightNumber.aerolinea,
      numero_vuelo: flightNumber.numero,
      clase_codigo: clase,
      fecha_salida: formatISODate(fecha_salida_date),
      fecha_salida_original: dateInfo.dateStr,
      dia_salida: fecha_salida_date.getDay(),
      origen_codigo: airports.origen,
      origen_nombre: origen?.name || airports.origen,
      origen_ciudad: origen?.city || airports.origen,
      destino_codigo: airports.destino,
      destino_nombre: destino?.name || airports.destino,
      destino_ciudad: destino?.city || airports.destino,
      estado_codigo: statusInfo.estado,
      estado_nombre: STATUS_CODES[statusInfo.estado] || statusInfo.estado,
      asientos: statusInfo.asientos,
      hora_salida: times.salida,
      hora_llegada: times.llegada,
      fecha_llegada: formatISODate(fecha_llegada_date),
      dias_adicionales: diasOffset,
      aeronave: extractAircraft(line),
    };
  } catch (error) {
    console.error('Error parseando línea de vuelo:', error);
    return null;
  }
}

/**
 * Parsea pasajeros de una línea
 * Soporta: "1.APELLIDO/NOMBRE TITULO   2.APELLIDO2/NOMBRE2 TITULO2"
 */
function parsePassengerLine(line: string): ParsedPassenger[] {
  const passengers: ParsedPassenger[] = [];

  // Dividir por "N." donde N es número
  const parts = line.split(/(\d+\.)/).filter(p => p.trim().length > 0);

  let currentNum = 0;
  for (const part of parts) {
    if (/^\d+\.$/.test(part.trim())) {
      currentNum = parseInt(part.trim());
      continue;
    }

    if (currentNum === 0) continue;

    const clean = part.trim();
    // Formato: APELLIDO/NOMBRE TITULO
    const match = clean.match(/^([^/]+)\/(.+?)\s+(MR|MRS|MS|MISS|CHD|INF|ADT)$/i);
    if (match) {
      passengers.push({
        numero: currentNum,
        apellido: match[1].trim(),
        nombre: match[2].trim(),
        titulo: match[3].toUpperCase(),
        tipo: match[3].toUpperCase() === 'CHD' ? 'CHD' : match[3].toUpperCase() === 'INF' ? 'INF' : 'ADT'
      });
    }
  }

  return passengers;
}

/**
 * Parsea línea de agencia
 * Ej: "4 AP MEL +61300888888 - TRAVELS VACATIONS - A"
 */
function parseAgencyLine(line: string): ParsedAgency | null {
  const match = line.match(/^\d+\s+AP\s+(.+?)\s+-\s+(.+?)(?:\s+-\s+.*)?$/i);
  if (match) {
    return {
      telefono: match[1].trim(),
      nombre: match[2].trim()
    };
  }

  // Formato alternativo
  const altMatch = line.match(/^\d+\s+AP\s+(.+)$/i);
  if (altMatch) {
    return { telefono: altMatch[1].trim() };
  }

  return null;
}

/**
 * Parsea línea RP / Record Locator
 * Ej: "RP/ABCB23129/ABCB23129            EK/RM  26SEP16/1852Z   2B82OU"
 */
function parseRecordLocatorLine(line: string): ParsedRecordLocator | null {
  const match = line.match(/^RP\/([A-Z0-9]{5,10})\//);
  if (!match) return null;

  const locator = match[1];

  // Buscar información de ticketing
  const ticketingMatch = line.match(/\s+([A-Z]{2})\/[A-Z]{2}\s+(\d{2}[A-Z]{3}\d{2,4})\/(\d{4}Z?)\s+([A-Z0-9]+)/);

  return {
    locator,
    pnr: locator,
    issuing_airline: ticketingMatch ? ticketingMatch[1] : undefined,
    issuing_date: ticketingMatch ? ticketingMatch[2] : undefined,
    issuing_time: ticketingMatch ? ticketingMatch[3] : undefined,
  };
}

/**
 * Determina si una línea es una nota/marketing/operated by asociada a un vuelo
 */
function isFlightContinuationLine(line: string): boolean {
  const clean = line.trim();
  if (isFlightLine(clean)) return false;
  if (clean.startsWith('RP/')) return false;
  if (/^\d+\./.test(clean)) return false; // Pasajero
  if (/^\d+\s+AP\s/.test(clean)) return false; // Agencia
  if (clean.startsWith('SSR ')) return false;
  if (clean.startsWith('OSI ')) return false;
  if (clean.startsWith('TK ')) return false;
  if (clean.startsWith('FE ')) return false;
  if (clean.startsWith('FV ')) return false;
  if (clean.startsWith('RM ')) return false;
  if (clean.startsWith('RC ')) return false;
  if (clean === 'END') return false;

  return true;
}

/**
 * Procesa líneas de continuación de un vuelo (marketing codes, operated by, notas)
 */
function processFlightContinuation(flight: ParsedFlight, lines: string[], startIndex: number): number {
  let i = startIndex;
  const notasPartes: string[] = [];
  const marketingCodes: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    if (!isFlightContinuationLine(line)) break;

    const clean = line.trim();

    // Marketing codes: "010 EK 3744 /KL 9445" o "010 AA 7746 /AF 6332 /AM 8069"
    if (clean.startsWith('010 ') || /^\d{3}\s+[A-Z]{2}\s+\d+/.test(clean)) {
      const codes = clean.match(/[A-Z0-9]{2}\s+\d{1,4}/g);
      if (codes) {
        marketingCodes.push(...codes.map(c => c.replace(/\s+/g, '')));
      }
      i++;
      continue;
    }

    // Operated by
    const operatedMatch = clean.match(/OPERATED BY\s+(.+)/i);
    if (operatedMatch) {
      flight.operado_por = operatedMatch[1].trim();
      i++;
      continue;
    }

    // Notas útiles
    if (clean.includes('SEE RTSVC') ||
        clean.includes('AIRCRAFT') ||
        clean.includes('EQUIP') ||
        clean.includes('TERMINAL') ||
        clean.includes('BAGGAGE') ||
        clean.includes('CLASS') ||
        clean.includes('OPERATED BY') ||
        clean.length > 0) {
      notasPartes.push(clean);
    }

    i++;
  }

  if (notasPartes.length > 0) {
    flight.notas = notasPartes.join(' | ');
  }
  if (marketingCodes.length > 0) {
    flight.marketing_codes = marketingCodes;
  }

  return i;
}

/**
 * Función principal: Parsea texto completo de Amadeus
 */
export function parseAmadeusPNR(text: string): ParseResult {
  const result: ParseResult = {
    success: false,
    flights: [],
    passengers: [],
    errors: [],
    rawLines: [],
  };

  if (!text || text.trim().length === 0) {
    result.errors.push('El texto está vacío');
    return result;
  }

  const normalized = normalizePNRText(text);
  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  result.rawLines = lines;

  const year = new Date().getFullYear();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Record Locator
    if (line.startsWith('RP/')) {
      const recordLocator = parseRecordLocatorLine(line);
      if (recordLocator) result.recordLocator = recordLocator;
      i++;
      continue;
    }

    // Pasajeros
    if (/^\d+\.\S+/.test(line)) {
      const passengers = parsePassengerLine(line);
      if (passengers.length > 0) {
        result.passengers.push(...passengers);
      }
      i++;
      continue;
    }

    // Agencia
    if (/^\d+\s+AP\s/.test(line)) {
      const agency = parseAgencyLine(line);
      if (agency) result.agency = agency;
      i++;
      continue;
    }

    // Saltar líneas de ticketing, SSR, OSI, etc.
    if (line.startsWith('SSR ') ||
        line.startsWith('OSI ') ||
        line.startsWith('TK ') ||
        line.startsWith('FE ') ||
        line.startsWith('FV ') ||
        line.startsWith('RM ') ||
        line.startsWith('RC ') ||
        line === 'END') {
      i++;
      continue;
    }

    // Intentar parsear como vuelo
    if (isFlightLine(line)) {
      const flight = parseFlightLine(line, year);

      if (flight) {
        // Procesar líneas de continuación
        const nextIndex = processFlightContinuation(flight, lines, i + 1);
        result.flights.push(flight);
        i = nextIndex;
        continue;
      } else {
        result.errors.push(`Línea ${i + 1} parece ser vuelo pero no se pudo parsear: ${line.substring(0, 80)}`);
      }
    }

    i++;
  }

  result.success = result.flights.length > 0;

  if (result.flights.length === 0 && result.errors.length === 0) {
    result.errors.push('No se encontraron segmentos de vuelo válidos. Asegúrate de pegar el texto completo del PNR.');
  }

  return result;
}

/**
 * Valida si el texto parece ser un PNR de Amadeus
 */
export function isValidAmadeusText(text: string): boolean {
  if (!text) return false;

  const hasFlightPattern = /\d+\s+[A-Z0-9]{2,3}\s*\d{1,5}\s+[A-Z]\s+\d{1,2}[A-Z]{3}/.test(text);
  const hasRPLine = text.includes('RP/');
  const hasStatusCode = /\b(HK|DK|NN|HL|HX|UC|UN|SS|SA)\d*\b/.test(text);

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
