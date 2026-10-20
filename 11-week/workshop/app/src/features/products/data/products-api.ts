/**
 * Capa DATA: cliente HTTP de la API de productos (server/app.js).
 *
 * `request` y `getProducts` YA ESTÁN RESUELTOS como ejemplo del patrón. El resto de las
 * funciones se escriben en la Parte 3 del TODO.md, replicando ese patrón.
 */
import type { Product, ProductInput } from '../domain/product';
import { ApiError } from './api-error';
import { API_URL, SIMULATE_EMPTY, SIMULATE_ERROR, SIMULATED_DELAY_MS } from './config';

/**
 * YA DADO. Hace una petición a la API y devuelve el cuerpo JSON ya convertido.
 *  1. Si `fetch` lanza una excepción, la API no respondió: ApiError de red (status null).
 *  2. Si la respuesta no es exitosa (`!response.ok`), se lee el cuerpo `{ error, details }`
 *     y se lanza un ApiError con el código que devolvió el servidor.
 *  3. El 204 (DELETE) no trae cuerpo: se devuelve undefined.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError('No fue posible conectar con el servidor.', null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `Error ${response.status}`, response.status, body?.details ?? []);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export interface ProductQuery {
  search?: string;
  category?: string;
}

/** YA DADO (ejemplo): GET /api/products?search=&category= */
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  if (SIMULATED_DELAY_MS > 0) await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  if (SIMULATE_ERROR) throw new ApiError('No fue posible conectar con el servidor.', null);
  if (SIMULATE_EMPTY) return [];
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  const queryString = params.toString();
  return request<Product[]>(`/api/products${queryString ? `?${queryString}` : ''}`);
}

/** GET /api/products/:id */
export async function getProduct(id: number): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

/** Encabezados para enviar JSON en POST y PUT. */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** POST /api/products — cuerpo JSON con el producto; responde 201 con el producto creado. */
export async function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>('/api/products', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** PUT /api/products/:id — cuerpo JSON con el producto; responde 200 con el producto actualizado. */
export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** DELETE /api/products/:id — responde 204 sin cuerpo. */
export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/api/products/${id}`, { method: 'DELETE' });
}
