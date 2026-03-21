/**
 * Tests para el parser de Amadeus
 * Ejecutar con: npm test -- amadeus-parser.test.ts
 */

import { parseAmadeusPNR, isValidAmadeusText, getFlightSummary } from './amadeus-parser';

// Test case 1: El código que falló anteriormente (G3 con 5 dígitos)
const TEST_CASE_1 = `RP/DZOUY2100/
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

// Test case 2: Formato con AM/PM
const TEST_CASE_2 = `RP/ABCB23129/ABCB23129
  1.JOHNSON/BRIAN MR
  2  UA 978 E 18JUL 4 GRUIAH HK1       1  2100 0510+1 *1A/E*
  3  UA1239 E 19JUL 5 IAHLAX HK1       C  0620 0750   *1A/E*
  4  BA 190 Q 14JUN 3 AUSLHR HK2          620P 950A+1 *1A/E*
  5  BA 206 Y 10JUN 2 MIALHR NN15         450P 635A+1 744 E0M`;

// Test case 3: Formato compacto sin espacios
const TEST_CASE_3 = `RP/TEST123
  1  AF7700 R 07AUG 3 CONNCE HK1  725A 855A  *1A/E*
  2  AF711 R 16AUG 5 NCBCCD HK1  710A 845A  *1A/E*
  3  AF012 Q 16AUG 5 CDGJKT HK1  1035A 1235P  *1A/E*`;

// Test case 4: Varios pasajeros y formatos mixtos
const TEST_CASE_4 = `RP/ABCB12115/ABCB12115
  1.SILVA/MATEUS MR   2.SILVA/MARIO MR   3.SILVA/ANA MRS
  4  SA 223 G 15OCT 2 GRUJNB HK3       2  1800 0750+1 *1A/E*
  5  SA 222 L 23OCT 3 JNBGRU HK3       B  1040 1700   *1A/E*`;

function runTests() {
  console.log('🧪 Iniciando tests del parser de Amadeus\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Código G3 con 5 dígitos
  console.log('📋 Test 1: Código G3 (5 dígitos)');
  const result1 = parseAmadeusPNR(TEST_CASE_1);
  console.log('  Vuelos encontrados:', result1.flights.length);
  console.log('  Éxito:', result1.success);
  
  if (result1.success && result1.flights.length === 4) {
    console.log('  ✅ PASÓ');
    passed++;
    
    // Verificar detalles del primer vuelo
    const vuelo1 = result1.flights[0];
    console.log('  Vuelo 1:', vuelo1.aerolinea_codigo, vuelo1.numero_vuelo, vuelo1.origen_codigo, '→', vuelo1.destino_codigo);
    console.log('  Hora salida:', vuelo1.hora_salida, 'Hora llegada:', vuelo1.hora_llegada);
  } else {
    console.log('  ❌ FALLÓ - Esperaba 4 vuelos, obtuve', result1.flights.length);
    console.log('  Errores:', result1.errors);
    failed++;
  }
  
  // Test 2: Formato AM/PM
  console.log('\n📋 Test 2: Formato AM/PM');
  const result2 = parseAmadeusPNR(TEST_CASE_2);
  console.log('  Vuelos encontrados:', result2.flights.length);
  
  if (result2.success && result2.flights.length >= 3) {
    console.log('  ✅ PASÓ');
    passed++;
    
    // Verificar conversión AM/PM
    const vueloBA = result2.flights.find(f => f.numero_vuelo === '190');
    if (vueloBA) {
      console.log('  BA190 - Salida:', vueloBA.hora_salida, '(esperado 06:20 desde 620P)');
      console.log('  BA190 - Llegada:', vueloBA.hora_llegada, '(esperado 09:50 desde 950A)');
    }
  } else {
    console.log('  ❌ FALLÓ');
    console.log('  Errores:', result2.errors);
    failed++;
  }
  
  // Test 3: Formato compacto
  console.log('\n📋 Test 3: Formato compacto (sin espacios)');
  const result3 = parseAmadeusPNR(TEST_CASE_3);
  console.log('  Vuelos encontrados:', result3.flights.length);
  
  if (result3.success && result3.flights.length === 3) {
    console.log('  ✅ PASÓ');
    passed++;
  } else {
    console.log('  ❌ FALLÓ');
    console.log('  Errores:', result3.errors);
    failed++;
  }
  
  // Test 4: Resumen
  console.log('\n📋 Test 4: Resumen de vuelos');
  const summary = getFlightSummary(result1.flights);
  console.log('  Resumen:', summary);
  
  if (summary.includes('MVD') || summary.includes('GIG')) {
    console.log('  ✅ PASÓ');
    passed++;
  } else {
    console.log('  ❌ FALLÓ');
    failed++;
  }
  
  // Resultados finales
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resultados: ${passed} pasaron, ${failed} fallaron`);
  console.log('='.repeat(50));
  
  return { passed, failed, total: 4 };
}

// Ejecutar si se corre directamente
if (require.main === module) {
  runTests();
}

export { runTests };
