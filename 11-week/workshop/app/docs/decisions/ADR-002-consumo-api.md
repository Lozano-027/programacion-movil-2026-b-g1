# ADR-002 — Consumo de la API con fetch, API_URL y ApiError

- **ID:** ADR-002
- **Date:** 2026-10-11
- **Status:** Accepted
- **Authors:** Julio Cesar Lozano Lozano

---

## Context

La app debe leer y modificar productos en la API Express (`server/`). Hay que decidir cómo se hacen las peticiones HTTP, de dónde sale la dirección de la API y cómo se convierten los errores (red caída, 400, 404, 500) en algo que la interfaz pueda mostrar. Si cada página llamara a `fetch` por su cuenta, el manejo de errores quedaría repetido e inconsistente.

**Known constraints:**
- La app (puerto 5173) y la API (puerto 3000) corren en orígenes distintos: la API debe permitir CORS.
- La dirección de la API cambia entre entornos y no debe quedar fija en el código.
- La API responde todos los errores con el formato `{ "error": "mensaje", "details": ["..."] }`.

---

## Decision

**We decided:** todas las llamadas pasan por una función `request()` en la capa `data/` (`products-api.ts`), que usa `fetch` sobre `API_URL` y lanza un `ApiError` cuando algo falla; la capa `presentation/` solo atrapa `ApiError` y lo traduce a un mensaje con `getErrorMessage()`.

**Justification:**
Centralizar el acceso en `data/` aplica la regla de capas del framework: la interfaz no sabe de URLs ni de códigos HTTP. `ApiError` separa dos casos que la persona usuaria debe entender distinto:
- **Error de red:** `fetch` lanza una excepción porque la API no responde. `ApiError` con `status = null` e `isNetworkError = true`.
- **Respuesta no exitosa:** la API respondió, pero con `!response.ok`. `ApiError` con el `status` (400, 404, 500) y los `details` del servidor.

`API_URL` sale de `import.meta.env.VITE_API_URL` (archivo `.env`, ignorado por Git), con `http://localhost:3000` por defecto. Una respuesta 204 (DELETE) no tiene cuerpo, así que `request()` devuelve `undefined`.

En el servidor, las piezas ya dadas completan el contrato: `express.json()` lee el cuerpo, `cors()` permite el origen de la app, `parseId()` convierte `:id` y devuelve `null` si no es numérico (la ruta responde 400), el manejador 404 responde a rutas desconocidas y el manejador central de errores (4 parámetros) devuelve 400 si el JSON está mal formado y 500 ante cualquier excepción no prevista.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `fetch` + `request()` + `ApiError` (elegida) | Nativo del navegador, sin dependencias; errores uniformes y tipados | Hay que escribir a mano la conversión de JSON y errores | — (chosen) |
| `fetch` directo en cada página | Rápido de escribir | Manejo de errores repetido; la interfaz depende de HTTP | Rompe la separación de capas |
| Axios | Interceptores, JSON automático, lanza en 4xx/5xx | Dependencia adicional para pocas llamadas | No aporta lo suficiente para cinco endpoints |
| React Query / TanStack Query | Caché, reintentos, estados de carga | Dependencia y conceptos nuevos | Fuera del alcance; ver ADR-001 |

---

## Consequences

**Positive:**
- Un solo lugar para cambiar la URL, los encabezados o el manejo de errores.
- La interfaz distingue «no hay conexión» de «datos inválidos» o «no encontrado».
- Los `details` del servidor llegan al formulario para mostrarse a la persona usuaria.
- No hay secretos en el código: la URL se configura en `.env`.

**Negative / Trade-offs:**
- Sin caché ni reintentos automáticos: el reintento es un botón.
- No hay validación del JSON recibido en tiempo de ejecución; se confía en el contrato de la API.

**Impact on the system:**
- Affected features/screens: lista, detalle y formulario.
- Documents to update: `docs/api/products-endpoints.md` y la sección «API error handling» del README.

---

## References

- MDN: Fetch API y `Response.ok`.
- Express: manejo de errores (middleware de 4 parámetros).
- Related to: ADR-001 (manejo del estado).
