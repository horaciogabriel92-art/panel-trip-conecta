# 00 - Setup y Configuración Inicial

**Cómo levantar el proyecto localmente y en producción**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Uso |
|------|------------|---------|-----|
| **API Backend** | Express.js | 5.x | TypeScript, CommonJS |
| **Dashboard** | Next.js | 16.x | App Router, RSC |
| **Landing** | Next.js | 16.x | App Router |
| **Lenguaje** | TypeScript | 5.x | Estricto habilitado |
| **Dashboard CSS** | Tailwind CSS | v4 | Configuración CSS-based |
| **Landing CSS** | Tailwind CSS | v3 | Configuración tradicional |
| **Database** | PostgreSQL | - | Supabase Cloud |
| **Storage Imágenes** | Supabase Storage | - | Bucket paquetes-imagenes |
| **Storage Documentos** | Filesystem VPS | - | /data/trip-conecta/uploads |
| **Auth** | JWT | 9.x | Expira en 24h |
| **Validation** | Zod | 4.x | Schemas de validación |
| **HTTP Client** | Axios | 1.x | Configurado en AuthContext |

---

## 💻 Desarrollo Local

### 1. Backend (API)

```bash
cd trip-conecta-api
npm install

# Crear archivo .env
cat > .env << EOF
PORT=3001
JWT_SECRET=super-secret-key-change-this-in-prod
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_key_here
LOG_LEVEL=info
STORAGE_PATH=../storage/uploads
NODE_ENV=development
EOF

npm run dev          # Puerto 3001
```

### 2. Dashboard (Panel Admin/Vendedor)

```bash
cd trip-conecta-panel
npm install

# Crear archivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key_here
EOF

npm run dev          # Puerto 3000
```

### 3. Landing Page

```bash
cd trip-conecta-landing
npm install
npm run dev          # Puerto 3002 (o el disponible)
```

---

## ☁️ Producción (Coolify + VPS)

### Infraestructura Actual

| Servicio | URL | Tecnología |
|----------|-----|------------|
| Panel Admin/Vendedor | https://panel.tripconecta.com | Coolify (Docker) |
| Landing | https://tripconecta.com | Vercel |
| API | https://api.tripconecta.com | Coolify (Docker) + Nginx |
| Database | Supabase | PostgreSQL |
| Storage Imágenes | Supabase | Bucket público |
| Storage Documentos | VPS | /data/trip-conecta/uploads |

### Variables de Entorno - Producción

**Panel (trip-conecta-panel):**
```
NEXT_PUBLIC_API_URL=https://api.tripconecta.com/api
NEXT_PUBLIC_SUPABASE_URL=https://fcaglzfkqqgoqoayrrzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_BEyBvlAu9xqJmYs7o45hmA_rWcAvpe7
NODE_ENV=production
```

**API (trip-conecta-api):**
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_key_here
JWT_SECRET=your-jwt-secret-change-in-production
STORAGE_PATH=/app/storage/uploads
NODE_ENV=production
```

---

## 🔧 Configuración Inicial (Primera vez)

### 1. Base de Datos (Supabase)

Ejecutar SQL en Supabase SQL Editor:

```sql
-- Tablas principales
-- Ver archivo: docs/02-DATABASE.md

-- Bucket para imágenes de paquetes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('paquetes-imagenes', 'paquetes-imagenes', true);
```

### 2. Usuarios Iniciales

```sql
-- Admin
INSERT INTO users (email, password, nombre, apellido, rol, comision_porcentaje)
VALUES ('admin@tripconecta.com', '$2b$10$...', 'Admin', 'Sistema', 'admin', 0);

-- Vendedor de prueba
INSERT INTO users (email, password, nombre, apellido, rol, comision_porcentaje)
VALUES ('vendedor1@gmail.com', '$2b$10$...', 'Juan', 'Pérez', 'vendedor', 12);
```

**Contraseñas por defecto (desarrollo):**
- Admin: `admin123`
- Vendedor: `vendedor123`

### 3. VPS - Volumen Persistente

```bash
# Crear directorio para uploads
mkdir -p /data/trip-conecta/uploads

# Verificar permisos
chmod 755 /data/trip-conecta/uploads
```

---

## 🧪 Verificación Post-Setup

### Backend
```bash
curl http://localhost:3001/api/ventas
# Debe retornar: {"error":"Token requerido"}
```

### Frontend
- Panel: http://localhost:3000
- Login con credenciales de prueba
- Verificar que carga dashboard sin errores 500

### Storage
```bash
# Verificar bucket de imágenes existe
curl https://fcaglzfkqqgoqoayrrzc.supabase.co/storage/v1/bucket/paquetes-imagenes

# Verificar directorio de documentos
ls -la /data/trip-conecta/uploads
```

---

## 🚨 Troubleshooting Común

### Error: "Token requerido" al descargar documentos
- Verificar que `NEXT_PUBLIC_API_URL` apunte al backend correcto
- Verificar que el token JWT no esté expirado (24h)

### Error 404 en documentos
- Verificar que el volumen Docker esté montado: `/data/trip-conecta/uploads:/app/storage/uploads`
- Verificar que el archivo exista físicamente en el VPS

### Error: "Cannot read properties of undefined"
- Usar helper `formatCurrency()` de `lib/utils.ts`
- No usar `.toLocaleString()` directamente sin verificar null/undefined

---

**Próximo paso:** Ver [01-ARQUITECTURA.md](./01-ARQUITECTURA.md)
