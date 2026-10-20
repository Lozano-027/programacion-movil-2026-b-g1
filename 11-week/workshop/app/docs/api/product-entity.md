# Entity — Product

- **Store:** N/A (almacenamiento en memoria). La API guarda un arreglo en memoria, copiado de `server/data/products.json` (8 productos semilla); se reinicia al reiniciar el servidor.
- **Table/collection:** `products` (arreglo en memoria, no es una tabla real)
- **Schema version introduced:** 1

---

## Fields

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | integer | No | Clave única; la asigna el servidor de forma incremental. No se envía al crear ni se cambia al actualizar |
| `name` | string | No | Obligatorio; sin espacios sobrantes; máximo 60 caracteres |
| `price` | number | No | Mayor que 0; en pesos colombianos; se muestra con `formatCOP` (p. ej. `$ 1.250.000`) |
| `category` | string | No | Una de `Bebidas`, `Snacks`, `Aseo`, `Hogar` (coincidencia exacta) |
| `stock` | integer | No | Entero mayor o igual que 0 |
| `created_at` | — | — | N/A (almacenamiento en memoria) |
| `updated_at` | — | — | N/A (almacenamiento en memoria) |

**Valores derivados en la app** (`toProductView`, no se guardan):

| Campo | Regla |
|-------|-------|
| `priceLabel` | `formatCOP(price)` |
| `stockLabel` | «Agotado» si `stock` = 0 · «Pocas unidades» si `stock` < 5 · «Disponible» en otro caso |
| `isOutOfStock` | `stock === 0` |
| `isLowStock` | `stock` entre 1 y 4 |

---

## Indexes

N/A (almacenamiento en memoria). Las búsquedas por `id`, `name` y `category` recorren el arreglo con `find` y `filter`.

---

## Relationships

N/A (almacenamiento en memoria). `Product` no se relaciona con otras entidades; `category` es un texto de una lista fija, no una entidad aparte.

---

## Sync

- **Synced?** No. N/A (almacenamiento en memoria; la app no guarda copia local).
- **Conflict policy:** N/A. Gana la última escritura que llegue al servidor.

---

## Migration notes

N/A (almacenamiento en memoria). No hay migraciones: al reiniciar el servidor se vuelve a cargar la semilla.
