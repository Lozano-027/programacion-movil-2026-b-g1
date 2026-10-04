# Semana 9 · App Ionic React + API Express

Proyecto individual del Corte 2. Una API REST mínima de **libros** hecha con Express y una app Ionic React que lista los libros, crea nuevos y muestra el detalle de cada uno.

## Estructura

```
semana-09/
├── server/                 # API REST con Express
│   ├── src/app.js          # Rutas y validaciones
│   ├── src/server.js       # Arranque en el puerto 3000
│   ├── test/books.test.js  # Pruebas automáticas (node:test + supertest)
│   └── requests.http       # Peticiones de ejemplo
└── app/                    # App Ionic React
    └── src/
        ├── App.tsx                 # Rutas /books y /books/:id
        ├── services/api.ts         # fetch y manejo de errores
        └── pages/
            ├── BooksPage.tsx       # Lista + formulario
            └── BookDetailPage.tsx  # Detalle
```

## Cómo ejecutar

**1. API**

```bash
cd server
npm install
npm start          # http://localhost:3000/api/books
npm test           # corre las 5 pruebas
```

**2. App**

```bash
cd app
npm install
ionic serve        # o: npm run dev
```

La app consume `http://localhost:3000/api`. Para probar en un celular, crea `app/.env` con `VITE_API_URL=http://TU_IP_LOCAL:3000/api`.

## Endpoints

| Método | Ruta              | Descripción                  | Respuestas        |
|--------|-------------------|------------------------------|-------------------|
| GET    | `/api/books`      | Lista todos los libros       | 200               |
| GET    | `/api/books/:id`  | Devuelve un libro            | 200, 404          |
| POST   | `/api/books`      | Crea un libro                | 201, 400          |

Ejemplo de cuerpo para POST:

```json
{ "title": "María", "author": "Jorge Isaacs", "year": 1867 }
```

## Architecture

The project follows a simple client–server architecture with two independent parts: a REST API built with Express and a mobile front end built with Ionic React. The API exposes three JSON endpoints under the `/api/books` path: `GET /api/books` returns the full list of books, `GET /api/books/:id` returns a single book or a 404 error, and `POST /api/books` validates the request body and creates a new book, responding with status 201. Data is stored in an in-memory array, so it resets every time the server restarts, and CORS is enabled so the Ionic app can call the API from a different port. On the client side, all HTTP calls are centralized in `services/api.ts`, which wraps `fetch`, sets the JSON headers, and converts both network failures and HTTP error codes into readable error messages. The `BooksPage` component uses `useState` to hold the list, the form fields, the loading flag, and the error message, and it calls `GET /api/books` when the screen loads and `POST /api/books` when the user submits the form. When a book is created, the new object returned by the API is appended to the local state, so the list updates without reloading the page. Each item in the list uses Ionic's `routerLink` to navigate to `/books/:id`, where `BookDetailPage` reads the id from the URL and requests that specific book from the API. If the server is down or returns an error, both screens show the message and a retry button instead of crashing.

## Autor

- Nombre: Julio Cesar Lozano
- GitHub: Lozano-027
