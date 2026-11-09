import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  /** true si el dispositivo tiene conexión. Se actualiza en tiempo real. */
  readonly online = signal(true);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const status = await Network.getStatus();
    this.online.set(status.connected);
    Network.addListener('networkStatusChange', (s) => this.online.set(s.connected));
  }
}
