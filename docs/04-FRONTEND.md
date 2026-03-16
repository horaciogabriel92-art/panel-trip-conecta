# 04 - Frontend

**Estructura de Next.js, rutas y componentes**

---

## 📁 Estructura de Proyectos

### Panel (trip-conecta-panel)

```
trip-conecta-panel/
├── src/
│   ├── app/
│   │   ├── (dashboard)/           ← Grupo de rutas con layout compartido
│   │   │   ├── layout.tsx         ← Sidebar + Header
│   │   │   ├── page.tsx           ← /dashboard (home vendedor)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx       ← /admin (dashboard admin)
│   │   │   │   ├── ventas/
│   │   │   │   │   ├── page.tsx   ← /admin/ventas (listado)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx ← /admin/ventas/:id (detalle)
│   │   │   │   ├── paquetes/
│   │   │   │   ├── cotizaciones/
│   │   │   │   ├── comisiones/
│   │   │   │   └── documentos/
│   │   │   ├── paquetes/          ← Catálogo para vendedores
│   │   │   ├── cotizaciones/
│   │   │   ├── ventas/
│   │   │   └── mis-ventas/
│   │   ├── login/
│   │   │   └── page.tsx           ← Página de login
│   │   ├── layout.tsx             ← Root layout (AuthProvider)
│   │   └── globals.css            ← Tailwind v4 config
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx        ← Navegación por rol
│   │       └── Header.tsx         ← Header con user info
│   ├── context/
│   │   └── AuthContext.tsx        ← JWT auth + axios config
│   ├── lib/
│   │   ├── api.ts                 ← Axios instance
│   │   └── utils.ts               ← cn() + formatCurrency()
│   └── middleware.ts              ← Protección de rutas
```

### Landing (trip-conecta-landing)

```
trip-conecta-landing/
├── src/
│   ├── app/
│   │   ├── page.tsx               ← Landing principal
│   │   ├── layout.tsx
│   │   └── globals.css            ← Tailwind v3
│   └── ...
```

---

## 🎨 Tema Visual

### Colors

```css
--background: #0a0a0f        /* Fondo principal */
--foreground: #fafafa        /* Texto principal */
--blue-400: #60a5fa          /* Acentos */
--blue-600: #2563eb          /* Botones primarios */
--green-400: #4ade80         /* Éxito / Comisiones */
--orange-400: #fb923c        /* Pendientes */
--purple-400: #c084fc        /* Cotizaciones */
--red-400: #f87171           /* Errores */
```

### Utilidades CSS

```css
/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 1.5rem;
}

.text-gradient {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 🔐 Autenticación (AuthContext)

```typescript
// Uso en componentes
import { useAuth } from '@/context/AuthContext';

function MiComponente() {
  const { user, login, logout, isLoading } = useAuth();
  
  if (user?.rol === 'admin') {
    // Mostrar opciones de admin
  }
}
```

### Axios Configurado

```typescript
// lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🧩 Componentes Reutilizables

### Helpers (lib/utils.ts)

```typescript
// Tailwind merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo seguro de moneda
export function formatCurrency(value: number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('es-AR');
}
```

### Iconos

Siempre usar **Lucide React**:

```typescript
import { ShoppingCart, FileText, Wallet, CheckCircle } from 'lucide-react';

// Tamaños consistentes
<ShoppingCart className="w-5 h-5" />  // Navegación
<CheckCircle className="w-4 h-4" />   // Botones
```

---

## 🛣️ Routing

### Protección de Rutas

El middleware `middleware.ts` protege rutas del dashboard:

```typescript
// Redirige a /login si no hay token
// Redirige a /dashboard si rol=vendedor intenta acceder a /admin
```

### Navegación Sidebar

**Admin:**
- Dashboard
- Ventas
- Paquetes
- Cotizaciones
- Comisiones
- Documentos

**Vendedor:**
- Dashboard
- Paquetes (catálogo)
- Cotizaciones
- Mis Ventas

---

## 📱 Patrones de Componentes

### Página de Listado

```typescript
export default function ListadoPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="space-y-8">
      <Header />
      <StatsCards />
      <DataTable data={items} />
    </div>
  );
}
```

### Página de Detalle

```typescript
export default function DetallePage() {
  const params = useParams();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    api.get(`/recurso/${params.id}`).then(setData);
  }, [params.id]);
  
  if (!data) return <NotFound />;
  
  return <DetalleLayout data={data} />;
}
```

---

## 🚨 Errores Comunes

### 1. toLocaleString en undefined

❌ **Incorrecto:**
```typescript
<span>${venta.precio_total.toLocaleString()}</span>
// Error si precio_total es null
```

✅ **Correcto:**
```typescript
import { formatCurrency } from '@/lib/utils';
<span>${formatCurrency(venta.precio_total)}</span>
```

### 2. Window object en SSR

❌ **Incorrecto:**
```typescript
const token = localStorage.getItem('token');
// Error en server-side rendering
```

✅ **Correcto:**
```typescript
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
}
```

### 3. Download sin token

❌ **Incorrecto:**
```html
<a href="/api/documentos/123/download" target="_blank">
```

✅ **Correcto:**
```typescript
const handleDownload = async (docId) => {
  const response = await api.get(`/documentos/${docId}/download`, {
    responseType: 'blob'
  });
  // Crear URL y descargar
};
```

---

**Próximo paso:** Ver [05-DECISIONES.md](./05-DECISIONES.md)
