# SOP-022: Alta de Usuarios Administradores Iniciales

## Objetivo
Configurar los accesos seguros del cliente al sistema B2B (Back-Office o CRM Base) asignándoles su cuenta maestra (Dueño / Administrador) para que puedan comenzar a gobernar y cargar más paquetes.

## Requisitos Previos
- [ ] Haber completado el SOP-021 (El Tenant ya existe en la DB y tienes su UUID).
- [ ] Tener el Nombre, Correo y Contraseña inicial del dueño (u otra persona clave a quien le daremos acceso).

## 🛠️ Instrucciones Paso a Paso (Backend / PostgreSQL)

1. **Abre el Editor SQL de tu panel Supabase (Proyecto de Producción).**
2. Ejecuta el `INSERT` de abajo, pero con extrema atención para sustituir el campo `'EL_UUID_LARGO_DEL_TENANT'` (Punto crítico: si te equivocas, lo asignas a la agencia de otro país). 

```sql
INSERT INTO users (
  email,
  password, /* Usar Pass Cifrada por bcrypt o API directa */
  nombre,
  apellido,
  rol,
  comision_porcentaje,
  tenant_id
)
VALUES (
  'director@viajeselsol.com',
  '$2b$10$UnHashBcryptAcaOgenerarPorAuthRoute...',
  'Mariana',
  'Juarez',
  'admin',
  0,  /* Los administradores normalmente NO cobran comisión */
  'EL_UUID_LARGO_DEL_TENANT'
);
```

> [!NOTE]
> *Recomendación Práctica:* 
> Para no arriesgarte a inyectar hashes BCrypt manuales (lo cual es lento), si existe el **Panel SuperAdmin interno de CARMEN**, utiliza esa ruta visual (Endpoint `POST /api/auth/register-admin`) donde te pregunte el Token API de Creación. De no existir y hacerlo puramente por DB, verifica que tengas una herramienta CLI para hashear a 10 saltos.

### Alta del Primer Vendedor Test (Solo Mayoristas)
Si es un *Mayorista* (Enterprise):
3. Asígnale de cortesía a 1 de sus vendedores "Estrella".
```sql
INSERT INTO users (
  email,
  password, 
  nombre,
  apellido,
  rol,
  comision_porcentaje,
  tenant_id
)
VALUES (
  'pepe_freelance@hotmail.com',
  'HASH2B...',
  'José',
  'García',
  'vendedor',
  12, /* La Comisión Defecto levantada en el SOP-011 Kickoff */
  'EL_UUID_LARGO_DEL_TENANT'
);
```

## 🏁 Finalización de Tarea en Asana
*   En la Tarea, escribe las credenciales de Login provisionales (Ej. `director@viajeselsol.com` / `Temporal123!`).
*   Marca este SOP como Completado ☑️.
*   Pasa al [SOP-023: Branding (Inyección de Colores Web)](./SOP-023-Branding-Inyeccion.md).
