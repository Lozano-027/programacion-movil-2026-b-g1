# Semana 7 - Kotlin básico y componente Ionic

## 1. Kotlin

Se creó la clase `Producto` con los atributos `nombre` y `precio`.

El precio utiliza `Double?` para permitir valores nulos y se agregó una validación para evitar precios negativos.

También se crearon dos ejemplos:

- Cuaderno con precio de 15000.
- Lapicero con precio nulo.

## 2. Ionic React

Se creó el componente `Saludo.tsx`.

El componente recibe un nombre y lo muestra en pantalla junto con un botón. Al presionar el botón se muestra un mensaje de saludo.

## 3. Diferencias entre Kotlin y TypeScript

### Diferencia 1: Tipos de datos

Kotlin tiene un sistema de tipos más estricto y diferencia entre tipos que pueden aceptar `null` y los que no.

TypeScript permite definir tipos para JavaScript, pero finalmente el código se ejecuta como JavaScript.

### Diferencia 2: Uso

Kotlin se utiliza principalmente para desarrollar aplicaciones, especialmente en Android.

TypeScript se utiliza principalmente para aplicaciones web y proyectos como React e Ionic.

## 4. Evidencias

La aplicación Ionic muestra el mensaje `Hola, Julio` y el botón `Saludar`.

La clase `Producto` se encuentra en:

`Kotlin/Producto.kt`

El componente Ionic se encuentra en:

`miApp/src/components/Saludo.tsx`