const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

test('GET /api/books devuelve un arreglo JSON', async () => {
  const res = await request(app).get('/api/books');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 2);
});

test('POST /api/books crea un libro y luego se puede consultar', async () => {
  const res = await request(app)
    .post('/api/books')
    .send({ title: 'María', author: 'Jorge Isaacs', year: 1867 });
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.id);
  assert.strictEqual(res.body.title, 'María');

  const detail = await request(app).get(`/api/books/${res.body.id}`);
  assert.strictEqual(detail.status, 200);
  assert.strictEqual(detail.body.author, 'Jorge Isaacs');
});

test('POST /api/books sin title responde 400', async () => {
  const res = await request(app).post('/api/books').send({ author: 'Alguien' });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /api/books con JSON inválido responde 400', async () => {
  const res = await request(app)
    .post('/api/books')
    .set('Content-Type', 'application/json')
    .send('{ esto no es json');
  assert.strictEqual(res.status, 400);
});

test('GET /api/books/:id inexistente responde 404', async () => {
  const res = await request(app).get('/api/books/9999');
  assert.strictEqual(res.status, 404);
});
