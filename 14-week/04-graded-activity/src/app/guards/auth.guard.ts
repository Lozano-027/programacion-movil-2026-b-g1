import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.isLoggedIn()) ? true : router.createUrlTree(['/login']);
};

/** Si ya hay sesión, no tiene sentido mostrar el login. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.isLoggedIn()) ? router.createUrlTree(['/home']) : true;
};
