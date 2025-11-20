import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../utils/service_messages.dart';

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
  final int? expiresIn; // Segundos hasta expiración del access token
  final String? tokenType; // "Bearer"
  final int? accessTokenExpiresAt; // Timestamp en milisegundos
  final int? refreshTokenExpiresAt; // Timestamp en milisegundos

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
  final int? accessTokenExpiresAt; // Timestamp en milisegundos
  final int? refreshTokenExpiresAt; // Timestamp en milisegundos

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
      expiresIn: json['expires_in'] ?? 900, // Default 15 minutos
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

    // Construir el nombre completo
    String displayName;
    if (firstName.isNotEmpty && lastName.isNotEmpty) {
      // Si ambos están presentes: "Juan Pérez"
      displayName = '$firstName $lastName'.trim();
    } else if (firstName.isNotEmpty) {
      // Solo firstName: "Juan"
      displayName = firstName;
    } else if (lastName.isNotEmpty) {
      // Solo lastName: "Pérez"
      displayName = lastName;
    } else if (username.isNotEmpty) {
      // Si no hay nombre, usar username: "juanperez"
      displayName = username;
    } else {
      // Último recurso: "User"
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

/// Servicio de autenticación - maneja todas las peticiones relacionadas con auth
class AuthService {
  final http.Client _client;

  AuthService({http.Client? client}) : _client = client ?? http.Client();

  /// Login - retorna token y datos de usuario
  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}');

      final response = await _client
          .post(
            url,
            headers: ApiConfig.defaultHeaders,
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return LoginResponse.fromJson(data);
      } else if (response.statusCode == 401) {
        // Credenciales incorrectas
        try {
          final error = jsonDecode(response.body);
          throw AuthException(
            error['message'] ?? ServiceMessages.invalidCredentials,
            statusCode: 401,
          );
        } catch (e) {
          if (e is AuthException) rethrow;
          throw AuthException(
            ServiceMessages.invalidCredentials,
            statusCode: 401,
          );
        }
      } else if (response.statusCode == 400) {
        try {
          final error = jsonDecode(response.body);
          throw AuthException(
            error['message'] ?? ServiceMessages.emailOrPasswordIncorrect,
            statusCode: 400,
          );
        } catch (e) {
          if (e is AuthException) rethrow;
          throw AuthException(
            ServiceMessages.emailOrPasswordIncorrect,
            statusCode: 400,
          );
        }
      } else {
        try {
          final error = jsonDecode(response.body);
          throw AuthException(
            error['message'] ?? ServiceMessages.loginError,
            statusCode: response.statusCode,
          );
        } catch (e) {
          if (e is AuthException) rethrow;
          throw AuthException(
            ServiceMessages.loginError,
            statusCode: response.statusCode,
          );
        }
      }
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(ServiceMessages.connectionToServerError);
    }
  }

  /// Registro de nuevo usuario
  Future<LoginResponse> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.registerEndpoint}',
      );

      final body = {'username': username, 'email': email, 'password': password};

      final response = await _client
          .post(url, headers: ApiConfig.defaultHeaders, body: jsonEncode(body))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return LoginResponse.fromJson(data);
      } else if (response.statusCode == 409) {
        // Conflicto - email o username ya existen
        try {
          final error = jsonDecode(response.body);
          throw AuthException(
            error['message'] ?? ServiceMessages.emailOrUsernameInUse,
            statusCode: 409,
          );
        } catch (e) {
          if (e is AuthException) rethrow;
          throw AuthException(
            ServiceMessages.emailOrUsernameInUse,
            statusCode: 409,
          );
        }
      } else if (response.statusCode == 400) {
        // Error de validación
        try {
          final error = jsonDecode(response.body);
          final message = error['message'];
          final errorMsg = message is List
              ? message.join(', ')
              : message ?? ServiceMessages.validationError;
          throw AuthException(errorMsg, statusCode: 400);
        } catch (e) {
          if (e is AuthException) rethrow;
          throw AuthException(ServiceMessages.validationError, statusCode: 400);
        }
      } else {
        try {
          final error = jsonDecode(response.body);
          throw AuthException(
            error['message'] ?? ServiceMessages.registrationError,
            statusCode: response.statusCode,
          );
        } catch (e) {
          if (e is AuthException) rethrow;
          throw AuthException(
            ServiceMessages.registrationError,
            statusCode: response.statusCode,
          );
        }
      }
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(ServiceMessages.connectionToServerError);
    }
  }

  /// Refresh tokens - obtiene nuevos access y refresh tokens
  Future<RefreshTokenResponse> refreshTokens(String refreshToken) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.refreshEndpoint}');

      final response = await _client
          .post(
            url,
            headers: ApiConfig.defaultHeaders,
            body: jsonEncode({'refresh_token': refreshToken}),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return RefreshTokenResponse.fromJson(data);
      } else if (response.statusCode == 401) {
        throw AuthException(ServiceMessages.sessionExpired, statusCode: 401);
      } else {
        throw AuthException(
          ServiceMessages.errorRefreshingSession,
          statusCode: response.statusCode,
        );
      }
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(ServiceMessages.connectionErrorRefreshing);
    }
  }

  /// Logout - invalida el refresh token en el servidor
  Future<void> logout(String? accessToken, String? refreshToken) async {
    try {
      if (refreshToken == null) return;

      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.logoutEndpoint}');

      final headers = accessToken != null
          ? ApiConfig.authHeaders(accessToken)
          : ApiConfig.defaultHeaders;

      await _client
          .post(
            url,
            headers: headers,
            body: jsonEncode({'refresh_token': refreshToken}),
          )
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      // Ignoramos errores de logout en el servidor
    }
  }

  /// Logout All - revoca todos los tokens del usuario
  Future<void> logoutAll(String accessToken) async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.logoutAllEndpoint}',
      );

      await _client
          .post(url, headers: ApiConfig.authHeaders(accessToken))
          .timeout(ApiConfig.connectionTimeout);
      // ignore: empty_catches
    } catch (e) {}
  }

  /// Verifica si un token es válido
  Future<bool> verifyToken(String token) async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.verifyTokenEndpoint}',
      );

      final response = await _client
          .get(url, headers: ApiConfig.authHeaders(token))
          .timeout(ApiConfig.connectionTimeout);

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Cierra el cliente HTTP
  void dispose() {
    _client.close();
  }
}
