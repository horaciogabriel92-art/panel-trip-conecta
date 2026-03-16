# 05 - Decisiones Técnicas (ADR)

**Architecture Decision Records - Con fecha y contexto**

---

## ADR-001: Storage de Archivos (Marzo 2026)

### Contexto
Necesitábamos almacenar:
- Imágenes de paquetes turísticos (para landing)
- PDFs de cotizaciones generadas
- Documentos de viaje (vouchers, boletos, boarding passes)

### Opciones Evaluadas

| Opción | Pros | Contras |
|--------|------|---------|
| **Supabase Storage** (todo) | Integrado, CDN, backups | Límite 1GB en plan gratis |
| **VPS Filesystem** (todo) | Espacio ilimitado | Sin CDN, backup manual |
| **S3/R2** (todo) | Escalable, barato | Complejidad, costo adicional |
| **Híbrido** (elegida) | Mejor de ambos | Múltiples sistemas |

### Decisión
**Arquitectura Híbrida:**
- Supabase Storage: Imágenes de paquetes (necesitan CDN)
- VPS Filesystem: PDFs y documentos privados (espacio ilimitado)

### Consecuencias
- ✅ Espacio ilimitado para documentos
- ✅ CDN rápido para imágenes públicas
- ⚠️ Backup manual requerido para VPS
- ⚠️ Volumen Docker obligatorio para persistencia

### Estado: ✅ Aprobado e Implementado

---

## ADR-002: Base de Datos (Enero 2026)

### Contexto
Necesitábamos persistencia de datos para el MVP.

### Opciones
- SQLite (desarrollo local)
- PostgreSQL self-hosted
- Supabase (PostgreSQL managed)

### Decisión
**Supabase PostgreSQL**

Razones:
- Free tier generoso
- Auth integrado (aunque usamos JWT propio)
- Real-time subscriptions (futuro)
- Backups automáticos
- Facilidad de uso

### Estado: ✅ Aprobado e Implementado

---

## ADR-003: Autenticación (Enero 2026)

### Contexto
Sistema de login para admin y vendedores.

### Opciones
- Supabase Auth
- JWT propio
- Auth0 / Firebase Auth

### Decisión
**JWT propio con Supabase como DB de usuarios**

Razones:
- Control total sobre tokens
- Sin dependencia de servicio externo para auth
- Flexibilidad en roles y permisos

Implementación:
- bcrypt para passwords
- jsonwebtoken para JWT
- 24h de expiración

### Estado: ✅ Aprobado e Implementado

---

## ADR-004: Infraestructura Hosting (Enero 2026)

### Contexto
Desplegar aplicación en producción con presupuesto limitado.

### Opciones
- Vercel (frontend) + Railway/Render (backend)
- AWS/GCP (más complejo)
- VPS propio (Hetzner) + Coolify

### Decisión
**VPS Hetzner + Coolify**

Stack:
- **Panel:** Coolify (Docker) - https://panel.tripconecta.com
- **API:** Coolify (Docker) - https://api.tripconecta.com
- **Landing:** Vercel (gratis) - https://tripconecta.com
- **DB:** Supabase (gratis)
- **VPS:** Hetzner CX21 (~$6/mes)

Costo total: ~$6-12/mes

### Estado: ✅ Aprobado e Implementado

---

## ADR-005: Framework Frontend (Diciembre 2025)

### Contexto
Elegir tecnología para panel administrativo.

### Opciones
- React puro + Vite
- Next.js 14+ (App Router)
- Remix
- Vue/Nuxt

### Decisión
**Next.js 16 con App Router**

Razones:
- SSR/SSG integrado
- API routes (para futuro serverless)
- Tailwind CSS integración perfecta
- React Server Components
- Equipo familiarizado

### Estado: ✅ Aprobado e Implementado

---

## ADR-006: Estado de Cotizaciones (Febrero 2026)

### Contexto
Flujo de cotizaciones desde solicitud hasta cierre.

### Opciones Consideradas
1. Solo 2 estados: pendiente / convertida
2. Estados completos: pendiente, respondida, aceptada, rechazada, vencida
3. Sistema CRM completo

### Decisión
**3 Estados simplificados:**
- `pendiente`: Cliente pidió cotización
- `respondida`: Admin respondió con precio
- `convertida`: Se convirtió en venta (o `cancelada`)

Razón: Simplicidad para MVP, cubre el 90% de casos de uso.

### Estado: ✅ Aprobado e Implementado

---

## ADR-007: Manejo de Cupos (Febrero 2026)

### Contexto
Cómo manejar disponibilidad de lugares en paquetes.

### Decisión
**Cupos se descuentan al convertir cotización a venta.**

Flujo:
1. Cotización: NO reduce cupos (solo presupuesto)
2. Venta confirmada: Reduce `cupos_disponibles -= num_pasajeros`
3. Venta cancelada: Reintegra cupos

Razón: Evita bloquear cupos por cotizaciones que no se concretan.

### Estado: ✅ Aprobado e Implementado

---

## ADR-008: Generación de PDFs (Pendiente)

### Contexto
Cotizaciones y vouchers necesitan versión PDF.

### Opciones
- Puppeteer (Chrome headless)
- jsPDF (client-side)
- React-PDF
- Servicio externo

### Decisión Pendiente
Evaluar opciones cuando se implemente feature de PDFs.

### Estado: ⏳ Pendiente

---

## Plantilla para Nuevas Decisiones

```markdown
## ADR-XXX: Título (Mes Año)

### Contexto
Descripción del problema o necesidad.

### Opciones Evaluadas
| Opción | Pros | Contras |
|--------|------|---------|
| Opción A | ... | ... |
| Opción B | ... | ... |

### Decisión
**Opción elegida:** X

Razones:
- Punto 1
- Punto 2

### Consecuencias
- ✅ Positiva
- ⚠️ Neutra
- ❌ Negativa

### Estado: ✅ Aprobado / ⏳ Pendiente / ❌ Rechazado
```

---

**Volver a índice:** [README.md](./README.md)
