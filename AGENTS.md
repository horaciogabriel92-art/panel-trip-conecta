# Trip Conecta - Checkpoint 16/03/2026

## ✅ Funcionalidades Implementadas

### 1. Pipeline de Cotizaciones Completo

**Flujo del Vendedor:**
```
NUEVA → ENVIADA → VENDIDA/PERDIDA
```

- **Nueva**: Cotización creada, botón "Marcar como Enviada"
- **Enviada**: Ya enviada al cliente, botones:
  - "Cerrar Venta" → Abre modal con datos de pago
  - "Venta Perdida" → Modal para indicar motivo
- **Vendida**: Convertida en venta, link a "Mis Ventas"
- **Perdida**: No se concretó, queda archivada

**Archivos modificados:**
- `src/app/(dashboard)/cotizaciones/page.tsx` - Kanban con 4 columnas
- `src/app/(dashboard)/cotizaciones/[id]/page.tsx` - Modal de cierre de venta

### 2. Modal de Cierre de Venta (Vendedor)

**Pregunta principal:** "¿El cliente ya realizó algún pago?"

**Si SÍ:**
- Monto recibido
- Tipo: Adelanto/Seña o Pago Total
- Medio de pago (transferencia, efectivo, tarjeta, etc.)
- Upload de comprobantes (imagen o PDF, máx 10MB)
- Resta cobrar (calculado automáticamente)

**Si NO:**
- Campo para detalles/acuerdo de pago

**Datos heredados al admin:**
- Toda la información de pago se copia a la venta
- Comprobantes almacenados en VPS: `/data/trip-conecta/uploads/comprobantes/`

### 3. Backend - API Endpoints

**Nuevos endpoints:**
- `POST /api/upload/comprobante-pago/:cotizacionId` - Subir comprobante
- `GET /api/upload/comprobantes-pago/:cotizacionId` - Listar comprobantes
- `GET /api/upload/comprobante-pago/:id/download` - Descargar comprobante
- `DELETE /api/upload/comprobante-pago/:id` - Eliminar comprobante
- `PUT /api/cotizaciones/:id/convertir` - Actualizado con datos de pago

**Configuración crítica:**
- `express.json()` NO se aplica globalmente (rompe multipart)
- Se aplica solo a rutas específicas
- `/api/upload` va sin `express.json()` para permitir multipart

**Almacenamiento:**
- Imágenes de paquetes → Supabase Storage (`paquetes-imagenes`)
- Comprobantes de pago → VPS local (`/data/trip-conecta/uploads/comprobantes/`)
- Documentos de viaje → VPS local

### 4. Base de Datos (Supabase)

**Campos agregados a `cotizaciones`:**
```sql
pago_realizado BOOLEAN DEFAULT FALSE
monto_pagado DECIMAL(12, 2)
tipo_pago VARCHAR(20) -- 'adelanto', 'total', 'pendiente'
medio_pago VARCHAR(50)
observaciones_pago TEXT
comprobante_pago_url TEXT
fecha_pago TIMESTAMP
```

**Nueva tabla `comprobantes_pago`:**
```sql
id UUID PRIMARY KEY
cotizacion_id UUID REFERENCES cotizaciones(id)
vendedor_id UUID REFERENCES users(id)
nombre_archivo VARCHAR(255)
ruta_archivo VARCHAR(500)
tipo_archivo VARCHAR(50) -- 'imagen', 'pdf'
tamaño_bytes INTEGER
descripcion TEXT
fecha_subida TIMESTAMP
```

**Campos agregados a `ventas`:**
```sql
pago_heredado BOOLEAN DEFAULT FALSE
monto_pagado_heredado DECIMAL(12, 2)
tipo_pago_heredado VARCHAR(20)
observaciones_pago_heredado TEXT
comprobantes_pago_urls TEXT -- JSON array
```

### 5. Infraestructura

**Traefik (Coolify):**
- SSL automático con Let's Encrypt
- Buffering deshabilitado para uploads: `maxRequestBodyBytes=0`
- Redirección HTTP → HTTPS automática

**Docker:**
- Panel: Coolify managed (auto-deploy en push)
- API: Manual container con labels Traefik
- Volumen persistente: `/data/trip-conecta/uploads:/app/storage/uploads`

## 🐛 Problemas Resueltos

### Problema: Upload de imágenes daba 400 "No se proporcionó ninguna imagen"
**Causa:** `express.json()` consumía el body antes de que multer lo procesara
**Solución:** Aplicar `express.json()` solo a rutas que lo necesitan, no globalmente

### Problema: Coolify no deployaba cambios automáticamente
**Causa:** Build fallaba silenciosamente o caché de Docker
**Solución:** Forzar redeploy manual o rebuild con `--no-cache`

### Problema: Endpoint de comprobantes daba 404
**Causa:** Caché de Docker no invalidaba capas
**Solución:** `docker build --no-cache` y recrear contenedor

## ✅ Cambios Recientes (16/03/2026)

### Pestañas de Paquete Simplificadas
- Antes: 3 pestañas (Información, Itinerario, Recursos)
- Ahora: 2 pestañas (Itinerario, Recursos)
- La pestaña "Itinerario" ahora contiene: descripción, incluye, no incluye
- La pestaña "Recursos" se mantiene igual

### Datos de Venta - Estructura Actual
Los datos de pago se muestran en la sección "Notas" de la venta con este formato:
```
=== INFORMACIÓN DE PAGO ===
Pago Realizado: Sí/No
Monto Pagado: $X
Tipo de Pago: Adelanto/Seña o Total
Medio de Pago: transferencia/efectivo/etc
Fecha de Pago: DD/MM/YYYY
Observaciones: ...

=== COMPROBANTES ADJUNTOS ===
1. archivo.png (imagen)

=== DATOS DE PASAJEROS ===
...

=== NOTAS ORIGINALES ===
...
```

## 📋 Pendientes para Próxima Sesión

### Alta Prioridad:
1. **Mostrar comprobantes en panel de admin**
   - Sección en `/admin/ventas/[id]` para ver/descargar comprobantes de pago
   
2. **Agregar botones de estado en venta:**
   - "Emitido" (boletos/tickets emitidos)
   - "Cancelado" (venta cancelada)

### Mejora UI (Opcional):
3. **Estructurar mejor los datos de pago**
   - Actualmente están en notas como texto plano
   - Podría mostrarse en cards/boxes separados más visuales

## 🚀 Cómo Deployar

### Panel (Coolify):
```bash
git add -A
git commit -m "mensaje"
git push origin main
# Coolify deploya automáticamente
```

### API (Manual):
```bash
# En servidor:
cd /data/trip-conecta/api-build
git pull origin master
docker build -t trip-conecta-api:latest .
docker stop trip-conecta-api
docker rm trip-conecta-api
docker run -d --name trip-conecta-api ... (ver comando completo en infra)
```

## 🔑 URLs Importantes

- Panel: https://panel.tripconecta.com
- API: https://api.tripconecta.com
- Supabase: https://fcaglzfkqqgoqoayrrzc.supabase.co
- Coolify: http://5.78.158.76:8000

## 📁 Estructura de Archivos

```
trip-conecta-panel/
├── src/app/(dashboard)/
│   ├── cotizaciones/page.tsx       # Kanban 4 columnas
│   ├── cotizaciones/[id]/page.tsx  # Detalle + modal cierre
│   ├── admin/ventas/[id]/page.tsx  # Ver venta (falta comprobantes)
│   └── ...

trip-conecta-api/
├── src/routes/upload.routes.ts     # Endpoints comprobantes
├── src/controllers/cotizaciones.controller.ts  # Convertir con pago
├── src/index.ts                    # Config express.json()
└── migrations/004_add_pago_cotizaciones.sql
```

---

**Última actualización:** 16/03/2026 19:50
**Commit panel:** `71fbd81`
**Commit API:** `2ad50f4`
