# 01 - Arquitectura del Sistema

**Infraestructura, componentes y flujo de datos**

---

## 🏗️ Diagrama General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TRIP CONECTA B2B                               │
└─────────────────────────────────────────────────────────────────────────────┘

USUARIOS
├── Admin (panel.tripconecta.com/admin/*)
│   └── Gestiona paquetes, vendedores, emite documentos
└── Vendedores (panel.tripconecta.com/dashboard)
    └── Cotiza, vende, recibe documentos para clientes

FRONTEND
├── Panel Admin/Vendedor (Next.js 16 + Tailwind v4)
│   └── Coolify Docker: panel.tripconecta.com
├── Landing Page (Next.js 16 + Tailwind v3)
│   └── Vercel: tripconecta.com
└── API Client (Axios + JWT)

BACKEND
└── API Express.js (TypeScript)
    ├── Coolify Docker: api.tripconecta.com
    ├── Puerto: 3001 (interno) → Nginx → 443 (HTTPS)
    └── Middleware: Auth JWT, Multer (uploads)

DATA LAYER
├── PostgreSQL (Supabase Cloud)
│   ├── Tablas: users, paquetes, cotizaciones, ventas, documentos_viaje
│   └── Auth: JWT tokens (expiran 24h)
│
└── STORAGE (Híbrido)
    ├── Supabase Storage (Free - 1GB)
    │   └── paquetes-imagenes/ (imágenes públicas de paquetes)
    │
    └── VPS Filesystem (/data/trip-conecta/)
        ├── uploads/documentos-viaje/ (PDFs, vouchers, boletos - privados)
        └── uploads/cotizaciones/ (PDFs generados - privados)
```

---

## 🖥️ Infraestructura Detallada

### Producción (Actual)

| Componente | Tecnología | Ubicación | Acceso |
|------------|-----------|-----------|--------|
| **Panel B2B** | Next.js 16 + Tailwind v4 | Coolify Docker | panel.tripconecta.com |
| **Landing** | Next.js 16 + Tailwind v3 | Vercel | tripconecta.com |
| **API** | Express.js + TypeScript | Coolify Docker | api.tripconecta.com |
| **Database** | PostgreSQL | Supabase Cloud | fcaglzfkqqgoqoayrrzc.supabase.co |
| **Storage Img** | Supabase Storage | Supabase Cloud | Bucket público |
| **Storage Docs** | Filesystem Local | VPS Hetzner | /data/trip-conecta/uploads |
| **Proxy** | Nginx | VPS Hetzner | api.tripconecta.com:443 → localhost:3001 |

### Desarrollo Local

| Servicio | Puerto | URL |
|----------|--------|-----|
| API | 3001 | http://localhost:3001/api |
| Panel | 3000 | http://localhost:3000 |
| Landing | 3002 | http://localhost:3002 |

---

## 📦 Storage - Arquitectura de Archivos

### Decisión de Diseño (Marzo 2026)

**Problema:** Supabase Storage Free limita a 1GB. Con imágenes + PDFs de cotizaciones + documentos de viaje, se superaría rápidamente.

**Solución:** Arquitectura híbrida

| Tipo | Ubicación | Razón |
|------|-----------|-------|
| **Imágenes de paquetes** | Supabase Storage | Necesitan CDN para carga rápida en landing |
| **PDFs de cotizaciones** | VPS Filesystem | Espacio ilimitado, generación frecuente |
| **Documentos de viaje** | VPS Filesystem | Espacio ilimitado, privacidad requerida |

### Estructura de Carpetas

```
VPS Hetzner (5.78.158.76)
└── /data/trip-conecta/
    └── uploads/
        ├── documentos-viaje/           ← Vouchers, boletos, seguros
        │   └── {venta_id}/
        │       ├── 20240315_boleto_aereo_vuelo-aa123.pdf
        │       ├── 20240316_voucher_hotel_marriott.pdf
        │       └── ...
        │
        └── cotizaciones/               ← PDFs generados
            └── {cotizacion_id}/
                └── cotizacion-{codigo}.pdf

Supabase Storage
└── Bucket: paquetes-imagenes (PÚBLICO)
    └── {paquete_id}/
        ├── imagen-principal.jpg
        ├── galeria-1.jpg
        └── galeria-2.jpg
```

### Volumen Docker (Persistencia)

El contenedor de la API tiene montado:
```yaml
volumes:
  - /data/trip-conecta/uploads:/app/storage/uploads
```

**Importante:** Sin este volumen, los archivos se pierden al reiniciar el contenedor.

### Límites y Capacidades

| Recurso | Límite | Uso Estimado | Notas |
|---------|--------|--------------|-------|
| Supabase Storage | 1 GB | ~500MB (imágenes) | Solo imágenes optimizadas |
| VPS Disco | 50 GB | ~5GB/año | PDFs y documentos |
| Tamaño archivo | 10 MB | - | Límite Multer |
| Tipos permitidos | PDF, JPG, PNG, WEBP | - | Validación backend |

---

## 🔐 Autenticación y Seguridad

### JWT Flow

```
1. Login: POST /api/auth/login
   └── Recibe: { token, user }

2. Frontend almacena token en localStorage

3. Axios interceptor agrega header a cada request:
   Authorization: Bearer {token}

4. Middleware authenticateToken valida JWT

5. Token expira en 24h → Redirect a login
```

### Roles y Permisos

| Rol | Permisos | Rutas |
|-----|----------|-------|
| **admin** | CRUD paquetes, CRUD vendedores, subir documentos, pagar comisiones | /admin/* |
| **vendedor** | Cotizar, ver sus ventas, descargar documentos de sus ventas | /dashboard, /paquetes, /cotizaciones, /ventas, /documentos |

---

## 🔄 Flujos Principales

### Flujo 1: Cotización → Venta

```
Vendedor
  ↓ (crea cotización)
Cotización (estado: pendiente)
  ↓ (admin responde con precio)
Cotización (estado: respondida)
  ↓ (cliente acepta)
Venta (estado: confirmada)
  ↓ (admin sube documentos)
Venta (estado: emitida)
  ↓ (viaje completo)
Venta (estado: completada)
  ↓ (pago comisión)
Comisión pagada al vendedor
```

### Flujo 2: Subida de Documentos

```
Admin
  ↓ (selecciona archivo)
API Express (Multer)
  ↓ (valida tipo/tamaño)
Guarda en /data/trip-conecta/uploads/documentos-viaje/{venta_id}/
  ↓ (registra en BD)
Supabase: INSERT INTO documentos_viaje
  ↓ (vendedor descarga)
GET /api/documentos/{id}/download (serve file desde VPS)
```

### Flujo 3: Imágenes de Paquetes

```
Admin sube imagen
  ↓
Frontend sube a Supabase Storage
  ↓
Bucket: paquetes-imagenes/{paquete_id}/imagen.jpg
  ↓
URL pública: https://...supabase.co/storage/v1/object/public/...
  ↓
Guarda URL en tabla paquetes.imagen_url
```

---

## 🚨 Puntos Críticos

### 1. Backup de Documentos
- **Imágenes Supabase:** Backup automático por Supabase
- **Documentos VPS:** Snapshots manuales de Hetzner (configurar)

### 2. Volumen Docker
- Si se elimina el contenedor sin volumen montado → **SE PIERDEN ARCHIVOS**
- Verificar siempre: `docker inspect trip-conecta-api | grep Mounts`

### 3. SSL/HTTPS
- Panel y Landing: HTTPS automático (Vercel/Coolify)
- API: Nginx proxy con Let's Encrypt
- **NO** usar puerto 3001 directo en producción (sin SSL)

---

**Próximo paso:** Ver [02-DATABASE.md](./02-DATABASE.md)
