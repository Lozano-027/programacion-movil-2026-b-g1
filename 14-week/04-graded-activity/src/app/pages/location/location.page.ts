import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
  IonSpinner, IonText, IonList, IonItem, IonLabel,
} from '@ionic/angular';
import { Position } from '@capacitor/geolocation';
import { LocationService } from '../../services/location.service';

type GpsStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [DecimalPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonSpinner, IonText, IonList, IonItem, IonLabel],
  styles: [`.state { text-align: center; padding: 32px 16px; }`],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/home" text="Volver"></ion-back-button></ion-buttons>
        <ion-title>Mi ubicación</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @switch (status()) {
        @case ('idle') {
          <div class="state">
            <p>La app usará el GPS solo cuando pulses el botón.</p>
          </div>
        }
        @case ('loading') {
          <div class="state"><ion-spinner name="crescent"></ion-spinner><p>Obteniendo ubicación…</p></div>
        }
        @case ('denied') {
          <div class="state" role="alert">
            <ion-text color="warning">
              <p>No diste permiso de ubicación. Para usar esta función, actívalo en
                Ajustes → Aplicaciones → esta app → Permisos → Ubicación.</p>
            </ion-text>
          </div>
        }
        @case ('error') {
          <div class="state" role="alert">
            <ion-text color="danger"><p>{{ errorMsg() }}</p></ion-text>
          </div>
        }
        @case ('success') {
          <ion-list>
            <ion-item><ion-label>Latitud</ion-label>{{ position()?.coords?.latitude | number: '1.5-5' }}</ion-item>
            <ion-item><ion-label>Longitud</ion-label>{{ position()?.coords?.longitude | number: '1.5-5' }}</ion-item>
            <ion-item><ion-label>Precisión</ion-label>± {{ position()?.coords?.accuracy | number: '1.0-0' }} m</ion-item>
          </ion-list>
        }
      }

      <ion-button expand="block" (click)="locate()" [disabled]="status() === 'loading'">
        {{ status() === 'success' ? 'Actualizar ubicación' : 'Obtener mi ubicación' }}
      </ion-button>
    </ion-content>
  `,
})
export class LocationPage {
  private location = inject(LocationService);

  status = signal<GpsStatus>('idle');
  position = signal<Position | null>(null);
  errorMsg = signal('');

  async locate(): Promise<void> {
    this.status.set('loading');
    try {
      const permission = await this.location.ensurePermission();
      if (permission === 'denied') {
        this.status.set('denied');
        return;
      }
      this.position.set(await this.location.getCurrentPosition());
      this.status.set('success');
    } catch (err: any) {
      const msg = String(err?.message ?? '').toLowerCase();
      if (msg.includes('denied')) {
        this.status.set('denied');
        return;
      }
      this.errorMsg.set(
        msg.includes('not enabled') || msg.includes('disabled')
          ? 'El GPS del dispositivo está apagado. Actívalo e inténtalo de nuevo.'
          : 'No se pudo obtener la ubicación. Sal a un lugar abierto e inténtalo de nuevo.',
      );
      this.status.set('error');
    }
  }
}
