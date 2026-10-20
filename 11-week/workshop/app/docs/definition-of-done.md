# Definition of Done (DoD) — Catálogo de productos

Una historia de usuario está **terminada solo cuando todo esto se cumple**:

- [ ] Criterios de aceptación cumplidos y verificados a mano con `npm run server` y `npm run dev`.
- [ ] Código en una rama `feature/…`, integrado a `main` del fork mediante un PR con descripción.
- [ ] Pruebas unitarias (`domain/`) y de API (`startTestServer()`) agregadas y pasando con `npm test`.
- [ ] Funciona en el navegador con la app (5173) y la API (3000) corriendo a la vez, sin regresiones en las otras pantallas.
- [ ] `npm run lint` y `npm run build` sin errores ni advertencias nuevas (incluidos errores de tipos).
- [ ] Estados de carga, vacío, sin resultados y error (con «Reintentar») manejados; sin conexión se trata como error de red.
- [ ] Validación en línea con `validateProduct` y mensajes `details` del servidor visibles en el formulario.
- [ ] Nombres según `coding-standards`: `PascalCase` para tipos y componentes, `camelCase` para variables y funciones, `UPPER_SNAKE_CASE` para constantes, booleanos con `is` / `has` / `should`.
- [ ] Capas respetadas: `presentation` → `domain` y `data`; `data` → `domain`; `domain` sin dependencias externas.
- [ ] Sin secretos en el repositorio: `.env` ignorado; solo se versiona `.env.example`.
- [ ] Commits en formato Conventional Commits (`type(scope): resumen`).
- [ ] Documentación actualizada (feature, pantallas, ADR, API) y README con cómo ejecutar.
- [ ] Textos de la interfaz en español. N/A: localización a varios idiomas (fuera del alcance).
- [ ] N/A: analítica y reporte de fallos (fuera del alcance del parcial).

> Una historia que no cumple todo el DoD **no está terminada**: sigue abierta. El trabajo parcial
> no se cierra «para terminarlo después».
