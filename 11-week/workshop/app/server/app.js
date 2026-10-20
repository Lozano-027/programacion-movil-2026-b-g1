/**
 * API de productos (Express).
 *
 * `createApp()` construye y devuelve la aplicación SIN ponerla a escuchar:
 *  - `server/index.js` la pone a escuchar en el puerto 3000 (`npm run server`);
 *  - las pruebas la levantan con `app.listen(0)` (puerto libre) y llaman con `fetch`
 *    (ver el helper `startTestServer()` en src/features/products/__tests__/test-server.ts).
 *
 * Contrato (el detalle se documenta en docs/api/products-endpoints.md, Parte 1):
 *   GET    /api/products?search=&category=   200 + arreglo
 *   GET    /api/products/:id                 200 | 400 | 404
 *   POST   /api/products                     201 | 400
 *   PUT    /api/products/:id                 200 | 400 | 404
 *   DELETE /api/products/:id                 204 | 400 | 404
 * Formato de error uniforme: { "error": "mensaje", "details": ["..."] }
 *
 * QUÉ YA VIENE HECHO (no se pide escribirlo, pero sí entenderlo y explicarlo en el ADR-002
 * y en la sección «API error handling» del README):
 *   - express.json(): convierte el cuerpo JSON en `req.body`.
 *   - cors(): permite que la app (puerto 5173) llame a la API (puerto 3000).
 *   - parseId(): convierte el parámetro `:id` en número, o devuelve null si no es numérico.
 *   - Manejador 404 (ruta desconocida) y manejador de errores central (500).
 *
 * QUÉ SE ESCRIBIÓ (Parte 2): las cinco rutas de /api/products, la validación
 * (validateProductBody) y las respuestas 400/404 de id (sendInvalidId, sendNotFound).
 */
const express = require('express');
const cors = require('cors');
const seedProducts = require('./data/products.json');

// Categorías permitidas (la app usa la misma lista).
const CATEGORIES = ['Bebidas', 'Snacks', 'Aseo', 'Hogar'];

// Longitud máxima del nombre (la app usa el mismo valor).
const NAME_MAX_LENGTH = 60;

/**
 * YA DADO. Convierte el texto de `:id` en número.
 * Devuelve null si no son solo dígitos ("abc", "1.5", "-2"): la ruta responde 400 en ese caso.
 */
function parseId(rawId) {
  return /^\d+$/.test(rawId) ? Number(rawId) : null;
}

/**
 * Valida el cuerpo de POST y PUT. Devuelve un arreglo con UN mensaje por cada problema
 * (vacío si todo está bien), para responder 400 con { error, details }.
 */
function validateProductBody(body) {
  const details = [];
  const { name, price, category, stock } = body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    details.push('name es obligatorio');
  } else if (name.trim().length > NAME_MAX_LENGTH) {
    details.push(`name debe tener máximo ${NAME_MAX_LENGTH} caracteres`);
  }

  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    details.push('price debe ser un número mayor que 0');
  }

  if (typeof category !== 'string' || category.trim() === '') {
    details.push('category es obligatoria');
  } else if (!CATEGORIES.includes(category)) {
    details.push(`category debe ser una de: ${CATEGORIES.join(', ')}`);
  }

  if (!Number.isInteger(stock) || stock < 0) {
    details.push('stock debe ser un entero mayor o igual que 0');
  }

  return details;
}

/** Toma solo los campos permitidos del cuerpo (ignora id u otros campos extra). */
function pickProductFields(body) {
  return {
    name: body.name.trim(),
    price: body.price,
    category: body.category,
    stock: body.stock,
  };
}

/** Respuesta 400 cuando `:id` no es numérico (parseId devolvió null). */
function sendInvalidId(res, rawId) {
  return res.status(400).json({ error: 'Id inválido', details: [`El id "${rawId}" debe ser un número entero`] });
}

/** Respuesta 404 cuando no existe un producto con ese id. */
function sendNotFound(res, id) {
  return res.status(404).json({ error: 'Producto no encontrado', details: [`No existe un producto con id ${id}`] });
}

function createApp() {
  const app = express();

  // YA DADO: CORS para el origen de desarrollo de la app y lectura del cuerpo JSON.
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use(express.json());

  // Almacenamiento en memoria: copia de la semilla (se reinicia con el servidor).
  const products = seedProducts.map((item) => ({ ...item }));
  // Siguiente id: uno más que el mayor id de la semilla (8 + 1 = 9). Nunca se reutiliza.
  let nextId = products.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

  // GET /api/products?search=&category= → 200 con el arreglo (filtrado si vienen filtros).
  app.get('/api/products', (req, res) => {
    const { search, category } = req.query; // texto, o undefined si no vienen
    let result = products;
    if (typeof search === 'string' && search.trim() !== '') {
      const text = search.trim().toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(text));
    }
    if (typeof category === 'string' && category !== '') {
      result = result.filter((item) => item.category === category);
    }
    res.status(200).json(result);
  });

  // GET /api/products/:id → 200 | 400 (id no numérico) | 404 (no existe).
  app.get('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res, req.params.id);
    const product = products.find((item) => item.id === id);
    if (!product) return sendNotFound(res, id);
    return res.status(200).json(product);
  });

  // POST /api/products → 201 con el producto creado | 400 con { error, details[] }.
  app.post('/api/products', (req, res) => {
    const details = validateProductBody(req.body);
    if (details.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details });
    }
    const product = { id: nextId, ...pickProductFields(req.body) };
    nextId += 1;
    products.push(product);
    return res.status(201).json(product);
  });

  // PUT /api/products/:id → 200 con el producto actualizado | 400 | 404.
  app.put('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res, req.params.id);
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) return sendNotFound(res, id);
    const details = validateProductBody(req.body);
    if (details.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details });
    }
    // El id sale de la URL; nunca del cuerpo.
    products[index] = { id, ...pickProductFields(req.body) };
    return res.status(200).json(products[index]);
  });

  // DELETE /api/products/:id → 204 sin cuerpo | 400 | 404.
  app.delete('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res, req.params.id);
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) return sendNotFound(res, id);
    products.splice(index, 1);
    return res.status(204).end();
  });

  // YA DADO: ruta desconocida → 404 con el formato de error uniforme.
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', details: [`${req.method} ${req.originalUrl}`] });
  });

  // YA DADO: manejador de errores central (se reconoce por tener CUATRO parámetros).
  // Express lo ejecuta cuando una ruta lanza una excepción o llama a next(error).
  // eslint-disable-next-line no-unused-vars -- Express exige los 4 parámetros para reconocerlo.
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      // JSON malformado en el cuerpo: es un error de quien llama, no del servidor.
      return res.status(400).json({ error: 'El cuerpo no es un JSON válido', details: [] });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor', details: [] });
  });

  return app;
}

module.exports = { createApp, CATEGORIES, parseId };
