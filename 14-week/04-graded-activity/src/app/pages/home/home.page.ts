import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonList, IonItem,
  IonLabel, IonSpinner, IonText, IonIcon, IonRefresher, IonRefresherContent, IonBadge,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locateOutline, logOutOutline, cloudOfflineOutline, alertCircleOutline } from 'ionicons/icons';
import { ApiService, Task } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NetworkService } from '../../services/network.service';
import { AppError, toAppError } from '../../utils/http-error';
import { environment } from '../../../environments/environment';

type ViewStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonList, IonItem,
    IonLabel, IonSpinner, IonText, IonIcon, IonRefresher, IonRefresherContent, IonBadge],
  styles: [`
    .state { display: flex; flex-direction: column; align-items: center; text-align: center;
             gap: 8px; padding: 48px 16px; }
    .state ion-icon { font-size: 48px; }
  `],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mis tareas</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="goToLocation()" aria-label="Mi ubicación">
            <ion-icon slot="icon-only" name="locate-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="auth.logout()" aria-label="Cerrar sesión">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      @if (!network.online()) {
        <ion-toolbar color="warning"><ion-title size="small">Sin conexión a internet</ion-title></ion-toolbar>
      }
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="load($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @switch (status()) {
        <!-- ESTADO 1: CARGA -->
        @case ('loading') {
          <div class="state">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Cargando tareas…</p>
          </div>
        }

        <!-- ESTADO 2: ERROR -->
        @case ('error') {
          <div class="state" role="alert">
            <ion-icon [name]="error()?.kind === 'offline' ? 'cloud-offline-outline' : 'alert-circle-outline'"
                      color="danger"></ion-icon>
            <ion-text color="danger"><p>{{ error()?.message }}</p></ion-text>
            <ion-button (click)="load()">Reintentar</ion-button>
          </div>
        }

        <!-- ESTADO 3: DATOS (incluye lista vacía) -->
        @case ('success') {
          @if (items().length === 0) {
            <div class="state"><p>Todavía no tienes tareas. Créalas desde la app web o Swagger y desliza hacia abajo para actualizar.</p></div>
          } @else {
            <ion-list>
              @for (item of items(); track item.id) {
                <ion-item>
                  <ion-label>
                    <h2>{{ item.title }}</h2>
                    @if (item.description) { <p>{{ item.description }}</p> }
                    @if (item.dueDate) { <p>Vence: {{ item.dueDate }}</p> }
                  </ion-label>
                  @if (item.status === 'COMPLETED') {
                    <ion-badge slot="end" color="success">Completada</ion-badge>
                  } @else if (item.overdue) {
                    <ion-badge slot="end" color="danger">Vencida</ion-badge>
                  } @else {
                    <ion-badge slot="end" color="medium">Pendiente</ion-badge>
                  }
                </ion-item>
              }
            </ion-list>
          }
        }
      }

      <!-- Solo en desarrollo: provoca un 401 para la evidencia -->
      @if (isDev) {
        <div class="ion-padding">
          <ion-button expand="block" fill="outline" color="medium" (click)="simulate401()">
            Simular sesión vencida (prueba)
          </ion-button>
        </div>
      }
    </ion-content>
  `,
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);
  network = inject(NetworkService);

  status = signal<ViewStatus>('loading');
  items = signal<Task[]>([]);
  error = signal<AppError | null>(null);

  constructor() {
    addIcons({ locateOutline, logOutOutline, cloudOfflineOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  async load(event?: CustomEvent): Promise<void> {
    if (!event) this.status.set('loading');
    try {
      this.items.set(await this.api.getTasks());
      this.status.set('success');
    } catch (err) {
      const appErr = toAppError(err, this.network.online());
      // Si fue 401, el interceptor ya cerró sesión y redirigió al login.
      if (appErr.kind !== 'unauthorized') {
        this.error.set(appErr);
        this.status.set('error');
      }
    } finally {
      (event?.target as { complete?: () => void } | undefined)?.complete?.();
    }
  }

  readonly isDev = !environment.production;

  async simulate401(): Promise<void> {
    await this.auth.simulateExpiredToken();
    await this.load(); // la API responde 401 -> el interceptor cierra sesión
  }

  goToLocation(): void {
    this.router.navigateByUrl('/location');
  }
}
