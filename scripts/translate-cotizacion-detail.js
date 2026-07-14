const fs = require('fs');
const path = 'src/app/(dashboard)/cotizaciones/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import useTranslations
if (!content.includes("useTranslations")) {
  content = content.replace(
    "import { useEffect, useState } from 'react';",
    "import { useEffect, useState } from 'react';\nimport { useTranslations } from 'next-intl';"
  );
}

// Add t hook after useToast
if (!content.includes("const t = useTranslations('cotizaciones')")) {
  content = content.replace(
    "const { success: toastSuccess, error: toastError } = useToast();",
    "const { success: toastSuccess, error: toastError } = useToast();\n  const t = useTranslations('cotizaciones');\n  "
  );
}

// Add status helper before render
if (!content.includes("const statusLabel")) {
  content = content.replace(
    "if (!cotizacion) {",
    "const statusLabels: Record<string, string> = {\n    nueva: t('detail.status.nueva'),\n    enviada: t('detail.status.enviada'),\n    vendida: t('detail.status.vendida'),\n    perdida: t('detail.status.perdida')\n  };\n\n  if (!cotizacion) {"
  );
}

const replacements = [
  // Header
  ['<h2 className="text-2xl font-bold text-[var(--foreground)]">Cotización no encontrada</h2>', '<h2 className="text-2xl font-bold text-[var(--foreground)]">{t(\'detail.notFound\')}</h2>'],
  ['← Volver a cotizaciones', '{t(\'detail.backToQuotes\')}'],
  ['<h2 className="text-2xl font-black text-[var(--foreground)]">Cotización {cotizacion.codigo}</h2>', '<h2 className="text-2xl font-black text-[var(--foreground)]">{t(\'detail.quoteTitle\', { codigo: cotizacion.codigo })}</h2>'],
  ['{cotizacion.estado}', '{statusLabels[cotizacion.estado] || cotizacion.estado}'],
  ['Creada el ', '{t(\'detail.created\', { date: '],
  ['Vence el ', '{t(\'detail.expires\', { date: '],

  // Fallback titles for PDF data object strings (keep in Spanish? these are data fields passed to PDF component)
  // Paquete / cotización
  ["'Cotización'", "t('detail.quoteNotAvailable')"],
  ["'Destino no especificado'", "t('detail.details.toBeDefined')"],

  // Header package type
  ['{cotizacion.tipo_cotizacion === \'manual\' ? \'Cotización Personalizada\' : \'Paquete\'}', '{cotizacion.tipo_cotizacion === \'manual\' ? t(\'detail.customQuote\') : t(\'detail.package\')}'],
  ['{cotizacion.nombre_cotizacion || paquete?.nombre || paquete?.titulo || \'Cotización no disponible\'}', '{cotizacion.nombre_cotizacion || paquete?.nombre || paquete?.titulo || t(\'detail.quoteNotAvailable\')}'],

  // Details
  ['Detalles de la Cotización', '{t(\'detail.details.title\')}'],
  ['>Pasajeros</p>', '>{t(\'detail.details.passengers\')}</p>'],
  ['>Habitación</p>', '>{t(\'detail.details.room\')}</p>'],
  ['No especificada', '{t(\'detail.details.notSpecified\')}'],
  ['>Fecha Salida</p>', '>{t(\'detail.details.departureDate\')}</p>'],
  ['A definir', '{t(\'detail.details.toBeDefined\')}'],
  ['>Total</p>', '>{t(\'detail.details.total\')}</p>'],

  // Itinerario
  ['>Itinerario</h3>', '>{t(\'detail.itinerary\')}</h3>'],
  ['Día {dia.dia || idx + 1}', '{t(\'detail.day\', { day: dia.dia || idx + 1 })}'],
  ['• {act}', '• {act}'],

  // Flights catalog
  ['>Vuelos</h3>', '>{t(\'detail.flights.title\')}</h3>'],
  ["{vuelo.tipo === 'ida' ? 'Vuelo de Ida' : 'Vuelo de Vuelta'}", "{vuelo.tipo === 'ida' ? t('detail.flights.outbound') : t('detail.flights.return')}"],
  ['>Origen</p>', '>{t(\'detail.flights.origin\')}</p>'],
  ['>Destino</p>', '>{t(\'detail.flights.destination\')}</p>'],
  ['>Fecha</p>', '>{t(\'detail.flights.date\')}</p>'],
  ['>Horario</p>', '>{t(\'detail.flights.schedule\')}</p>'],
  ['>Aerolínea</p>', '>{t(\'detail.flights.airline\')}</p>'],
  ['>Clase</p>', '>{t(\'detail.flights.class\')}</p>'],

  // Service details
  ['Detalles del Servicio', '{t(\'detail.serviceDetails\')}'],
  ['>Incluye</p>', '>{t(\'detail.includes\')}</p>'],
  ['>No incluye</p>', '>{t(\'detail.notIncludes\')}</p>'],

  // Manual flights
  ['Vuelos ({cotizacion.vuelos.length})', '{t(\'detail.flights.manual.title\', { count: cotizacion.vuelos.length })}'],
  ['>Salida</p>', '>{t(\'detail.flights.manual.departure\')}</p>'],
  ['>Llegada</p>', '>{t(\'detail.flights.manual.arrival\')}</p>'],

  // Hospedaje
  ['Hospedaje', '{t(\'detail.accommodation.title\')}'],
  ['Ver Hotel', '{t(\'detail.accommodation.viewHotel\')}'],
  ['>Check-in</p>', '>{t(\'detail.accommodation.checkin\')}</p>'],
  ['>Check-out</p>', '>{t(\'detail.accommodation.checkout\')}</p>'],
  ['>Regimen</p>', '>{t(\'detail.accommodation.regimen\')}</p>'],
  ["{hotel.fecha_checkin || 'N/A'}", "{hotel.fecha_checkin || t('detail.accommodation.notAvailable')}"],
  ["{hotel.fecha_checkout || 'N/A'}", "{hotel.fecha_checkout || t('detail.accommodation.notAvailable')}"],

  // Cliente
  ['Datos del Cliente', '{t(\'detail.client.title\')}'],
  ['>Nombre</p>', '>{t(\'detail.client.name\')}</p>'],
  ['>Email</p>', '>{t(\'detail.client.email\')}</p>'],
  ['>Teléfono</p>', '>{t(\'detail.client.phone\')}</p>'],
  ['>Documento</p>', '>{t(\'detail.client.document\')}</p>'],

  // Pasajeros
  ['Pasajeros ({numPasajerosReal})', '{t(\'detail.passengersTitle\', { count: numPasajerosReal })}'],
  ['Pasajeros ({todos.length})', '{t(\'detail.passengersTitle\', { count: todos.length })}'],
  ['(Titular)', '{t(\'detail.holder\')}'],

  // Notas
  ['>Notas</h3>', '>{t(\'detail.notes\')}</h3>'],

  // Resumen
  ['>Resumen</h3>', '>{t(\'detail.summary.title\')}</h3>'],
  ['>Hotel</span>', '>{t(\'detail.summary.hotel\')}</span>'],
  ['>Habitación</span>', '>{t(\'detail.summary.room\')}</span>'],
  ['Precio por persona', '{t(\'detail.summary.pricePerPerson\')}'],
  ['>Pasajeros</span>', '>{t(\'detail.summary.passengers\')}</span>'],
  ['>Total</span>', '>{t(\'detail.summary.total\')}</span>'],
  ['Tu comisión', '{t(\'detail.summary.commission\')}'],

  // Actions
  ['Convertir a Venta', '{t(\'detail.actions.convertToSale\')}'],
  ['Esta cotización ya fue convertida en venta', '{t(\'detail.actions.alreadyConverted\')}'],
  ['Ver mis ventas →', '{t(\'detail.actions.viewMySales\')}'],
  ['Registrar pago', '{t(\'detail.actions.registerPayment\')}'],
  ['📄 Vouchers de Viaje ({vouchers.length})', '{t(\'detail.vouchersTitle\', { count: vouchers.length })}'],
  ['Editar Cotización', '{t(\'detail.actions.editQuote\')}'],
  ['title="Editar"', 'title={t(\'detail.actions.edit\')}'],

  // Edit modal labels
  ['Nombre del Cliente', '{t(\'detail.actions.clientName\')}'],
  ['Tipo Habitación', '{t(\'detail.actions.roomType\')}'],
  ['>Doble</option>', '>{t(\'detail.actions.double\')}</option>'],
  ['>Triple</option>', '>{t(\'detail.actions.triple\')}</option>'],
  ['>Cuádruple</option>', '>{t(\'detail.actions.quadruple\')}</option>'],
  ['Fecha de Salida', '{t(\'detail.actions.departureDate\')}'],
  ['>Notas</label>', '>{t(\'detail.notes\')}</label>'],
  ['Cancelar', '{t(\'common.cancel\')}'],
  ['Guardar Cambios', '{t(\'detail.actions.saveChanges\')}'],

  // Sale modal
  ['Cerrar Venta', '{t(\'detail.actions.closeSale\')}'],
  ['Cotización:', '{t(\'detail.actions.quoteLabel\')}'],
  ['¿El cliente ya realizó algún pago?', '{t(\'detail.actions.didReceivePayment\')}'],
  ['✅ Sí, recibí pago', '{t(\'detail.actions.yesReceived\')}'],
  ['⏳ No, aún no', '{t(\'detail.actions.notYet\')}'],
  ['Detalles del Pago Recibido', '{t(\'detail.actions.paymentDetailsReceived\')}'],
  ['Monto Recibido *', '{t(\'detail.actions.amountReceived\')}'],
  ['Tipo de Pago *', '{t(\'detail.actions.paymentType\')}'],
  ['Adelanto / Seña', '{t(\'detail.actions.paymentAdvance\')}'],
  ['Pago Total', '{t(\'detail.actions.paymentTotal\')}'],
  ['Medio de Pago *', '{t(\'detail.actions.paymentMethod\')}'],
  ['Transferencia Bancaria', '{t(\'detail.actions.methods.transferencia\')}'],
  ['Efectivo', '{t(\'detail.actions.methods.efectivo\')}'],
  ['Tarjeta de Crédito/Débito', '{t(\'detail.actions.methods.tarjeta\')}'],
  ['Mercado Pago', '{t(\'detail.actions.methods.mercadopago\')}'],
  ['PayPal', '{t(\'detail.actions.methods.paypal\')}'],
  ['Otro', '{t(\'detail.actions.methods.otro\')}'],
  ['Resta cobrar:', '{t(\'detail.actions.remainingToCollect\')}'],
  ['Fecha de pago del restante *', '{t(\'detail.actions.paymentRestDate\')}'],
  ['Indica cuándo el cliente pagará el saldo restante', '{t(\'detail.actions.paymentRestDateHint\')}'],
  ['Comprobante de Pago (opcional)', '{t(\'detail.actions.paymentReceipt\')}'],
  ['Click para subir comprobante', '{t(\'detail.actions.uploadReceipt\')}'],
  ['Imagen o PDF (máx. 10MB)', '{t(\'detail.actions.fileHint\')}'],
  ['+ Agregar otro comprobante', '{t(\'detail.actions.addReceipt\')}'],
  ['Información de Pago Pendiente', '{t(\'detail.actions.pendingPaymentInfo\')}'],
  ['Indica cuándo o cómo planeas recibir el pago. Esta información será útil para el administrador.', '{t(\'detail.actions.pendingPaymentHint\')}'],
  ['Detalles / Acuerdo de pago', '{t(\'detail.actions.paymentDetails\')}'],
  ['Ej: El cliente pagará el lunes por transferencia...', '{t(\'detail.actions.paymentPlaceholder\')}'],
  ['Datos de Pasajeros', '{t(\'detail.actions.passengerDataTitle\')}'],
  ['Datos completos de los {numPasajerosReal} pasajero(s)', '{t(\'detail.actions.passengerDataFull\', { count: numPasajerosReal })}'],
  ['Nombre completo, DNI/Pasaporte, Fecha de nacimiento de cada pasajero...\\n\\nEjemplo:\\n1. Juan Pérez, DNI 12345678, 15/03/1985\\n2. María López, DNI 87654321, 20/07/1990', '{t(\'detail.actions.passengerDataPlaceholder\')}'],
  ['Observaciones / Dónde cobrar', '{t(\'detail.actions.paymentObservations\')}'],
  ['Detalles adicionales, cuenta bancaria, dirección de cobro, etc.', '{t(\'detail.actions.paymentObservationsPlaceholder\')}'],
  ['CBU para transferencia, dirección si hay que ir a cobrar, notas especiales...', '{t(\'detail.actions.observationsPlaceholder\')}'],
  ['Total del viaje:', '{t(\'detail.actions.totalTrip\')}'],
  ['Recibido:', '{t(\'detail.actions.received\')}'],
  ['Restante:', '{t(\'detail.actions.remaining\')}'],
  ['Sin pago - se enviará a administrador', '{t(\'detail.actions.noPayment\')}'],
  ['PAGO TOTAL', '{t(\'detail.actions.totalPayment\')}'],
  ['PAGO PARCIAL - Resta ${formatCurrency(montoRestante)}', '{t(\'detail.actions.partialPayment\', { amount: formatCurrency(montoRestante) })}'],
  ['Subiendo comprobantes...', '{t(\'detail.actions.uploadingReceipts\')}'],
  ['Procesando...', '{t(\'detail.actions.processing\')}'],
  ['Confirmar Venta', '{t(\'detail.actions.confirmSale\')}'],
  ['Enviar a Administrador', '{t(\'detail.actions.sendToAdmin\')}'],

  // Voucher types
  ["{v.tipo_documento === 'vuelo' && '✈️ Vuelo'}", "{v.tipo_documento === 'vuelo' && t('detail.voucherTypes.vuelo')}"],
  ["{v.tipo_documento === 'hotel' && '🏨 Hotel'}", "{v.tipo_documento === 'hotel' && t('detail.voucherTypes.hotel')}"],
  ["{v.tipo_documento === 'seguro' && '🛡️ Seguro'}", "{v.tipo_documento === 'seguro' && t('detail.voucherTypes.seguro')}"],
  ["{v.tipo_documento === 'otro' && '📄 Otro'}", "{v.tipo_documento === 'otro' && t('detail.voucherTypes.otro')}"],

  // Toast messages
  ['toastError(\'Debes indicar la fecha de pago del restante\', \'Fecha requerida\')', 'toastError(t(\'new.errors.restPaymentDateRequired\'), t(\'new.errors.dateRequired\'))'],
  ['toastSuccess(\'Cotización convertida a venta exitosamente\', \'¡Venta confirmada!\')', 'toastSuccess(t(\'success.convertedToSale\'), t(\'success.saleConfirmed\'))'],
  ['toastError(`${errorMsg}${details ? \'\\\\n\\\\nDetalles: \' + details : \'\'}${code ? \'\\\\nCódigo: \' + code : \'\'}`, \'Error al convertir\')', 'toastError(`${errorMsg}${details ? `\\n\\n${t(\'errors.details\')}: ${details}` : \'\'}${code ? `\\n${t(\'errors.code\')}: ${code}` : \'\'}`, t(\'detail.actions.confirmSale\'))'],
  ['toastError(`El archivo ${file.name} no es válido. Solo se permiten imágenes (JPG, PNG, WebP) o PDFs.`, \'Archivo inválido\')', 'toastError(t(\'new.errors.fileInvalid\', { name: file.name }), t(\'new.errors.invalidFileTitle\'))'],
  ['toastError(`El archivo ${file.name} excede el límite de 10MB.`, \'Archivo muy grande\')', 'toastError(t(\'new.errors.fileTooLarge\', { name: file.name }), t(\'new.errors.largeFileTitle\'))'],
  ['toastSuccess(\'Cotización actualizada\', \'Guardado\')', 'toastSuccess(t(\'success.updated\'), t(\'success.saved\'))'],
  ['toastError(err.response?.data?.error || \'Error al actualizar\', \'Error\')', 'toastError(err.response?.data?.error || t(\'errors.update\'), t(\'common.error\'))'],
  ['toastError(\'Error al descargar voucher\', \'Descarga fallida\')', 'toastError(t(\'detail.actions.voucherError\'), t(\'detail.actions.downloadFailed\'))'],

  // File description
  ["`Comprobante de ${ventaData.tipo_pago === 'total' ? 'pago total' : 'adelanto'} - ${ventaData.medio_pago}`", "t('detail.actions.paymentReceiptDescription', { type: ventaData.tipo_pago === 'total' ? t('detail.actions.paymentTotal') : t('detail.actions.paymentAdvance'), method: t(`detail.actions.methods.${ventaData.medio_pago}`) })"]
];

replacements.forEach(([oldStr, newStr]) => {
  if (!content.includes(oldStr)) {
    console.log('NOT FOUND:', oldStr.slice(0, 80));
    return;
  }
  content = content.split(oldStr).join(newStr);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
