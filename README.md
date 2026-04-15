# HomeNest

Repositorio raiz del proyecto HomeNest. Agrupa el backend NestJS, el panel administrativo en Expo y la app movil en Flutter.

La raiz no es una aplicacion ejecutable por si sola: solo contiene la documentacion general y las tres aplicaciones separadas por carpeta.

## Proyectos

- [2dam_booking](./2dam_booking/README.md): API REST con NestJS, TypeORM y MySQL.
- [AdminApp](./AdminApp/README.md): panel de administracion con Expo, React Native Paper y Zustand.
- [Flutter-App-movil](./Flutter-App-movil/README.md): app cliente movil con Flutter y Riverpod.

## Como esta organizado

```text
./
├── 2dam_booking/        # Backend
├── AdminApp/            # Panel admin
├── Flutter-App-movil/   # App cliente
└── README.md            # Guia raiz del monorepo
```

## Flujo recomendado de trabajo

1. Levanta primero el backend y la base de datos.
2. Configura la URL del backend en AdminApp y Flutter.
3. Arranca el panel admin o la app movil segun lo que quieras probar.

## Inicio rapido

### Backend

```bash
cd 2dam_booking
npm install
npm run start:dev
```

Swagger disponible en `http://localhost:3000/api/docs`.

### AdminApp

```bash
cd AdminApp
npm install
# Windows (PowerShell)
copy .env.example .env
# macOS / Linux / Codespaces
# cp .env.example .env
npm run start
```

### Flutter-App-movil

```bash
cd Flutter-App-movil
flutter pub get
# Windows (PowerShell)
copy .env.example .env
# macOS / Linux / Codespaces
# cp .env.example .env
flutter run
```

## Variables de entorno

### Backend

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `PORT`

### AdminApp

- `EXPO_PUBLIC_API_URL`

### Flutter-App-movil

- `API_HOST`
- `API_PORT`

## Puntos importantes

- En dispositivo fisico no uses `localhost` para acceder al backend.
- Usa la IP local de tu equipo en la misma red WiFi.
- Cada proyecto tiene su propio README con detalle tecnico y comandos especificos.

## Documentacion por proyecto

- Backend: [2dam_booking/README.md](./2dam_booking/README.md)
- AdminApp: [AdminApp/README.md](./AdminApp/README.md)
- Flutter-App-movil: [Flutter-App-movil/README.md](./Flutter-App-movil/README.md)

