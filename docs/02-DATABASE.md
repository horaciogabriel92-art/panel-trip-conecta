# 02 - Base de Datos

**Schema de PostgreSQL (Supabase)**

---

## 📊 Diagrama de Tablas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 USERS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ email │ password │ nombre │ apellido │ rol │ comision_porcentaje │
└─────────────────┴───────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                VENTAS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ numero_venta │ vendedor_id (FK) │ cliente_nombre │ precio_total │
│ comision_monto │ comision_estado │ estado │ fecha_creacion │ ...          │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOCUMENTOS_VIAJE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ venta_id (FK) │ tipo │ nombre_archivo │ ruta_archivo │ ...       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                               PAQUETES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ codigo │ titulo │ descripcion │ duracion_dias │ tipo │ status   │
│ precio_doble │ precio_triple │ precio_cuadruple │ imagen_url │ galeria    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             COTIZACIONES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ codigo │ vendedor_id (FK) │ paquete_id (FK) │ cliente_nombre    │
│ num_pasajeros │ precio_total │ estado │ fecha_creacion │ ...               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Tablas Detalladas

### 1. `users`
Vendedores y administradores del sistema.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PK |
| email | varchar(255) | NO | - | Único |
| password | varchar(255) | NO | - | Bcrypt hash |
| nombre | varchar(100) | NO | - | - |
| apellido | varchar(100) | YES | - | - |
| rol | enum | NO | 'vendedor' | 'admin' o 'vendedor' |
| telefono | varchar(50) | YES | - | - |
| comision_porcentaje | decimal(5,2) | NO | 12.00 | % de comisión |
| activo | boolean | NO | true | - |
| fecha_creacion | timestamp | NO | now() | - |

**Índices:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
```

---

### 2. `paquetes`
Paquetes turísticos publicados por admin.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PK |
| codigo | varchar(50) | NO | - | Único (PKG-2024-001) |
| titulo | varchar(200) | NO | - | Nombre del paquete |
| descripcion | text | YES | - | Descripción larga |
| duracion_dias | integer | NO | - | Duración del viaje |
| tipo | enum | NO | - | 'internacional', 'nacional', 'circuito' |
| status | enum | NO | 'activo' | 'activo', 'pausado', 'eliminado' |
| precio_doble | decimal(12,2) | NO | - | Precio base habitación doble |
| precio_triple | decimal(12,2) | YES | - | Precio habitación triple |
| precio_cuadruple | decimal(12,2) | YES | - | Precio habitación cuádruple |
| imagen_url | varchar(500) | YES | - | URL imagen principal (Supabase) |
| galeria | jsonb | YES | [] | Array de URLs de imágenes |
| itinerario | jsonb | YES | [] | Array de días con actividades |
| incluye | jsonb | YES | [] | Array de servicios incluidos |
| no_incluye | jsonb | YES | [] | Array de servicios no incluidos |
| cupos_disponibles | integer | NO | 0 | Cupos disponibles |
| fecha_creacion | timestamp | NO | now() | - |

**Notas:**
- Los campos JSON (`itinerario`, `incluye`, `no_incluye`, `galeria`) permiten estructuras flexibles.
- Frontend usa `nombre` (mapeado a `titulo`) y `duracion` (mapeado a `duracion_dias`).

---

### 3. `cotizaciones`
Presupuestos solicitados por vendedores.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PK |
| codigo | varchar(50) | NO | - | Único (COT-2024-XXXXX) |
| vendedor_id | uuid | NO | - | FK → users |
| paquete_id | uuid | NO | - | FK → paquetes |
| cliente_nombre | varchar(200) | NO | - | - |
| cliente_email | varchar(255) | NO | - | - |
| cliente_telefono | varchar(50) | YES | - | - |
| num_pasajeros | integer | NO | 1 | - |
| tipo_habitacion | enum | NO | 'doble' | 'single', 'doble', 'triple', 'cuadruple' |
| fecha_salida | date | YES | - | - |
| precio_total | decimal(12,2) | YES | - | Calculado por backend |
| comision_vendedor | decimal(12,2) | YES | - | Calculado (12% por defecto) |
| estado | enum | NO | 'pendiente' | 'pendiente', 'respondida', 'convertida', 'vencida', 'cancelada' |
| notas | text | YES | - | - |
| fecha_creacion | timestamp | NO | now() | - |
| fecha_expiracion | timestamp | YES | - | - |

**Estados de Cotización:**
- `pendiente`: Cliente pidió cotización
- `respondida`: Admin respondió con precio
- `convertida`: Se convirtió en venta
- `vencida`: Pasó fecha de expiración
- `cancelada`: Cancelada por admin o vendedor

---

### 4. `ventas`
Cierres confirmados de cotizaciones.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PK |
| numero_venta | varchar(50) | NO | - | Único (VEN-2024-XXXXX) |
| vendedor_id | uuid | NO | - | FK → users |
| cotizacion_id | uuid | YES | - | FK → cotizaciones (nullable) |
| cliente_nombre | varchar(200) | NO | - | - |
| cliente_email | varchar(255) | NO | - | - |
| cliente_telefono | varchar(50) | YES | - | - |
| paquete_nombre | varchar(200) | NO | - | Denormalizado |
| num_pasajeros | integer | NO | - | - |
| fecha_salida | date | YES | - | - |
| precio_total | decimal(12,2) | NO | - | - |
| comision_monto | decimal(12,2) | NO | - | 12% por defecto |
| comision_estado | enum | NO | 'pendiente' | 'pendiente', 'pagada' |
| comision_fecha_pago | timestamp | YES | - | - |
| estado | enum | NO | 'confirmada' | 'confirmada', 'en_proceso', 'emitida', 'cancelada', 'reembolsada' |
| fecha_creacion | timestamp | NO | now() | - |
| notas | text | YES | - | - |

**Estados de Venta:**
- `confirmada`: Venta recién creada
- `en_proceso`: En preparación
- `emitida`: Documentos subidos y listos
- `cancelada`: Cancelada
- `reembolsada`: Reembolsada

---

### 5. `documentos_viaje`
Archivos subidos a las ventas (boletos, vouchers, etc.).

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PK |
| venta_id | uuid | NO | - | FK → ventas |
| tipo | enum | NO | 'otro' | 'boleto_aereo', 'voucher_hotel', 'voucher_actividad', 'seguro', 'itinerario_final', 'e_ticket', 'boarding_pass', 'otro' |
| nombre_archivo | varchar(255) | NO | - | Nombre original |
| ruta_archivo | varchar(500) | NO | - | **Path en VPS** (/data/trip-conecta/...) |
| descripcion | text | YES | - | - |
| subido_por | uuid | NO | - | FK → users (admin) |
| fecha_subida | timestamp | NO | now() | - |

**Importante:** `ruta_archivo` guarda el path físico en el VPS, NO una URL pública.

---

### 6. `pagos_comisiones`
Registro de pagos de comisiones a vendedores.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PK |
| vendedor_id | uuid | NO | - | FK → users |
| venta_id | uuid | NO | - | FK → ventas |
| monto | decimal(12,2) | NO | - | - |
| metodo_pago | varchar(50) | YES | - | 'transferencia', 'efectivo', etc. |
| referencia_pago | varchar(100) | YES | - | Número de comprobante |
| pagado_por | uuid | NO | - | FK → users (admin) |
| notas | text | YES | - | - |
| fecha_pago | timestamp | NO | now() | - |

---

## 🔗 Relaciones

```
users (1) ───< (N) ventas
users (1) ───< (N) cotizaciones
users (1) ───< (N) documentos_viaje (como subido_por)
users (1) ───< (N) pagos_comisiones (como vendedor o pagado_por)

paquetes (1) ───< (N) cotizaciones

ventas (1) ───< (N) documentos_viaje
ventas (1) ───< (N) pagos_comisiones

cotizaciones (0..1) ─── (1) ventas (nullable FK)
```

---

## 🔐 Políticas RLS (Row Level Security)

Todas las tablas tienen RLS habilitado con políticas:

```sql
-- Ejemplo para tabla ventas
CREATE POLICY "Allow all access to authenticated users"
ON public.ventas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

**Nota:** En producción, se deben restringir políticas por rol.

---

**Próximo paso:** Ver [03-API.md](./03-API.md)
