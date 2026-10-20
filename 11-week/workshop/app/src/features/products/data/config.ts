/**
 * YA DADO. Dirección base de la API.
 *
 * Vite expone las variables que empiezan por `VITE_` en `import.meta.env`. Si no existe un
 * archivo `.env` (se crea copiando `.env.example`), se usa la dirección por defecto.
 */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Simulación para probar estados: se activa en .env (solo local). */
export const SIMULATED_DELAY_MS = Number(import.meta.env.VITE_SIMULATED_DELAY_MS ?? 0);
export const SIMULATE_ERROR = import.meta.env.VITE_SIMULATE_ERROR === 'true';
export const SIMULATE_EMPTY = import.meta.env.VITE_SIMULATE_EMPTY === 'true';