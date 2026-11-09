import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput,
  IonButton, IonSpinner, IonText, IonNote,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { NetworkService } from '../../services/network.service';
import { toAppError } from '../../utils/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonInput, IonButton, IonSpinner, IonText, IonNote],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>Iniciar sesión</ion-title></ion-toolbar>
      @if (!network.online()) {
        <ion-toolbar color="warning"><ion-title size="small">Sin conexión a internet</ion-title></ion-toolbar>
      }
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-input label="Correo" labelPlacement="stacked" type="email" name="email"
            [(ngModel)]="email" autocomplete="email" [disabled]="loading()"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Contraseña" labelPlacement="stacked" type="password" name="password"
            [(ngModel)]="password" [disabled]="loading()"></ion-input>
        </ion-item>
      </ion-list>

      @if (error()) {
        <ion-text color="danger"><p role="alert">{{ error() }}</p></ion-text>
      }

      <ion-button expand="block" (click)="submit()" [disabled]="loading() || !email || !password">
        @if (loading()) { <ion-spinner name="crescent"></ion-spinner> } @else { Entrar }
      </ion-button>
      <ion-note>Usa un usuario registrado en tu API.</ion-note>
    </ion-content>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  network = inject(NetworkService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.email.trim(), this.password);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err) {
      const appErr = toAppError(err, this.network.online());
      // En el login, 401 significa credenciales incorrectas, no sesión vencida.
      this.error.set(appErr.kind === 'unauthorized' ? 'Correo o contraseña incorrectos.' : appErr.message);
    } finally {
      this.loading.set(false);
    }
  }
}
