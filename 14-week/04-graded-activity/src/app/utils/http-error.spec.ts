import { describe, expect, it } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { toAppError } from './http-error';

describe('toAppError', () => {
  it('returns "offline" when the device has no network', () => {
    const result = toAppError(new Error('any'), false);
    expect(result.kind).toBe('offline');
  });

  it('maps HTTP status 0 (no connection to server) to "offline"', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(toAppError(err).kind).toBe('offline');
  });

  it('maps HTTP 401 to "unauthorized"', () => {
    const err = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const result = toAppError(err);
    expect(result.kind).toBe('unauthorized');
    expect(result.message).toContain('sesión');
  });

  it('maps HTTP 500 to "server"', () => {
    const err = new HttpErrorResponse({ status: 500 });
    expect(toAppError(err).kind).toBe('server');
  });

  it('uses the API message for 4xx errors when available', () => {
    const err = new HttpErrorResponse({ status: 422, error: { message: 'Email inválido' } });
    expect(toAppError(err)).toEqual({ kind: 'client', message: 'Email inválido' });
  });

  it('maps RxJS TimeoutError to "timeout"', () => {
    const err = new Error('Timeout has occurred');
    err.name = 'TimeoutError';
    expect(toAppError(err).kind).toBe('timeout');
  });
});
