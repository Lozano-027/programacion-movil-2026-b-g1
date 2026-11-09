import { HttpErrorResponse } from '@angular/common/http';

export type AppErrorKind = 'offline' | 'timeout' | 'unauthorized' | 'server' | 'client' | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  message: string;
}

/**
 * Traduce cualquier error técnico a un error de la app con un mensaje entendible.
 * Es una función pura: no depende de Angular ni de Capacitor, por eso es fácil de probar.
 */
export function toAppError(err: unknown, online = true): AppError {
  if (!online) {
    return { kind: 'offline', message: 'Sin conexión a internet. Revisa tu red y vuelve a intentarlo.' };
  }

  if (err instanceof Error && err.name === 'TimeoutError') {
    return { kind: 'timeout', message: 'El servidor tardó demasiado en responder. Vuelve a intentarlo.' };
  }

  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return { kind: 'offline', message: 'No se pudo conectar con el servidor. Revisa tu red.' };
    }
    if (err.status === 401) {
      return { kind: 'unauthorized', message: 'Tu sesión expiró. Inicia sesión de nuevo.' };
    }
    if (err.status >= 500) {
      return { kind: 'server', message: 'El servidor tuvo un problema. Intenta más tarde.' };
    }
    const apiMsg = typeof err.error?.message === 'string' ? err.error.message : null;
    return { kind: 'client', message: apiMsg ?? `La solicitud falló (código ${err.status}).` };
  }

  return { kind: 'unknown', message: 'Ocurrió un error inesperado.' };
}
