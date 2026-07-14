const fs = require('fs');
const files = ['src/messages/es.json','src/messages/en.json','src/messages/pt.json'];
const translations = {
  es: {
    detail: {
      status: { nueva: "Nueva", enviada: "Enviada", vendida: "Vendida", perdida: "Perdida" },
      quoteTitle: "Cotización {codigo}",
      client: { title: "Datos del Cliente", name: "Nombre", email: "Email", phone: "Teléfono", document: "Documento" },
      passengersTitle: "Pasajeros ({count})",
      holder: "(Titular)",
      notes: "Notas",
      summary: { title: "Resumen", hotel: "Hotel", room: "Habitación", pricePerPerson: "Precio por persona", passengers: "Pasajeros", total: "Total", commission: "Tu comisión" },
      actions: {
        convertToSale: "Convertir a Venta",
        alreadyConverted: "Esta cotización ya fue convertida en venta",
        viewMySales: "Ver mis ventas →",
        registerPayment: "Registrar pago",
        editQuote: "Editar Cotización",
        clientName: "Nombre del Cliente",
        roomType: "Tipo Habitación",
        double: "Doble", triple: "Triple", quadruple: "Cuádruple",
        departureDate: "Fecha de Salida",
        saveChanges: "Guardar Cambios",
        closeSale: "Cerrar Venta",
        quoteLabel: "Cotización:",
        didReceivePayment: "¿El cliente ya realizó algún pago?",
        yesReceived: "✅ Sí, recibí pago",
        notYet: "⏳ No, aún no",
        paymentDetailsReceived: "Detalles del Pago Recibido",
        amountReceived: "Monto Recibido *",
        paymentType: "Tipo de Pago *",
        paymentAdvance: "Adelanto / Seña",
        paymentTotal: "Pago Total",
        paymentMethod: "Medio de Pago *",
        methods: { transferencia: "Transferencia Bancaria", efectivo: "Efectivo", tarjeta: "Tarjeta de Crédito/Débito", mercadopago: "Mercado Pago", paypal: "PayPal", otro: "Otro" },
        remainingToCollect: "Resta cobrar:",
        paymentRestDate: "Fecha de pago del restante *",
        paymentRestDateHint: "Indica cuándo el cliente pagará el saldo restante",
        paymentReceipt: "Comprobante de Pago (opcional)",
        uploadReceipt: "Click para subir comprobante",
        fileHint: "Imagen o PDF (máx. 10MB)",
        addReceipt: "+ Agregar otro comprobante",
        pendingPaymentInfo: "Información de Pago Pendiente",
        pendingPaymentHint: "Indica cuándo o cómo planeas recibir el pago. Esta información será útil para el administrador.",
        paymentDetails: "Detalles / Acuerdo de pago",
        paymentPlaceholder: "Ej: El cliente pagará el lunes por transferencia...",
        passengerDataTitle: "Datos de Pasajeros",
        passengerDataFull: "Datos completos de los {count} pasajero(s)",
        passengerDataPlaceholder: "Nombre completo, DNI/Pasaporte, Fecha de nacimiento de cada pasajero...\n\nEjemplo:\n1. Juan Pérez, DNI 12345678, 15/03/1985\n2. María López, DNI 87654321, 20/07/1990",
        paymentObservations: "Observaciones / Dónde cobrar",
        paymentObservationsPlaceholder: "Detalles adicionales, cuenta bancaria, dirección de cobro, etc.",
        observationsPlaceholder: "CBU para transferencia, dirección si hay que ir a cobrar, notas especiales...",
        totalTrip: "Total del viaje:",
        received: "Recibido:",
        remaining: "Restante:",
        noPayment: "Sin pago - se enviará a administrador",
        totalPayment: "PAGO TOTAL",
        partialPayment: "PAGO PARCIAL - Resta ${amount}",
        processing: "Procesando...",
        uploadingReceipts: "Subiendo comprobantes...",
        confirmSale: "Confirmar Venta",
        sendToAdmin: "Enviar a Administrador"
      },
      vouchersTitle: "Vouchers de Viaje ({count})",
      voucherTypes: { vuelo: "✈️ Vuelo", hotel: "🏨 Hotel", seguro: "🛡️ Seguro", otro: "📄 Otro" }
    }
  },
  en: {
    detail: {
      status: { nueva: "New", enviada: "Sent", vendida: "Sold", perdida: "Lost" },
      quoteTitle: "Quote {codigo}",
      client: { title: "Client Details", name: "Name", email: "Email", phone: "Phone", document: "Document" },
      passengersTitle: "Passengers ({count})",
      holder: "(Holder)",
      notes: "Notes",
      summary: { title: "Summary", hotel: "Hotel", room: "Room", pricePerPerson: "Price per person", passengers: "Passengers", total: "Total", commission: "Your commission" },
      actions: {
        convertToSale: "Convert to Sale",
        alreadyConverted: "This quote has already been converted to a sale",
        viewMySales: "View my sales →",
        registerPayment: "Register payment",
        editQuote: "Edit Quote",
        clientName: "Client Name",
        roomType: "Room Type",
        double: "Double", triple: "Triple", quadruple: "Quadruple",
        departureDate: "Departure Date",
        saveChanges: "Save Changes",
        closeSale: "Close Sale",
        quoteLabel: "Quote:",
        didReceivePayment: "Has the client made any payment?",
        yesReceived: "✅ Yes, I received payment",
        notYet: "⏳ No, not yet",
        paymentDetailsReceived: "Payment Received Details",
        amountReceived: "Amount Received *",
        paymentType: "Payment Type *",
        paymentAdvance: "Advance / Deposit",
        paymentTotal: "Total Payment",
        paymentMethod: "Payment Method *",
        methods: { transferencia: "Bank Transfer", efectivo: "Cash", tarjeta: "Credit/Debit Card", mercadopago: "Mercado Pago", paypal: "PayPal", otro: "Other" },
        remainingToCollect: "Remaining to collect:",
        paymentRestDate: "Remaining payment date *",
        paymentRestDateHint: "Indicate when the client will pay the remaining balance",
        paymentReceipt: "Payment Receipt (optional)",
        uploadReceipt: "Click to upload receipt",
        fileHint: "Image or PDF (max. 10MB)",
        addReceipt: "+ Add another receipt",
        pendingPaymentInfo: "Pending Payment Information",
        pendingPaymentHint: "Indicate when or how you plan to receive payment. This information will be useful for the administrator.",
        paymentDetails: "Details / Payment Agreement",
        paymentPlaceholder: "E.g.: The client will pay on Monday by bank transfer...",
        passengerDataTitle: "Passenger Data",
        passengerDataFull: "Complete data for the {count} passenger(s)",
        passengerDataPlaceholder: "Full name, ID/Passport, Date of birth for each passenger...\n\nExample:\n1. John Doe, ID 12345678, 03/15/1985\n2. Jane Smith, ID 87654321, 07/20/1990",
        paymentObservations: "Observations / Where to collect",
        paymentObservationsPlaceholder: "Additional details, bank account, collection address, etc.",
        observationsPlaceholder: "CBU for transfer, address if you need to go collect, special notes...",
        totalTrip: "Total trip:",
        received: "Received:",
        remaining: "Remaining:",
        noPayment: "No payment - will be sent to administrator",
        totalPayment: "TOTAL PAYMENT",
        partialPayment: "PARTIAL PAYMENT - ${amount} remaining",
        processing: "Processing...",
        uploadingReceipts: "Uploading receipts...",
        confirmSale: "Confirm Sale",
        sendToAdmin: "Send to Administrator"
      },
      vouchersTitle: "Travel Vouchers ({count})",
      voucherTypes: { vuelo: "✈️ Flight", hotel: "🏨 Hotel", seguro: "🛡️ Insurance", otro: "📄 Other" }
    }
  },
  pt: {
    detail: {
      status: { nueva: "Nova", enviada: "Enviada", vendida: "Vendida", perdida: "Perdida" },
      quoteTitle: "Orçamento {codigo}",
      client: { title: "Dados do Cliente", name: "Nome", email: "Email", phone: "Telefone", document: "Documento" },
      passengersTitle: "Passageiros ({count})",
      holder: "(Titular)",
      notes: "Notas",
      summary: { title: "Resumo", hotel: "Hotel", room: "Quarto", pricePerPerson: "Preço por pessoa", passengers: "Passageiros", total: "Total", commission: "Sua comissão" },
      actions: {
        convertToSale: "Converter em Venda",
        alreadyConverted: "Este orçamento já foi convertido em venda",
        viewMySales: "Ver minhas vendas →",
        registerPayment: "Registrar pagamento",
        editQuote: "Editar Orçamento",
        clientName: "Nome do Cliente",
        roomType: "Tipo de Quarto",
        double: "Duplo", triple: "Triplo", quadruple: "Quádruplo",
        departureDate: "Data de Saída",
        saveChanges: "Salvar Alterações",
        closeSale: "Fechar Venda",
        quoteLabel: "Orçamento:",
        didReceivePayment: "O cliente já realizou algum pagamento?",
        yesReceived: "✅ Sim, recebi pagamento",
        notYet: "⏳ Não, ainda não",
        paymentDetailsReceived: "Detalhes do Pagamento Recebido",
        amountReceived: "Valor Recebido *",
        paymentType: "Tipo de Pagamento *",
        paymentAdvance: "Adiantamento / Sinal",
        paymentTotal: "Pagamento Total",
        paymentMethod: "Meio de Pagamento *",
        methods: { transferencia: "Transferência Bancária", efectivo: "Dinheiro", tarjeta: "Cartão de Crédito/Débito", mercadopago: "Mercado Pago", paypal: "PayPal", otro: "Outro" },
        remainingToCollect: "Resta cobrar:",
        paymentRestDate: "Data de pagamento do restante *",
        paymentRestDateHint: "Indique quando o cliente pagará o saldo restante",
        paymentReceipt: "Comprovante de Pagamento (opcional)",
        uploadReceipt: "Clique para enviar comprovante",
        fileHint: "Imagem ou PDF (máx. 10MB)",
        addReceipt: "+ Adicionar outro comprovante",
        pendingPaymentInfo: "Informação de Pagamento Pendente",
        pendingPaymentHint: "Indique quando ou como planeja receber o pagamento. Esta informação será útil para o administrador.",
        paymentDetails: "Detalhes / Acordo de pagamento",
        paymentPlaceholder: "Ex: O cliente pagará na segunda-feira por transferência...",
        passengerDataTitle: "Dados dos Passageiros",
        passengerDataFull: "Dados completos dos {count} passageiro(s)",
        passengerDataPlaceholder: "Nome completo, RG/Passaporte, Data de nascimento de cada passageiro...\n\nExemplo:\n1. João Silva, RG 12345678, 15/03/1985\n2. Maria Souza, RG 87654321, 20/07/1990",
        paymentObservations: "Observações / Onde cobrar",
        paymentObservationsPlaceholder: "Detalhes adicionais, conta bancária, endereço de cobrança, etc.",
        observationsPlaceholder: "CBU para transferência, endereço se for necessário ir cobrar, notas especiais...",
        totalTrip: "Total da viagem:",
        received: "Recebido:",
        remaining: "Restante:",
        noPayment: "Sem pagamento - será enviado ao administrador",
        totalPayment: "PAGAMENTO TOTAL",
        partialPayment: "PAGAMENTO PARCIAL - Resta ${amount}",
        processing: "Processando...",
        uploadingReceipts: "Enviando comprovantes...",
        confirmSale: "Confirmar Venda",
        sendToAdmin: "Enviar para Administrador"
      },
      vouchersTitle: "Vouchers de Viagem ({count})",
      voucherTypes: { vuelo: "✈️ Voo", hotel: "🏨 Hotel", seguro: "🛡️ Seguro", otro: "📄 Outro" }
    }
  }
};

files.forEach(f => {
  const locale = f.includes('/es.json') ? 'es' : f.includes('/en.json') ? 'en' : 'pt';
  const data = JSON.parse(fs.readFileSync(f,'utf8'));
  const detail = data.cotizaciones.detail;
  const add = translations[locale].detail;
  Object.keys(add).forEach(k => {
    if (typeof add[k] === 'object' && !Array.isArray(add[k]) && add[k] !== null) {
      if (k === 'actions') {
        detail[k] = { ...detail[k], ...add[k] };
      } else {
        detail[k] = { ...(detail[k] || {}), ...add[k] };
      }
    } else {
      if (!(k in detail)) detail[k] = add[k];
    }
  });
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n', 'utf8');
});
console.log('Messages updated');
