# SOP-031: Auditoría Visual y Flujo (QA)

## Objetivo
El Asistente (QA) realiza un examen del sistema adoptando el rol del Mayorista o Minorista que acaba de adquirir CARMEN B2B. Ningún cliente debe ver el software hasta que este SOP esté **100% aprobado** en el entorno de pruebas de la agencia.

## 🛠️ Instrucciones de Prueba de Calidad (Quality Assurance)

### 1. El Test del Disfraz (Personalización Front-End)
Antes que nada, Next.js tiene que estar engañando visualmente al cliente.
1. Abre tu navegador (Google Chrome) en Modo Incógnito (Ctrl+Shift+N).
2. Ingresa a la URL exacta que le acaban de apuntar al cliente. Ej: `https://b2b.agencia-x.com`.

**El Checklist del QA:**
- [ ] ¿El Logo en el header pertenece a "Agencia X" (y no dice Trip Conecta/CARMEN)?
- [ ] ¿El color de los botones principales (Color Primario) respeta el Hexadecimal inyectado (SOP-023)?
- [ ] El Favicon (Iconito de la pestaña del navegador) ¿Ha cambiado o sigue siendo el estándar?
*(Si algún punto falla, regresa a la configuración de la BD o las variables de tu entorno).*

### 2. Simulación de Rango y Flujo Lógico de Venta
Comprobar roles y restricciones del Backend. Entraremos con dos disfraces.

#### A. Disfraz de Vendedor Independiente (Closer)
1. Ve a la pantalla de Login y entra con el Vendedor 1 "Juan Perez" que creaste (`vendedor1@agencia-x.com`).
2. Tómale lista al panel: No debe haber opciones de "Configurar Comisiones" ni "Ajustes Base".
3. Ve a la sección de [Paquetes] / Catálogo. Selecciona el Paquete N° 5. 
4. **Prueba de Fuego (PDF):** Haz clic en "Generar Cotización Mágica". Rellena datos falsos ('Pepe Prueba', 3 pasajeros).
5. Dale a "Descargar PDF".
6. Abre el PDF. ¿Lleva el logo del Vendedor y los colores del Cliente? ¿Dice 3 pasajeros a $1,000 cada uno?
7. Da clic en el botón de **"Convertir a Venta!"**.

#### B. Disfraz de Dueño / Admin (El Back-Office)
1. Cierra sesión y Loguéate como Administrador (Dueño de Agencia X).
2. Ve al panel de "Cotizaciones/Ventas Recientes".
3. **Control Ciego:** ¿Puede ver la cotización falsa de 'Pepe Prueba' que acabas de meter con el perfil del vendedor? 
4. Entra al perfil del Vendedor 'Juan Perez'. **Prueba de Fuego Lógica Matemática:**
   Revisa tu código o tabla: *"Si la comisión preestablecida es 12%, ¿está la cartera de Juan Perez diciendo que le debes $120 de comisión al vendedor por los $1000 que acaba de ganar tu sistema?"*. 
5. Clica el botón de "Pagar Comisión". Revisa si cambia de estado *Pendiente* a *Pagada*.

### 3. Evidencias y Troubleshooting

Si algo tronó:  Revisa el contenedor de la API (Docker Logs de Coolify -> `trip-conecta-api`).
- ¿Error 500? El JWT expiró, falló el RLS del Tenant u olvidaron cargar el archivo .ENV.
- ¿Logo no cambia? Verifica que Supabase devuelve el `Tenant_Id` correcto al Middleware de Next.js en Vercel.

## 🏁 Finalización de Tarea en Asana

Cuando pasaste el examen a ti mismo:
*   Realiza un "Limpiado" de Base de Datos. Elimina a un Dueño (Tú) la venta de 'Pepe Prueba', para dejar todo en cero.
*   En la tarea de Asana, anexa una captura de pantalla tuya (Screenshot en Mac o recortes en Windows) demostrando el Frontend vestido de rojo para la *Agencia X*. ¡Esto sirve a largo plazo si el cliente luego pide cambios gratis!
*   Marca completado ☑️ y pasa al [SOP-041: Handover (Entrega y Videollamadas)](./SOP-042-Handover-Loom.md).
