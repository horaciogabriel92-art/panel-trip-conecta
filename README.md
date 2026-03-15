# Trip Conecta Panel

Dashboard B2B para vendedores y administradores de Trip Conecta. Permite cotizar paquetes turísticos, gestionar ventas y descargar documentos.

URL Objetivo: `https://panel.tripconecta.com`

## 🚀 Tecnologías

- **Framework**: Next.js 16.x (App Router)
- **Lenguaje**: TypeScript 5.x
- **Estilos**: Tailwind CSS v4
- **UI**: Lucide React (iconos)
- **Formularios**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Animaciones**: Framer Motion

## 📁 Estructura

```
trip-conecta-panel/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout con fuentes
│   │   ├── page.tsx                # Home (redirige a login)
│   │   ├── globals.css             # Tailwind v4 + variables CSS
│   │   ├── login/
│   │   │   └── page.tsx            # Página de login
│   │   └── (dashboard)/            # Route group (protegido)
│   │       ├── layout.tsx          # Layout con Sidebar + Header
│   │       ├── dashboard/
│   │       │   └── page.tsx        # Panel del vendedor
│   │       ├── paquetes/
│   │       │   └── page.tsx        # Catálogo de paquetes
│   │       ├── cotizaciones/
│   │       │   └── page.tsx        # Gestión de cotizaciones
│   │       ├── ventas/
│   │       │   └── page.tsx        # Historial de ventas
│   │       ├── documentos/
│   │       │   └── page.tsx        # Documentos de viaje
│   │       └── admin/
│   │           ├── page.tsx        # Dashboard admin
│   │           └── paquetes/
│   │               └── page.tsx    # CRUD de paquetes
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx          # Header del dashboard
│   │       └── Sidebar.tsx         # Navegación lateral
│   ├── context/
│   │   └── AuthContext.tsx         # Auth + Axios config
│   └── lib/
│       └── utils.ts                # Utilidades (cn, etc)
├── public/                          # Assets estáticos
├── .env.local                       # Variables locales
├── next.config.ts
└── package.json
```

## 🛠️ Instalación Local

```bash
# 1. Navegar al directorio
cd trip-conecta-panel

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔧 Variables de Entorno

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase (cuando migres)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Environments

| Entorno | NEXT_PUBLIC_API_URL |
|---------|---------------------|
| Local | `http://localhost:3001/api` |
| Preview | `https://api-staging.tripconecta.com/api` |
| Producción | `https://api.panel.tripconecta.com/api` |

## 📱 Funcionalidades

### Para Vendedores
- [x] Login con JWT
- [ ] Dashboard con estadísticas
- [ ] Ver catálogo de paquetes
- [ ] Crear cotizaciones
- [ ] Ver historial de cotizaciones
- [ ] Convertir cotizaciones en ventas
- [ ] Ver comisiones ganadas
- [ ] Descargar documentos de viaje

### Para Administradores
- [x] Login con JWT
- [ ] Dashboard admin
- [ ] CRUD de paquetes turísticos
- [ ] Gestión de vendedores
- [ ] Subir documentos a ventas
- [ ] Ver todas las cotizaciones y ventas

## 🎨 Sistema de Diseño

### Colores Principales
```css
--background: #0a0a0f;        /* Fondo oscuro */
--foreground: #ffffff;        /* Texto principal */
--primary: #2563eb;           /* Azul principal */
--primary-foreground: #ffffff;
--muted: #1a1a24;             /* Fondos secundarios */
--muted-foreground: #94a3b8;  /* Texto secundario */
```

### Componentes UI
- **Glassmorphism**: `.glass`, `.glass-card`
- **Gradientes**: `.text-gradient`, `.gradient-bg`
- **Botones**: `.btn-primary`, `.btn-secondary`

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo (puerto 3000)
npm run build    # Build para producción
npm run lint     # ESLint
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Crear proyecto en Vercel
2. Conectar con este repositorio
3. Configurar dominio: `panel.tripconecta.com`
4. Variables de entorno:
   ```
   NEXT_PUBLIC_API_URL=https://api.panel.tripconecta.com/api
   ```

### Build Local

```bash
npm run build
# Genera carpeta .next/
```

## 🔗 Integraciones

- **API**: Conecta con `trip-conecta-api`
- **Auth**: JWT almacenado en localStorage
- **File Uploads**: Via API a `/storage/uploads`

## 📋 TODO - Desarrollo Pendiente

Las páginas del dashboard existen pero necesitan desarrollo:

1. **Dashboard Vendedor** (`/dashboard`)
   - Estadísticas de ventas
   - Cotizaciones recientes
   - Comisiones del mes

2. **Catálogo** (`/paquetes`)
   - Listado con filtros
   - Vista detalle de paquete
   - Botón "Cotizar"

3. **Cotizaciones** (`/cotizaciones`)
   - Formulario de cotización
   - Listado histórico
   - Acción "Convertir a Venta"

4. **Ventas** (`/ventas`)
   - Historial de ventas
   - Estado de cada venta
   - Documentos asociados

5. **Documentos** (`/documentos`)
   - Listado de documentos
   - Descargas

6. **Admin Paquetes** (`/admin/paquetes`)
   - Formulario de creación
   - Lista editable
   - Gestión de cupos

---

**Última actualización**: Marzo 2026
**Versión**: 0.1.0 (En desarrollo)
