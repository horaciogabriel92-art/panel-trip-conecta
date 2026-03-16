# SOP-021: Creación de Tenant en Base de Datos (Supabase)

## Objetivo
Registrar la nueva Agencia (Mayorista o Minorista) en la base de datos central de CARMEN B2B. Este registro crea la capa de aislamiento (Row Level Security) para que los datos de esta agencia nunca se mezclen con los de otras.

## Requisitos Previos
- [ ] Haber recibido el pago de Setup por la plataforma administrativa.
- [ ] Tener el nombre legal y nombre comercial de la Agencia.
- [ ] Tener acceso de Super-Admin al dashboard web de Supabase del proyecto `Trip Conecta B2B`.

## 🛠️ Instrucciones Paso a Paso (Data Entry)

### 1. Iniciar sesión en Supabase
Ingresa a `app.supabase.com` y abre el proyecto principal de Producción (ej. `Trip Conecta Producción`).

### 2. Navegar a la Tabla de Empleadores/Agencias (Tenants)
1. Ve a **Table Editor** en el menú izquierdo.
2. Abre la tabla llamada `agencias` (o `tenants` dependiendo del esquema actual).

### 3. Insertar el Nuevo Registro (Filas Lógicas)
1. Haz clic en el botón verde **"Insert Row"** (Insertar fila).
2. Llena los campos obligatorios exactamente con la información provista por el cliente en el Kick-off:
   - `nombre`: "Agencia Viajes El Sol S.A."
   - `nombre_publico`: "Viajes El Sol" (Este es el que se verá en pantalla).
   - `plan`: Selecciona si es `MIN_PREMIUM` (Minorista MRR) o `MAY_ENTERPRISE` (Mayorista B2B).
   - `dominio_solicitado`: El que ellos pidieron (ej. `b2b.viajeselsol.com`).
3. Guarda la fila.

> [!IMPORTANT]
> Apenas guardes, Supabase generará automáticamente un `id` alfanumérico largo (Ej. `512ea3...`). **Copia este ID**. Es el "Tenant ID" de la agencia. A partir de ahora TODO lo que subas para ellos requerirá pegar este ID.

### 4. Crear el Bucket de Storage Privado
CARMEN guarda documentos de viaje privados y fotos de paquetes.

1. Navega a **Storage** en el menú lateral de Supabase.
2. Si la arquitectura no usa un bucket único: Crea una carpeta o política amarrada al `Tenant ID` que copiaste para garantizar la separación de fotos y PDFs.

### 5. Confirmación RLS (Row Level Security)
Esta política ya debería estar programada por el equipo de dev de CARMEN B2B, pero como QA, verifica mentalmente:
- La tabla de `paquetes` y `usuarios` tiene la política configurada: *"¿Puede un usuario leer esto? Solo si su JWT tiene un tenant_id que coincida con la celda tenant_id de esta fila"*.

---
## 🏁 Finalización de Tarea en Asana
*   Pega el **Tenant ID** recién creado en los comentarios de la tarea de Asana como evidencia.
*   Marca la de este SOP como Completada ☑️.
*   Pasa a la siguiente Tarea en Asana (Avanzar al [SOP-022](./SOP-022-Alta-Admins.md)).
