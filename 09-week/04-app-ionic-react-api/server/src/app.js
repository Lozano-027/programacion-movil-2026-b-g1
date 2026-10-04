const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());          // Permite que la app Ionic (otro puerto) consuma la API
app.use(express.json());  // Parsea cuerpos JSON

// "Base de datos" en memoria
let books = [
  { id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', year: 1967 },
  { id: 2, title: 'La vorágine', author: 'José Eustasio Rivera', year: 1924 },
];
let nextId = 3;

// GET /api/books -> lista todos los libros
app.get('/api/books', (req, res) => {
  res.json(books);
});

// GET /api/books/:id -> un libro (lo usa la pantalla de detalle)
app.get('/api/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
  res.json(book);
});

// POST /api/books -> crea un libro
app.post('/api/books', (req, res) => {
  const { title, author, year } = req.body || {};

  if (typeof title !== 'string' || !title.trim() || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'Los campos title y author son obligatorios' });
  }

  const parsedYear = year === undefined || year === null || year === '' ? null : Number(year);
  if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 0 || parsedYear > 2100)) {
    return res.status(400).json({ error: 'El campo year debe ser un número entero válido' });
  }

  const book = { id: nextId++, title: title.trim(), author: author.trim(), year: parsedYear };
  books.push(book);
  res.status(201).json(book);
});

// Rutas no existentes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo central de errores (por ejemplo, JSON mal formado)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
