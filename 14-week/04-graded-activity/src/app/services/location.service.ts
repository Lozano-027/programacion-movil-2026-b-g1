import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export type PermissionResult = 'granted' | 'denied';

@Injectable({ providedIn: 'root' })
export class LocationService {
  /**
   * 1) Revisa el permiso actual.  2) Si no está decidido, lo pide.
   * 3) Devuelve 'denied' si el usuario lo negó, para que la UI lo explique.
   */
  async ensurePermission(): Promise<PermissionResult> {
    // En navegador, requestPermissions no existe: el navegador pregunta al llamar getCurrentPosition.
    if (!Capacitor.isNativePlatform()) return 'granted';

    let status = await Geolocation.checkPermissions();
    if (status.location === 'granted' || status.coarseLocation === 'granted') return 'granted';

    // 'prompt' o 'prompt-with-rationale' -> todavía se puede pedir
    if (status.location !== 'denied') {
      status = await Geolocation.requestPermissions({ permissions: ['location'] });
    }
    return status.location === 'granted' || status.coarseLocation === 'granted' ? 'granted' : 'denied';
  }

  getCurrentPosition(): Promise<Position> {
    return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
  }
}
