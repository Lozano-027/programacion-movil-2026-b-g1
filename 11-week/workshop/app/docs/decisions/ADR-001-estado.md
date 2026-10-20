# ADR-001 — Manejo del estado con useState y useEffect por página

- **ID:** ADR-001
- **Date:** 2026-10-11
- **Status:** Accepted
- **Authors:** Julio Cesar Lozano Lozano

---

## Context

La app tiene tres pantallas (lista, detalle y formulario) que cargan datos de la API y deben mostrar estados de carga, vacío, sin resultados y error. Hay que decidir dónde vive ese estado antes de escribir las páginas, porque de eso depende cómo se estructura cada componente.

Las pantallas casi no comparten datos: cada una pide a la API lo que necesita (la lista pide todos, el detalle pide uno). Cuando se crea, edita o elimina un producto, la lista se vuelve a cargar al regresar (`useIonViewWillEnter`), así que no hace falta mantener una copia global sincronizada.

**Known constraints:**
- Tiempo: fin de semana (6 a 8 horas).
- Solo lo visto en las semanas 6 a 9 (React con hooks, Ionic React).
- Aplicación pequeña: un recurso (`Product`) y cuatro rutas.

---

## Decision

**We decided:** cada página guarda su propio estado con `useState` y carga sus datos con `useEffect` (más `useIonViewWillEnter` en la lista para recargar al volver).

**Justification:**
Es el patrón más simple que resuelve el problema: no hay datos compartidos entre pantallas, así que un estado global solo agregaría código y conceptos nuevos. El estado de carga se modela con un tipo `'loading' | 'ready' | 'error'`, lo que hace explícitas las transiciones. La lógica que no depende de React (validar, filtrar, formatear) queda en `domain/` como funciones puras, por lo que se puede probar sin la interfaz.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `useState` + `useEffect` por página (elegida) | Simple, sin dependencias, fácil de leer y explicar | Algo de código repetido entre páginas (carga y error) | — (chosen) |
| Hook propio (`useProducts`, `useProduct`) | Reúne la lógica de carga y evita repetir | Una capa más para un proyecto pequeño | Se puede extraer después si la repetición crece |
| React Context | Estado compartido sin librerías | Recargas innecesarias; más código para datos que no se comparten | No hay estado global que lo justifique |
| Store externo (Redux, Zustand) o React Query | Caché, sincronización y reintentos | Dependencia nueva y curva de aprendizaje; fuera del alcance de las semanas 6 a 9 | Excesivo para un CRUD de un recurso |

---

## Consequences

**Positive:**
- Cada página se entiende por sí sola: su estado, su carga y su vista están en el mismo archivo.
- No se agregan dependencias.
- Las funciones de `domain/` se prueban de forma unitaria sin montar componentes.

**Negative / Trade-offs:**
- El patrón de carga (`status`, `errorMessage`, `try/catch`) se repite en las tres páginas.
- No hay caché: cada vez que se entra a una pantalla se vuelve a llamar a la API.
- Si la app creciera (carrito, sesión, varias pantallas con los mismos datos), habría que migrar a un hook propio o a un store.

**Impact on the system:**
- Affected features/screens: lista, detalle y formulario de productos.
- Documents to update: `docs/features/productos.md` (sección State) y la sección «State management decision» del README.

---

## References

- React: `useState` y `useEffect` (react.dev).
- Ionic React: ciclo de vida `useIonViewWillEnter`.
- Related to: ADR-002 (consumo de la API).
