import '../data/repositories/auth_repository.dart';
import '../data/datasources/remote/auth_remote_datasource.dart';

/// Excepciones personalizadas para el servicio de autenticación
class AuthException implements Exception {
  final String message;
  final int? statusCode;

  AuthException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Modelo de respuesta de login/register
class LoginResponse {
  final String accessToken;
  final String refreshToken;
  final UserData user;
  final int? expiresIn;
  final String? tokenType;
  final int? accessTokenExpiresAt;
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

/// Modelo de respuesta de refresh token
class RefreshTokenResponse {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final String tokenType;
  final int? accessTokenExpiresAt;
  final int? refreshTokenExpiresAt;

  RefreshTokenResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.tokenType,
    this.accessTokenExpiresAt,
    this.refreshTokenExpiresAt,
  });

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

/// Modelo de datos de usuario
class UserData {
  final String id;
  final String name;
  final String email;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? address;
  final String? role;
  final bool? isActive;

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
  });

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
    );
  }

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
}
