# Screen — Formulario de producto (crear / editar)

- **Route:** `/productos/nuevo` (crear) y `/productos/:id/editar` (editar)
- **Feature:** Catálogo de productos
- **Design reference:** N/A (componentes estándar de Ionic)

---

## Purpose

Crear un producto nuevo o modificar uno existente, con validación en línea antes de enviar y con los mensajes del servidor si este rechaza los datos.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonToolbar` + `IonBackButton` | Título «Nuevo producto» o «Editar producto» según la ruta |
| Body | 3 `IonInput` (nombre, precio, stock) + 4 `IonButton` de categoría | Debajo de cada campo, su mensaje de error en rojo |
| Errores del servidor | Bloque de texto | `error` y la lista de `details` cuando la API responde 400 |
| Footer / CTA | `IonButton` «Guardar» | Deshabilitado mientras se guarda |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading (solo editar) | `getProduct(id)` en curso | Texto «Cargando producto…» |
| Editando | Formulario listo | Campos vacíos (crear) o con los datos actuales (editar) |
| Inválido | `validateProduct` devuelve errores | Mensaje bajo cada campo con problema; no se envía nada |
| Guardando | `createProduct` / `updateProduct` en curso | Botón «Guardando…» deshabilitado |
| Rechazado | La API responde 400 | Mensaje del servidor y sus `details` |
| No encontrado (solo editar) | La API responde 404 | `EmptyState` con botón «Volver a la lista» |
| Error | Error de red | Mensaje de conexión; los datos escritos se conservan |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Escribir en un campo | Se actualiza el estado y se revalida en línea | `validateProduct` |
| Elegir categoría | Se marca la categoría elegida | — |
| Tocar «Guardar» con datos válidos (crear) | `POST`, luego vuelve a `/productos` | `createProduct` |
| Tocar «Guardar» con datos válidos (editar) | `PUT`, luego vuelve al detalle | `updateProduct` |
| Tocar «Guardar» con datos inválidos | Muestra los errores; no llama a la API | `validateProduct` |

---

## Accessibility

- [x] Cada `IonInput` tiene etiqueta visible (`label`).
- [x] Los errores se muestran como texto junto al campo, no solo con color.
- [x] Precio y stock usan teclado numérico (`type="number"`).
- [x] Área táctil de al menos 44×44 pt.
