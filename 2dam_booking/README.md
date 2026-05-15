# 🛍️ 2DAM Booking - Backend API

> Backend REST API desarrollado con NestJS, TypeORM y MySQL para una aplicación de e-commerce móvil.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Ejecución](#-ejecución)
- [Base de Datos](#-base-de-datos)
- [Documentación API](#-documentación-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Autenticación](#-autenticación)
- [Testing](#-testing)

---

## 📖 Descripción

API REST completa para una aplicación de e-commerce que incluye:

- Sistema de autenticación con JWT y refresh tokens
- Gestión de usuarios con roles (USER/ADMIN)
- Catálogo de productos con múltiples colores e imágenes
- Sistema de categorías
- Carrito de compras persistente
- Favoritos por usuario
- Gestión de órdenes y líneas de pedido
- Modelos 3D de productos

---

## 🛠️ Tecnologías

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Lenguaje**: TypeScript v5.7
- **ORM**: TypeORM v0.3
- **Base de Datos**: MySQL v8+
- **Autenticación**: JWT (@nestjs/jwt)
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI (@nestjs/swagger)
- **Testing**: Jest
- **Encriptación**: bcrypt

---

## ✨ Características

### 🔐 Autenticación y Autorización

- ✅ Registro e inicio de sesión
- ✅ JWT tokens con refresh automático
- ✅ Tokens con expiración (Access: 15 min, Refresh: 7 días)
- ✅ Guards para protección de rutas (AuthGuard, AdminGuard)
- ✅ Roles de usuario (USER, ADMIN)

### 👤 Gestión de Usuarios

- ✅ Perfiles de usuario con avatar
- ✅ Actualización de perfil autenticado
- ✅ CRUD completo (solo admin)
- ✅ Sistema de favoritos personal
- ✅ Historial de órdenes personal

### 🛒 E-commerce

- ✅ Catálogo de productos con paginación y filtros
- ✅ Productos con múltiples colores (many-to-many)
- ✅ Múltiples imágenes por producto
- ✅ Modelos 3D opcionales
- ✅ Sistema de categorías
- ✅ Carrito persistente por usuario
- ✅ Gestión de órdenes y líneas de pedido
- ✅ Contador de favoritos por producto

### 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de DTOs
- ✅ Protección de endpoints administrativos
- ✅ Revocación de refresh tokens
- ✅ Validación de unicidad (email, username)

---

## 📦 Requisitos Previos

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **MySQL**: v8 o superior
- **Git**: Para clonar el repositorio

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Rafajorda/2dam_booking.git
cd 2dam_booking
```

### 2. Instalar dependencias

```bash
npm install
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=2dam_booking

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=15m

# Aplicación
PORT=3000
NODE_ENV=development
```

### 2. Base de Datos MySQL

Crea la base de datos:

```sql
CREATE DATABASE 2dam_booking;
```

> **Nota**: TypeORM creará automáticamente las tablas al iniciar la aplicación.

---

## 🏃 Ejecución

### Modo Desarrollo (con auto-reload)

```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3000`

### Modo Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Otros comandos útiles

```bash
# Modo debug
npm run start:debug

# Formatear código
npm run format

# Linting
npm run lint
```

---

## 🗄️ Base de Datos

### Sincronización automática

TypeORM está configurado con `synchronize: true` en desarrollo, lo que crea/actualiza las tablas automáticamente.

### Seeder (Datos de Prueba)

Para poblar la base de datos con datos de ejemplo:

```bash
npm run seed
```

Esto creará:

- 3 usuarios (incluyendo 1 admin)
- Múltiples categorías
- Productos con colores e imágenes
- Relaciones de ejemplo

**Credenciales de prueba:**

Admin:

- Email: `admin@example.com`
- Password: `admin123`

Usuario regular:

- Email: `juan@example.com`
- Password: `password123`

---

## 📚 Documentación API

### Swagger UI

La documentación interactiva de la API está disponible en:

```
http://localhost:3000/api
```

### Colecciones principales

#### 🔐 Auth (`/auth`)

- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil (autenticado)
- `PUT /auth/profile` - Actualizar perfil (autenticado)
- `GET /auth/orders` - Ver órdenes propias (autenticado)

#### 👥 Users (`/users`)

- `GET /users` - Listar usuarios (admin)
- `POST /users` - Crear usuario (admin)
- `GET /users/:id` - Ver usuario (admin)
- `PUT /users/:id` - Actualizar usuario (admin)
- `DELETE /users/:id` - Eliminar usuario (admin)

#### 📦 Products (`/products`)

- `GET /products` - Listar productos (público)
- `POST /products` - Crear producto (admin)
- `GET /products/:id` - Ver producto (público)
- `PUT /products/:id` - Actualizar producto (admin)
- `DELETE /products/:id` - Eliminar producto (admin)

#### 🏷️ Categories (`/categories`)

- `GET /categories` - Listar categorías (público)
- `POST /categories` - Crear categoría (admin)
- `PUT /categories/:id` - Actualizar categoría (admin)
- `DELETE /categories/:id` - Eliminar categoría (admin)

#### 🛒 Cart (`/cart`)

- `GET /cart` - Ver carrito (autenticado)
- `POST /cart/add` - Añadir producto (autenticado)
- `PUT /cart/product/:id` - Actualizar cantidad (autenticado)
- `DELETE /cart/product/:id` - Eliminar producto (autenticado)
- `DELETE /cart/clear` - Vaciar carrito (autenticado)

#### ⭐ Favorites (`/favorites`)

- `GET /favorites` - Listar favoritos (autenticado)
- `POST /favorites` - Añadir favorito (autenticado)
- `DELETE /favorites/:id` - Eliminar favorito (autenticado)

#### 📋 Orders (`/orders`)

- `GET /orders` - Listar todas (admin)
- `POST /orders` - Crear orden (admin)
- `GET /orders/:id` - Ver orden (admin)
- `PUT /orders/:id` - Actualizar orden (admin)
- `DELETE /orders/:id` - Eliminar orden (admin)

---

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Autenticación y autorización
│   ├── auth.controller.ts   # Endpoints de auth
│   ├── auth.service.ts      # Lógica de negocio
│   ├── auth.dto.ts          # DTOs de auth
│   ├── auth.guard.ts        # Guard JWT
│   ├── admin.guard.ts       # Guard de admin
│   └── refresh-token.entity.ts
│
├── users/                   # Gestión de usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── user.entity.ts       # Entidad User
│   └── user.dto.ts
│
├── product/                 # Productos
│   ├── product.controller.ts
│   ├── product.service.ts
│   ├── product.entity.ts    # Entidad Product
│   └── product.dto.ts
│
├── category/                # Categorías
│   ├── category.controller.ts
│   ├── category.service.ts
│   ├── category.entity.ts
│   └── category.dto.ts
│
├── cart/                    # Carrito de compras
│   ├── cart.controller.ts
│   ├── cart.service.ts
│   ├── cart.entity.ts
│   ├── cartProduct.entity.ts
│   └── cart.dto.ts
│
├── favorites/               # Favoritos
│   ├── favorites.controller.ts
│   ├── favorites.service.ts
│   ├── favorites.entity.ts
│   └── favorites.dto.ts
│
├── order/                   # Órdenes
│   ├── order.controller.ts
│   ├── order.service.ts
│   ├── order.entity.ts
│   └── order.dto.ts
│
├── orderline/               # Líneas de pedido
│   ├── orderline.controller.ts
│   ├── orderline.service.ts
│   ├── orderline.entity.ts
│   └── orderline.dto.ts
│
├── images/                  # Imágenes de productos
│   ├── images.controller.ts
│   ├── images.service.ts
│   ├── images.entity.ts
│   └── images.dto.ts
│
├── data/                    # Datos de seeding
│   ├── users.ts
│   ├── products.ts
│   ├── categories.ts
│   └── images.ts
│
├── db/                      # Configuración de DB
│   └── seeding/
│       └── seeds/
│
├── common/                  # Módulos compartidos
│   ├── filters/
│   └── services/
│
├── app.module.ts            # Módulo principal
├── main.ts                  # Punto de entrada
└── seed.ts                  # Script de seeding
```

---

## 🔐 Autenticación

### Sistema de Tokens

Este backend implementa un sistema de autenticación moderno con **rotación de refresh tokens**, ideal para aplicaciones móviles.

#### Flujo de Autenticación

1. **Login/Register**: Devuelve access_token + refresh_token + timestamps
2. **Peticiones**: Enviar `Authorization: Bearer {access_token}`
3. **Auto-refresh**: El frontend debe renovar el token automáticamente cuando esté próximo a expirar
4. **Logout**: Revoca el refresh_token en el servidor

#### Configuración de Tokens

- **Access Token**: 15 minutos (para peticiones API)
- **Refresh Token**: 7 días (para renovar access token)
- **Rotación**: Cada refresh genera un nuevo par de tokens

#### Ejemplo de Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0...",
  "expires_in": 900,
  "token_type": "Bearer",
  "access_token_expires_at": 1732118400000,
  "refresh_token_expires_at": 1732723200000,
  "user": {
    "id": "1",
    "email": "usuario@example.com",
    "username": "usuario123",
    "role": "USER",
    "isActive": true
  }
}
```

### Implementación en Frontend (Flutter)

Consulta el archivo [`AUTH_TOKENS.md`](./AUTH_TOKENS.md) para guía completa de implementación con interceptores HTTP y manejo automático de refresh.

#### Quick Start

```dart
// Guardar tokens después de login
await storage.write(key: 'access_token', value: response['access_token']);
await storage.write(key: 'refresh_token', value: response['refresh_token']);
await storage.write(key: 'access_token_expires_at', value: response['access_token_expires_at'].toString());

// En cada petición (interceptor)
final expiresAt = int.parse(await storage.read(key: 'access_token_expires_at'));
final now = DateTime.now().millisecondsSinceEpoch;

if (expiresAt - now < 120000) { // 2 minutos antes
  await refreshToken();
}
```

---

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Tests con cobertura

```bash
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

### Watch mode (desarrollo)

```bash
npm run test:watch
```

---

## 🚀 Despliegue

### Producción

1. **Configurar variables de entorno**:
   - Crear `.env.production` con configuración de producción
   - Deshabilitar `synchronize: false` en TypeORM
   - Configurar CORS apropiadamente

2. **Build**:

   ```bash
   npm run build
   ```

3. **Ejecutar**:
   ```bash
   NODE_ENV=production npm run start:prod
   ```

### Docker (opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## 📝 Convenciones de Código

- **Naming**: camelCase para variables/funciones, PascalCase para clases
- **DTOs**: Validación con class-validator en todos los inputs
- **Entities**: Decoradores TypeORM para definir esquema
- **Services**: Lógica de negocio separada de controllers
- **Guards**: Protección de rutas basada en roles
- **Exceptions**: Usar exceptions HTTP de NestJS

---

## 🔧 Scripts Disponibles

| Comando              | Descripción            |
| -------------------- | ---------------------- |
| `npm run start`      | Iniciar en modo normal |
| `npm run start:dev`  | Iniciar con hot-reload |
| `npm run start:prod` | Iniciar en producción  |
| `npm run build`      | Compilar proyecto      |
| `npm run seed`       | Poblar base de datos   |
| `npm run test`       | Ejecutar tests         |
| `npm run lint`       | Linting del código     |
| `npm run format`     | Formatear código       |

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y no tiene licencia pública.

---

## 👥 Autores

- **Rafajorda** - [GitHub](https://github.com/Rafajorda)

---

## 🆘 Soporte

Para preguntas o problemas:

1. Revisa la [documentación de NestJS](https://docs.nestjs.com)
2. Revisa el archivo `AUTH_TOKENS.md` para temas de autenticación
3. Abre un issue en el repositorio

---

## 📌 Notas Importantes

- ⚠️ **Desarrollo**: `synchronize: true` en TypeORM está habilitado, las tablas se crean automáticamente
- ⚠️ **Producción**: Cambiar a `synchronize: false` y usar migraciones
- ⚠️ **Seeder**: El seeder bypasses los guards usando TypeORM directamente
- ⚠️ **Seguridad**: Cambiar `JWT_SECRET` en producción a un valor robusto
- ⚠️ **CORS**: Configurar orígenes permitidos en `main.ts` para producción

---

**¡Feliz desarrollo! 🎉**
