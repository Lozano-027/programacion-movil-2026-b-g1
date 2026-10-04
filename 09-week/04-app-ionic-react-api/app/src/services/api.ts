export interface Book {
  id: number;
  title: string;
  author: string;
  year: number | null;
}

export interface NewBook {
  title: string;
  author: string;
  year?: number;
}

// Se puede cambiar con un archivo .env: VITE_API_URL=http://192.168.1.10:3000/api
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // fetch solo lanza excepción cuando no hay red o el servidor está apagado
    throw new Error('No se pudo conectar con el servidor. Verifica que la API esté encendida.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Errores HTTP (400, 404, 500...) usan el mensaje que envía la API
    throw new Error(data?.error ?? `Error ${res.status} del servidor`);
  }
  return data as T;
}

export const getBooks = () => request<Book[]>('/books');

export const getBook = (id: string) => request<Book>(`/books/${id}`);

export const createBook = (book: NewBook) =>
  request<Book>('/books', { method: 'POST', body: JSON.stringify(book) });
