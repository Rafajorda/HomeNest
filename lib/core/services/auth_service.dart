import '../data/repositories/auth_repository.dart';
import '../data/datasources/remote/auth_remote_datasource.dart';

/// Excepción personalizada para errores de autenticación
///
/// Envuelve errores del backend con:
/// - **message**: Descripción del error (ej: "Invalid credentials")
/// - **statusCode**: Código HTTP opcional (400, 401, 403, 500, etc.)
///
/// Lanzada por AuthService en:
/// - Login fallido (credenciales incorrectas)
/// - Register fallido (email duplicado, validación)
/// - Refresh token inválido/expirado
/// - Errores de red o servidor
///
/// Ejemplo de uso:
/// ```dart
/// try {
///   await authService.login(email, password);
/// } on AuthException catch (e) {
///   print('Error ${e.statusCode}: ${e.message}');
/// }
/// ```
class AuthException implements Exception {
  /// Mensaje descriptivo del error
  final String message;

  /// Código de estado HTTP del error (opcional)
  final int? statusCode;

  AuthException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Respuesta del backend tras login o register exitoso
///
/// Contiene:
/// - **Tokens JWT**: accessToken (15 min) y refreshToken (7 días)
/// - **Datos del usuario**: UserData con id, name, email
/// - **Metadata de tokens**:
///   - expiresIn: Duración en segundos del access token
///   - tokenType: Típicamente "Bearer"
///   - accessTokenExpiresAt: Timestamp de expiración (ms desde epoch)
///   - refreshTokenExpiresAt: Timestamp de expiración (ms desde epoch)
///
/// Devuelto por:
/// - `POST /auth/login` (autenticación)
/// - `POST /auth/register` (registro + auto-login)
///
/// Flujo típico:
/// ```dart
/// final response = await authService.login(email, password);
/// print('Token: ${response.accessToken}');
/// print('Usuario: ${response.user.name}');
/// print('Expira en: ${response.expiresIn} segundos');
/// ```
class LoginResponse {
  /// JWT access token (corta duración, ~15 min)
  final String accessToken;

  /// JWT refresh token (larga duración, ~7 días)
  final String refreshToken;

  /// Datos del usuario autenticado
  final UserData user;

  /// Duración del access token en segundos (ej: 900 = 15 min)
  final int? expiresIn;

  /// Tipo de token (típicamente "Bearer")
  final String? tokenType;

  /// Timestamp de expiración del access token (ms desde epoch)
  final int? accessTokenExpiresAt;

  /// Timestamp de expiración del refresh token (ms desde epoch)
  final int? refreshTokenExpiresAt;

  LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
    this.expiresIn,
    this.tokenType,
    this.accessTokenExpiresAt,
    this.refreshTokenExpiresAt,
  });

  /// Parsea la respuesta JSON del backend a LoginResponse
  ///
  /// Formato esperado del JSON:
  /// ```json
  /// {
  ///   "access_token": "eyJhbGc...",
  ///   "refresh_token": "eyJhbGc...",
  ///   "user": { "id": "uuid", "email": "...", ... },
  ///   "expires_in": 900,
  ///   "token_type": "Bearer",
  ///   "access_token_expires_at": 1234567890000,
  ///   "refresh_token_expires_at": 1234567890000
  /// }
  /// ```
  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['access_token'] ?? '',
      refreshToken: json['refresh_token'] ?? '',
      user: UserData.fromJson(json['user'] ?? {}),
      expiresIn: json['expires_in'],
      tokenType: json['token_type'] ?? 'Bearer',
      accessTokenExpiresAt: json['access_token_expires_at'],
      refreshTokenExpiresAt: json['refresh_token_expires_at'],
    );
  }
}

/// Respuesta del backend tras renovar tokens
///
/// Similar a LoginResponse pero sin datos de usuario (solo tokens nuevos).
///
/// Contiene:
/// - **Nuevos tokens JWT**: accessToken y refreshToken renovados
/// - **Metadata**: expiresIn, tokenType, timestamps de expiración
///
/// Devuelto por:
/// - `POST /auth/refresh-tokens` cuando el access token expira
///
/// Flujo típico de auto-refresh:
/// 1. Request HTTP recibe 401 Unauthorized
/// 2. AuthInterceptor llama a refreshTokens()
/// 3. Backend devuelve nuevos tokens
/// 4. Request original se reintenta con nuevo access token
///
/// Ejemplo:
/// ```dart
/// final response = await authService.refreshTokens(oldRefreshToken);
/// print('Nuevo access token: ${response.accessToken}');
/// ```
class RefreshTokenResponse {
  /// Nuevo JWT access token (15 min)
  final String accessToken;

  /// Nuevo JWT refresh token (7 días)
  final String refreshToken;

  /// Duración en segundos del nuevo access token
  final int expiresIn;

  /// Tipo de token ("Bearer")
  final String tokenType;

  /// Timestamp de expiración del nuevo access token (ms desde epoch)
  final int? accessTokenExpiresAt;

  /// Timestamp de expiración del nuevo refresh token (ms desde epoch)
  final int? refreshTokenExpiresAt;

  RefreshTokenResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.tokenType,
    this.accessTokenExpiresAt,
    this.refreshTokenExpiresAt,
  });

  /// Parsea la respuesta JSON del backend a RefreshTokenResponse
  ///
  /// Formato esperado:
  /// ```json
  /// {
  ///   "access_token": "eyJhbGc...",
  ///   "refresh_token": "eyJhbGc...",
  ///   "expires_in": 900,
  ///   "token_type": "Bearer",
  ///   "access_token_expires_at": 1234567890000,
  ///   "refresh_token_expires_at": 1234567890000
  /// }
  /// ```
  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      accessToken: json['access_token'] ?? '',
      refreshToken: json['refresh_token'] ?? '',
      expiresIn: json['expires_in'] ?? 900,
      tokenType: json['token_type'] ?? 'Bearer',
      accessTokenExpiresAt: json['access_token_expires_at'],
      refreshTokenExpiresAt: json['refresh_token_expires_at'],
    );
  }
}

/// Datos del usuario autenticado
///
/// Contiene toda la información del perfil del usuario:
/// - **Campos requeridos**: id (UUID), name (display name), email
/// - **Campos opcionales**: username, firstName, lastName, address, role, isActive
///
/// Lógica de **display name**:
/// El campo `name` se construye automáticamente con esta prioridad:
/// 1. "firstName lastName" (si ambos existen)
/// 2. Solo "firstName" (si existe)
/// 3. Solo "lastName" (si existe)
/// 4. "username" (si existe)
/// 5. "User" (fallback por defecto)
///
/// Esta lógica asegura que siempre haya un nombre para mostrar en la UI.
///
/// Ejemplo de JSON del backend:
/// ```json
/// {
///   "id": "550e8400-e29b-41d4-a716-446655440000",
///   "email": "john@example.com",
///   "firstName": "John",
///   "lastName": "Doe",
///   "username": "johndoe",
///   "role": "user",
///   "isActive": true
/// }
/// ```
///
/// Resultado: `name = "John Doe"`
class UserData {
  /// ID único del usuario (UUID del backend)
  final String id;

  /// Nombre de visualización (generado automáticamente)
  final String name;

  /// Email del usuario
  final String email;

  /// Nombre de usuario (opcional)
  final String? username;

  /// Nombre (opcional)
  final String? firstName;

  /// Apellido (opcional)
  final String? lastName;

  /// Dirección (opcional)
  final String? address;

  /// Rol del usuario (ej: "user", "admin") (opcional)
  final String? role;

  /// Si la cuenta está activa (opcional)
  final bool? isActive;

  /// URL del avatar del usuario (opcional)
  /// Puede ser una URL externa como https://i.pravatar.cc/150?img=10
  /// o una ruta del backend
  final String? avatar;

  UserData({
    required this.id,
    required this.name,
    required this.email,
    this.username,
    this.firstName,
    this.lastName,
    this.address,
    this.role,
    this.isActive,
    this.avatar,
  });

  /// Parsea JSON del backend a UserData
  ///
  /// Construye automáticamente el campo `name` con la siguiente lógica:
  /// - Prioridad 1: "firstName lastName" (si ambos no vacíos)
  /// - Prioridad 2: Solo "firstName"
  /// - Prioridad 3: Solo "lastName"
  /// - Prioridad 4: "username"
  /// - Fallback: "User"
  ///
  /// Esto asegura siempre tener un nombre para mostrar en UI.
  factory UserData.fromJson(Map<String, dynamic> json) {
    final firstName = json['firstName'] ?? '';
    final lastName = json['lastName'] ?? '';
    final username = json['username'] ?? '';

    String displayName;
    if (firstName.isNotEmpty && lastName.isNotEmpty) {
      displayName = '$firstName $lastName'.trim();
    } else if (firstName.isNotEmpty) {
      displayName = firstName;
    } else if (lastName.isNotEmpty) {
      displayName = lastName;
    } else if (username.isNotEmpty) {
      displayName = username;
    } else {
      displayName = 'User';
    }

    return UserData(
      id: json['id']?.toString() ?? '',
      name: displayName,
      email: json['email'] ?? '',
      username: username.isEmpty ? null : username,
      firstName: firstName.isEmpty ? null : firstName,
      lastName: lastName.isEmpty ? null : lastName,
      address: json['address'],
      role: json['role'],
      isActive: json['isActive'],
      avatar: json['avatar'],
    );
  }

  /// Convierte UserData a JSON
  ///
  /// Solo incluye campos no nulos (usando `if`).
  /// Útil para enviar datos al backend al actualizar perfil.
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    if (username != null) 'username': username,
    if (firstName != null) 'firstName': firstName,
    if (lastName != null) 'lastName': lastName,
    if (address != null) 'address': address,
    if (role != null) 'role': role,
    if (isActive != null) 'isActive': isActive,
    if (avatar != null) 'avatar': avatar,
  };
}

/// Servicio de autenticación - Capa de coordinación
///
/// Delega toda la lógica de negocio al AuthRepository.
/// Mantiene los modelos (LoginResponse, UserData, etc.) para uso de la UI.
class AuthService {
  final AuthRepository _repository;

  AuthService() : _repository = AuthRepository(AuthRemoteDataSource());

  /// Login - Autenticar usuario
  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final data = await _repository.login(email, password);
      return LoginResponse.fromJson(data);
    } catch (e) {
      if (e is AuthRepositoryException) {
        throw AuthException(e.message, statusCode: e.statusCode);
      }
      rethrow;
    }
  }

  /// Registro de nuevo usuario
  Future<LoginResponse> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final data = await _repository.register(email, password, username);
      return LoginResponse.fromJson(data);
    } catch (e) {
      if (e is AuthRepositoryException) {
        throw AuthException(e.message, statusCode: e.statusCode);
      }
      rethrow;
    }
  }

  /// Refresh tokens - Renovar tokens de acceso
  Future<RefreshTokenResponse> refreshTokens(String refreshToken) async {
    try {
      final data = await _repository.refreshToken(refreshToken);
      return RefreshTokenResponse.fromJson(data);
    } catch (e) {
      if (e is AuthRepositoryException) {
        throw AuthException(e.message, statusCode: e.statusCode);
      }
      rethrow;
    }
  }

  /// Logout - Cerrar sesión
  Future<void> logout(String? accessToken, String? refreshToken) async {
    if (accessToken == null) return;
    try {
      await _repository.logout(accessToken);
    } catch (e) {
      // Ignoramos errores de logout
    }
  }

  /// Logout All - Cerrar todas las sesiones (mismo que logout)
  Future<void> logoutAll(String accessToken) async {
    try {
      await _repository.logout(accessToken);
    } catch (e) {
      // Ignoramos errores
    }
  }

  /// Verifica si un token es válido
  Future<bool> verifyToken(String token) async {
    try {
      // Intentamos obtener el perfil como verificación
      await _repository.getUserProfile(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Actualiza el perfil del usuario en el backend
  ///
  /// Envía una petición PUT a /auth/profile con los campos a actualizar.
  ///
  /// Parámetros:
  /// - [accessToken]: Token JWT del usuario autenticado
  /// - [username]: Nuevo nombre de usuario (opcional)
  /// - [firstName]: Nuevo nombre (opcional)
  /// - [lastName]: Nuevo apellido (opcional)
  /// - [email]: Nuevo email (opcional)
  /// - [avatar]: Nueva URL del avatar (opcional)
  ///
  /// Returns: UserData actualizado con los nuevos valores
  ///
  /// Throws: AuthException si falla la actualización
  ///
  /// Ejemplo:
  /// ```dart
  /// final updatedUser = await authService.updateProfile(
  ///   accessToken: token,
  ///   firstName: 'John',
  ///   lastName: 'Doe',
  ///   avatar: 'https://i.pravatar.cc/150?img=10',
  /// );
  /// ```
  Future<UserData> updateProfile({
    required String accessToken,
    String? username,
    String? firstName,
    String? lastName,
    String? email,
    String? avatar,
  }) async {
    try {
      final data = await _repository.updateProfile(
        accessToken: accessToken,
        username: username,
        firstName: firstName,
        lastName: lastName,
        email: email,
        avatar: avatar,
      );
      return UserData.fromJson(data);
    } catch (e) {
      if (e is AuthRepositoryException) {
        throw AuthException(e.message, statusCode: e.statusCode);
      }
      rethrow;
    }
  }
}
