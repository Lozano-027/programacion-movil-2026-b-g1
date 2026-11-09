import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string; // Ajusta si tu API devuelve otro nombre (ej. access_token)
}

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastController);

  private token: string | null = null;
  private loggingOut = false;

  getToken(): string | null {
    return this.token;
  }

  async isLoggedIn(): Promise<boolean> {
    if (this.token) return true;
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    this.token = value;
    return !!value;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }),
    );
    this.token = res.token;
    await Preferences.set({ key: TOKEN_KEY, value: res.token });
  }

  /** Solo para pruebas: reemplaza el token por uno inválido para que la API responda 401. */
  async simulateExpiredToken(): Promise<void> {
    this.token = 'token-invalido-para-prueba';
    await Preferences.set({ key: TOKEN_KEY, value: this.token });
  }

  /** Borra el token y vuelve al login. Si viene de un 401, avisa al usuario. */
  async logout(reason?: 'expired'): Promise<void> {
    if (this.loggingOut) return; // evita varios logouts si llegan varios 401 a la vez
    this.loggingOut = true;
    this.token = null;
    await Preferences.remove({ key: TOKEN_KEY });
    await this.router.navigateByUrl('/login', { replaceUrl: true });
    if (reason === 'expired') {
      const t = await this.toast.create({
        message: 'Tu sesión expiró. Inicia sesión de nuevo.',
        duration: 3000,
        color: 'warning',
      });
      await t.present();
    }
    this.loggingOut = false;
  }
}
