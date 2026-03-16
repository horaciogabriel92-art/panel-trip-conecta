# 03 - API Reference

**Endpoints, autenticación y ejemplos**

---

## 🔐 Autenticación

Todas las rutas (excepto `/auth/login`) requieren JWT en header:

```http
Authorization: Bearer {token}
```

### POST /api/auth/login

Login de usuarios.

**Request:**
```json
{
  "email": "admin@tripconecta.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "8af7af5d-4996-4163-87c7-3750b6013e70",
    "email": "admin@tripconecta.com",
    "nombre": "Admin",
    "apellido": "Sistema",
    "rol": "admin"
  }
}
```

---

## 📦 Paquetes

### GET /api/paquetes

Listar todos los paquetes activos.

**Auth:** JWT requerido

**Response (200):**
```json
[
  {
    "id": "...",
    "codigo": "PKG-2024-001",
    "titulo": "Europa Clásica 15 días",
    "descripcion": "Recorrido por...",
    "duracion_dias": 15,
    "tipo": "internacional",
    "precio_doble": 3500.00,
    "precio_triple": 3200.00,
    "precio_cuadruple": 2900.00,
    "imagen_url": "https://...supabase.co/...",
    "cupos_disponibles": 20
  }
]
```

### POST /api/paquetes

Crear nuevo paquete (Admin only).

**Auth:** JWT + rol 'admin'

**Request:**
```json
{
  "titulo": "Cancún All Inclusive",
  "descripcion": "7 días en...",
  "duracion_dias": 7,
  "tipo": "internacional",
  "precio_doble": 1200,
  "precio_triple": 1100,
  "precio_cuadruple": 1000,
  "cupos_disponibles": 30
}
```

---

## 💰 Cotizaciones

### GET /api/cotizaciones

Listar cotizaciones del vendedor (o todas si es admin).

**Auth:** JWT requerido

**Query params:**
- `estado`: pendiente, respondida, convertida, vencida, cancelada

### POST /api/cotizaciones

Crear cotización.

**Auth:** JWT + rol 'vendedor'

**Request:**
```json
{
  "paquete_id": "...",
  "cliente_nombre": "Juan Pérez",
  "cliente_email": "juan@email.com",
  "cliente_telefono": "+59899123456",
  "num_pasajeros": 2,
  "tipo_habitacion": "doble",
  "fecha_salida": "2024-06-15",
  "notas": "Preferencia ventana"
}
```

### PUT /api/cotizaciones/:id/responder

Admin responde cotización con precio.

**Auth:** JWT + rol 'admin'

**Request:**
```json
{
  "precio_total": 2500.00
}
```

### PUT /api/cotizaciones/:id/convertir

Convertir cotización a venta.

**Auth:** JWT + rol 'vendedor' (dueño de la cotización)

**Request:**
```json
{
  "monto_pagado": 2500,
  "tipo_pago": "completo",
  "metodo_pago": "transferencia",
  "datos_pasajeros": "Juan Pérez, DNI 12345678\nMaría González, DNI 87654321",
  "observaciones": "CBU: 014..."
}
```

---

## 🛒 Ventas

### GET /api/ventas

Listar ventas (vendedor ve solo las suyas, admin ve todas).

**Auth:** JWT requerido

### GET /api/ventas/stats

Estadísticas de ventas para dashboard.

**Auth:** JWT requerido

**Response (vendedor):**
```json
{
  "cantidad_ventas": 5,
  "total_ventas": 12500,
  "total_comisiones": 1500,
  "comisiones_pendientes": 800,
  "comisiones_pagadas": 700
}
```

### GET /api/ventas/:id

Obtener detalle de venta.

### PUT /api/ventas/:id/estado

Cambiar estado de venta (Admin only).

**Auth:** JWT + rol 'admin'

**Request:**
```json
{
  "estado": "emitida"
}
```

---

## 📄 Documentos

### GET /api/documentos/venta/:ventaId

Listar documentos de una venta.

**Auth:** JWT requerido (vendedor debe ser dueño de la venta, o admin)

**Response:**
```json
[
  {
    "id": "...",
    "tipo": "boleto_aereo",
    "nombre_archivo": "vuelo-aa123.pdf",
    "descripcion": "Vuelo ida y vuelta",
    "fecha_subida": "2024-03-15T10:30:00Z",
    "subido_por": {
      "nombre": "Admin",
      "apellido": "Sistema"
    }
  }
]
```

### POST /api/documentos

Subir documento (Admin only).

**Auth:** JWT + rol 'admin'

**Content-Type:** `multipart/form-data`

**Fields:**
- `documento`: File (PDF, JPG, PNG, WEBP - max 10MB)
- `venta_id`: ID de la venta
- `tipo`: Tipo de documento
- `descripcion`: Opcional

### GET /api/documentos/:id/download

Descargar archivo.

**Auth:** JWT requerido

**Response:** File stream con headers:
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="vuelo-aa123.pdf"
```

---

## 💸 Comisiones

### GET /api/comisiones/pendientes

Listar comisiones pendientes.

**Auth:** JWT requerido

**Response (admin):**
```json
{
  "ventas": [...],
  "agrupadas_por_vendedor": {
    "vendedor_id": {
      "vendedor": {...},
      "ventas": [...],
      "total_comision": 1500
    }
  }
}
```

### GET /api/comisiones/pagadas

Listar pagos de comisiones realizados.

**Auth:** JWT requerido

### PUT /api/ventas/:id/pagar-comision

Marcar comisión de venta como pagada.

**Auth:** JWT + rol 'admin'

---

## 📊 Códigos de Error

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 400 | Bad Request | Datos inválidos, falta campo requerido |
| 401 | Unauthorized | Token faltante o inválido |
| 403 | Forbidden | No tiene permisos para esta acción |
| 404 | Not Found | Recurso no existe |
| 500 | Server Error | Error interno del servidor |

**Ejemplo error 400:**
```json
{
  "error": "No se subió ningún archivo"
}
```

---

## 🔧 Headers Requeridos

```http
# Para JSON endpoints
Content-Type: application/json
Authorization: Bearer {token}

# Para upload de archivos
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

---

**Próximo paso:** Ver [04-FRONTEND.md](./04-FRONTEND.md)
