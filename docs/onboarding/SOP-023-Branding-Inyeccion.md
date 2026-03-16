# SOP-023: Inyección de Marca (Branding Hexadecimal)

## Objetivo
"Vestir" el motor genérico Multi-Tenant de CARMEN B2B con la *ilusión óptica* de que fue desarrollado desde cero para el cliente. Esto requiere mapear sus colores y logotipo al `Tenant_Id` para que Next.js responda dinámicamente cuando entren por su puerta/dominio.

## Requisitos Previos
- [ ] Haber obtenido el Código de Color Principal Hex (Ej. `#FF5500`) y las Letras de Tipografía.
- [ ] Tener el Logotipo de Alta Calidad (PNG Transparente descargado en SOP-012).
- [ ] Recordar el famoso ID largo del Cliente (`Tenant_Id`).

## 🛠️ Instrucciones Paso a Paso (UI Themes / Base de Datos)
Existen dos formas posibles que los desarrolladores diseñan. La "Forma Avanzada DB" o la "Forma Variables de Entorno". 
*(Asumimos la primera en Arquitectura Modular).*

### 1. Ingesta del Logo (Supabase Storage)
Si usas Supabase como CMS de identidad visual:
1. Abre Supabase > Storage y entra al bucket donde se guarden los avatares/logos (Ej. `logos-compania`). 
2. Sube el `.png` con el nombre de archivo estandarizado como `Logo_[tenant_id].png` (Ej. `Logo_512ea3x.png`).
3. Da clic derecho al archivo recién cargado y obtén la **URL Pública** (Get URL). Se verá algo como `https://fcag...supabase.co/storage/v1/object/public/logos-compania/Logo_512ea3x.png`.

### 2. Actualizar las Opciones del Tenant (PostgreSQL)
Tienes que decirle al sistema que este Tenant usará este color.

1. Ve a Supabase -> **Table Editor** o ejecuta SQL.
2. Encuentra la tabla de características (`agencias` o `tenant_config`).
3. Localiza la fila de "Viajes El Sol" (Búscala por su `Tenant_Id`).
4. Edita la celda `color_primario` y pega el valor: `#FF5500`.
5. Edita la celda `color_secundario` (o déjalo nulo si usaron 1 solo).
6. Edita la celda `logo_url` y pega la inmensa URL pública de Supabase que copiaste arriba.
7. Guarda.

### 3. (Condicional) Selección de Plantilla B2C Minorista
Si El Cliente Minorista pagó el Escenario de App SaaS con Website Constructor (*Website Builder*):
- Existe una celda en tu DB llamada `template_activa` o similar.
- Abre tu glosario de plantillas: 
  - `Template_1`: Lujo/Oscura.
  - `Template_2`: Playera/Colorida.
  - `Template_3`: Corporativa.
- Modifica el string de BD ingresando `Template_2` si el cliente llenó eso en el Kick-Off Airtable.

## 🏁 Finalización de Tarea en Asana
*   Copia el bloque `{ Color: '#FF5500', Logo_Url: 'https://...' }` como apunte técnico del cliente.
*   Marca la Tarea como Completada ☑️.
*   Pasa al [SOP-024: Apuntado DNS (La Parte Final Técnica)](./SOP-024-Configuracion-DNS-Coolify.md).
