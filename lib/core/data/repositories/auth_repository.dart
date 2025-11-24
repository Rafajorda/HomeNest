import 'dart:convert';
import '../datasources/remote/auth_remote_datasource.dart';

/// Excepción del repositorio de autenticación
class AuthRepositoryException implements Exception {
  final String message;
  final int? statusCode;

  AuthRepositoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Repositorio de autenticación
///
/// Responsabilidad: lógica de negocio y transformación de datos de auth
class AuthRepository {
  final AuthRemoteDataSource _dataSource;

  AuthRepository(this._dataSource);

  /// Login con credenciales
  ///
  /// Retorna: Map con tokens y datos de usuario parseados
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dataSource.login(email, password);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 400) {
        throw AuthRepositoryException(
          'Credenciales inválidas',
          statusCode: 400,
        );
      } else if (response.statusCode == 401) {
        throw AuthRepositoryException(
          'Email o contraseña incorrectos',
          statusCode: 401,
        );
      } else {
        throw AuthRepositoryException(
          'Error al iniciar sesión',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is AuthRepositoryException) rethrow;
      throw AuthRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Registro de nuevo usuario
  ///
  /// Retorna: Map con tokens y datos de usuario parseados
  Future<Map<String, dynamic>> register(
    String email,
    String password,
    String name,
  ) async {
    try {
      final response = await _dataSource.register(email, password, name);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 400) {
        final body = jsonDecode(response.body);
        throw AuthRepositoryException(
          body['message'] ?? 'Datos inválidos',
          statusCode: 400,
        );
      } else if (response.statusCode == 409) {
        throw AuthRepositoryException(
          'El email ya está registrado',
          statusCode: 409,
        );
      } else {
        throw AuthRepositoryException(
          'Error al registrar usuario',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is AuthRepositoryException) rethrow;
      throw AuthRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Renueva el access token
  ///
  /// Retorna: Map con nuevos tokens
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    try {
      final response = await _dataSource.refreshToken(refreshToken);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        throw AuthRepositoryException(
          'Refresh token inválido o expirado',
          statusCode: 401,
        );
      } else {
        throw AuthRepositoryException(
          'Error al renovar token',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is AuthRepositoryException) rethrow;
      throw AuthRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Obtiene perfil del usuario
  ///
  /// Retorna: Map con datos del usuario
  Future<Map<String, dynamic>> getUserProfile(String accessToken) async {
    try {
      final response = await _dataSource.getUserProfile(accessToken);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        throw AuthRepositoryException('Token inválido', statusCode: 401);
      } else {
        throw AuthRepositoryException(
          'Error al obtener perfil',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is AuthRepositoryException) rethrow;
      throw AuthRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Actualiza perfil del usuario
  ///
  /// Retorna: Map con datos actualizados
  Future<Map<String, dynamic>> updateUserProfile(
    String accessToken,
    Map<String, dynamic> updates,
  ) async {
    try {
      final response = await _dataSource.updateUserProfile(
        accessToken,
        updates,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        throw AuthRepositoryException('No autorizado', statusCode: 401);
      } else {
        throw AuthRepositoryException(
          'Error al actualizar perfil',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is AuthRepositoryException) rethrow;
      throw AuthRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Cierra sesión
  ///
  /// Retorna: true si fue exitoso
  Future<bool> logout(String accessToken) async {
    try {
      final response = await _dataSource.logout(accessToken);
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      // Logout puede fallar sin problemas
      return false;
    }
  }
}
