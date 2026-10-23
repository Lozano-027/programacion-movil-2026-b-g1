# CP8 · Prueba de usabilidad con dos personas reales

Fecha: 22 Oct 2026
App: Catálogo de productos (Lista, Detalle y Formulario), en el navegador a 360 px.
Cómo se hizo: cada persona hizo las tareas sola, sin ayuda ni explicaciones. Se le pidió que dijera en voz alta lo que pensaba.

## Participantes

| Participante | Perfil | ¿Había visto la app? |
|---|---|---|
| P1 | Hermano | No |
| P2 | Prima | No |

## Tareas

1. Registre un producto nuevo: Café molido 500 g, categoría Bebidas, precio 18.000 y 25 unidades.
2. Encuentre cuánto cuesta el Jabón de manos 250 ml y cuántas unidades quedan.
3. Intente guardar un producto con precio 0 y corrija el error hasta que se guarde.

## Resultados

| Tarea | Participante | ¿Completó? | Tiempo | Errores o dificultades | Lo que dijo |
|---|---|---|---|---|---|
| 1 | P1 | Sí | 40 s | Dudó un momento antes de tocar el botón +, luego reconoció su función. Escribió el precio sin puntos (18000). Vio el toast de confirmación | "Está fácil de usar, solo ingreso los datos y guardo" |
| 1 | P2 | Sí | 48 s | Revisó los datos antes de guardar. No vio el toast porque miraba el formulario; después comprobó en la lista que el producto estuviera | "Me parece sencillo y los campos se entienden bien" |
| 2 | P1 | Sí | 20 s | Usó el buscador | "Lo encontré rápido, se ve claramente la información" |
| 2 | P2 | Sí | 25 s | Usó el buscador y abrió el detalle para ver precio y unidades | "La información está organizada y es fácil de encontrar" |
| 3 | P1 | Sí | 25 s | Entendió la validación rápido y corrigió el precio | "Me avisa que el precio no es válido y puedo corregirlo" |
| 3 | P2 | Sí | 30 s | Al principio revisó el formulario para entender por qué Guardar estaba deshabilitado; luego vio que faltaba un precio válido | |

Las 6 tareas se completaron sin ayuda, todas en menos de un minuto.

## Los tres problemas más importantes

| # | Problema | Quién y en qué tarea | Severidad | Arreglo propuesto |
|---|---|---|---|---|
| 1 | El botón + es solo un ícono: no dice qué hace y hace dudar antes de tocarlo | P1, tarea 1. Sugirió que dijera "Agregar producto" | Media | Botón con ícono y texto "Agregar producto" |
| 2 | Con Guardar deshabilitado, el aviso dice "Complete los campos" pero no cuál falta | P2, tarea 3. Tuvo que revisar el formulario | Media | Nombrar los campos pendientes: "Para guardar, revise: Precio." |
| 3 | En el detalle, el stock no se destaca tanto como el precio | P2, tarea 2. Sugirió destacar la cantidad disponible | Baja | Stock en negrita, como el precio |

Observación adicional: P2 no vio el toast "Producto guardado" porque estaba mirando el formulario. Funcionó, pero podría durar más o mostrarse abajo.

## Corrección aplicada

Se corrigieron los problemas 1 y 2, que tuvieron severidad media:

| Problema | Cambio | Archivo |
|---|---|---|
| 1. El + no decía qué hacía | El botón flotante ahora tiene ícono y texto "Agregar producto", como sugirió P1 | `ProductListPage.tsx`, `variables.css` |
| 2. Guardar deshabilitado sin decir qué faltaba | El aviso nombra los campos pendientes: "Para guardar, revise: Precio, Stock." | `ProductFormPage.tsx` |

| Botón con texto | Campos pendientes |
|---|---|
| ![Agregar producto](img/after-cp8-boton-agregar.png) | ![Pendientes](img/after-cp8-campos-pendientes.png) |

El problema 3 (destacar el stock en el detalle) queda pendiente por ser de severidad baja.