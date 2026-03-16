# Trip Conecta B2B

Sistema de gestión de paquetes turísticos para agencias de viajes. Conecta agencias mayoristas con vendedores independientes.

## 📚 Documentación

**Toda la documentación técnica está en `/docs/`:**

| Documento | Descripción |
|-----------|-------------|
| [docs/README.md](./docs/README.md) | **Índice central** - Empezar aquí |
| [docs/00-SETUP.md](./docs/00-SETUP.md) | Instalación y configuración |
| [docs/01-ARQUITECTURA.md](./docs/01-ARQUITECTURA.md) | Infraestructura y flujos |
| [docs/02-DATABASE.md](./docs/02-DATABASE.md) | Schema de base de datos |
| [docs/03-API.md](./docs/03-API.md) | Endpoints y autenticación |
| [docs/04-FRONTEND.md](./docs/04-FRONTEND.md) | Estructura Next.js |
| [docs/05-DECISIONES.md](./docs/05-DECISIONES.md) | Decisiones técnicas (ADRs) |

**Para agentes de IA:** [AGENTS.md](./AGENTS.md) - Convenciones y guías de código

---

## 🚀 Inicio Rápido

```bash
# Backend
cd trip-conecta-api && npm install && npm run dev

# Panel
cd trip-conecta-panel && npm install && npm run dev

# Landing
cd trip-conecta-landing && npm install && npm run dev
```

Ver guía completa: [docs/00-SETUP.md](./docs/00-SETUP.md)

---

## 🏗️ Arquitectura (Resumen)

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  tripconecta.com         panel.tripconecta.com         │
│  ┌──────────────┐       ┌──────────────────┐           │
│  │   Landing    │       │  Dashboard B2B   │           │
│  │   (Vercel)   │       │   (Coolify)      │           │
│  └──────────────┘       └────────┬─────────┘           │
│                                  │                      │
│  ┌───────────────────────────────┴───────────────┐     │
│  │           api.tripconecta.com                 │     │
│  │         Coolify + Nginx + VPS                 │     │
│  └───────────────────────┬───────────────────────┘     │
│                          │                             │
│  ┌───────────────────────▼───────────────────────┐     │
│  │       Supabase (PostgreSQL + Storage)         │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Proyectos

| Proyecto | Tecnología | Descripción |
|----------|-----------|-------------|
| [trip-conecta-api](./trip-conecta-api/) | Express.js + TypeScript | API RESTful |
| [trip-conecta-panel](./trip-conecta-panel/) | Next.js 16 + Tailwind v4 | Dashboard B2B |
| [trip-conecta-landing](./trip-conecta-landing/) | Next.js 16 + Tailwind v3 | Landing Page |

---

## ⚡ Estado del Proyecto

- ✅ Panel Admin/Vendedor funcional
- ✅ API con autenticación JWT
- ✅ Base de datos en Supabase
- ✅ Storage híbrido (Supabase + VPS)
- 🔄 En desarrollo: Mejoras de UX

**Última actualización:** Marzo 2026
