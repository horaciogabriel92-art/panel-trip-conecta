# 07 - La Lógica del RAG Multi-Tenant (CARMEN Assistant)

## Desmitificando la Inteligencia Artificial Privada

Es normal que la idea de "Programar un Agente IA que separe los datos de 50 empresas distintas" suene a ciencia ficción o a meses de ingeniería compleja. La realidad es que, en 2026, las bases de datos modernas (como Supabase) ya resolvieron el 80% del problema por nosotros.

Aquí explicamos, paso a paso y sin jerga técnica innecesaria, cómo funciona el cerebro de CARMEN Assistant y por qué es 100% seguro que un Mayorista A nunca verá los precios del Mayorista B.

---

## 🧠 El Problema: ChatGPT es un loro sin memoria
Si conectas la API normal de ChatGPT a tu software, el cliente preguntará: *"¿A cuánto tienes el viaje a Cancún?"* y ChatGPT alucinará respondiendo: *"Un viaje a Cancún cuesta típicamente $1,500 en Despegar.com"*. 

Eso es inútil para B2B. Necesitamos que responda: *"Tu paquete 'Caribe Especial' cuesta $1,200 y te quedan 4 cupos"*.

Aquí es donde entra el **RAG (Retrieval-Augmented Generation)**:
1. **Retrieval (Recuperación):** Antes de hablar con ChatGPT, buscamos en *nuestra* base de datos los documentos relevantes.
2. **Augmented (Aumento):** Le pegamos esos documentos a la pregunta del usuario (*"Oye IA, el usuario preguntó X. Usa **solo** este texto que encontré para responderle"*).
3. **Generation (Generación):** La IA redacta una respuesta perfecta basada *exclusivamente* en nuestra data.

---

## 🏗️ La Arquitectura de 3 Pasos (Cómo lo programamos)

Para que el RAG funcione en un entorno **Multi-Tenant** (muchas agencias en una sola base de datos), el secreto no está en la Inteligencia Artificial, sino en la **Matemática Vectorial**.

### Paso 1: La Ingesta (El Proceso de Setup por el que cobramos $500)
El cliente "Agencia El Sol" (`tenant_id: 15`) acaba de subir sus 50 paquetes turísticos al sistema. 

Nuestra base de datos tradicional (`PostgreSQL`) entiende palabras. Pero la IA solo entiende números (**Vectores**).
1. Nuestro backend (Node.js) toma el texto del Paquete 1: *"Viaje a Cancún 7 días, $1,200, Todo Incluido"*.
2. Se lo enviamos a la API de Embeddings de OpenAI (`text-embedding-3-small`).
3. OpenAI nos devuelve un vector masivo (ej. `[0.0012, -0.442, 0.992...]`). Es la "Coordenada semántica" de ese texto.
4. **EL TRUCO DE SEGURIDAD:** Guardamos ese vector en una tabla de Supabase (`documentos_ia`) PERO amarrado con candado a su dueño:
   *   `vector`: `[0.0012, -0.442...]`
   *   `texto_original`: "Viaje a Cancún..."
   *   **`tenant_id`**: `15` (Crucial)

*(Repetimos esto con cada paquete de la agencia. Esto es lo que hace el botón "Sincronizar" del Super-Admin panel).*

### Paso 2: La Pregunta del Vendedor (La Búsqueda Vectorial)
Un mes después, el Vendedor de "Agencia El Sol" (`tenant_id: 15`) abre el chat y escribe:
*"Busco algo para la playa"*

1. Enviamos *"Busco algo para la playa"* a OpenAI para convertir la pregunta en un Vector de números.
2. **El Escudo (RLS):** Aquí ocurre la magia. Le pedimos a Supabase (usando la extensión `pgvector`): 
   *"Oye Base de Datos, encuéntrame los 5 vectores que matemáticamente se parezcan más a la pregunta de la playa... **PERO SOLO BUSCA entre los vectores que tengan `tenant_id = 15`**"*.
3. Es **físicamente imposible** que Supabase recupere un vector del crucero a Miami de la "Agencia B", porque el filtro SQL `WHERE tenant_id = 15` los bloquea antes de que la IA siquiera los vea.
4. Supabase nos devuelve el texto original del paquete de Cancún de $1,200.

### Paso 3: El Aumento y la Respuesta (La Magia)
Ahora tenemos la pregunta del usuario y los datos reales ("El Contexto"). Juntamos todo en un "Prompt" (Instrucción) gigante escondido para OpenAI:

> **System Prompt de CARMEN:**
> "Eres CARMEN, la experta en ventas de la Agencia El Sol. Responde la pregunta del usuario usando ESTRICTAMENTE la siguiente información de nuestro catálogo. Si la respuesta no está en el texto, di 'No tenemos paquetes disponibles para eso'.
>
> **INFORMACIÓN ENCONTRADA:**
> [Texto: Viaje a Cancún 7 días, $1,200, Todo Incluido]
> 
> **PREGUNTA DEL USUARIO:** Busco algo para la playa"

Le enviamos este bloque gigante a la API de Chats de OpenAI (Ej: `gpt-4o-mini`).
OpenAI procesa la lógica y responde hermosamente:
*"¡Claro! Tenemos un paquete a Cancún por 7 días Todo Incluido que cuesta $1,200. ¿Te gustaría generar la cotización?"*

---

## ⚡ El Resumen Técnico (Por qué no es tan complejo)

Si te fijas, la IA de OpenAI o Gemini **nunca vio tu base de datos completa**, **ni siquiera sabe que existen otras agencias**. Es un motor "tonto y ciego" al que tú le das los ingredientes procesados en una cuchara.

**El peso de la seguridad y el aislamiento lógico recae 100% sobre tu Base de Datos (Supabase RLS).** 
Como Supabase RLS (Row Level Security) ya es militarmente estricto, si tu desarrollador filtra correctamente el `tenant_id` en la consulta vectorial de PostgreSQL, la IA es incapaz de filtrar datos cruzados.

Esa es la arquitectura moderna de RAG B2B. Parece magia negra al usuario final, pero es simple matemática de similitud en una tabla de base de datos filtrada.
