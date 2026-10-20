# Feature — Catálogo de productos

- **Owner:** Julio Cesar Lozano Lozano (@Lozano-027)
- **Status:** In progress
- **Related stories:** HU-PROD-001 (ver lista), HU-PROD-002 (ver detalle), HU-PROD-003 (crear), HU-PROD-004 (editar), HU-PROD-005 (eliminar)

---

## Purpose

Permitir que la persona encargada de una tienda consulte, busque, cree, edite y elimine los productos del catálogo (bebidas, snacks, aseo y hogar) desde una app móvil, viendo de un vistazo el precio en pesos y si queda poco inventario.

---

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Lista de productos | `/productos` | Ver todos los productos, buscar por nombre y filtrar por categoría |
| Detalle de producto | `/productos/:id` | Ver todos los campos de un producto, ir a editar o eliminarlo |
| Formulario (crear) | `/productos/nuevo` | Registrar un producto nuevo con validación en línea |
| Formulario (editar) | `/productos/:id/editar` | Modificar un producto existente (misma pantalla que crear) |

> Cada pantalla se especifica en `docs/screens/`.

---

## State

- **Pattern:** Estado local por página con `useState` + `useEffect` de React (ver ADR-001).
- **State object(s):**
  - Lista: `products: Product[]`, `status: 'loading' | 'ready' | 'error'`, `errorMessage`, `search`, `selectedCategory`.
  - Detalle: `product: Product | null`, `status`, `errorMessage`, `isConfirmingDelete`.
  - Formulario: valores de los campos, `errors` (de `validateProduct`), `serverError`, `serverDetails`, `isSaving`.
- **Key transitions:**
  - `loading → ready` cuando la API responde bien.
  - `loading → error` cuando hay error de red o respuesta no exitosa; `error → loading` al tocar «Reintentar».
  - En la lista, con `status = ready`: si la API devuelve 0 productos → **vacío**; si hay productos pero `filterProducts` no deja ninguno → **sin resultados**.
  - Formulario: `editando → guardando → (éxito: volver a la lista) | (rechazo: mostrar details)`.

---

## Data

- **Use cases:** Listar productos, Ver producto, Crear producto, Actualizar producto, Eliminar producto.
- **Repositories:** Cliente HTTP `data/products-api.ts` (`getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`).
- **Remote sources / endpoints:** `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` (detalle en `docs/api/products-endpoints.md`).
- **Local persistence:** N/A. La app no guarda datos en el dispositivo; la API guarda los productos en memoria y se reinician al reiniciar el servidor.

---

## Edge cases & states

- [x] Loading: texto «Cargando…» mientras llega la respuesta.
- [x] Empty: la API no tiene productos → `EmptyState` con botón para crear uno.
- [x] Sin resultados: la búsqueda o la categoría no coinciden con ningún producto → `EmptyState` que invita a cambiar el filtro.
- [x] Error / retry: `EmptyState` con el mensaje de `getErrorMessage` y botón «Reintentar».
- [x] Offline: se trata como error de red (`ApiError` con `status = null`), con el mismo botón «Reintentar». No hay caché.
- [ ] Permission denied: N/A (la API no tiene autenticación).
- [x] Producto no encontrado (404) en detalle y edición.
- [x] Id no numérico en la URL: las rutas solo aceptan dígitos; la API responde 400 si llega uno inválido.
- [x] Datos inválidos en el formulario: errores en línea; si el servidor rechaza, se muestran sus `details`.

---

## Decisions

- `docs/decisions/ADR-001-estado.md`: manejo del estado con `useState` y `useEffect` por página.
- `docs/decisions/ADR-002-consumo-api.md`: consumo de la API con `fetch`, `API_URL` y `ApiError`.

---

## Tests

- Unit: `validateProduct` (datos válidos e inválidos), `toProductView` (etiquetas Agotado / Pocas unidades / Disponible y formato COP), `filterProducts` (búsqueda sin mayúsculas y categoría).
- API (con `startTestServer()`): `POST` inválido → 400 con `details`; `GET /api/products/999` → 404; ruta desconocida → 404 del manejador dado.
- Integration/E2E: N/A en este parcial; el flujo crear → ver en lista → eliminar se prueba a mano con `npm run server` y `npm run dev`.
