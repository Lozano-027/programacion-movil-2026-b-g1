// Thin client for the Task Manager API. Every protected call sends "Authorization: Bearer <token>".
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { token, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    // fetch only rejects on network or CORS failures.
    throw new ApiError(0, 'NETWORK_ERROR', `Can't reach the API at ${API_URL}. Check that it is running.`);
  }

  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.code ?? 'UNKNOWN_ERROR',
      body?.message ?? `The request failed with status ${response.status}.`,
    );
  }
  return body;
}

export const login = (email, password) =>
  request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const listTasks = (token) => request('/api/v1/tasks?size=50', { token });

export const createTask = (token, task) =>
  request('/api/v1/tasks', { method: 'POST', token, body: JSON.stringify(task) });

export const changeTaskStatus = (token, id, status) =>
  request(`/api/v1/tasks/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status }) });
