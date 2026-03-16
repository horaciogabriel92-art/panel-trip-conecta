# QA & Onboarding B2B - CARMEN
## Manual de Operaciones Estandarizado (SOPs)

Este documento es la "Biblia Operativa" para el equipo de Implementación y Aseguramiento de Calidad (QA). Su propósito es guiar de la mano al Asistente en cada paso a seguir desde que se firma un contrato hasta que el Software está al aire ("Go-Live").

---

## 🏗️ La Estructura del Onboarding
El proceso de implementación se divide en 4 grandes etapas. Cada etapa se gestiona mediante tareas automáticas en Asana.

1. **Kick-Off Exitoso:** Interacción humana y recolección de activos.
2. **Setup Técnico y Migración:** Construcción del Tenant en Coolify/Supabase.
3. **Calidad (QA) Interno:** Prueba de estrés antes de presentar al cliente.
4. **Capacitación y Despliegue (Go-Live):** Entrenamiento y entrega de llaves.

---

## 📋 Lista Maestra de SOPs (Standard Operating Procedures)

Haz clic en el ID del SOP para ver las instrucciones detalladas paso a paso con rutas de código y paneles de configuración.

### Fase 1: Kick-Off (Día 1-3)
- [SOP-011: Primera Toma de Contacto y Typeform](./SOP-011-Kickoff-y-Data.md)
- [SOP-012: Revisión de Insumos Recibidos](./SOP-012-Revision-Insumos.md)

### Fase 2: Configuración (Setup Técnico) (Día 4-10)
- [SOP-021: Creación de Tenant en Base de Datos (Supabase)](./SOP-021-Setup-Supabase-Tenant.md)
- [SOP-022: Alta de Usuarios Administradores Iniciales](./SOP-022-Alta-Admins.md)
- [SOP-023: Inyección de Marca (Branding Hexadecimal)](./SOP-023-Branding-Inyeccion.md)
- [SOP-024: Apuntado DNS (Coolify + Host del Cliente)](./SOP-024-Configuracion-DNS-Coolify.md)
- [SOP-025: Carga de Datos Semilla (Excel a PostgreSQL)](./SOP-025-Data-Entry-Semilla.md)

### Fase 3: Quality Assurance (Día 11-12)
- [SOP-031: Auditoría Visual y Flujo de Cotización (Modo Vendedor)](./SOP-031-QA-Auditoria.md)
- [SOP-032: Prueba Estrés de PDFs y Storage](./SOP-032-QA-Storage.md)

### Fase 4: Capacitación y Entrega (Día 13-14)
- [SOP-041: Llamada de Presentación y Demo Admin](./SOP-041-Demo-Admin.md)
- [SOP-042: Handover Asíncrono (Entrega de Videos Loom)](./SOP-042-Handover-Loom.md)
- [SOP-043: Activación Módulo IA CARMEN (Solo si aplica)](./SOP-043-Activacion-IA.md)

---

## 🛠️ Herramientas de Trabajo del Asistente

| Fase | Herramienta | Uso Principal |
|---|---|---|
| Gestión de Proyecto | **Asana** | Tablero central. Todo el progreso debe quedar documentado aquí. |
| Recolección de Datos | **Airtable / Typeform** | Formularios donde el cliente sube su logo y Excel de viajes. |
| Acceso a Infraestructura | **Panel Supabase** | Para inyectar datos y crear IDs de agencias (Tenants). |
| Infraestructura Web | **Panel Coolify** | Para rutear dominios (DNS) al servidor central. |
| Comunicación B2B | **Slack Connect / WhatsApp** | Canal oficial exclusivo con el Dueño/Admin de la Agencia. |
| Capacitación | **Loom** | Grabación de tutoriales de pantalla 1 a 1. |
