# Roadmap - CRM Trip Conecta

> **Fecha creación:** 26 Marzo 2026  
> **Última actualización:** 27 Marzo 2026  
> **Estado:** 🟡 En desarrollo - Fase 1.3  
> **Prioridad:** Alta

---

## 🎯 Objetivo

Transformar Trip Conecta en un CRM completo donde:
- **Cliente es el centro** de todo
- **No hay duplicados** (Email o Documento como únicos)
- **Historial trazable** de todas las interacciones
- **Pasajeros reutilizables** (perfiles de viajeros)

---

## ✅ Estado General

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: Schema ✅ | Backend 🟡 | Frontend 🔴              │
│  FASE 2: Frontend Clientes 🔴                               │
│  FASE 3: Adaptar Cotización 🔴                              │
│  FASE 4: Testing 🔴                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Schema de Base de Datos (COMPLETADO)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCHEMA CRM - ACTIVO                                 │
└─────────────────────────────────────────────────────────────────────────────┘

clientes (1)  ←── Centro de todo
  │
  ├──< (N) pasajeros ── Perfiles de viajeros gestionados por este cliente
  │       │
  │       └── es_cliente_registrado: boolean (si este pasajero también es cliente)
  │
  ├──< (N) cotizaciones ── Todas las cotizaciones del cliente
  │       │
  │       ├──< (N) cotizacion_pasajeros ── Vinculación con snapshot
  │       │
  │       ├──< (N) vuelos ── Segmentos de vuelo
  │       │
  │       ├──< (N) hospedajes ── Hoteles
  │       │
  │       └──< (1) ventas ── Conversión
  │
  └──< (N) historial_cliente ── Log de todas las interacciones
          │
          └── cotizacion_creada | llamada | email | nota_interna | etc
```

### Tablas Creadas (✅ 27 Marzo 2026)

| Tabla | Estado | Archivo |
|-------|--------|---------|
| `clientes` | ✅ Lista | `005_add_fecha_envio.sql` (parcial) |
| `pasajeros` | ✅ Lista | `006_recreate_cotizaciones_doc05.sql` |
| `cotizaciones` | ✅ Recreada | `006_recreate_cotizaciones_doc05.sql` |
| `cotizacion_pasajeros` | ✅ Lista | `006_recreate_cotizaciones_doc05.sql` |
| `vuelos` | ✅ Lista | `006_recreate_cotizaciones_doc05.sql` |
| `hospedajes` | ✅ Lista | `006_recreate_cotizaciones_doc05.sql` |
| `historial_cliente` | ✅ Lista | `006_recreate_cotizaciones_doc05.sql` |

---

## 📋 Fases del Roadmap

### 🔴 FASE 1: Backend API (EN PROGRESO)

#### 1.1 Nuevo Controller: Clientes
**Archivo:** `trip-conecta-api/src/controllers/clientes.controller.ts`

| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `GET /clientes` | `getClientes` | Listar con paginación y filtros | 🔴 Pendiente |
| `GET /clientes/:id` | `getClienteById` | Detalle con pasajeros e historial | 🔴 Pendiente |
| `POST /clientes` | `createCliente` | Crear nuevo (valida duplicados) | 🔴 Pendiente |
| `PUT /clientes/:id` | `updateCliente` | Actualizar datos | 🔴 Pendiente |
| `POST /clientes/:id/pasajeros` | `addPasajero` | Agregar pasajero a cliente | 🔴 Pendiente |
| `GET /clientes/buscar?q=` | `buscarClientes` | Búsqueda fuzzy por nombre/email/doc | 🔴 Pendiente |

**Notas:**
- Validar duplicados por `email` y `tipo_documento + documento`
- Al crear cliente, crear automáticamente el pasajero titular

#### 1.2 Adaptar Controller: Cotizaciones
**Archivo:** `trip-conecta-api/src/controllers/cotizaciones.controller.ts`

| Cambio | Descripción | Estado |
|--------|-------------|--------|
| `POST /cotizaciones/manual` | Aceptar `cliente_id` o crear cliente nuevo | 🔴 Pendiente |
| `POST /cotizaciones` (paquete) | Mismo comportamiento - buscar/crear cliente | 🔴 Pendiente |
| Guardar vuelos | Insertar en tabla `vuelos` | 🔴 Pendiente |
| Guardar hospedajes | Insertar en tabla `hospedajes` | 🔴 Pendiente |
| Guardar pasajeros | Insertar en `cotizacion_pasajeros` con snapshot | 🔴 Pendiente |
| Historial | Crear registro en `historial_cliente` | 🔴 Pendiente |

**Notas:**
- El flujo ahora es: Buscar/crear cliente → Crear pasajeros → Crear cotización → Guardar vuelos/hospedajes → Registrar en historial

#### 1.3 Rutas API
**Archivo:** `trip-conecta-api/src/routes/clientes.routes.ts` (nuevo)

```typescript
router.get('/', authenticateToken, clientesController.getClientes);
router.get('/buscar', authenticateToken, clientesController.buscarClientes);
router.get('/:id', authenticateToken, clientesController.getClienteById);
router.post('/', authenticateToken, clientesController.createCliente);
router.put('/:id', authenticateToken, clientesController.updateCliente);
router.post('/:id/pasajeros', authenticateToken, clientesController.addPasajero);
```

---

### 🔴 FASE 2: Frontend - Gestión de Clientes

#### 2.1 Nueva Página: `/admin/clientes`
**Archivo:** `trip-conecta-panel/src/app/(dashboard)/admin/clientes/page.tsx`

```
┌─────────────────────────────────────┐
│ 👥 Clientes                 [+ Nuevo]
│                                     │
│ 🔍 Buscar cliente...               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Juan Pérez                   │ │
│ │ juan@email.com | CI 12345678    │ │
│ │ 3 cotizaciones | Última: 15 Mar │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 👤 María López                  │ │
│ │ maria@email.com | CI 87654321   │ │
│ │ 1 cotización | Última: 10 Mar   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Lista paginada de clientes
- Búsqueda en tiempo real (fuzzy)
- Filtros por fecha de registro, cantidad de cotizaciones
- Botón "+ Nuevo Cliente" (modal o página)

#### 2.2 Nueva Página: `/admin/clientes/[id]`
**Archivo:** `trip-conecta-panel/src/app/(dashboard)/admin/clientes/[id]/page.tsx`

Tabs:
- **📋 Info:** Datos personales + pasajeros frecuentes (listado de pasajeros del cliente)
- **📊 Historial:** Timeline de interacciones (desde `historial_cliente`)
- **✈️ Viajes:** Lista de cotizaciones del cliente
- **💬 Notas:** Notas internas del CRM

#### 2.3 Servicio API Clientes
**Archivo:** `trip-conecta-panel/src/lib/api-clientes.ts`

```typescript
export const clientesAPI = {
  listar: (params?: { q?: string; page?: number }) => Promise<...>,
  buscar: (query: string) => Promise<...>,
  obtener: (id: string) => Promise<...>,
  crear: (data: ClienteInput) => Promise<...>,
  actualizar: (id: string, data: Partial<ClienteInput>) => Promise<...>,
  agregarPasajero: (clienteId: string, data: PasajeroInput) => Promise<...>,
};
```

---

### 🔴 FASE 3: Adaptar Flujo Cotización

#### 3.1 Paso 1: Seleccionar Cliente
**Archivo:** Modificar `/cotizacion/nueva` y `/admin/cotizacion/nueva`

```
┌─────────────────────────────────────┐
│ Buscar cliente existente            │
│ [🔍 Escribir nombre, email o CI...] │
│                                     │
│ Sugerencias:                        │
│ • 👤 Juan Pérez (juan@email.com)   │
│ • 👤 Juan García (juan.g@email.com)│
│                                     │
│ [+ Crear nuevo cliente]             │
└─────────────────────────────────────┘
```

**Features:**
- Búsqueda debounce (300ms)
- Mostrar datos del cliente seleccionado
- Botón "Crear nuevo cliente" abre modal con formulario

#### 3.2 Paso 2: Seleccionar Pasajeros
**Archivo:** Modificar flujo de cotización

- Titular: El cliente seleccionado (automático)
- Listado de "pasajeros frecuentes" de este cliente (dropdown/checkboxes)
- Botón "+ Agregar pasajero nuevo" (formulario inline)

#### 3.3 Guardar Cotización
- Crear registro en `cotizaciones` con `cliente_id`
- Crear registros en `cotizacion_pasajeros` (con snapshot de datos)
- Crear registros en `vuelos` (si hay)
- Crear registros en `hospedajes` (si hay)
- Crear registro en `historial_cliente` (tipo: "cotizacion_creada")

---

### 🔴 FASE 4: Testing y Deploy

| Tarea | Responsable | Estado |
|-------|-------------|--------|
| QA Test endpoints clientes | Dev | 🔴 Pendiente |
| QA Test flujo cotización completo | Dev | 🔴 Pendiente |
| Test duplicados (email/doc) | Dev | 🔴 Pendiente |
| Test pasajeros snapshot | Dev | 🔴 Pendiente |
| Deploy a producción | DevOps | 🔴 Pendiente |

---

## 🚨 ATENCIÓN: Código Actual ROTO

Después de ejecutar el SQL de migración, el sistema actual **NO FUNCIONA** para cotizaciones:

| Funcionalidad | Estado | Razón |
|---------------|--------|-------|
| Crear cotización desde paquete | ❌ Roto | Falta `cliente_id` obligatorio |
| Crear cotización manual (vendedor) | ❌ Roto | Falta `cliente_id` obligatorio |
| Crear cotización manual (admin) | ❌ Roto | Falta `cliente_id` obligatorio |
| Ver cotizaciones existentes | ⚠️ Posible | Si no se borraron datos, pueden fallar FKs |

**⚡ Prioridad inmediata:** Implementar controller de clientes y adaptar cotizaciones.

---

## ✅ Checklist de Tareas

### Backend (Fase 1)
- [ ] Crear `clientes.controller.ts` con endpoints CRUD
- [ ] Crear `clientes.routes.ts` y registrar en app
- [ ] Adaptar `createCotizacionManual` para manejar clientes
- [ ] Adaptar `createCotizacion` (desde paquete) para manejar clientes
- [ ] Implementar guardado de vuelos en tabla `vuelos`
- [ ] Implementar guardado de hospedajes en tabla `hospedajes`
- [ ] Implementar guardado de pasajeros en `cotizacion_pasajeros`
- [ ] Implementar registro en `historial_cliente`

### Frontend (Fase 2)
- [ ] Crear página `/admin/clientes`
- [ ] Crear página `/admin/clientes/[id]`
- [ ] Crear servicio `api-clientes.ts`
- [ ] Crear componente `BuscarCliente` (para usar en cotización)
- [ ] Crear componente `SeleccionarPasajeros`
- [ ] Modificar `/cotizacion/nueva` con nuevo flujo
- [ ] Modificar `/admin/cotizacion/nueva` con nuevo flujo

---

## 📁 Archivos Relacionados

- `docs/05-CRM-REDISENHO.md` - Schema detallado SQL
- `docs/06-QA-CHECKLIST.md` - Checklist de testing
- `trip-conecta-api/migrations/006_recreate_cotizaciones_doc05.sql` - Última migración

---

## 📝 Notas de Implementación

### Flujo de Crear Cotización (nuevo):

```
1. BUSCAR/CREAR CLIENTE
   ↓
   - Buscar por email, CI o nombre
   - Si existe: usar ese cliente_id
   - Si no existe: crear cliente → crear pasajero titular

2. SELECCIONAR PASAJEROS
   ↓
   - Titular: el cliente (fijo)
   - Adicionales: elegir de pasajeros frecuentes del cliente
   - O crear nuevos pasajeros

3. DATOS DEL VIAJE
   ↓
   - Vuelos (parsear Amadeus o manual)
   - Hospedajes (hoteles)
   - Itinerario, incluye/no_incluye

4. PRECIOS Y GUARDAR
   ↓
   - Calcular totales
   - Crear cotización
   - Guardar vuelos en tabla vuelos
   - Guardar hospedajes en tabla hospedajes
   - Guardar pasajeros en cotizacion_pasajeros (snapshot)
   - Registrar en historial_cliente
```

---

**Última actualización:** 27 Marzo 2026  
**Próxima revisión:** Cuando se complete Fase 1 (Backend)
