# Trip Conecta B2B - Guía para Agentes de IA

**Documento de referencia para desarrollo colaborativo**

**Última actualización:** Marzo 2026

---

## 🚀 Inicio Rápido

### Estructura de Documentación

```
docs/
├── README.md           ← Índice central (empieza aquí)
├── 00-SETUP.md         ← Instalación y configuración
├── 01-ARQUITECTURA.md  ← Infraestructura y flujos
├── 02-DATABASE.md      ← Schema SQL
├── 03-API.md           ← Endpoints
├── 04-FRONTEND.md      ← Next.js estructura
└── 05-DECISIONES.md    ← Decisiones técnicas (ADRs)

Root:
├── AGENTS.md           ← Este archivo
└── README.md           ← README principal del proyecto
```

**Antes de hacer cambios, leer:**
1. `docs/01-ARQUITECTURA.md` - Entender infraestructura
2. `docs/05-DECISIONES.md` - Ver decisiones previas
3. Este archivo (`AGENTS.md`) - Convenciones de código

---

## 📋 Contexto del Proyecto

### Qué es Trip Conecta B2B
Plataforma de gestión de paquetes turísticos que conecta una agencia mayorista con vendedores independientes.

**Flujo principal:**
```
Admin publica paquete → Vendedor cotiza → Admin responde → 
Cliente acepta → Venta confirmada → Admin sube documentos → 
Vendedor entrega a cliente
```

### Usuarios
- **Admin:** Gestiona paquetes, emite documentos, paga comisiones
- **Vendedor:** Cotiza, vende, recibe documentos para clientes

---

## 🏗️ Arquitectura (Resumen)

### Stack Tecnológico
| Capa | Tecnología | Ubicación |
|------|-----------|-----------|
| **API** | Express.js + TypeScript | Coolify Docker |
| **Panel** | Next.js 16 + Tailwind v4 | Coolify Docker |
| **Landing** | Next.js 16 + Tailwind v3 | Vercel |
| **DB** | PostgreSQL | Supabase Cloud |
| **Storage** | VPS Filesystem + Supabase | Híbrido |

### Storage de Archivos (CRÍTICO)
**Siempre usar arquitectura híbrida:**
- **Imágenes de paquetes:** Supabase Storage (CDN público)
- **Documentos de viaje:** VPS Filesystem (`/data/trip-conecta/uploads/`)
- **PDFs de cotizaciones:** VPS Filesystem

⚠️ **NUNCA** guardar documentos solo en contenedor Docker (se pierden al reiniciar).

---

## 💻 Convenciones de Código

### Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos | kebab-case | `auth.controller.ts` |
| Componentes | PascalCase | `Sidebar.tsx` |
| Funciones/Vars | camelCase | `getUserById` |
| Constantes | UPPER_SNAKE | `JWT_SECRET` |
| Interfaces | PascalCase | `AuthContextType` |
| API Routes | kebab-case | `/api/paquetes` |

### TypeScript - Reglas Estrictas

```typescript
// ✅ SIEMPRE tipar Request/Response
export const getAllItems = (req: Request, res: Response) => { ... }

// ✅ Preferir interface sobre type para objetos
interface User {
  id: string;
  nombre: string;
}

// ✅ Usar enums para valores fijos
enum EstadoCotizacion {
  PENDIENTE = 'pendiente',
  RESPONDIDA = 'respondida',
  CONVERTIDA = 'convertida'
}
```

### Formateo de Moneda (OBLIGATORIO)

```typescript
// ❌ NUNCA hacer esto:
${venta.precio_total.toLocaleString()}  // Rompe si es null

// ✅ SIEMPRE usar helper:
import { formatCurrency } from '@/lib/utils';
${formatCurrency(venta.precio_total)}   // Seguro para null/undefined
```

### Download de Archivos (OBLIGATORIO)

```typescript
// ❌ NUNCA enlace directo:
<a href="/api/documentos/123/download" target="_blank">

// ✅ SIEMPRE con axios:
const handleDownload = async (docId: string, fileName: string) => {
  const response = await api.get(`/documentos/${docId}/download`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
```

### SQL - Prepared Statements

```typescript
// ✅ SIEMPRE usar prepared statements
const items = db.prepare('SELECT * FROM table WHERE id = ?').all(id);

// ❌ NUNCA concatenar strings
const items = db.prepare(`SELECT * FROM table WHERE id = ${id}`).all();  // INSEGuro
```

---

## 🗄️ Database - Conocimientos Clave

### Tablas Principales
- `users` - Admin y vendedores
- `paquetes` - Paquetes turísticos (con campos JSON: itinerario, incluye, no_incluye, galeria)
- `cotizaciones` - Presupuestos (estados: pendiente, respondida, convertida, vencida, cancelada)
- `ventas` - Cierres confirmados
- `documentos_viaje` - Metadatos de archivos (ruta_archivo apunta a VPS)
- `pagos_comisiones` - Registro de pagos a vendedores

### Estados Importantes

**Cotización:**
- `pendiente` → `respondida` → `convertida` (o `cancelada`)

**Venta:**
- `confirmada` → `en_proceso` → `emitida` → `completada`

### Cupos
- Cotización NO reduce cupos
- Venta SÍ reduce cupos: `cupos_disponibles -= num_pasajeros`

---

## 🔧 Patrones de Implementación

### API Controller

```typescript
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllItems = async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  try {
    let query = supabase.from('table').select('*');
    
    // Filtrar por rol
    if (user.role !== 'admin') {
      query = query.eq('user_id', user.userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### React Component (Client)

```typescript
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Props {
  prop: string;
}

export function ComponentName({ prop }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const res = await api.get('/endpoint');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="glass-card p-6">
      {/* JSX */}
    </div>
  );
}
```

---

## ⚠️ Checklist Antes de Cambios

### Si modificás documentos/archivos:
- [ ] ¿El volumen Docker está montado en `/data/trip-conecta/uploads`?
- [ ] ¿La variable `STORAGE_PATH` apunta al path correcto?
- [ ] ¿Usás `formatCurrency()` para montos?
- [ ] ¿Usás axios con `responseType: 'blob'` para downloads?

### Si modificás base de datos:
- [ ] ¿Actualizaste `docs/02-DATABASE.md`?
- [ ] ¿Creaste migración SQL?
- [ ] ¿Actualizaste tipos en TypeScript?

### Si modificás API:
- [ ] ¿Actualizaste `docs/03-API.md`?
- [ ] ¿Protegiste rutas con `authenticateToken`?
- [ ] ¿Validaste inputs con Zod?

### Si es decisión arquitectónica:
- [ ] ¿Agregaste entrada a `docs/05-DECISIONES.md`?
- [ ] ¿Documentaste por qué se eligió esa opción?

---

## 📞 Contacto y Recursos

- **VPS:** Hetzner CX21 (5.78.158.76)
- **Panel:** https://panel.tripconecta.com
- **API:** https://api.tripconecta.com
- **Landing:** https://tripconecta.com

**Para ver documentación completa:**
```bash
cat docs/README.md
```

---

**Recordá:** Este proyecto usa archivos locales en VPS para documentos. Nunca guardar archivos solo en contenedores Docker.
