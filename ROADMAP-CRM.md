# Roadmap - CRM Trip Conecta

> **Fecha creación:** 26 Marzo 2026  
> **Última actualización:** 28 Marzo 2026  
> **Estado:** 🟡 En desarrollo - Fase 2 (Testing)  
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
│  FASE 1: Schema ✅ | Backend ✅ | Frontend ✅              │
│  FASE 2: Frontend Clientes ✅ (Listo para testing)         │
│  FASE 3: Adaptar Cotización ✅ (Listo para testing)        │
│  FASE 4: Testing 🟡 (Pendiente QA)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Schema de Base de Datos (✅ COMPLETADO - 27 Marzo 2026)

### Tablas Creadas

| Tabla | Estado | Archivo SQL |
|-------|--------|-------------|
| `clientes` | ✅ | `006_recreate_cotizaciones_doc05.sql` |
| `pasajeros` | ✅ | `006_recreate_cotizaciones_doc05.sql` |
| `cotizaciones` | ✅ | `006_recreate_cotizaciones_doc05.sql` |
| `cotizacion_pasajeros` | ✅ | `006_recreate_cotizaciones_doc05.sql` |
| `vuelos` | ✅ | `006_recreate_cotizaciones_doc05.sql` |
| `hospedajes` | ✅ | `006_recreate_cotizaciones_doc05.sql` |
| `historial_cliente` | ✅ | `006_recreate_cotizaciones_doc05.sql` |

---

## 📋 Fases del Roadmap

### ✅ FASE 1: Backend API (COMPLETADO - 27 Marzo 2026)

#### 1.1 Controller: Clientes
**Archivo:** `trip-conecta-api/src/controllers/clientes.controller.ts` ✅

| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `GET /clientes` | `getClientes` | Listar con paginación y filtros | ✅ |
| `GET /clientes/:id` | `getClienteById` | Detalle con pasajeros e historial | ✅ |
| `POST /clientes` | `createCliente` | Crear nuevo (valida duplicados) | ✅ |
| `PUT /clientes/:id` | `updateCliente` | Actualizar datos | ✅ |
| `POST /clientes/:id/pasajeros` | `addPasajero` | Agregar pasajero a cliente | ✅ |
| `GET /clientes/buscar?q=` | `buscarClientes` | Búsqueda fuzzy | ✅ |

#### 1.2 Adaptar Controller: Cotizaciones
**Archivo:** `trip-conecta-api/src/controllers/cotizaciones.controller.ts` ✅

| Cambio | Descripción | Estado |
|--------|-------------|--------|
| `POST /cotizaciones/manual` | Aceptar `cliente_id` o crear cliente nuevo | ✅ |
| Guardar vuelos | Insertar en tabla `vuelos` | ✅ |
| Guardar hospedajes | Insertar en tabla `hospedajes` | ✅ |
| Guardar pasajeros | Insertar en `cotizacion_pasajeros` con snapshot | ✅ |
| Historial | Crear registro en `historial_cliente` | ✅ |

#### 1.3 Rutas API
**Archivo:** `trip-conecta-api/src/routes/clientes.routes.ts` ✅

---

### ✅ FASE 2: Frontend - Gestión de Clientes (COMPLETADO - 28 Marzo 2026)

#### 2.1 Página: `/admin/clientes` ✅
**Archivo:** `trip-conecta-panel/src/app/(dashboard)/admin/clientes/page.tsx`

- [x] Lista paginada de clientes
- [x] Búsqueda en tiempo real (fuzzy)
- [x] Acceso desde sidebar (nuevo ítem "Clientes")

#### 2.2 Componentes CRM ✅

| Componente | Archivo | Descripción | Estado |
|------------|---------|-------------|--------|
| `BuscarCliente` | `src/components/cotizaciones/BuscarCliente.tsx` | Búsqueda con autocompletar | ✅ |
| `CrearClienteModal` | `src/components/cotizaciones/CrearClienteModal.tsx` | Modal para crear cliente nuevo | ✅ |

#### 2.3 Servicio API Clientes ✅
**Archivo:** `trip-conecta-panel/src/lib/api-clientes.ts`

```typescript
clientesAPI.listar(params)
clientesAPI.buscar(query)
clientesAPI.obtener(id)
clientesAPI.crear(data)
clientesAPI.actualizar(id, data)
clientesAPI.getPasajeros(clienteId)
clientesAPI.agregarPasajero(clienteId, data)
```

---

### ✅ FASE 3: Adaptar Flujo Cotización (COMPLETADO - 28 Marzo 2026)

#### 3.1 Cotización Manual (`/cotizacion/nueva`) ✅
**Archivo:** `trip-conecta-panel/src/app/(dashboard)/cotizacion/nueva/page.tsx`

- [x] Paso 1: Buscar/Crear cliente con `BuscarCliente`
- [x] Modal `CrearClienteModal` para nuevos clientes
- [x] Submit adaptado al formato CRM (envía `cliente_id`)
- [x] Guarda pasajeros adicionales

#### 3.2 Cotización desde Paquete (`/paquetes/[id]/cotizar`) ✅
**Archivo:** `trip-conecta-panel/src/app/(dashboard)/paquetes/[id]/cotizar/page.tsx`

- [x] **Fecha de salida automática**: Toma del paquete (`paquete.fecha_salida` o `paquete.fecha_inicio`)
- [x] Buscar/Crear cliente con componentes CRM
- [x] Submit adaptado al formato CRM
- [x] Calcula precio según tipo de habitación y pasajeros

#### 3.3 Cambios en Backend API (Cotizaciones)

El endpoint `POST /cotizaciones/manual` ahora acepta:

```typescript
{
  cliente_id?: string;           // Cliente existente
  cliente_nuevo?: ClienteInput;  // O crear nuevo
  pasajeros_ids?: string[];      // IDs de pasajeros existentes
  pasajeros_nuevos?: PasajeroInput[]; // Nuevos pasajeros
  pasajero_titular_id?: string;
  nombre_cotizacion: string;
  tipo_cotizacion: 'paquete' | 'manual';
  origen_datos: 'manual' | 'amadeus_pnr';
  vuelos: VueloInput[];
  hospedajes: HospedajeInput[];
  itinerario?: { texto: string, dias: any[] };
  incluye: string[];
  no_incluye: string[];
  precios: { moneda, subtotal, impuestos, total };
}
```

---

### 🟡 FASE 4: Testing y Deploy (EN PROGRESO)

| Tarea | Estado | Notas |
|-------|--------|-------|
| Deploy backend CRM | ✅ | Commit `c7d7e32` |
| Deploy frontend CRM | 🟡 | En progreso |
| Test crear cliente | 🔴 | Pendiente |
| Test buscar cliente | 🔴 | Pendiente |
| Test cotización manual | 🔴 | Pendiente |
| Test cotización desde paquete | 🔴 | Pendiente |
| Test duplicados (email/doc) | 🔴 | Pendiente |
| Verificar historial_cliente | 🔴 | Pendiente |
| Test pasajeros snapshot | 🔴 | Pendiente |

---

## 🚀 Flujo de Uso (Nuevo)

### Crear Cotización Manual
```
1. Ir a /cotizacion/nueva
2. Buscar cliente existente o crear nuevo
3. Agregar pasajeros adicionales (opcional)
4. Ingresar vuelos (Amadeus o manual)
5. Ingresar hospedajes
6. Definir itinerario y condiciones
7. Establecer precios
8. Guardar → Crea:
   - Cotización con cliente_id
   - Pasajeros en tabla pasajeros
   - Vuelos en tabla vuelos
   - Hospedajes en tabla hospedajes
   - Vínculos en cotizacion_pasajeros
   - Registro en historial_cliente
```

### Crear Cotización desde Paquete
```
1. Ir a /paquetes/[id]
2. Click "Cotizar"
3. Fecha de salida ya viene del paquete (no se pide)
4. Buscar cliente o crear nuevo
5. Definir pasajeros adicionales
6. Guardar → Mismo flujo que arriba
```

---

## 📝 Para el PDF (Futuro)

Todos los datos quedan correctamente estructurados:

| Dato | Origen | Tabla/JSONB |
|------|--------|-------------|
| Cliente | `cotizaciones.cliente_id` → JOIN `clientes` | `clientes` |
| Pasajeros | `cotizacion_pasajeros` con snapshot | `cotizacion_pasajeros` |
| Vuelos | `vuelos.cotizacion_id` | `vuelos` |
| Hospedajes | `hospedajes.cotizacion_id` | `hospedajes` |
| Itinerario | `cotizaciones.itinerario` | JSONB |
| Incluye/No incluye | `cotizaciones.paquete_data` | JSONB |
| Precios | `cotizaciones.precio_total` | `cotizaciones` |

---

## 📁 Archivos Relacionados

### Backend
- `trip-conecta-api/src/controllers/clientes.controller.ts` - CRUD clientes
- `trip-conecta-api/src/controllers/cotizaciones.controller.ts` - Adaptado CRM
- `trip-conecta-api/src/routes/clientes.routes.ts` - Rutas clientes

### Frontend
- `trip-conecta-panel/src/lib/api-clientes.ts` - Servicio API
- `trip-conecta-panel/src/components/cotizaciones/BuscarCliente.tsx` - Buscador
- `trip-conecta-panel/src/components/cotizaciones/CrearClienteModal.tsx` - Modal
- `trip-conecta-panel/src/app/(dashboard)/admin/clientes/page.tsx` - Lista clientes
- `trip-conecta-panel/src/app/(dashboard)/cotizacion/nueva/page.tsx` - Manual
- `trip-conecta-panel/src/app/(dashboard)/paquetes/[id]/cotizar/page.tsx` - Desde paquete

### Database
- `trip-conecta-api/migrations/006_recreate_cotizaciones_doc05.sql` - Schema completo

---

**Última actualización:** 28 Marzo 2026  
**Próximo paso:** Testing y validación de todo el flujo
