# HomeNest Workspace

Workspace multi-proyecto con backend NestJS, panel administrativo Expo/React Native y app movil Flutter.

## Proyectos

- [2dam_booking](./2dam_booking/README.md): API REST (NestJS + TypeORM + MySQL)
- [AdminApp](./AdminApp/README.md): Panel admin (Expo + React Native)
- [Flutter-App-movil](./Flutter-App-movil/README.md): App cliente movil (Flutter)

## Orden recomendado de arranque

1. Levantar base de datos y backend
2. Configurar y ejecutar AdminApp
3. Configurar y ejecutar Flutter-App-movil

## Quick Start

### 1) Backend

```bash
cd 2dam_booking
npm install
npm run start:dev
```

Swagger: http://localhost:3000/api/docs

### 2) AdminApp

```bash
cd AdminApp
npm install
copy .env.example .env
npm run start
```

### 3) Flutter App

```bash
cd Flutter-App-movil
flutter pub get
copy .env.example .env
flutter run
```

## Variables de entorno

- Backend: `DB_*`, `JWT_SECRET`, `PORT`
- AdminApp: `EXPO_PUBLIC_API_URL`
- Flutter: `API_HOST`, `API_PORT`

## Notas de red (desarrollo movil)

- En dispositivo fisico no usar `localhost` para llegar al backend.
- Usar la IP local de tu PC y la misma red WiFi para todos los dispositivos.