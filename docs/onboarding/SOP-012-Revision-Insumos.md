# SOP-012: Revisión de Insumos Recibidos

## Objetivo
Verificar que la información cargada por el cliente en el Formulario de Airtable o Typeform sea sólida, útil y cumplo con los formatos exigidos. Si la "Materia Prima" entra sucia (imágenes de baja calidad, Excel roto, colores no hexadecimales), el software se verá mal.

## Requisitos Previos
- [ ] Recibir alerta de HubSpot, Airtable o Typeform con los datos del cliente.
- [ ] Tener una Tarea en Asana con el Nombre de la Agencia a un lado.

## 🛠️ Instrucciones Paso a Paso (Auditoría de Insumos)

### 1. Descargar Archivos de la Base Formulada (Airtable)
Entra al registro recién creado o notificado por Airtable y descarga todos los adjuntos (Excel de Destinos, Logotipos).

### 2. Revisión del Logotipo y Marca Lógica
- [ ] ¿Viene en formato PNG transparente o SVG vectorial? Si viene en JPG con fondo blanco horroroso, detén el proceso y responde: *"Señor Cliente, para que su portal luzca premium necesitamos un PNG con fondo transparente"*.
- [ ] ¿El texto del formulario especifica un **color primario principal en Hexadecimal puro** (ej. `#FF5500`) y no frases abiertas como *"azul oscuro"*? Si escribieron *"azul oscuro"*, devuélveles un correo con la tabla hexadecimal pidiendo el exacto.

### 3. Revisión del Excel Semilla (Sanidad de Datos)
Abre el archivo `.xlsx` (o Google Sheets) que cargó el Mayorista:
1. **Obligatorio:** ¿Entregó al menos 15 a 20 paquetes para la carga inicial?
2. **Columnas Limpias:** Asegúrate que no haya mezclado "Precios" con texto. La columna de "Precio Doble" debe ser un número entero (`1500`), no un string de tipo `"1,500 dólares"`. Si hay letras, tendrás que limpiarlo en tu Excel con la fórmula Buscar y Reemplazar.
3. **Fotos Enlazadas:** Cada fila de viaje en su Excel debe tener la columna "URL Foto". Ábrela para confirmar que el Link lleva a un Google Drive público que permita descargar las imágenes libremente (y no requiera solicitud de acceso, lo cual bloquearía tu workflow).

## 🏁 Finalización de Tarea en Asana
*   Sube el `Logo_Limpio.png` y el `Excel_Limpio.xlsx` a los adjuntos de la Tarea principal en Asana.
*   En los comentarios anota: "Auditoría de insumos exitosa, listos para Fase Setup Técnico".
*   Marca la de este SOP como Completada ☑️.
*   Avanza al [SOP-021: Creación de Tenant](./SOP-021-Setup-Supabase-Tenant.md).
