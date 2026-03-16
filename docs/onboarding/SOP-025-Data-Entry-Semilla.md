# SOP-025: Carga de Datos Semilla (Excel a PostgreSQL)

## Objetivo
Un software vacío no sirve de nada y desmotiva al dueño en su primer inicio de sesión. El objetivo es tomar el Excel de "Los 20 Paquetes Estrella" que nos enviaron, limpiarlo, formatearlo y subir masivamente esos datos al `Tenant` (La Base de Datos de la Agencia) para crear el "Efecto Wow" el día que le entreguemos la llave.

## Requisitos Previos
- [ ] Tener el Excel que nos envió el cliente validado y limpio (SOP-012).
- [ ] Conocer el ID Largo de la Agencia (`Tenant_id`) (SOP-021).
- [ ] Tener acceso a las cuentas maestras de Supabase o scripts de inserción (Node.js/Python).

## 🛠️ Instrucciones de Procesamiento de Datos

### 1. Preparación del Excel o CSV
El Excel que subió el cliente nunca estará en SQL directamente. Seguramente usarás un script de importación masiva. 
Abre el archivo original y aplica una tabla pivote o ajusta manualmente las cabeceras para que coincida con la tabla de DB:
-   `titulo` (Ej. Caribe Mágico Clásico).
-   `descripcion`.
-   `duracion_dias` (Número).
-   `tipo` (Ver tipos permitidos: `nacional`, `internacional`, `corporativo`).
-   `precio_doble`, `precio_triple` y `precio_cuadruple` (Solo usar números decimales sin símbolos de $ o palabras).
-   `cupos_disponibles` (entero).

### 2. Guardar el CSV Limpio
Guarda la versión depurada como *"Semilla_Viajes_El_Sol.csv"* para que sea compatible con las herramientas nativas.

### 3. Inserción Directa usando Supabase CSV Import Tool (El método visual UI)
Si `CARMEN B2B` usa el panel genérico de Supabase para las tablas, puedes:

1. Ingresar a Supabase Panel > **Table Editor**.
2. Abrir la tabla `paquetes`.
3. Haz clic en **Insertar → Cargar datos CSV**.
4. ¡CUIDADO! Supabase no sabrá "a qué agencia atribuir" estos 20 nuevos registros si tu CSV no tiene una columna llamada `tenant_id`.
   - **Solución Obligatoria:** En tu CSV debes copiar y pegar el ID del cliente (Ej. `512ea3...`) en absolutamente todos los 20 registros bajo la celda/columna que coincida con la clave foránea de pertenencia.
5. Inicia el asistente de mapeo de columnas (Asegúrate que `precio_doble` se ligue a `#precio_doble` tipo entero/flotante).
6. Presiona **Importar**.

### 4. (Alternativa) Inserción Vía Script (Si existe API/Script B2B Automático)
Si los desarrolladores armaron un Endpoint Batch `POST /api/admin/paquetes/batch`, úsalo. Le pasarás tu JWT de Super-Admin en el Header de un Insomnia o Postman, adjuntarás el JSON con el array de 20 paquetes (enlazando siempre al Tenant).

### 5. La Subida de Imágenes Fotográficas
1. Si el cliente subió 20 Links de Google Drive a sus carpetas:
   - Descarga comprimido (zip) las fotos en tu equipo.
2. Ingresa a `Supabase Storage` -> `paquetes-imagenes` (El Bucket).
3. Entra a la Terminal SQL (o tu base del Panel Vendedor, si está lista en Frontend).
4. Subir la Foto, extraer su "URL Pública" y ligarla ("Update") a la celda `imagen_url` del paquete N°1 que acabas de cargar.
*(Asigna horas suficientes a esta tarea si el cliente envió resoluciones gigantescas, deberías pasarlas por Squoosh o Sharp)*.

---

## 🏁 Finalización de Tarea en Asana
*   Anota: "Catálogo Semilla de 20 Paquetes Inyectado".
*   Marca este SOP como Completado ☑️.
*   Pasa a la [SOP-031: Quality Assurance del Frontend](./SOP-031-QA-Auditoria.md).
