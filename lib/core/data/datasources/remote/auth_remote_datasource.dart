import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

/// DataSource remoto para autenticación
///
/// Responsabilidad: realizar peticiones HTTP al backend de auth
class AuthRemoteDataSource {
  final http.Client _client;

  AuthRemoteDataSource({http.Client? client})
    : _client = client ?? http.Client();

  /// Login con email y contraseña
  ///
  /// Parámetros:
  /// - [email]: Email del usuario
  /// - [password]: Contraseña del usuario
  ///
  /// Retorna: Response con tokens y datos de usuario
  Future<http.Response> login(String email, String password) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/auth/login');
      final body = jsonEncode({'email': email, 'password': password});

      return await _client
          .post(uri, headers: ApiConfig.defaultHeaders, body: body)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Registro de nuevo usuario
  ///
  /// Parámetros:
  /// - [email]: Email del usuario
  /// - [password]: Contraseña del usuario
  /// - [name]: Nombre del usuario
  ///
  /// Retorna: Response con tokens y datos de usuario
  Future<http.Response> register(
    String email,
    String password,
    String name,
  ) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/auth/register');
      final body = jsonEncode({
        'email': email,
        'password': password,
        'name': name,
      });

      return await _client
          .post(uri, headers: ApiConfig.defaultHeaders, body: body)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Renueva el access token usando el refresh token
  ///
  /// Parámetros:
  /// - [refreshToken]: Token de refresco
  ///
  /// Retorna: Response con nuevos tokens
  Future<http.Response> refreshToken(String refreshToken) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/auth/refresh');
      final body = jsonEncode({'refresh_token': refreshToken});

      return await _client
          .post(uri, headers: ApiConfig.defaultHeaders, body: body)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Obtiene datos del perfil del usuario autenticado
  ///
  /// Parámetros:
  /// - [accessToken]: Token de acceso
  ///
  /// Retorna: Response con datos del usuario
  Future<http.Response> getUserProfile(String accessToken) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/auth/me');
      final headers = ApiConfig.authHeaders(accessToken);

      return await _client
          .get(uri, headers: headers)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Actualiza el perfil del usuario
  ///
  /// Parámetros:
  /// - [accessToken]: Token de acceso
  /// - [updates]: Mapa con campos a actualizar
  ///
  /// Retorna: Response con datos actualizados
  Future<http.Response> updateUserProfile(
    String accessToken,
    Map<String, dynamic> updates,
  ) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.updateProfileEndpoint}',
      );
      final headers = ApiConfig.authHeaders(accessToken);
      final body = jsonEncode(updates);

      return await _client
          .put(uri, headers: headers, body: body)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Cierra sesión (invalida tokens)
  ///
  /// Parámetros:
  /// - [accessToken]: Token de acceso
  ///
  /// Retorna: Response de confirmación
  Future<http.Response> logout(String accessToken) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/auth/logout');
      final headers = ApiConfig.authHeaders(accessToken);

      return await _client
          .post(uri, headers: headers)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }
}
