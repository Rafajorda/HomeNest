# AdminApp

Panel de administracion movil/web para gestionar el backend de 2dam_booking (HomeNest API), construido con Expo + React Native.

## Descripcion

AdminApp permite operar las entidades principales del sistema desde una interfaz administrativa:

- Login de administradores y persistencia de sesion
- Gestion de productos (listado, filtros, altas, edicion, borrado, estado)
- Gestion de usuarios (listado paginado, altas, edicion, activacion/desactivacion)
- Gestion de categorias y colores
- Consulta de pedidos
- Escaneo de QR/codigo de barras para flujos de inventario y producto

## Ecosistema del Workspace

Este proyecto forma parte de un workspace con 3 piezas:

- [Guia raiz del workspace](../README.md)
- [2dam_booking (backend)](../2dam_booking/README.md)
- [Flutter-App-movil (app cliente)](../Flutter-App-movil/README.md)

## Stack Tecnologico

- Expo (SDK 54)
- React Native 0.81
- TypeScript
- Expo Router
- React Native Paper (Material Design)
- Zustand (estado global)
- TanStack React Query
- Zod (validacion)

## Requisitos

- Node.js 18+
- npm 9+
- Backend NestJS de 2dam_booking levantado y accesible por red

## Instalacion

```bash
npm install
```

## Configuracion de entorno

1. Copia el archivo `.env.example` a `.env`.
2. Ajusta la URL del backend:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Notas:

- En dispositivo fisico, usa la IP local de tu PC en lugar de `localhost`.
- La app toma la URL desde `EXPO_PUBLIC_API_URL` (ver `src/config/api.ts`).

## Ejecucion

```bash
# Servidor de desarrollo (Expo)
npm run start

# Android nativo
npm run android

# iOS nativo
npm run ios

# Web
npm run web
```

## Endpoints que consume

Principales rutas usadas por la app admin:

- `/auth/*`
- `/users/*`
- `/product/*`
- `/category/*`
- `/color/*`
- `/order/*`
- `/images`

## Estructura (resumen)

```text
src/
	app/          # Rutas Expo Router
	screens/      # Pantallas principales (dashboard, users, products, etc.)
	components/   # Componentes reutilizables
	services/     # Capa de acceso HTTP al backend
	stores/       # Estado global (auth, tema)
	config/       # Configuracion centralizada (API)
	types/        # Tipos y contratos de datos
```

## Troubleshooting rapido

- Si en movil no conecta al backend, revisa que PC y movil esten en la misma red y usa IP local.
- Si la sesion expira, verifica `JWT_SECRET` y la validez del refresh token en backend.
- Si falla Android nativo, ejecuta primero `npx expo prebuild` o usa Expo Go con `npm run start`.

## Licencia

Proyecto privado.
