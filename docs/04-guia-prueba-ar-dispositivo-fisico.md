# 📱 Guía: Probar Realidad Aumentada en Dispositivo Físico

## 🎯 Resumen

Esta guía te ayudará a probar la funcionalidad de **Realidad Aumentada (AR)** con ARCore en tu dispositivo Android físico. La AR **NO funciona en emuladores**, por lo que es imprescindible usar un dispositivo real.

---

## 📋 Requisitos Previos

### 1. **Dispositivo Android Compatible**

Tu dispositivo debe cumplir:
- ✅ **Android 7.0 (API 24)** o superior
- ✅ **ARCore instalado** (Google Play Services for AR)
- ✅ Procesador potente (preferiblemente ARM64)
- ✅ Cámara funcional

**Verificar compatibilidad**: [Lista oficial de dispositivos compatibles con ARCore](https://developers.google.com/ar/devices)

### 2. **Software Instalado en tu PC**

- ✅ Flutter SDK (ya instalado)
- ✅ Android Studio o Android SDK
- ✅ ADB (Android Debug Bridge)
- ✅ Driver USB del dispositivo

---

## 🔧 Paso 1: Preparar el Dispositivo

### 1.1 Activar Modo Desarrollador

1. Ve a **Ajustes** → **Acerca del teléfono**
2. Toca **7 veces** en "Número de compilación"
3. Verás el mensaje: *"Ahora eres desarrollador"*

### 1.2 Activar Depuración USB

1. Ve a **Ajustes** → **Opciones de desarrollador**
2. Activa **Depuración USB**
3. (Opcional) Activa **Permanecer activo** para evitar que la pantalla se apague

### 1.3 Instalar ARCore (Google Play Services for AR)

1. Abre **Google Play Store**
2. Busca: **"Google Play Services for AR"** o **"ARCore"**
3. Instala o actualiza si ya lo tienes

**Enlace directo**: [ARCore en Play Store](https://play.google.com/store/apps/details?id=com.google.ar.core)

---

## 🔌 Paso 2: Conectar el Dispositivo al PC

### 2.1 Conectar por Cable USB

1. Conecta tu dispositivo al PC con un **cable USB de datos** (no solo carga)
2. En el dispositivo, aparecerá una notificación:
   ```
   ¿Permitir depuración USB?
   Huella digital RSA: ...
   ```
3. Marca **"Permitir siempre desde este equipo"**
4. Toca **"Permitir"**

### 2.2 Verificar Conexión con ADB

Abre PowerShell en tu PC y ejecuta:

```powershell
flutter devices
```

**Resultado esperado**:
```
Found 2 connected devices:
  SM G960F (mobile) • 1234567890ABCDEF • android-arm64 • Android 10 (API 29)
  Chrome (web)      • chrome           • web-javascript • Google Chrome 120.0
```

Si no aparece tu dispositivo:
```powershell
# Reiniciar servidor ADB
adb kill-server
adb start-server
adb devices
```

---

## 🚀 Paso 3: Compilar y Ejecutar la App

### 3.1 Compilar en Modo Debug

Desde PowerShell en la raíz del proyecto:

```powershell
# Limpiar builds anteriores
flutter clean

# Obtener dependencias
flutter pub get

# Ejecutar en el dispositivo conectado
flutter run
```

**Tiempo estimado**: 2-5 minutos (primera vez)

### 3.2 Alternativa: Compilar APK de Debug

Si prefieres instalar el APK manualmente:

```powershell
# Generar APK debug
flutter build apk --debug

# El APK estará en:
# build\app\outputs\flutter-apk\app-debug.apk
```

Instalar el APK:
```powershell
adb install build\app\outputs\flutter-apk\app-debug.apk
```

---

## 🎮 Paso 4: Usar la Funcionalidad AR

### 4.1 Navegar a la Vista AR

1. Abre la aplicación en el dispositivo
2. Ve a la página **"Catálogo Widgets Generales"** (GeneralWidgetsCatalogPage)
3. Presiona el botón flotante **"Ver Radio en AR"** (icono: 📱)

### 4.2 Conceder Permisos de Cámara

La primera vez, aparecerá un diálogo:
```
¿Permitir que proyecto_1 acceda a la cámara?
```
- Toca **"Permitir"** o **"Mientras se usa la app"**

### 4.3 Inicializar ARCore

1. Apunta la cámara hacia una **superficie plana** (mesa, suelo, pared)
2. **Mueve lentamente el dispositivo** de lado a lado
3. ARCore detectará el plano y mostrará puntos blancos

### 4.4 Ver el Modelo 3D

- El modelo de la **radio retro** aparecerá automáticamente frente a ti
- Puedes **caminar alrededor** para verlo desde diferentes ángulos
- El modelo se coloca a **1.5 metros** de distancia

---

## 🎨 Características de la Vista AR

### Controles Disponibles

| Elemento | Descripción |
|----------|-------------|
| **Tarjeta superior** | Muestra estado: "Cargando modelo 3D..." → "Modelo cargado" |
| **Botón ℹ️ Ayuda** | Muestra instrucciones de uso |
| **Botón 🔄 Recargar** | Reinicia el modelo AR |
| **Vista de error** | Aparece si falla la carga con botón "Reintentar" |

### Interacción Táctil

- **Mover el dispositivo**: Ver el modelo desde diferentes ángulos
- **Caminar alrededor**: Explorar el modelo en 360°
- **Tocar la pantalla**: (Funcionalidad futura: rotar, escalar)

---

## ⚠️ Solución de Problemas

### ❌ Error: "ARCore no está instalado"

**Solución**:
1. Verifica que Google Play Services for AR esté instalado
2. Actualiza ARCore desde Play Store
3. Reinicia el dispositivo

### ❌ Error: "El dispositivo no detecta superficies"

**Solución**:
1. **Mejora la iluminación**: AR necesita buena luz
2. **Apunta a superficies texturizadas**: Evita superficies lisas o reflectantes
3. **Mueve el dispositivo más lentamente**
4. Limpia la lente de la cámara

### ❌ Error: "Error al cargar modelo"

**Solución**:
1. Verifica que `assets/3d/radio.glb` exista
2. Confirma que esté declarado en `pubspec.yaml`:
   ```yaml
   flutter:
     assets:
       - assets/3d/radio.glb
   ```
3. Ejecuta `flutter clean` y `flutter pub get`
4. Recompila la app

### ❌ El dispositivo no aparece en `flutter devices`

**Solución**:
1. Desconecta y reconecta el cable USB
2. Prueba con otro cable o puerto USB
3. Instala los drivers USB del fabricante (Samsung, Xiaomi, etc.)
4. En el dispositivo: Desactiva y reactiva "Depuración USB"
5. Ejecuta:
   ```powershell
   adb kill-server
   adb start-server
   ```

### ❌ Error de permisos de cámara

**Solución manual**:
1. Ve a **Ajustes** → **Aplicaciones** → **proyecto_1**
2. **Permisos** → **Cámara** → **Permitir**

---

## 📊 Verificación de Configuración

### Checklist de Permisos (AndroidManifest.xml)

Asegúrate de que `android/app/src/main/AndroidManifest.xml` contenga:

```xml
<!-- Permisos para Realidad Aumentada (ARCore) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera.ar" android:required="true"/>

<application>
    <!-- ... otras configuraciones ... -->
    
    <!-- ARCore metadata -->
    <meta-data
        android:name="com.google.ar.core"
        android:value="required" />
</application>
```

### Checklist de Dependencias (pubspec.yaml)

```yaml
dependencies:
  arcore_flutter_plugin: ^0.1.0
  vector_math: ^2.1.4  # (incluida automáticamente)

flutter:
  assets:
    - assets/3d/radio.glb
```

---

## 🎯 Mejores Prácticas para Pruebas AR

### ✅ Entorno Óptimo

| Factor | Recomendación |
|--------|---------------|
| **Iluminación** | Luz natural o artificial brillante (>300 lux) |
| **Superficies** | Texturizadas (madera, alfombra) > Lisas (vidrio, metal) |
| **Espacio** | Mínimo 2x2 metros libres |
| **Movimiento** | Lento y suave para inicialización |

### ❌ Evitar

- ❌ Superficies reflectantes (espejos, pantallas)
- ❌ Contraluz (ventanas detrás de la superficie)
- ❌ Movimientos bruscos al inicializar
- ❌ Probar en emuladores (no funciona)

---

## 🔍 Logs y Debugging

### Ver Logs en Tiempo Real

```powershell
# Ver todos los logs
flutter logs

# Filtrar logs de AR
flutter logs | Select-String "AR"
```

### Logs Relevantes

```
[AR] Modelo Radio Retro cargado exitosamente
[AR] Error: java.io.FileNotFoundException: assets/3d/radio.glb
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **ARCore Developers**: https://developers.google.com/ar
- **arcore_flutter_plugin**: https://pub.dev/packages/arcore_flutter_plugin
- **Lista de dispositivos compatibles**: https://developers.google.com/ar/devices

### Modelos 3D de Ejemplo

- **Poly Haven**: https://polyhaven.com/models (Modelos GLB/GLTF gratuitos)
- **Sketchfab**: https://sketchfab.com/feed (Búsqueda: "glb free")

---

## 🎉 Resumen de Comandos

```powershell
# 1. Verificar dispositivo conectado
flutter devices

# 2. Limpiar y obtener dependencias
flutter clean
flutter pub get

# 3. Ejecutar en dispositivo
flutter run

# 4. Ver logs
flutter logs

# 5. (Opcional) Generar APK
flutter build apk --debug
adb install build\app\outputs\flutter-apk\app-debug.apk
```

---

## ✅ Resultado Esperado

Al completar esta guía correctamente:

1. ✅ Tu dispositivo está conectado y reconocido por Flutter
2. ✅ ARCore está instalado y actualizado
3. ✅ La app se ejecuta sin errores de compilación
4. ✅ Puedes acceder al catálogo y presionar "Ver Radio en AR"
5. ✅ Se te solicita permiso de cámara
6. ✅ ARCore detecta superficies planas
7. ✅ El modelo de la radio aparece en 3D frente a ti
8. ✅ Puedes moverte alrededor del modelo

---

## 🆘 Soporte

Si encuentras problemas no cubiertos en esta guía:

1. **Revisar logs**: `flutter logs | Select-String "ERROR"`
2. **Verificar versión de ARCore**: Debe ser la última disponible
3. **Consultar issues de arcore_flutter_plugin**: https://github.com/giandifra/arcore_flutter_plugin/issues
4. **Verificar permisos**: Ajustes → Apps → proyecto_1 → Permisos

---

**¡Disfruta probando la Realidad Aumentada! 🚀📱**
