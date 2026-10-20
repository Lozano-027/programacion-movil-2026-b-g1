# CP2 · Navegación y tokens de diseño

## Patrón de navegación: pila

La app tiene una sola sección principal, Productos. Todo lo demás es profundidad dentro de ella: Lista → Detalle → Formulario (crear o editar). Las pestañas sirven para 3 a 5 secciones del mismo nivel, y aquí habría una sola pestaña, así que se usa una pila con IonBackButton en Detalle y Formulario.

La acción más frecuente es crear un producto. Antes estaba al final de la lista y a 360 px no se veía. Ahora es un IonFab fijo abajo a la derecha (`aria-label="Nuevo producto"`), siempre visible en `/productos`.

## Tokens (src/app/theme/variables.css)

| Token | Valor | Uso |
|---|---|---|
| --ion-color-primary | #007a33 | Botones principales, categoría activa, FAB |
| --ion-color-secondary | #0163aa | Acciones secundarias |
| --ion-color-success | #2dd55b | Badge "Disponible" |
| --ion-color-danger | #c5000f | Eliminar, errores, badge "Agotado" |
| --ion-background-color | #ffffff | Fondo |
| --ion-text-color | #000000 | Texto principal |
| --app-text-secondary | #595959 | Categoría y textos de apoyo |
| --app-font-sm / md / lg | 0.875rem / 1rem / 1.25rem | Tamaños de letra en rem |
| --app-space-xs / sm / md / lg | 4 / 8 / 16 / 24 px | Espacios |

## Contraste (mínimo 4.5:1)

| Texto | Fondo | Relación | Cumple |
|---|---|---|---|
| #ffffff (botón) | #009540 (primario anterior) | 3.9:1 | No |
| #ffffff (botón) | #007a33 (primario nuevo) | 5.5:1 | Sí |
| #007a33 (botón outline) | #ffffff | 5.5:1 | Sí |
| #000000 | #2dd55b (badge Disponible) | 10.8:1 | Sí |
| #000000 | #ffc409 (badge Pocas unidades) | 13.2:1 | Sí |
| #ffffff | #c5000f (badge Agotado) | 6.2:1 | Sí |
| #000000 | #ffffff (texto principal) | 21:1 | Sí |
| #595959 | #ffffff (texto secundario) | 7.0:1 | Sí |