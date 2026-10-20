# Screen — Lista de productos

- **Route:** `/productos`
- **Feature:** Catálogo de productos
- **Design reference:** N/A (sin mockup; se usan componentes estándar de Ionic)

---

## Purpose

Ver el catálogo completo, buscar productos por nombre, filtrar por categoría y entrar al detalle o al formulario de creación.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonToolbar` + `IonTitle` | Título «Productos» |
| Filtros | `IonInput` + 5 `IonButton` | Buscador por texto y botones «Todas», «Bebidas», «Snacks», «Aseo», «Hogar»; el botón activo se resalta |
| Body | `IonList` con un `ProductCard` por producto | Nombre, categoría, precio con `formatCOP` y etiqueta de stock |
| Footer / CTA | `IonButton` «Nuevo producto» | Lleva a `/productos/nuevo` |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Petición `getProducts()` en curso | Texto «Cargando productos…» |
| Loaded | La API devolvió productos y el filtro deja al menos uno | Lista de `ProductCard` |
| Empty | La API devolvió un arreglo vacío | `EmptyState` «No hay productos» con acción «Crear producto» |
| Sin resultados | Hay productos, pero `filterProducts` devuelve 0 | `EmptyState` «Sin resultados» con acción «Ver todas» (limpia filtros) |
| Error | Error de red o respuesta no exitosa | `EmptyState` con el mensaje de `getErrorMessage` y botón «Reintentar» |
| Offline | La API no responde | Igual que Error (mensaje de conexión) |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Escribir en el buscador | La lista se filtra al instante por nombre (sin distinguir mayúsculas) | `filterProducts` |
| Tocar un botón de categoría | Se muestran solo los de esa categoría («Todas» quita el filtro) | `filterProducts` |
| Tocar un producto | Navega a `/productos/:id` | Ver producto |
| Tocar «Nuevo producto» | Navega a `/productos/nuevo` | Crear producto |
| Tocar «Reintentar» | Vuelve a pedir la lista | `getProducts` |
| Volver desde otra pantalla | La lista se recarga (`useIonViewWillEnter`) | `getProducts` |

---

## Accessibility

- [x] El buscador tiene etiqueta visible («Buscar por nombre»).
- [x] Los botones de categoría y los productos tienen área táctil de al menos 44×44 pt (componentes Ionic).
- [x] El texto escala con el tamaño de fuente del sistema.
- [x] La etiqueta de stock no depende solo del color: siempre se muestra el texto («Agotado», «Pocas unidades»).
