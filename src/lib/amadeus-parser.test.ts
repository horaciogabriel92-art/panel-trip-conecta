import { describe, it, expect } from 'vitest';
import {
  parseAmadeusPNR,
  isValidAmadeusText,
  getFlightSummary,
  ParsedFlight,
} from './amadeus-parser';

describe('Amadeus PNR Parser', () => {
  it('detecta texto vacío', () => {
    const result = parseAmadeusPNR('');
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('detecta texto que no es un PNR', () => {
    const result = parseAmadeusPNR('Esto no es un PNR de ningún GDS');
    expect(result.success).toBe(false);
  });

  it('detecta PNR Amadeus válido', () => {
    const text = `RP/DZOUY2100/
  1  G37683 Y 20APR 1 MVDGIG DK1  0250 0530  20APR  E  0 738 M`;
    expect(isValidAmadeusText(text)).toBe(true);
  });

  describe('formatos de vuelo', () => {
    it('parsea formato G3 con 5 dígitos y marketing codes', () => {
      const text = `RP/DZOUY2100/
  1  G37683 Y 20APR 1 MVDGIG DK1  0250 0530  20APR  E  0 738 M
     010 EK 3744 /KL 9445
     SEE RTSVC
  2  G31886 Y 20APR 1 GIGSSA DK1  0640 0840  20APR  E  0 738
     010 AD 3080 /AR 7471 /AV 2613 /CM 3530 /EK 3701 /KL 9258
     SEE RTSVC
  3  G31697 Y 27APR 1 SSAGRU DK1  0420 0705  27APR  E  0 7M8
     010 AF 1949 /AM 8103 /AR 7601 /CM 3749 /DT 6693 /SA 7894 /TP
      42
     6
     010 UX 2674
     SEE RTSVC
  4  G37630 Y 27APR 1 GRUMVD DK1  0930 1215  27APR  E  0 738 M
     010 AA 7746 /AF 6332 /AM 8069 /EK 3733 /KL 9402 /TK 9478
     SEE RTSVC`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights).toHaveLength(4);

      const vuelo1 = result.flights[0];
      expect(vuelo1.aerolinea_codigo).toBe('G3');
      expect(vuelo1.numero_vuelo).toBe('7683');
      expect(vuelo1.origen_codigo).toBe('MVD');
      expect(vuelo1.destino_codigo).toBe('GIG');
      expect(vuelo1.hora_salida).toBe('02:50');
      expect(vuelo1.hora_llegada).toBe('05:30');
      expect(vuelo1.fecha_salida).toMatch(/\d{4}-04-20/);
      expect(vuelo1.fecha_llegada).toMatch(/\d{4}-04-20/);
      expect(vuelo1.clase_codigo).toBe('Y');
      expect(vuelo1.estado_codigo).toBe('DK');
      expect(vuelo1.asientos).toBe(1);
      expect(vuelo1.aeronave).toBe('738');

      const vuelo4 = result.flights[3];
      expect(vuelo4.aerolinea_codigo).toBe('G3');
      expect(vuelo4.numero_vuelo).toBe('7630');
      expect(vuelo4.origen_codigo).toBe('GRU');
      expect(vuelo4.destino_codigo).toBe('MVD');
    });

    it('parsea formato con AM/PM y +1', () => {
      const text = `RP/ABCB23129/ABCB23129
  1.JOHNSON/BRIAN MR
  2  UA 978 E 18JUL 4 GRUIAH HK1       1  2100 0510+1 *1A/E*
  3  UA1239 E 19JUL 5 IAHLAX HK1       C  0620 0750   *1A/E*
  4  BA 190 Q 14JUN 3 AUSLHR HK2          620P 950A+1 *1A/E*
  5  BA 206 Y 10JUN 2 MIALHR NN15         450P 635A+1 744 E0M`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights.length).toBeGreaterThanOrEqual(4);

      const ba190 = result.flights.find(f => f.numero_vuelo === '190');
      expect(ba190).toBeDefined();
      expect(ba190?.hora_salida).toBe('18:20');
      expect(ba190?.hora_llegada).toBe('09:50');
      expect(ba190?.dias_adicionales).toBe(1);

      const ba206 = result.flights.find(f => f.numero_vuelo === '206');
      expect(ba206).toBeDefined();
      expect(ba206?.hora_salida).toBe('16:50');
      expect(ba206?.hora_llegada).toBe('06:35');
      expect(ba206?.dias_adicionales).toBe(1);
    });

    it('parsea formato compacto sin espacio entre aerolínea y número', () => {
      const text = `RP/TEST123
  1  AF7700 R 07AUG 3 CONNCE HK1  725A 855A  *1A/E*
  2  AF711 R 16AUG 5 NCBCCD HK1  710A 845A  *1A/E*
  3  AF012 Q 16AUG 5 CDGJKT HK1  1035A 1235P  *1A/E*`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights).toHaveLength(3);

      expect(result.flights[0].aerolinea_codigo).toBe('AF');
      expect(result.flights[0].numero_vuelo).toBe('7700');
      expect(result.flights[0].hora_salida).toBe('07:25');
      expect(result.flights[0].hora_llegada).toBe('08:55');

      expect(result.flights[2].hora_salida).toBe('10:35');
      expect(result.flights[2].hora_llegada).toBe('12:35');
    });

    it('parsea formato sin día de la semana', () => {
      const text = `RP/TEST123
  2  LA 533  Y 20NOV JFKSCL HK1  2015 0545+1 *E*`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights).toHaveLength(1);

      const vuelo = result.flights[0];
      expect(vuelo.aerolinea_codigo).toBe('LA');
      expect(vuelo.numero_vuelo).toBe('533');
      expect(vuelo.origen_codigo).toBe('JFK');
      expect(vuelo.destino_codigo).toBe('SCL');
      expect(vuelo.hora_salida).toBe('20:15');
      expect(vuelo.hora_llegada).toBe('05:45');
      expect(vuelo.dias_adicionales).toBe(1);
    });

    it('parsea formato con fecha de llegada explícita en línea', () => {
      const text = `RP/TEST123
  2  AF 023 T 06AUG 2 JTKCDG HK1  1425P 550A+1 *1A/E*`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights).toHaveLength(1);

      const vuelo = result.flights[0];
      expect(vuelo.hora_salida).toBe('14:25');
      expect(vuelo.hora_llegada).toBe('05:50');
      expect(vuelo.dias_adicionales).toBe(1);
    });

    it('parsea vuelo operado por otra aerolínea', () => {
      const text = `RP/TEST123
  2  LH 1234 Y 12DEC 4 FRAEZE HK1  1000 2230  12DEC  E  0 744
     OPERATED BY AIR DOLOMITI`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights).toHaveLength(1);

      const vuelo = result.flights[0];
      expect(vuelo.operado_por).toContain('AIR DOLOMITI');
    });

    it('parsea múltiples pasajeros en una línea', () => {
      const text = `RP/ABCB12115/ABCB12115
  1.SILVA/MATEUS MR   2.SILVA/MARIO MR   3.SILVA/ANA MRS
  4  SA 223 G 15OCT 2 GRUJNB HK3       2  1800 0750+1 *1A/E*
  5  SA 222 L 23OCT 3 JNBGRU HK3       B  1040 1700   *1A/E*`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.passengers).toHaveLength(3);
      expect(result.passengers[0].apellido).toBe('SILVA');
      expect(result.passengers[0].nombre).toBe('MATEUS');
      expect(result.passengers[0].titulo).toBe('MR');
    });

    it('parsea líneas de agencia (AP)', () => {
      const text = `RP/TEST123
  1.PEREZ/JUAN MR
  2  AR 1234 Y 10NOV 5 EZESCL HK1  2100 0325  11NOV  E  *1A/E*
  4 AP MEL +61300888888 - TRAVELS VACATIONS - A`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.agency?.nombre).toContain('TRAVELS VACATIONS');
      expect(result.agency?.telefono).toContain('+61300888888');
    });

    it('parsea record locator (RP)', () => {
      const text = `RP/ABCB23129/ABCB23129            EK/RM  26SEP16/1852Z   2B82OU
  1.PEREZ/JUAN MR
  2  EK 123 Y 10NOV 5 MVDMAD HK1  2100 0325  11NOV  E  *1A/E*`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.recordLocator?.locator).toBe('ABCB23129');
      expect(result.recordLocator?.issuing_airline).toBe('EK');
      expect(result.recordLocator?.issuing_date).toBe('26SEP16');
    });

    it('ignora líneas SSR y OSI', () => {
      const text = `RP/TEST123
  1.PEREZ/JUAN MR
  2  AR 1234 Y 10NOV 5 EZESCL HK1  2100 0325  11NOV  E  *1A/E*
  3 SSR DOCS AR HK1 P/UY/123456/M/15JAN85/PEREZ/JUAN
  4 OSI AR CTC MOB +59899123456`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      expect(result.flights).toHaveLength(1);
    });

    it('resuelve nombres de aeropuertos y aerolíneas desconocidos', () => {
      const text = `RP/TEST123
  1  Z8 123 Y 20NOV 5 LPBMVD HK1  1400 1600 *1A/E*`;

      const result = parseAmadeusPNR(text);
      expect(result.success).toBe(true);
      const vuelo = result.flights[0];
      expect(vuelo.origen_codigo).toBe('LPB');
      expect(vuelo.destino_codigo).toBe('MVD');
      expect(vuelo.aerolinea_codigo).toBe('Z8');
    });
  });

  describe('utilidades', () => {
    it('genera resumen de vuelos', () => {
      const flights: ParsedFlight[] = [
        {
          linea: 1,
          aerolinea_codigo: 'AR',
          aerolinea_nombre: 'Aerolíneas Argentinas',
          numero_vuelo: '1234',
          clase_codigo: 'Y',
          fecha_salida: '2025-11-10',
          fecha_salida_original: '10NOV',
          dia_salida: 1,
          origen_codigo: 'EZE',
          origen_nombre: 'Buenos Aires',
          origen_ciudad: 'Buenos Aires',
          destino_codigo: 'MAD',
          destino_nombre: 'Madrid',
          destino_ciudad: 'Madrid',
          estado_codigo: 'HK',
          estado_nombre: 'Confirmed',
          asientos: 1,
          hora_salida: '21:00',
          hora_llegada: '03:25',
          fecha_llegada: '2025-11-11',
        } as ParsedFlight,
      ];

      const summary = getFlightSummary(flights);
      expect(summary).toContain('Buenos Aires');
      expect(summary).toContain('Madrid');
      expect(summary).toContain('AR1234');
    });
  });
});
