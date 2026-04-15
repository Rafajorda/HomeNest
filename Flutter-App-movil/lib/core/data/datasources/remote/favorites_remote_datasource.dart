import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';
import '../../../services/auth_interceptor.dart';

/// DataSource remoto para favoritos
///
/// Responsabilidad: realizar peticiones HTTP al backend de favoritos
class FavoritesRemoteDataSource {
  final AuthInterceptor? _interceptor;
  final String? _authToken;

  FavoritesRemoteDataSource({AuthInterceptor? interceptor, String? authToken})
    : _interceptor = interceptor,
      _authToken = authToken;

  /// Ejecuta una petición GET con manejo de interceptor
  Future<http.Response> _get(Uri uri, Map<String, String> headers) async {
    if (_interceptor != null) {
      return await _interceptor.get(uri, headers: headers);
    } else {
      return await http
          .get(uri, headers: headers)
          .timeout(ApiConfig.connectionTimeout);
    }
  }

  /// Ejecuta una petición POST con manejo de interceptor
  Future<http.Response> _post(
    Uri uri,
    Map<String, String> headers,
    String body,
  ) async {
    if (_interceptor != null) {
      return await _interceptor.post(uri, headers: headers, body: body);
    } else {
      return await http
          .post(uri, headers: headers, body: body)
          .timeout(ApiConfig.connectionTimeout);
    }
  }

  /// Ejecuta una petición DELETE con manejo de interceptor
  Future<http.Response> _delete(Uri uri, Map<String, String> headers) async {
    if (_interceptor != null) {
      return await _interceptor.delete(uri, headers: headers);
    } else {
      return await http
          .delete(uri, headers: headers)
          .timeout(ApiConfig.connectionTimeout);
    }
  }

  /// Obtiene todos los favoritos del usuario
  ///
  /// Retorna: Response con JSON de favoritos
  Future<http.Response> fetchMyFavorites() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/favorites');
      final headers = ApiConfig.authHeaders(_authToken!);
      return await _get(uri, headers);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Añade un producto a favoritos
  ///
  /// Parámetros:
  /// - [productId]: ID del producto
  ///
  /// Retorna: Response con JSON del favorito creado
  Future<http.Response> addToFavorites(String productId) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/favorites');
      final headers = ApiConfig.authHeaders(_authToken!);
      final body = jsonEncode({'productId': productId});
      return await _post(uri, headers, body);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Verifica si un producto está en favoritos
  ///
  /// Parámetros:
  /// - [productId]: ID del producto
  ///
  /// Retorna: Response con resultado booleano
  Future<http.Response> checkIsFavorite(String productId) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/favorites/check/$productId');
      final headers = ApiConfig.authHeaders(_authToken!);
      return await _get(uri, headers);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Elimina un favorito por su ID
  ///
  /// Parámetros:
  /// - [favoriteId]: ID del favorito (no del producto)
  ///
  /// Retorna: Response de confirmación
  Future<http.Response> removeFromFavorites(int favoriteId) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/favorites/$favoriteId');
      final headers = ApiConfig.authHeaders(_authToken!);
      return await _delete(uri, headers);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }
}
