# Checkpoint - Estado Actual del Sistema

> **Fecha:** 22 Marzo 2026 (Checkpoint Actual)  
> **Commits de referencia:** api@415b539, panel@8470a7b

---

## ✅ Estado de Producción (30 Mar 2026)

### Sistema: OPERATIVO

| Servicio | URL | Estado | Último Deploy |
|----------|-----|--------|---------------|
| Panel B2B | https://panel.tripconecta.com | ✅ Online | 22 Mar (8470a7b) |
| API Backend | https://api.tripconecta.com | ✅ Online | 22 Mar (415b539) |
| Landing | https://tripconecta.com | ✅ Online | 20 Mar (18154eb) |
| Database | Supabase PostgreSQL | ✅ Conectado | - |

### 🔄 Deploy Pendiente en Coolify
- Ninguno. Todos los commits recientes están deployados en producción.

### ⚠️ SQL Pendiente en Producción
```sql
-- Fix notificaciones.id
ALTER TABLE public.notificaciones ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Opcional: Corregir cotización inconsistente (si aplica)
UPDATE cotizaciones SET estado = 'vendida', fecha_conversion = NOW() 
WHERE id = '20038bc7-7c1b-4b82-b337-e355e08edc3a';
```

---

## 🎯 Funcionalidades Implementadas Recientemente

### 1. Sistema de Notificaciones (ACTUALIZADO)
**Fecha:** 30 Marzo 2026

**Fixes aplicados:**
- ✅ Fix columna `usuario_id` (era `user_id`)
- ✅ Fix DEFAULT uuid_generate_v4() para columna `id`
- ✅ Trigger automático funcional

**Pendiente:**
- ⏳ Testing de recepción de notificaciones en tiempo real

**Backend:**
- Tabla `notificaciones` con campos: `id`, `usuario_id`, `tipo`, `titulo`, `mensaje`, `referencia_id`, `referencia_tipo`, `leida`, `created_at`
- Trigger automático `trg_notificar_nueva_venta` en tabla `ventas`
- Función PostgreSQL que crea notificación cuando se inserta venta
- Endpoints API:
  - `GET /api/notificaciones` - Listar notificaciones del usuario
  - `POST /api/notificaciones` - Crear notificación (admin)
  - `PUT /api/notificaciones/:id/leida` - Marcar como leída
  - `PUT /api/notificaciones/marcar-todas-leidas` - Marcar todas leídas

**Frontend:**
- Componente `NotificationsBell.tsx` con dropdown
- Badge con contador de no leídas
- Polling automático cada 30 segundos
- Navegación directa a venta/cotización desde notificación

**Tipos de notificación:**
- `nueva_venta` - Cuando un vendedor convierte cotización a venta
- `nueva_cotizacion` - (reservado para futuro)
- `pago_recibido` - (reservado para futuro)
- `comprobante_subido` - (reservado para futuro)
- `sistema` - Notificaciones manuales de admin

### 2. Admin - Vista Consolidada de Cotización Vendida (ACTUALIZADO)
**Fecha:** 30 Marzo 2026

**Problema:** Admin veía datos incompletos cuando una cotización estaba vendida.

**Solución:** Endpoint `GET /api/cotizaciones/:id` ahora enriquece respuesta con:
- Datos completos de la `venta` asociada
- `comprobantes_pago` parseados desde JSON
- Lista completa de `pasajeros`
- `vuelos` de la cotización
- `paquete` completo

**Nueva UI Admin (`/admin/cotizaciones/[id]`):**
- Banner de "Venta Confirmada" con código, fecha y monto
- Sección "Pasajeros" con titular marcado
- Sección "Vuelos" con origen/destino/fechas
- **SIMPLIFICADO (30/03):** Un solo box "Paquete: [nombre]" con duración/noches
- Sección "Información de Pago" (estado, monto, medio)
- Sección "Comprobantes de Pago" con botón descargar funcional
- **ELIMINADO (30/03):** Sección duplicada "Detalles de la Cotización"

### 3. Fix Estados de Cotización
**Fecha:** 29 Marzo 2026

**Estados actualizados:** `nueva`, `enviada`, `vendida`, `perdida`

**Fixes aplicados:**
- Fix error 500 en "Enviar cotización" (validación de estados)
- SQL constraint `unique_cotizacion_venta` para prevenir duplicados
- Cleanup de ventas duplicadas existentes

### 4. Descarga de Comprobantes Funcional
**Fecha:** 29 Marzo 2026

**Implementación:**
- Función `handleDownloadComprobante()` en admin y vendedor
- Descarga mediante link temporal con atributo `download`
- Soporte URLs absolutas y relativas
- Static files servidos desde `/uploads` en Express

---

## 📊 Schema de Base de Datos (Actualizado 29 Mar 2026)

### Tablas Principales

| Tabla | Descripción | Registros aprox |
|-------|-------------|-----------------|
| `users` | Usuarios (admin/vendedor) | 10+ |
| `clientes` | Clientes registrados | - |
| `paquetes` | Paquetes turísticos | 10+ |
| `cotizaciones` | Cotizaciones creadas | - |
| `ventas` | Ventas confirmadas | - |
| `pasajeros` | Pasajeros registrados | - |
| `cotizacion_pasajeros` | Vínculo cotización-pasajeros | - |
| `vuelos` | Vuelos de cotizaciones manuales | - |
| `hospedajes` | Hoteles de cotizaciones | - |
| `comprobantes_pago` | Archivos de comprobantes | - |
| `documentos_viaje` | Documentos post-venta | - |
| `historial_cliente` | Interacciones CRM | - |
| `notificaciones` | Sistema de notificaciones | NUEVA |

### Campos Importantes por Tabla

**cotizaciones:**
- `id`, `codigo`, `cliente_id`, `vendedor_id`, `paquete_id`
- `estado`: nueva, enviada, vendida, perdida
- `precio_total`, `precio_moneda`, `comision_vendedor`
- `paquete_data` (JSONB), `itinerario` (JSONB)
- `num_pasajeros`, `destino_principal`
- `fecha_creacion`, `fecha_expiracion`, `fecha_envio`

**ventas:**
- `id`, `codigo`, `cotizacion_id`, `vendedor_id`
- `cliente_nombre`, `cliente_email`, `cliente_telefono`
- `paquete_id`, `paquete_nombre`, `fecha_salida`
- `num_pasajeros`, `precio_total`
- `comision_porcentaje`, `comision_monto`, `comision_estado`
- `estado`: confirmada, en_proceso, emitida, cancelada, reembolsada
- `pago_heredado`, `monto_pagado_heredado`, `tipo_pago_heredado`
- `observaciones_pago_heredado`, `comprobantes_pago_urls`
- `fecha_creacion`, `fecha_actualizacion`

**notificaciones:**
- `id`, `usuario_id` (NULL = para todos los admins)
- `tipo`: nueva_venta, nueva_cotizacion, pago_recibido, comprobante_subido, sistema
- `titulo`, `mensaje`, `data` (JSONB)
- `referencia_id`, `referencia_tipo`
- `leida`, `created_at`

---

## 🔧 API Endpoints (Actualizado)

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login usuario |
| POST | `/api/auth/register` | Registro (solo admin) |
| GET | `/api/auth/me` | Perfil actual |

### Cotizaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cotizaciones` | Listar cotizaciones |
| POST | `/api/cotizaciones` | Crear cotización manual |
| GET | `/api/cotizaciones/:id` | Ver detalle (enriquecido con venta si aplica) |
| PUT | `/api/cotizaciones/:id` | Actualizar cotización |
| DELETE | `/api/cotizaciones/:id` | Eliminar cotización |
| POST | `/api/cotizaciones/:id/convertir` | Convertir a venta |
| PUT | `/api/cotizaciones/:id/enviar` | Enviar cotización |
| PUT | `/api/cotizaciones/:id/aprobar` | Aprobar cotización (admin) |
| PUT | `/api/cotizaciones/:id/rechazar` | Rechazar cotización (admin) |

### Ventas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/ventas` | Listar ventas |
| GET | `/api/ventas/:id` | Ver detalle de venta |
| PUT | `/api/ventas/:id/estado` | Cambiar estado |

### Notificaciones (NUEVO)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notificaciones` | Listar notificaciones |
| POST | `/api/notificaciones` | Crear notificación |
| PUT | `/api/notificaciones/:id/leida` | Marcar leída |
| PUT | `/api/notificaciones/marcar-todas-leidas` | Marcar todas leídas |

### Paquetes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/paquetes` | Listar paquetes |
| POST | `/api/paquetes` | Crear paquete (admin) |
| GET | `/api/paquetes/:id` | Ver detalle |
| PUT | `/api/paquetes/:id` | Actualizar paquete |
| DELETE | `/api/paquetes/:id` | Eliminar paquete |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/clientes/:id` | Ver detalle |
| GET | `/api/clientes/:id/historial` | Historial CRM |

### Upload
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload/comprobante` | Subir comprobante de pago |

### Archivos Estáticos
| Ruta | Descripción |
|------|-------------|
| `/uploads/comprobantes/:filename` | Descargar comprobante |
| `/uploads/documentos/:filename` | Descargar documento de viaje |

---

## 🎨 Panel - Rutas y Funcionalidades

### Vendedor
| Ruta | Funcionalidad |
|------|---------------|
| `/dashboard` | Dashboard principal |
| `/cotizaciones` | Mis cotizaciones |
| `/cotizaciones/[id]` | Detalle de cotización |
| `/cotizacion/nueva` | Nueva cotización manual |
| `/mis-ventas` | Mis ventas |
| `/mis-ventas/[id]` | Detalle de venta (con comprobantes descargables) |
| `/paquetes` | Catálogo de paquetes |
| `/documentos` | Mis documentos |

### Admin
| Ruta | Funcionalidad |
|------|---------------|
| `/admin` | Dashboard admin |
| `/admin/cotizaciones` | Todas las cotizaciones |
| `/admin/cotizaciones/[id]` | Detalle consolidado (NUEVO - con venta, pasajeros, comprobantes) |
| `/admin/cotizacion/nueva` | Crear cotización para vendedor |
| `/admin/ventas` | Todas las ventas |
| `/admin/ventas/[id]` | Detalle de venta |
| `/admin/paquetes` | Gestión de paquetes |
| `/admin/vendedores` | Listado de vendedores |
| `/admin/vendedores/[id]` | Detalle de vendedor |
| `/admin/clientes` | CRM Clientes |
| `/admin/comisiones` | Gestión de comisiones |

---

## ✅ Fixes Recientes (30 Marzo 2026)

### Fix 1: Sincronización Cotización-Venta
**Problema:** Al convertir cotización a venta, no se vinculaban correctamente (podían quedar huérfanas).
**Solución:** 
- Guardar `venta_id` en cotización al crear venta
- Rollback automático si falla la vinculación
- Estado "revisión_requerida" si hay error parcial

### Fix 2: Notificaciones - Columna usuario_id
**Problema:** Error 500 al crear notificación (columna `user_id` vs `usuario_id`).
**Solución:** Controller actualizado para usar `usuario_id` (coincide con schema DB).

### Fix 3: SQL - DEFAULT uuid_generate_v4()
**Problema:** Error al insertar notificación sin ID explícito.
**SQL Aplicar:** `ALTER TABLE notificaciones ALTER COLUMN id SET DEFAULT uuid_generate_v4();`

### Fix 4: UI Admin - Box de Paquete
**Problema:** Múltiples boxes de paquete, itinerario roto, nombre no aparecía.
**Solución:**
- Unificado a un solo box "Paquete: [nombre]"
- Usa columna `titulo` (no `nombre`) para coincidir con schema
- Eliminada sección "Detalles de la Cotización" duplicada

### Fix 5: Build Error (Syntax)
**Fecha:** 30 Marzo 2026
**Problema:** Desbalance de llaves en `admin/cotizaciones/[id]/page.tsx`.
**Solución:** Revertido a commit estable y re-aplicados cambios limpios.

### Fix 6: Perfil de Usuario (`/configuracion`)
**Fecha:** 22 Marzo 2026
**Solución:**
- Nueva página `/configuracion` para editar nombre, apellido y teléfono del usuario logueado.
- Link agregado en el Sidebar.
- Fix TypeScript: agregados `comision_porcentaje` y `telefono` a la interfaz `User` en `AuthContext`.

### Fix 7: Seguridad en Listado de Clientes
**Fecha:** 22 Marzo 2026
**Problema:** Vendedores podían ver clientes de otros vendedores.
**Solución:**
- `GET /clientes` y `GET /clientes/buscar` filtran por `registrado_por` para usuarios no-admin.
- `getClienteById` y `updateCliente` verifican ownership antes de responder o modificar.

### Fix 8: Documentos Perdidos en Redeploys (Bug #7)
**Fecha:** 22 Marzo 2026
**Problema:** Archivos subidos desaparecían al redeployar en Coolify.
**Solución:**
- Configurado **Coolify Directory Mount** persistente: host `/data/coolify/applications/.../storage/uploads` → contenedor `/app/storage/uploads`.
- Variable de entorno `STORAGE_PATH=/app/storage/uploads`.
- Estrategia de paths: DB guarda solo `basename`, backend resuelve ubicación real buscando múltiples paths posibles.
- Endpoint de limpieza: `POST /api/admin/cleanup-documentos` para purgar registros huérfanos.

### Fix 9: Truncado de Campos en Paquetes
**Fecha:** 22 Marzo 2026
**Problema:** Error PostgreSQL 22001 (value too long) al crear paquetes con datos extensos.
**Solución:** Helper `truncar()` en `paquetes.controller.ts` que limita strings antes del insert (ej. `titulo` a 255 chars).

### Fix 10: Parser Amadeus Unificado
**Fecha:** 22 Marzo 2026
**Problema:** Parser local en admin paquetes inconsistente con el resto del sistema.
**Solución:** Reemplazado parser local por `parseAmadeusPNR` desde `@/lib/amadeus-parser` en la creación de paquetes admin.

### Fix 11: Redirect Admin "Desde Catálogo"
**Fecha:** 22 Marzo 2026
**Problema:** Al crear cotización desde `/admin/paquetes`, el redirect caía en ruta rota.
**Solución:** Redirige a `/paquetes` (catálogo público) en lugar de `/admin/paquetes`.

### Fix 12: Enum Case Mismatch en Clientes
**Fecha:** 22 Marzo 2026
**Problema:** Creación de clientes fallaba por constraints lowercase en PostgreSQL.
**Solución:** Valores default corregidos a `estado: 'activo'`, `prioridad: 'media'`.

### Fix 13: Nacionalidad en Pasajeros Adicionales
**Fecha:** 22 Marzo 2026
**Solución:** Agregado select de nacionalidad para pasajeros adicionales en el formulario de cotización de paquetes.

### Fix 14: Precio por Persona en PDF
**Fecha:** 22 Marzo 2026
**Problema:** `parseFloat("1.234,56")` truncaba en la coma, dando cálculos incorrectos en `Precio por persona`.
**Solución:** Usar helpers `parsePrice` y `formatPrice` (manejan formato `es-UY`) en `CotizacionPDF.tsx`.

---

## 🛡️ Directiva de Trabajo para Agentes (NO NEGOCIABLE)

> **Cada edit, cada cambio y cada fix debe ser revisado 2 veces antes de ser commiteado.**  
> El objetivo es detectar errores de sintaxis, tipos, lógica o deployments **antes** de que toquen producción.

### Checklist de Auto-Auditoría (obligatorio antes de commit)
- [ ] **Sintaxis:** ¿Paréntesis, llaves, comas y punto y coma están balanceados?
- [ ] **Tipos TypeScript:** ¿No hay `any` ocultos ni errores de compilación (`tsc --noEmit`)?
- [ ] **Variables:** ¿Todas las variables usadas están definidas e importadas?
- [ ] **Lógica:** ¿El cambio no rompe integridad de datos ni borra información accidentalmente?
- [ ] **Backward Compatibility:** ¿Los cambios en JSON/DB no invalidan datos existentes?
- [ ] **Deploy-safe:** ¿No hay cambios que requieran migraciones no planificadas?

### Protocolo de Aprobación
1. **Preguntar primero:** Antes de aplicar cualquier solución que toque lógica de negocio, DB o deploy, se debe proponer al usuario y esperar aprobación explícita.
2. **Aplicar con minimalismo:** Solo el cambio estrictamente necesario.
3. **Revisar 2 veces:** Una vez escrito, releer línea por línea buscando errores.
4. **Commit y Push:** Solo después de la revisión, al repo correspondiente (`api` o `panel`).

**Primamos siempre fixes que no destruyan la integridad del sistema.**

---

## ⚠️ Issues Conocidos / Limitaciones

### 1. Sistema de Notificaciones
**Estado:** ✅ Implementado, testing pendiente
- El trigger crea notificación al insertar venta
- Verificar que admin vea notificación en tiempo real (polling 30s)
- **SQL Pendiente:** Ejecutar fix DEFAULT uuid_generate_v4() en producción

### 2. Schema Cache
**Workaround:** Esperar 1-2 min tras migración o reiniciar backend

### 3. Descarga de Comprobantes
**Estado:** ✅ Funcionando
- Archivos servidos desde `/uploads` en Express
- Docker volume: `/data/trip-conecta/uploads`

---

## 🧪 Testing Checklist

### Notificaciones
```
1. Vendedor convierte cotización a venta
2. Admin ve badge de notificación incrementado
3. Admin abre dropdown y ve notificación
4. Click en notificación navega a venta
5. Marcar como leída funciona
```

### Admin - Cotización Vendida
```
1. Abrir cotización en estado 'vendida'
2. Ver banner de venta confirmada
3. Ver sección de pasajeros completa
4. Ver sección de vuelos
5. Ver sección de pago con monto/medio
6. Ver comprobantes con botón descargar
7. Click en descargar funciona
```

### Estados Cotización
```
1. Crear cotización → estado 'nueva'
2. Enviar cotización → estado 'enviada'
3. Convertir a venta → estado 'vendida' + venta creada
4. No debe permitir duplicar venta (constraint)
```

---

## 📞 Datos de Acceso

### Producción
- **Panel:** https://panel.tripconecta.com
- **API:** https://api.tripconecta.com
- **Supabase:** https://fcaglzfkqqgoqoayrrzc.supabase.co

### VPS (Hetzner)
- **IP:** 5.78.158.76
- **Coolify:** http://5.78.158.76:8000

### Credenciales de Prueba
```
Admin:     admin@tripconecta.com     / admin123
Vendedor:  vendedor@tripconecta.com  / vendedor123
```

---

*Checkpoint actualizado: 29 Marzo 2026 - 17:00 UTC-3*
