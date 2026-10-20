// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startTestServer } from './test-server';

/**
 * Prueba de la API de EJEMPLO (ya viene dada). Patrón que se espera en las pruebas de la API:
 *  1. `startTestServer()` levanta la API en un puerto libre antes de cada prueba.
 *  2. `fetch` (el de Node, sin dependencias extra) llama a la API como lo haría la app.
 *  3. Se comprueba el código de estado y el cuerpo.
 *  4. `close()` cierra el servidor al terminar.
 */
let baseUrl = '';
let close: () => Promise<void>;

beforeEach(async () => {
  ({ baseUrl, close } = await startTestServer());
});

afterEach(async () => {
  await close();
});

describe('API de productos (ejemplo)', () => {
  it('arranca y responde 404 con el formato de error en una ruta desconocida', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: expect.any(String), details: expect.any(Array) });
  });
});

/** Atajo para enviar JSON con POST o PUT. */
function sendJson(path: string, method: 'POST' | 'PUT', body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/products', () => {
  it('filtra por texto sin distinguir mayúsculas y por categoría exacta', async () => {
    const bySearch = await (await fetch(`${baseUrl}/api/products?search=JUGO`)).json();
    expect(bySearch.map((item: { id: number }) => item.id)).toEqual([2]);

    const byCategory = await (await fetch(`${baseUrl}/api/products?category=Aseo`)).json();
    expect(byCategory.map((item: { id: number }) => item.id)).toEqual([6, 7]);
  });
});

describe('POST /api/products', () => {
  it('responde 400 con { error, details } cuando los datos no validan', async () => {
    const response = await sendJson('/api/products', 'POST', { name: '  ', price: 0, category: 'Ropa', stock: 1.5 });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toEqual(expect.any(String));
    expect(body.details).toHaveLength(4); // un mensaje por cada campo inválido
  });

  it('responde 201 con el producto creado y un id incremental', async () => {
    const response = await sendJson('/api/products', 'POST', { name: 'Café 250 g', price: 9800, category: 'Bebidas', stock: 15 });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 9, name: 'Café 250 g', price: 9800, category: 'Bebidas', stock: 15 });
  });
});

describe('GET /api/products/:id', () => {
  it('responde 404 cuando el producto no existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/999`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: expect.any(String), details: expect.any(Array) });
  });

  it('responde 400 cuando el id no es numérico', async () => {
    const response = await fetch(`${baseUrl}/api/products/abc`);
    expect(response.status).toBe(400);
  });
});

describe('PUT y DELETE /api/products/:id', () => {
  it('actualiza un producto y luego lo elimina con 204', async () => {
    const updated = await sendJson('/api/products/1', 'PUT', { name: 'Agua 1 L', price: 2500, category: 'Bebidas', stock: 50 });
    expect(updated.status).toBe(200);
    expect((await updated.json()).name).toBe('Agua 1 L');

    const deleted = await fetch(`${baseUrl}/api/products/1`, { method: 'DELETE' });
    expect(deleted.status).toBe(204);

    const afterDelete = await fetch(`${baseUrl}/api/products/1`);
    expect(afterDelete.status).toBe(404);
  });
});
