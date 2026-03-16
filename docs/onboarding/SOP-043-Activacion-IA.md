# SOP-043: Activación Módulo IA (CARMEN Assistant)

## Objetivo
*Solo aplica si el cliente pagó el "Upsell" (Setup Fee de $300-$500 USD por adelantado).*
Este SOP detalla cómo "despertar" al agente cognitivo (RAG) para que entienda el ecosistema de datos de esta agencia específica, asegurando que CARMEN no alucine inventando destinos que el Mayorista no vende.

## Requisitos Previos
- [ ] Venta Core de SaaS al Aire y Estable (SOP-042 Terminado).
- [ ] El Cliente tiene al menos 50 o 100 paquetes reales subidos a su Base de Datos. *(Nota: No activar CARMEN en catálogos vacíos; la IA lucirá tonta).*
- [ ] El cliente pagó el Fee de Ingesta (Embeddings Setup).

## 🛠️ Instrucciones de Activación (Ingeniería de Datos y RAG)

### 1. Ingesta Inicial a Vector DB (Supabase `pgvector`)
El primer paso es tomar todo el texto que el cliente cargó en Supabase (Catálogo de paquetes, precios, descripciones, itinerarios) y pasarlo por la API de Embeddings de OpenAI para convertirlo en números.

1. **Ejecutar el Script de Sincronización:**
   El equipo de Desarrollo de CARMEN debe tener un script (ej. `npm run sync-ai-embeddings --tenant=ID_DEL_CLIENTE`). Ejecútalo en el servidor local o en la terminal de Coolify.
2. **Explicación del Proceso (10 minutos aprox):**
   El script descargará las filas del Tenant, enviará miles de "Tokens" al modelo `text-embedding-3-small` de OpenAI (Costo ~0.02c), y guardará los vectores devueltos en la columna especial de `Supabase pgvector` de ese mismo Tenant.
3. Verificar en la base de datos que las columnas de "Embeddings" ya no estén `null`.

### 2. Activación de Funciones "Function Calling" (Backend)
Si vendiste el módulo de **CARMEN Admin** (El que dice cuánta plata ganamos), debes asegurarte de que el Agente en el Backend tenga permisos para hacer consultas SQL de métricas a este Tenant.
1. En el panel de control Super-Admin de CARMEN B2B, ve a la sección de [Tenant / IA Settings].
2. Cambia el *Switch* Módulo IA -> **Encendido (ON)**.
3. Asigna la llave API `OPENAI_API_KEY` corporativa o la llave propia del cliente (según el esquema comercial que se haya cerrado).

### 3. Prueba de Humo RAG (Sanity Check)
No se lo muestras al cliente hasta que tú hables con CARMEN.

1. Entra al Panel del Administrador del cliente (con su Login).
2. Abre la burbuja flotante del Chat (CARMEN Admin).
3. Escribe: *"¿Qué paquetes tengo cargados para el Caribe por menos de $1500?"*
4. **Respuesta Esperada:** CARMEN debe listar opciones reales que tú sabes que existen en ese catálogo, citando precios exactos de esa base de datos.
5. **Si CARMEN dice "Recomiendo Cancún" pero ese Mayorista no vende Cancún:** La configuración RAG falló. Revisa que el script de Ingesta filtró correctamente por `tenant_id` y que las System Instructions de OpenAI ("Eres un asistente que SOLO responde con los datos provistos en el contexto de la base de datos") estén rígidas.

### 4. La Demo de Entrega IA (Llamada Corta - Upsell)
Si superaste el test de humo:
1. Graba un video (Loom) de 3 minutos para el dueño de la Agencia.
2. **Guion:** *"¡Hola! CARMEN ya despertó y leyó todo tu inventario histórico. Mira cómo le acabo de preguntar cómo van nuestras comisiones este mes y me sacó una métrica al instante. El módulo ya está activo en tu panel y en el de tus vendedores por los $99/mes acordados."*

---

## 🏁 Finalización de Tarea en Asana
*   Anota: "Vectores Ingestados y Módulo IA Activo". (Guarda una captura de la charla con CARMEN como evidencia de que respondía bien el Día 1).
*   ¡Felicidades! Finalizaste todo el flujo de implementación y facturaste un Cliente Premium de Inicio a Fin.
*   Marca este SOP como Completado ☑️.
