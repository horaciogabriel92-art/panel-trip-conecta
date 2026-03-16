# SOP-024: Apuntado DNS (Coolify + Host del Cliente)

## Objetivo
Vincular el dominio web que el cliente ya compró (o el subdominio que nos pidió) con el motor de nuestra aplicación (Next.js) alojado en el VPS de CARMEN B2B gestionado por Coolify. Esto logra el "Espejismo" donde el cliente cree que programamos una app a medida en su URL.

## Requisitos Previos
- [ ] Conocer el **Dominio Solicitado** por la Agencia (Ej. `mayorista.com` o `b2b.mayorista.com`).
- [ ] Confirmar que tu Backend/Panel está encendido en tu panel de Coolify (Estado: Activo).
- [ ] Tener permisos de "Deploy" o "Settings" en el panel de control de tu Coolify (`panellocal.tripconecta.com` etc).

## 🛠️ Instrucciones de Configuración en Coolify (Capa Servidor)

1. Ingresa a la interfaz de administración de **Coolify** (Tu gestor de VPS y Docker).
2. Selecciona el "Proyecto" oficial de Producción de CARMEN B2B.
3. Encuentra la "Aplicación" frontal (El Fronend SSR de Next.js que despliega toda la web).
4. Dentro de la App Frontal en Coolify, navega a la pestaña de `Settings` (Ajustes) o `General`.
5. Busca el campo de **"Domains" (Dominios Atados)**. Coolify maneja un proxy inverso (Nginx o Traefik).
6. Haz clic en **Añadir Dominio** (`Add Domain`).
7. **Pega el dominio exacto** que el cliente quiere que CARMEN renderice: `https://b2b.agencia-viajes-x.com`.
8. Asegúrate de marcar la casilla de verificación **"Autogestionar SSL/HTTPS con Let's Encrypt"**. (Si no, el sitio le marcará "Inseguro" al cliente).
9. Guarda. Coolify reiniciará los contenedores del *Proxy* en unos segundos.

---

## 🛠️ Instrucciones de Registro DNS (Capa Cliente)

Coolify ya sabe qué hacer si alguien llega pidiendo ese dominio, *pero* nadie va a llegar hasta que el cliente no nos direccione su tráfico. 

El Asistente QA/Implementador debe enviar estar instrucciones al Webmaster o Dueño de la agencia Cliente.
(Si el cliente te da la clave de su GoDaddy, tú haces esto:)

1. Entrar a Cloudflare, GoDaddy o Namecheap del cliente.
2. Ir a la Zona DNS (**Configuración DNS**).
3. Añadir el siguiente "Registro Lógico":
   - **TIPO:** CNAME (Si es un subdominio como `b2b.agencia.com`) **o** A (Si es el dominio raíz `agencia.com`).
   - **HOST / NOMBRE:** `b2b` (la parte antes del punto) o `@` si es raíz.
   - **VALOR / APUNTA A:** `app.tu-trip-conecta-server.com` (O, si usas `A Record`, la IP de tu servidor VPS en Hetzner: `185.xxx.xx.xx`).
   - **TTL:** Automático/El más bajo posible.
4. **Guardar**.

### 5. Verificación de QA (Quality Assurance)
Los DNS tardan en propagarse, pero puedes revisarlo rápidamente:
Abre una terminal (o usa `https://dnschecker.org`) y verifica:
`ping b2b.agencia-viajes-x.com`

- ¿Responde con la IP de CARMEN B2B (Hetzner)? 🟢 Perfecto.
- Al ingresar en el navegador (Chrome en modo Incógnito) ¿Carga la pantalla de Next.js que programaste? 🟢 Perfecto.
- ¿Tiene el candadito verde (SSL)? 🟢 Perfecto. 

*(Recordatorio Técnico: Nuestra lógica Midleware de Next.js es la que, al detectar que entraron por 'b2b.agencia...', consultará la DB y le pintará los colores específicos en pantalla).*

## 🏁 Finalización de Tarea en Asana
*   Comenta *"Propagación DNS exitosa y SSL activo"*.
*   Marca este SOP como Completado ☑️.
*   Pasa a la [SOP-031: Auditoría Visual](./SOP-031-QA-Auditoria.md).
