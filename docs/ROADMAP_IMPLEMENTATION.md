# Roadmap Implementación - Panel Admin Consolidado

> **Última actualización:** 30 Marzo 2026 (Checkpoint)  
> **Commits de referencia:** api@dd9eda2, panel@a43cbb4

---

## Resumen de Cambios

Este documento resume los cambios implementados para solucionar los issues del Panel Admin relacionados con cotizaciones vendidas, sistema de notificaciones, y fixes de bugs críticos.

---

## FASE 1: Backend - Endpoint Enriquecido ✅

### Archivo: `trip-conecta-api/src/controllers/cotizaciones.controller.ts`

**Modificaciones:**
- Enriquecido `getCotizacionById` para incluir datos completos cuando una cotización está en estado "vendida"
- Agregado carga de:
  - **Venta asociada** (tabla `ventas`)
  - **Comprobantes de pago** (parseados desde `comprobantes_pago_urls` JSON)
  - **Comprobantes adicionales** (desde tabla `comprobantes_pago` si existe)
- **FIX 30/03:** Detección de inconsistencias (venta existe pero estado ≠ 'vendida')
- **FIX 30/03:** Sincronización atómica cotización-venta en `convertirAVenta`
- El endpoint ahora retorna:
  ```json
  {
    ...cotizacion,
    venta: { ... },
    comprobantes_pago: [...],
    pasajeros: [...],
    vuelos: [...],
    paquete: { ... }
  }
  ```

---

## FASE 2: Sistema de Notificaciones ✅

### 1. SQL Migration: `trip-conecta-api/migrations/008_add_notificaciones.sql`

**Tabla creada:**
```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = para todos los admins
  tipo VARCHAR(50) CHECK (tipo IN ('nueva_venta', 'nueva_cotizacion', ...)),
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  data JSONB,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**FIX 30/03:** Columna `id` tiene DEFAULT uuid_generate_v4()

**Trigger automático:**
- Se crea notificación automática para admins cuando se inserta una nueva venta
- El mensaje incluye: vendedor, cliente, monto y paquete

### 2. Controller: `trip-conecta-api/src/controllers/notificaciones.controller.ts`

**FIX 30/03:** Cambiado `user_id` → `usuario_id` para coincidir con schema DB

**Endpoints creados:**
- `GET /api/notificaciones` - Obtener notificaciones del usuario
- `POST /api/notificaciones` - Crear notificación (admin only)
- `PUT /api/notificaciones/:id/leida` - Marcar como leída
- `PUT /api/notificaciones/marcar-todas-leidas` - Marcar todas como leídas

### 3. Routes: `trip-conecta-api/src/routes/notificaciones.routes.ts`

Registrado en `index.ts` principal.

---

## FASE 3: Frontend Admin Consolidado ✅

### 1. Vista Cotización Detalle: `trip-conecta-panel/src/app/(dashboard)/admin/cotizaciones/[id]/page.tsx`

**Nuevas secciones agregadas:**

#### Banner de Venta (solo si estado = 'vendida')
- Muestra código de venta, fecha y monto total
- Badge visual destacado con gradiente

#### Lista de Pasajeros
- Muestra todos los pasajeros con datos snapshot
- Indica titular con badge
- Tipo de habitación

#### Vuelos
- Origen → Destino con íconos
- Aerolínea y fecha

#### Datos del Paquete
- **FIX 30/03:** Simplificado a un solo box con nombre del paquete en título
- **FIX 30/03:** Usa columna `titulo` (no `nombre`) para coincidir con schema DB
- Muestra duración y noches

#### Información de Pago (solo si vendida)
- Estado del pago (Total/Parcial/Pendiente)
- Monto pagado
- Medio de pago
- Observaciones

#### Comprobantes de Pago
- Lista de comprobantes con nombre de archivo
- Botón de descarga funcional
- Cada comprobante es clickeable

#### Estados actualizados
- Estados correctos según DB: `nueva`, `enviada`, `vendida`, `perdida`
- Colores y badges correspondientes

### 2. Componente Notificaciones: `trip-conecta-panel/src/components/NotificationsBell.tsx`

**Features:**
- Dropdown con últimas 50 notificaciones
- Badge con contador de no leídas
- Polling automático cada 30 segundos
- Iconos según tipo (venta, cotización, pago, etc.)
- Tiempo relativo (ahora, 5m, 2h, etc.)
- Navegación directa a venta/cotización
- Marcar individual o todas como leídas

### 3. Header actualizado: `trip-conecta-panel/src/components/layout/Header.tsx`

- Integrado NotificationsBell en lugar de campana estática

---

## FASE 4: Fix Descarga Comprobantes ✅

**Implementado en:**
- `admin/cotizaciones/[id]/page.tsx` - función `handleDownloadComprobante`
- Crea link temporal con `download` attribute
- Soporte URLs absolutas y relativas

---

## FASE 5: Fixes Críticos 30/03/2026

### Fix 1: Sincronización Cotización-Venta
**Problema:** Al convertir cotización a venta, no se vinculaban correctamente.
**Solución:** 
- Guardar `venta_id` en cotización
- Rollback si falla la vinculación
- Estado de "revisión requerida" si hay error parcial

### Fix 2: Columna Notificaciones
**Problema:** Error al insertar notificación sin ID explícito.
**Solución:** Agregar DEFAULT uuid_generate_v4() a columna `id`.

### Fix 3: UI Admin Paquete
**Problema:** Múltiples boxes de paquete, itinerario roto, nombre no aparecía.
**Solución:** 
- Unificar en un solo box
- Usar columna `titulo` del schema
- Eliminar secciones duplicadas

### Fix 4: Syntax Error Build
**Problema:** Desbalance de llaves en `admin/cotizaciones/[id]/page.tsx`.
**Solución:** Revertir a commit estable y re-aplicar cambios.

---

## SQL Pendiente por Ejecutar

Ejecutar en Supabase:

```sql
-- Migration 008: Sistema de notificaciones
\i trip-conecta-api/migrations/008_add_notificaciones.sql

-- Fix: DEFAULT para notificaciones.id
ALTER TABLE public.notificaciones ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix: Cotización inconsistente (ejemplo)
UPDATE cotizaciones SET estado = 'vendida', fecha_conversion = NOW() 
WHERE id = '20038bc7-7c1b-4b82-b337-e355e08edc3a';
```

O copiar el contenido del archivo y ejecutar en SQL Editor de Supabase.

---

## Archivos Modificados/Creados

### Backend:
1. ✅ `trip-conecta-api/src/controllers/cotizaciones.controller.ts` - Enriquecido getCotizacionById + fixes
2. ✅ `trip-conecta-api/src/controllers/notificaciones.controller.ts` - Fix user_id→usuario_id
3. ✅ `trip-conecta-api/src/routes/notificaciones.routes.ts` - Nuevo
4. ✅ `trip-conecta-api/src/index.ts` - Registrada ruta
5. ✅ `trip-conecta-api/migrations/008_add_notificaciones.sql` - Nuevo

### Frontend:
1. ✅ `trip-conecta-panel/src/app/(dashboard)/admin/cotizaciones/[id]/page.tsx` - Vista consolidada + fixes UI
2. ✅ `trip-conecta-panel/src/components/NotificationsBell.tsx` - Nuevo componente
3. ✅ `trip-conecta-panel/src/components/layout/Header.tsx` - Integrado

---

## Deployment

### Backend:
```bash
cd trip-conecta-api
git add .
git commit -m "feat: fixes críticos - notificaciones, sincronización venta, validaciones"
git push origin main
```

### Frontend:
```bash
cd trip-conecta-panel
git add .
git commit -m "feat: admin UI simplificada, fix paquete titulo, syntax fixes"
git push origin main
```

Coolify hará auto-deploy en ambos.

---

## Testing Checklist

- [x] Fix error 500 notificaciones (columna usuario_id)
- [x] Fix nombre paquete aparece en UI
- [x] Crear venta desde vendedor → Verificar notificación en admin
- [x] Abrir cotización vendida en admin → Ver datos completos
- [x] Ver pasajeros, vuelos, paquete en vista admin
- [x] Ver sección de pago con monto/método
- [x] Descargar comprobantes (click en botón)
- [ ] Marcar notificación como leída
- [ ] Marcar todas como leídas
- [ ] Navegar desde notificación a venta/cotización
- [ ] Sincronización correcta cotización-venta (no duplicados)

---

## Estado Actual (30 Marzo 2026)

### ✅ Completado
- Sistema de notificaciones funcional
- Vista admin consolidada para cotizaciones vendidas
- Fix de bugs críticos (sintaxis, columnas DB, sincronización)
- UI simplificada (un solo box de paquete)

### 🔄 En Progreso
- Testing de notificaciones en tiempo real
- Validación de sincronización venta-cotización

### ⏳ Pendiente
- WebSockets para notificaciones en tiempo real
- Email notifications a admin
- Filtros avanzados en lista de cotizaciones
- Export a PDF
- Testing completo QA

---

## Próximos Pasos Sugeridos

1. **Testing QA**: Usar `docs/08-TESTER-GUIDE.md` para validación
2. **Deploy a Producción**: Backend y Panel listos para deploy
3. **Monitoreo**: Verificar logs post-deploy
4. **SQL Ejecutar**: Aplicar fixes de DB en producción

---

*Documento actualizado: 30 Marzo 2026*
