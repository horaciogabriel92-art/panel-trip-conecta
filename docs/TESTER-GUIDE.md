# Guía para Testers - Trip Conecta B2B

> **Documento para:** QA / Testers  
> **Fecha:** 30 Marzo 2026  
> **Versión:** 1.0 - Checkpoint

---

## 📱 Antes de Empezar

### URLs del Sistema

| Ambiente | URL | Credenciales de Prueba |
|----------|-----|------------------------|
| **Panel Admin** | https://panel.tripconecta.com | admin@tripconecta.com / (pedir a dev) |
| **Panel Vendedor** | https://panel.tripconecta.com | vendedor@tripconecta.com / (pedir a dev) |
| **Landing** | https://tripconecta.com | - |

### Cómo Abrir la Consola (F12)

1. En Chrome/Edge: Presiona **F12** o click derecho → "Inspeccionar"
2. Ve a la pestaña **"Console"** (es la que importa para bugs)
3. Si hay errores rojos, eso es un bug → **screenshot obligatorio**

---

## 🎯 Qué Testear Hoy

### Prioridad 1: Sistema de Notificaciones

#### Test 1.1 - Notificación de Nueva Venta
**Flujo:** Vendedor convierte cotización → Admin recibe notificación

**Pasos:**
1. Loguearse como **vendedor**
2. Ir a "Mis Cotizaciones"
3. Crear una cotización nueva (cualquier paquete)
4. Abrir esa cotización
5. Click en "Convertir a Venta"
6. Completar datos de pago → Confirmar
7. Desloguearse
8. Loguearse como **admin**
9. Revisar si aparece la notificación (campana arriba a la derecha)

**✅ Éxito si:** Aparece el número rojo en la campana y la notificación "Nueva venta..."
**❌ Bug si:** No aparece nada después de 30 segundos

---

### Prioridad 2: Vista Admin de Cotización Vendida

#### Test 2.1 - Ver Cotización Vendida Completa
**Flujo:** Admin abre cotización vendida y ve todos los datos

**Pasos:**
1. Loguearse como **admin**
2. Ir a "Cotizaciones"
3. Buscar una cotización con estado **"VENDIDA"** (badge verde)
4. Click en el ojo 👁️ para ver detalle

**✅ Éxito si se ven estas secciones:**
- [ ] Banner verde "¡Venta Confirmada!" con código de venta
- [ ] Datos del vendedor
- [ ] Box "Paquete: [nombre]" con duración y noches
- [ ] Datos completos del cliente (nombre, email, teléfono, documento)
- [ ] Lista de pasajeros
- [ ] Vuelos (si los tiene)
- [ ] Información de Pago (estado, monto, medio)
- [ ] Comprobantes de Pago con botón "Descargar"

**❌ Bug si:**
- Falta alguna sección
- Dice "Paquete:" sin nombre
- No se ven los pasajeros
- Los botones no funcionan

---

#### Test 2.2 - Descargar Comprobante
**Flujo:** Admin descarga comprobante de pago

**Pasos:**
1. En la vista de cotización vendida (test anterior)
2. Buscar sección "Comprobantes de Pago"
3. Click en botón "Descargar" de un comprobante

**✅ Éxito si:** Se descarga el archivo (aparece en barra de descargas)
**❌ Bug si:** No pasa nada o sale error

**📸 Si hay bug:** Screenshot de la consola (F12) obligatorio

---

#### Test 2.3 - Marcar Comisión como Pagada
**Flujo:** Admin marca comisión de vendedor como pagada

**Pasos:**
1. En cotización vendida, ver panel derecho "Resumen Financiero"
2. Debe decir "Comisión pendiente" (badge amarillo)
3. Click en botón "Marcar Comisión Pagada"
4. Confirmar en el modal

**✅ Éxito si:** Cambia a "Comisión pagada" (badge verde)
**❌ Bug si:** No cambia o da error

---

### Prioridad 3: Estados de Cotización

#### Test 3.1 - Estados Correctos
**Flujo:** Verificar que los estados se ven bien

**Pasos:**
1. Ir a lista de cotizaciones (/admin/cotizaciones)
2. Revisar los badges de estado

**✅ Éxito si los colores son:**
- NUEVA → naranja 🟠
- ENVIADA → azul 🔵
- VENDIDA → verde 🟢
- PERDIDA → rojo 🔴

**❌ Bug si:**
- Los colores no coinciden
- El texto está en inglés
- No aparece el badge

---

### Prioridad 4: Crear Cotización

#### Test 4.1 - Admin Crea Cotización para Vendedor
**Flujo:** Admin asigna cotización a vendedor específico

**Pasos:**
1. Loguearse como **admin**
2. Ir a Cotizaciones
3. Click en "Nueva Cotización"
4. Seleccionar "Desde Cero"
5. Seleccionar un vendedor de la lista
6. Completar datos del cliente
7. Completar datos mínimos (vuelos opcional)
8. Guardar

**✅ Éxito si:**
- Se crea la cotización
- Aparece en la lista
- Tiene asignado el vendedor correcto

**❌ Bug si:**
- Da error al guardar
- No aparece en la lista
- No tiene vendedor asignado

---

## 🐛 Cómo Reportar un Bug

### Template (Copiar y Pegar)

```
**Bug #X**

**Módulo:** Admin / Vendedor / Notificaciones / Cotizaciones
**Severidad:** Crítica / Alta / Media / Baja

**Descripción:**
[Qué pasó en 1 oración]

**Pasos para reproducir:**
1. 
2. 
3. 

**Resultado esperado:**
[Qué debería pasar]

**Resultado actual:**
[Qué pasa realmente]

**Evidencia:**
📸 Screenshot de la pantalla
📸 Screenshot de la CONSOLA (F12) - IMPORTANTE

**Datos:**
- Usuario: admin@... / vendedor@...
- URL donde pasó: 
- Fecha/hora: 
- Navegador: Chrome/Edge/Safari
```

### Ejemplo de Bug Bien Reportado

```
**Bug #1**

**Módulo:** Notificaciones
**Severidad:** Alta

**Descripción:**
El admin no recibe notificación cuando el vendedor convierte cotización a venta.

**Pasos para reproducir:**
1. Login como vendedor@test.com
2. Ir a Mis Cotizaciones
3. Abrir cotización COT-2026-123
4. Click "Convertir a Venta"
5. Completar datos y confirmar
6. Desloguear
7. Login como admin@test.com
8. Esperar 1 minuto

**Resultado esperado:**
Debería aparecer notificación "Nueva venta..." en la campana.

**Resultado actual:**
La campana no muestra ninguna notificación. Queda en 0.

**Evidencia:**
[screenshot pantalla admin]
[screenshot consola F12 con errores rojos]

**Datos:**
- Usuario: admin@test.com
- URL: https://panel.tripconecta.com/admin/dashboard
- Fecha/hora: 30/03/2026 15:30
- Navegador: Chrome 123
```

---

## 📋 Checklist Final

Después de testear, marcar con ✅ o ❌:

| # | Test | Estado |
|---|------|--------|
| 1 | Notificación nueva venta | |
| 2 | Vista cotización vendida completa | |
| 3 | Descargar comprobante | |
| 4 | Marcar comisión pagada | |
| 5 | Estados con colores correctos | |
| 6 | Crear cotición desde admin | |

---

## 🆘 Qué Hacer Si Algo Falla

### Si la página no carga
1. Revisar que la URL esté bien escrita
2. Probar en modo incógnito (Ctrl+Shift+N)
3. Limpiar cache (Ctrl+F5)
4. Avisar a dev con screenshot del error

### Si hay errores en consola (F12)
1. Abrir consola **antes** de hacer la acción que falla
2. Limpiar consola (click en 🚫)
3. Hacer la acción que falla
4. Screenshot de los errores rojos
5. Reportar bug con ese screenshot

### Si no sé si es un bug
1. Preguntar en el grupo: "¿Esto es normal o es un bug?"
2. Describir lo que esperaba vs lo que pasó
3. Adjuntar screenshot

---

## 📞 Contacto

| Rol | Contacto |
|-----|----------|
| Tech Lead | (completar) |
| Product Owner | (completar) |
| Slack/Discord | (completar) |

---

*Guía creada: 30 Marzo 2026*  
*No incluye código ni detalles de base de datos - solo instrucciones de uso*
