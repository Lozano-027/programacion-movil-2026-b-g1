# Screen — Detalle de producto

- **Route:** `/productos/:id`
- **Feature:** Catálogo de productos
- **Design reference:** N/A (componentes estándar de Ionic)

---

## Purpose

Ver todos los datos de un producto y, desde aquí, editarlo o eliminarlo.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonToolbar` + `IonBackButton` | Título con el nombre del producto; botón para volver a `/productos` |
| Body | `IonList` con `IonItem` por campo | Id, nombre, categoría, precio (`formatCOP`), stock y etiqueta de stock |
| Footer / CTA | `IonButton` «Editar» y `IonButton` «Eliminar» (color peligro) | «Eliminar» muestra una confirmación en pantalla |
| Confirmación | Bloque con texto y botones «Sí, eliminar» / «Cancelar» | Aparece solo tras tocar «Eliminar» |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | `getProduct(id)` en curso | Texto «Cargando producto…» |
| Loaded | La API devolvió el producto | Todos los campos y los botones |
| No encontrado | La API responde 404 | `EmptyState` «No encontramos ese producto» con botón «Volver a la lista» |
| Error | Error de red u otro código | `EmptyState` con el mensaje y botón «Reintentar» |
| Confirmando | Se tocó «Eliminar» | Mensaje «¿Eliminar este producto?» con «Sí, eliminar» y «Cancelar» |
| Eliminando | `deleteProduct(id)` en curso | Botones deshabilitados |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Tocar «Editar» | Navega a `/productos/:id/editar` | Actualizar producto |
| Tocar «Eliminar» | Muestra la confirmación | — |
| Tocar «Sí, eliminar» | Borra el producto y vuelve a `/productos` | `deleteProduct` |
| Tocar «Cancelar» | Oculta la confirmación | — |
| Tocar «Reintentar» | Vuelve a pedir el producto | `getProduct` |

---

## Accessibility

- [x] Los botones tienen texto descriptivo («Editar», «Eliminar»), no solo íconos.
- [x] Área táctil de al menos 44×44 pt.
- [x] El texto escala con el sistema.
- [x] La acción destructiva pide confirmación antes de ejecutarse.
