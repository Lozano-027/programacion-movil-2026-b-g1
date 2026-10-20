# Endpoint Integration — Products API

- **Feature:** Catálogo de productos
- **Base URL:** `API_URL` (`VITE_API_URL` en `.env`; por defecto `http://localhost:3000`)
- **Auth required:** No

Todos los errores usan el mismo formato:

```json
{ "error": "mensaje", "details": ["un mensaje por cada problema"] }
```

En la app, cualquier error llega como `ApiError` (ver ADR-002): `status = null` si la API no respondió, o el código HTTP con sus `details` si respondió con error.

---

## 1. Listar productos — `GET /api/products`

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `search` | query | string | No | El nombre contiene el texto, sin distinguir mayúsculas |
| `category` | query | string | No | Coincidencia exacta: `Bebidas`, `Snacks`, `Aseo` u `Hogar` |

**Body:** ninguno.

### Response

**Success (200):** arreglo de productos (vacío si nada coincide).
```json
[{ "id": 1, "name": "Agua mineral 600 ml", "price": 1800, "category": "Bebidas", "stock": 120 }]
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| — | Este endpoint no define errores propios | — |
| Sin respuesta | La API no responde (red) | Estado de error con «Reintentar» |
| 500 | Error inesperado | Estado de error con el mensaje y «Reintentar» |

**Cliente:** `getProducts(query)`.

---

## 2. Ver producto — `GET /api/products/:id`

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos; si no, 400 |

### Response

**Success (200):** el producto.
```json
{ "id": 3, "name": "Gaseosa cola 1,5 L", "price": 4800, "category": "Bebidas", "stock": 4 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | `id` no numérico | Mensaje de error (las rutas de la app ya solo aceptan dígitos) |
| 404 | No existe un producto con ese id | Estado «No encontramos ese producto» con botón para volver |
| 5xx / red | Fallo del servidor o sin conexión | Error con «Reintentar» |

**Cliente:** `getProduct(id)`.

---

## 3. Crear producto — `POST /api/products`

### Request

**Headers:** `Content-Type: application/json`

**Body:**
```json
{ "name": "Café molido 250 g", "price": 9800, "category": "Bebidas", "stock": 15 }
```

| Field | Type | Required | Rule |
|-------|------|----------|------|
| `name` | string | Yes | No vacío (los espacios no cuentan), máximo 60 caracteres |
| `price` | number | Yes | Mayor que 0 |
| `category` | string | Yes | Una de `Bebidas`, `Snacks`, `Aseo`, `Hogar` |
| `stock` | integer | Yes | Entero mayor o igual que 0 |

### Response

**Success (201):** el producto creado con un `id` nuevo e incremental.
```json
{ "id": 9, "name": "Café molido 250 g", "price": 9800, "category": "Bebidas", "stock": 15 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Datos inválidos o JSON mal formado | Muestra `error` y cada mensaje de `details` en el formulario |
| 5xx / red | Fallo del servidor o sin conexión | Mensaje de error; los datos escritos se conservan |

Ejemplo de 400:
```json
{ "error": "Datos inválidos", "details": ["name es obligatorio", "price debe ser un número mayor que 0"] }
```

**Cliente:** `createProduct(input)`.

---

## 4. Actualizar producto — `PUT /api/products/:id`

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos |

**Headers:** `Content-Type: application/json`

**Body:** el producto completo (mismos campos y reglas que en POST; el `id` no cambia).

### Response

**Success (200):** el producto actualizado.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | `id` no numérico o datos inválidos | Muestra `error` y `details` en el formulario |
| 404 | El producto no existe | Estado «No encontramos ese producto» |
| 5xx / red | Fallo del servidor o sin conexión | Mensaje de error |

**Cliente:** `updateProduct(id, input)`.

---

## 5. Eliminar producto — `DELETE /api/products/:id`

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos |

### Response

**Success (204):** sin cuerpo. El cliente devuelve `undefined`.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | `id` no numérico | Mensaje de error |
| 404 | El producto no existe | Mensaje «No encontramos ese producto» |
| 5xx / red | Fallo del servidor o sin conexión | Mensaje de error; el producto sigue en pantalla |

Tras el 204, la app vuelve a `/productos`, que se recarga al entrar.

**Cliente:** `deleteProduct(id)`.

---

## Otros errores del servidor (manejadores ya dados)

| Caso | Status | Respuesta |
|------|--------|-----------|
| Ruta desconocida (p. ej. `GET /api/otra`) | 404 | `{ "error": "Ruta no encontrada", "details": ["GET /api/otra"] }` |
| Cuerpo con JSON mal formado | 400 | `{ "error": "El cuerpo no es un JSON válido", "details": [] }` |
| Excepción no prevista en una ruta | 500 | `{ "error": "Error interno del servidor", "details": [] }` |

---

## Caching / offline

- **Strategy:** online-only.
- **Cached entity:** N/A (no hay caché local).
- **TTL / invalidation:** N/A; la lista se vuelve a pedir cada vez que se entra a la pantalla.
