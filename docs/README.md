# Documentación Trip Conecta B2B

**Índice central de documentación técnica**

---

## 📚 Guías (Leer en orden)

| # | Documento | Descripción | Quién lo necesita |
|---|-----------|-------------|-------------------|
| 00 | [SETUP.md](./00-SETUP.md) | Instalación y configuración inicial | Desarrolladores nuevos |
| 01 | [ARQUITECTURA.md](./01-ARQUITECTURA.md) | Arquitectura del sistema, infraestructura y flujo de datos | Todo el equipo |
| 02 | [DATABASE.md](./02-DATABASE.md) | Schema de base de datos, tablas y relaciones | Backend/DevOps |
| 03 | [API.md](./03-API.md) | Endpoints, autenticación y ejemplos | Frontend/Mobile |
| 04 | [FRONTEND.md](./04-FRONTEND.md) | Estructura de Next.js, rutas y componentes | Frontend |
| 05 | [DECISIONES.md](./05-DECISIONES.md) | Decisiones técnicas con fecha y contexto | Arquitectos/Tech Leads |

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/horaciogabriel92-art/panel-trip-conecta.git

# 2. Ver guía de setup
cat docs/00-SETUP.md

# 3. Para agentes de IA, ver:
cat AGENTS.md
```

---

## 📁 Estructura de Carpetas

```
trip-conecta-b2b/
├── docs/                    ← Esta documentación
│   ├── README.md           ← Índice (usted está aquí)
│   ├── 00-SETUP.md
│   ├── 01-ARQUITECTURA.md
│   ├── 02-DATABASE.md
│   ├── 03-API.md
│   ├── 04-FRONTEND.md
│   ├── 05-DECISIONES.md
│   └── assets/             ← Diagramas e imágenes
│
├── AGENTS.md               ← Guía para agentes de IA (en root)
├── README.md               ← README principal del proyecto
│
├── trip-conecta-api/       ← Backend Express
├── trip-conecta-panel/     ← Frontend Dashboard (Next.js)
└── trip-conecta-landing/   ← Landing Page (Next.js)
```

---

## 🆘 Soporte

- **Problemas con documentos/archivos:** Ver `01-ARQUITECTURA.md` sección Storage
- **Errores de autenticación:** Ver `03-API.md` sección JWT
- **Dudas de base de datos:** Ver `02-DATABASE.md`
- **Setup local:** Ver `00-SETUP.md`

---

**Última actualización:** Marzo 2026
