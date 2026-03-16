# 06 - Master Dashboard (Super-Admin Panel)

## 👑 El Panóptico de CARMEN B2B

El **Super-Admin Panel** (o Backoffice Management) es el "centro de comando" interno exclusivo para ti y tu equipo de operaciones. Mientras que tus clientes (Dueños de agencias) entran a `b2b.susitio.com`, tu equipo entra a un dominio oculto aislado, por ejemplo: `master.carmensystem.com`.

El objetivo de este panel es **reemplazar el uso de herramientas técnicas (Supabase, Coolify, Asana)** por una interfaz gráfica de un solo clic, permitiendo que empleados no técnicos (como ejecutivos de ventas o QA) puedan operar el negocio, dar de alta clientes y facturar.

---

## 🏗️ Estructura y Módulos del Panel

### 1. 📊 Dashboard Global (Vista Pájaro)
Lo primero que ve el CEO (Tú) al abrir el panel para saber la salud financiera del SaaS.
- **Métricas MRR:** Ingreso recurrente mensual actual (Ej. *$12,000 USD/mes*).
- **Sumario de Tenants:** Número de agencias activas vs canceladas (Churn).
- **Métricas de Uso de IA:** Cuántos dólares llevas gastados este mes en la API de OpenAI vs Cuánto le cobraste a los clientes por CARMEN Assistant.
- **Alertas Rojas:** Listado de agencias con problemas (Ej. *La Agencia X ha tenido 5 errores 500 hoy al generar PDFs*).

### 2. 🏢 Gestión de Agencias (Tenants)
El corazón operativo. Aquí vive la lista de todos tus clientes Mayoristas y Minoristas.
- **Grilla de Clientes:** Tabla con todas las agencias, plan actual, fecha de alta, y estado de pago (Al día / Deuda).
- **Buscador Universal:** *¿Llama un vendedor de una agencia pequeña quejándose?* El Super-Admin puede buscarlo aquí y usar la función de **"Impersonación" (Iniciar Sesión Como...)** para entrar a la cuenta de ese cliente sin pedirle contraseñas y ver el error con sus propios ojos.

### 3. 🚀 Motor de Onboarding (1-Click Setup)
El módulo que automatiza el trabajo del Asistente QA. En lugar de ejecutar SQL o crear cosas a mano en Supabase, el asistente llena un formulario:
- **Campos:** Nombre de Agencia, Dominio Solicitado (`b2b.nueva.com`), Plan (Minorista), Color HEX (`#FF0000`).
- **Botón Mágico "Lanzar Agencia":** Al hacer clic, el Backend en Node.js hace el trabajo sucio en 3 segundos:
  1. Inserta la Agencia en la tabla de Supabase (Genera UUID).
  2. Inyecta el Color y Logo.
  3. Ejecuta el Endpoint de Asana para crear el Tablero de QA (Como el script que acabas de ver).
  4. Crea la cuenta Master del Cliente y le envía un correo de bienvenida.

### 4. 🧠 Feature Flags y Módulo IA (CARMEN Assistant)
Control de interruptores (Switches) de monetización. Si el cliente no paga, se le apaga el switch.
- **Control de Módulos (Add-Ons):** Activar/Desactivar el Creador de Webs B2C, Activar la Generación de PDFs Avanzados.
- **Control CARMEN:** 
  - Switch IA On/Off.
  - Botón: *"Iniciar Ingesta de Memoria"*. (Ejecuta el script de Embeddings en OpenAI para ese cliente específico).
  - Medidor de Tokens: Revisa si alguna agencia está abusando del ChatGPT y consumiendo tus márgenes.

### 5. 🛡️ Logs y Monitor de Salud (DevOps)
Para cuando hay caídas del sistema y no quieres entrar a la terminal de Coolify.
- **Monitor de Bases de Datos:** Tamaño consumido en Supabase de cada cliente. 
- **Storage Limits:** ¿Qué cliente está subiendo PDFs de 100 Megas conteniendo virus o fotos gigantes? (Advertencias de volumen).
- **Log de Errores Críticos:** Filtro de Errores 500 originados en la red B2B, permitiéndole a tu CTO saber en qué falló el motor de cotizaciones ayer a la noche.

### 6. 💸 Billing y Suscripciones (Stripe Integration)
Integración directa con tu pasarela de pagos.
- **Gestión de Planes:** Actualizar a un cliente de "Minorista Base" a "Minorista Premium".
- **Facturación Automática:** Si la tarjeta del cliente rebota, el Super-Admin Panel marca automáticamente a la Agencia como "Suspendida" y al intentar entrar a su CRM, todos sus vendedores ven una pantalla gigante de bloqueo: *"Contacta a la Administración para renovar tu suscripción"*.

---

## 🚦 La Arquitectura del Super-Admin

**¿Cómo se aísla de la aplicación normal?**
1. **Rutas Privadas (Next.js):** El código vive en la misma aplicación, pero en una carpeta paralela (Ej: `app/(super-admin)/...`).
2. **Rol "Master" Inquebrantable:** En Supabase, se crea un Enum especial. Un usuario regular puede ser `admin` (dueño de agencia) o `vendedor`. Pero solo tú y tu CTO tienen el rol `super_admin_carmen`. 
3. **Omisión de RLS de Supabase:** Mientras que un usuario normal es bloqueado por Supabase para no ver datos de otro, el token JWT del `super_admin_carmen` está configurado para **Bypass RLS** (Saltar las reglas de seguridad), lo que te permite ver la data completa de toda Latinoamérica en un solo panel.
