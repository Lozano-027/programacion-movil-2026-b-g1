import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NetworkService } from '../services/network.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const network = inject(NetworkService);
  const isLoginRequest = req.url.endsWith('/auth/login');

  // 1) Sin red: ni siquiera intentamos la petición.
  if (!network.online()) {
    return throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Offline', url: req.url }));
  }

  // 2) Agregar el token a las peticiones protegidas.
  const token = auth.getToken();
  const authReq =
    token && !isLoginRequest ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    timeout(environment.requestTimeoutMs),
    catchError((err) => {
      // 3) 401 en una ruta protegida = token vencido o inválido -> cerrar sesión.
      //    (En el login, un 401 solo significa credenciales incorrectas.)
      if (err instanceof HttpErrorResponse && err.status === 401 && !isLoginRequest) {
        auth.logout('expired');
      }
      return throwError(() => err);
    }),
  );
};
