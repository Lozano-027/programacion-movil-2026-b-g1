# Permisos nativos (después de `npx cap add android` / `ios`)

## Android — android/app/src/main/AndroidManifest.xml
Dentro de <manifest>, antes de <application>:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />
```

Si tu API está en HTTP (no HTTPS) durante el desarrollo, agrega en <application>:

```xml
android:usesCleartextTraffic="true"
```

## iOS — ios/App/App/Info.plist

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Usamos tu ubicación para mostrar dónde te encuentras.</string>
```

## CORS en tu API
Permite estos orígenes: `http://localhost` (Android), `capacitor://localhost` (iOS)
y `http://localhost:8100` (ionic serve).
