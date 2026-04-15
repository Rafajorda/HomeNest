# 🏠 HomeNest - Flutter E-commerce App

<div align="center">

![Flutter](https://img.shields.io/badge/Flutter-3.9.2-02569B?logo=flutter)
![Dart](https://img.shields.io/badge/Dart-3.9.2-0175C2?logo=dart)
![Riverpod](https://img.shields.io/badge/State-Riverpod-purple)
![Material3](https://img.shields.io/badge/Design-Material%203-blue)
![i18n](https://img.shields.io/badge/i18n-ES%20%7C%20EN-green)

Una aplicación móvil moderna de e-commerce construida con Flutter, enfocada en muebles y decoración para el hogar.

[Características](#-características) • [Instalación](#-instalación) • [Arquitectura](#-arquitectura) • [Tecnologías](#-tecnologías)

</div>

---

## 📱 Capturas de Pantalla

> *Próximamente: Agregar screenshots de la app en funcionamiento*

## 🔗 Ecosistema del Workspace

Este proyecto forma parte de un workspace con 3 piezas:

- [Guia raiz del workspace](../README.md)
- [2dam_booking (backend)](../2dam_booking/README.md)
- [AdminApp (panel admin)](../AdminApp/README.md)

---

## ✨ Características

### 🔐 Autenticación
- **Login y Registro** con validación de formularios
- **Gestión de sesión** persistente con SharedPreferences
- **Perfil de usuario** editable con:
  - Username (único, requerido)
  - Nombre y apellido (opcionales)
  - Email y avatar
  - Actualización en tiempo real

### 🛍️ Catálogo de Productos
- **Listado de productos** con paginación
- **Filtros avanzados**:
  - Por categoría (Sofás, Sillas, Mesas, etc.)
  - Por rango de precio
  - Por color
  - Solo favoritos (requiere login)
  - Ordenamiento (precio, favoritos, nombre)
- **Búsqueda** en tiempo real
- **Vista de detalles** con:
  - Carrusel de imágenes
  - Información completa del producto
  - Agregar a favoritos
  - Botón de compra

### 🎨 Personalización
- **Temas**: Light y Dark mode
- **Idiomas**: Español e Inglés
- **Persistencia** de preferencias del usuario
- **Material Design 3** con paleta natural (verde oliva, arena, madera)

### 🔧 Configuración
- Cambio de tema (Light/Dark)
- Cambio de idioma (ES/EN)
- Gestión de cuenta
- Cerrar sesión

### 📦 Otras Características
- **Visor 3D** con ARCore para visualizar productos en realidad aumentada
- **Componentes reutilizables**:
  - GeneralButton
  - GeneralLoadingIndicator
  - GeneralErrorView
  - GeneralEmptyState
  - GeneralSnackBar (success, error, info, warning)
- **Optimización de imágenes** con caché
- **Manejo de errores** robusto
- **Estados de carga** consistentes

---

## 🚀 Instalación

### Prerrequisitos

- Flutter SDK (>=3.9.2)
- Dart SDK (>=3.9.2)
- Android Studio / VS Code
- Dispositivo Android o emulador (para ARCore)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Rafajorda/Flutter-App-movil.git
cd Flutter-App-movil
```

2. **Instalar dependencias**
```bash
flutter pub get
```

3. **Generar archivos de localización**
```bash
flutter gen-l10n
```

4. **Configurar el backend**

  Copia `.env.example` a `.env` y ajusta:
  ```env
  API_HOST=192.168.1.100
  API_PORT=3000
  ```

  La app construye la URL final desde `lib/core/config/api_config.dart`.

5. **Ejecutar la aplicación**
```bash
flutter run
```

---

## 🏗️ Arquitectura

### Estructura de Carpetas

```
lib/
├── main.dart                          # Punto de entrada
├── core/                              # Funcionalidades base
│   ├── config/                        # Configuración (API, constantes)
│   ├── data/                          # Modelos de datos locales
│   ├── extensions/                    # Extensions de Dart/Flutter
│   ├── models/                        # Modelos de dominio
│   ├── services/                      # Servicios HTTP (API)
│   ├── theme/                         # Temas y estilos
│   ├── utils/                         # Utilidades (snackbar, etc.)
│   └── widgets/                       # Widgets reutilizables
│       ├── buttons/
│       ├── loading/
│       ├── error/
│       ├── empty/
│       └── products/
├── features/                          # Características por módulos
│   ├── home/                          # Pantalla principal
│   ├── login/                         # Autenticación
│   ├── profile/                       # Perfil de usuario
│   ├── catalog/                       # Catálogo de productos
│   ├── details/                       # Detalles de producto
│   └── settings/                      # Configuración
├── providers/                         # Estado global (Riverpod)
│   ├── auth_provider.dart             # Estado de autenticación
│   └── theme_and_locale_provider.dart # Tema e idioma
└── l10n/                              # Internacionalización
    ├── app_en.arb                     # Traducciones inglés
    ├── app_es.arb                     # Traducciones español
    └── app_localizations.dart         # Generado automáticamente
```

### Patrón de Diseño

- **Clean Architecture** con separación de responsabilidades
- **Repository Pattern** para acceso a datos
- **Provider Pattern** (Riverpod) para gestión de estado
- **Service Layer** para lógica de negocio
- **Widgets reutilizables** para consistencia UI

### Flujo de Datos

```
UI (Widgets)
    ↓
Providers (State Management)
    ↓
Services (Business Logic)
    ↓
Repository (Data Access)
    ↓
API / Local Storage
```

---

## 🛠️ Tecnologías

### Core
- **Flutter** 3.9.2 - Framework UI multiplataforma
- **Dart** 3.9.2 - Lenguaje de programación

### State Management
- **Riverpod** 3.0.3 - Gestión de estado reactiva y type-safe
- **SharedPreferences** 2.2.2 - Persistencia local

### Networking
- **HTTP** 1.2.2 - Cliente HTTP para API REST

### UI/UX
- **Material Design 3** - Sistema de diseño moderno
- **Cupertino Icons** 1.0.8 - Iconos iOS-style
- **flutter_3d_controller** 2.3.0 - Visor 3D
- **ar_flutter_plugin_updated** 0.0.1 - Realidad aumentada

### Internacionalización
- **flutter_localizations** - Soporte i18n
- **intl** 0.20.2 - Formateo de fechas/números
- **flutter_gen** 5.12.0 - Generación de código

### Dev Tools
- **flutter_lints** 5.0.0 - Reglas de estilo
- **riverpod_lint** 3.0.3 - Lints para Riverpod
- **custom_lint** 0.8.0 - Lints personalizados

---

## 🎨 Sistema de Temas

### Paleta de Colores

**Light Theme** - Inspirado en la naturaleza
- **Primary**: Verde oliva (`#556B2F`)
- **Secondary**: Arena (`#D2B48C`)
- **Tertiary**: Terracota (`#E07A5F`)
- **Surface**: Blanco roto (`#FAFAF5`)

**Dark Theme** - Tonos nocturnos
- **Primary**: Verde oliva oscuro (`#3D4E23`)
- **Secondary**: Arena oscura (`#8B7355`)
- **Tertiary**: Terracota oscura (`#A85642`)
- **Surface**: Carbón (`#1C1C1C`)

### Características del Theme
- ✅ Material Design 3
- ✅ Elevación con tint de color
- ✅ Esquinas redondeadas
- ✅ Transiciones suaves
- ✅ Alto contraste para accesibilidad

---

## 🌍 Internacionalización

### Idiomas Soportados
- 🇪🇸 **Español** (por defecto)
- 🇬🇧 **Inglés**

### Cómo Agregar un Nuevo Idioma

1. Crear archivo ARB en `lib/l10n/`:
```bash
lib/l10n/app_fr.arb  # Para francés
```

2. Copiar las claves de `app_es.arb` y traducir

3. Regenerar localizaciones:
```bash
flutter gen-l10n
```

4. Agregar el locale en `main.dart`:
```dart
supportedLocales: [
  Locale('es'),
  Locale('en'),
],
```

---

## 📡 API Backend

### Endpoints Utilizados

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/refresh` - Renovar access token
- `GET /auth/profile` - Obtener usuario actual
- `PUT /auth/profile` - Actualizar perfil

#### Productos
- `GET /product` - Listar productos (con filtros)
- `GET /product/:id` - Detalle de producto

#### Categorías
- `GET /category` - Listar categorías

#### Favoritos
- `GET /favorites` - Listar favoritos del usuario
- `POST /favorites` - Agregar a favoritos
- `DELETE /favorites/:id` - Quitar de favoritos

#### Pedidos
- `GET /order/user` - Pedidos del usuario autenticado
- `GET /order/:id` - Detalle de pedido

### Formato de Respuesta

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
flutter test

# Ejecutar tests con cobertura
flutter test --coverage

# Ver reporte de cobertura
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

---

## 📦 Build & Deploy

### Android

```bash
# Build APK debug
flutter build apk --debug

# Build APK release
flutter build apk --release

# Build App Bundle (recomendado para Play Store)
flutter build appbundle --release
```

### iOS

```bash
# Build para simulador
flutter build ios --debug --simulator

# Build release
flutter build ios --release
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- Seguir las [Dart Style Guidelines](https://dart.dev/guides/language/effective-dart/style)
- Usar `flutter format` antes de commit
- Escribir comentarios en español
- Mantener widgets pequeños y reutilizables
- Usar Riverpod para estado compartido

---

## 📝 Roadmap

- [ ] Carrito de compras funcional
- [ ] Pasarela de pago (Stripe/PayPal)
- [ ] Historial de pedidos
- [ ] Notificaciones push
- [ ] Compartir productos en redes sociales
- [ ] Modo offline con caché
- [ ] Tests de integración
- [ ] CI/CD con GitHub Actions
- [ ] Versión web (Flutter Web)

---

## 🐛 Problemas Conocidos

- ARCore solo funciona en dispositivos Android compatibles
- El visor 3D requiere descarga de modelos grandes
- La búsqueda podría ser más rápida con debounce

---

## 📄 Licencia

Este proyecto es privado y no está publicado bajo ninguna licencia pública.

---

## 👥 Autores

- **Rafael Jordan** - [Rafajorda](https://github.com/Rafajorda)

---

## 🙏 Agradecimientos

- [Flutter Documentation](https://flutter.dev/docs)
- [Riverpod](https://riverpod.dev/)
- [Material Design 3](https://m3.material.io/)
- Comunidad de Flutter en Stack Overflow

---

<div align="center">

**¿Tienes preguntas?** [Abre un issue](https://github.com/Rafajorda/Flutter-App-movil/issues)

Hecho con ❤️ usando Flutter

</div>
