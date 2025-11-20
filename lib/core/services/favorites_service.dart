import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/favorite.dart';
import './auth_interceptor.dart';

/// Excepciones para el servicio de favoritos
class FavoriteException implements Exception {
  final String message;
  final int? statusCode;

  FavoriteException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de favoritos - maneja todas las peticiones HTTP relacionadas con favoritos.
///
/// Endpoints base:
/// - `GET /favorites` - Obtener todos los favoritos del usuario
/// - `POST /favorites` - Añadir producto a favoritos
/// - `GET /favorites/check/:productId` - Verificar si producto está en favoritos
/// - `DELETE /favorites/:id` - Eliminar favorito
///
/// Características:
/// - Requiere autenticación (token JWT en headers)
/// - Incrementa/decrementa automáticamente favoritesCount del producto
/// - Previene duplicados (backend lanza ConflictException)
class FavoritesService {
  final AuthInterceptor? _interceptor;
  final String? _authToken;

  FavoritesService({AuthInterceptor? interceptor, String? authToken})
    : _interceptor = interceptor,
      _authToken = authToken;

  /// Obtiene todos los favoritos del usuario autenticado.
  ///
  /// Endpoint: `GET /favorites`
  /// Headers: `Authorization: Bearer <token>`
  ///
  /// Retorna lista de [Favorite] con productos completos (imágenes, colores, categorías).
  /// Lanza [FavoriteException] si hay error de red o no hay autenticación.
  Future<List<Favorite>> getMyFavorites() async {
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/favorites');
      final headers = ApiConfig.authHeaders(_authToken);

      http.Response response;
      if (_interceptor != null) {
        response = await _interceptor.get(url, headers: headers);
      } else {
        response = await http
            .get(url, headers: headers)
            .timeout(ApiConfig.connectionTimeout);
      }

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        // El backend puede devolver un array directamente o un objeto wrapper
        List<dynamic> data;
        if (decoded is List) {
          data = decoded;
        } else if (decoded is Map<String, dynamic>) {
          data =
              (decoded['data'] ?? decoded['favorites'] ?? []) as List<dynamic>;
        } else {
          throw FavoriteException('Formato de respuesta inesperado');
        }

        return data.map((json) => Favorite.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        throw FavoriteException('No autorizado', statusCode: 401);
      } else {
        throw FavoriteException(
          'Error al obtener favoritos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is FavoriteException) rethrow;
      throw FavoriteException('Error de conexión: ${e.toString()}');
    }
  }

  /// Añade un producto a favoritos del usuario autenticado.
  ///
  /// Endpoint: `POST /favorites`
  /// Headers: `Authorization: Bearer <token>`
  /// Body: `{"productId": "uuid-del-producto"}`
  ///
  /// Backend incrementa automáticamente `product.favoritesCount`.
  /// Lanza [FavoriteException] con código 409 si ya existe en favoritos.
  Future<Favorite> addToFavorites(String productId) async {
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/favorites');
      final headers = ApiConfig.authHeaders(_authToken);
      final body = jsonEncode({'productId': productId});

      http.Response response;
      if (_interceptor != null) {
        response = await _interceptor.post(url, headers: headers, body: body);
      } else {
        response = await http
            .post(url, headers: headers, body: body)
            .timeout(ApiConfig.connectionTimeout);
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        return Favorite.fromJson(decoded);
      } else if (response.statusCode == 409) {
        throw FavoriteException(
          'El producto ya está en favoritos',
          statusCode: 409,
        );
      } else if (response.statusCode == 401) {
        throw FavoriteException('No autorizado', statusCode: 401);
      } else if (response.statusCode == 404) {
        throw FavoriteException('Producto no encontrado', statusCode: 404);
      } else {
        throw FavoriteException(
          'Error al añadir a favoritos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is FavoriteException) rethrow;
      throw FavoriteException('Error de conexión: ${e.toString()}');
    }
  }

  /// Verifica si un producto está en favoritos del usuario.
  ///
  /// Endpoint: `GET /favorites/check/:productId`
  /// Headers: `Authorization: Bearer <token>`
  ///
  /// Retorna `true` si está en favoritos, `false` si no.
  Future<bool> isFavorite(String productId) async {
    if (_authToken == null) {
      return false; // Si no está autenticado, no puede tener favoritos
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/favorites/check/$productId');
      final headers = ApiConfig.authHeaders(_authToken);

      http.Response response;
      if (_interceptor != null) {
        response = await _interceptor.get(url, headers: headers);
      } else {
        response = await http
            .get(url, headers: headers)
            .timeout(ApiConfig.connectionTimeout);
      }

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        // El backend puede devolver: {"isFavorite": true} o simplemente true
        if (decoded is bool) {
          return decoded;
        } else if (decoded is Map<String, dynamic>) {
          return decoded['isFavorite'] == true;
        }
        return false;
      } else if (response.statusCode == 401) {
        return false;
      } else {
        return false;
      }
    } catch (e) {
      // En caso de error, asumimos que no está en favoritos
      return false;
    }
  }

  /// Elimina un favorito por su ID.
  ///
  /// Endpoint: `DELETE /favorites/:id`
  /// Headers: `Authorization: Bearer <token>`
  ///
  /// Backend decrementa automáticamente `product.favoritesCount`.
  /// Lanza [FavoriteException] si el favorito no existe o no pertenece al usuario.
  Future<void> removeFromFavorites(int favoriteId) async {
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/favorites/$favoriteId');
      final headers = ApiConfig.authHeaders(_authToken);

      http.Response response;
      if (_interceptor != null) {
        response = await _interceptor.delete(url, headers: headers);
      } else {
        response = await http
            .delete(url, headers: headers)
            .timeout(ApiConfig.connectionTimeout);
      }

      if (response.statusCode == 200 || response.statusCode == 204) {
        return; // Eliminado exitosamente
      } else if (response.statusCode == 401) {
        throw FavoriteException('No autorizado', statusCode: 401);
      } else if (response.statusCode == 404) {
        throw FavoriteException('Favorito no encontrado', statusCode: 404);
      } else {
        throw FavoriteException(
          'Error al eliminar de favoritos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is FavoriteException) rethrow;
      throw FavoriteException('Error de conexión: ${e.toString()}');
    }
  }

  /// Elimina un favorito buscando por productId (alternativa más común).
  ///
  /// Útil cuando solo tienes el productId y no el favoriteId.
  /// Primero busca el favorito en la lista local, luego lo elimina.
  Future<void> removeFromFavoritesByProductId(String productId) async {
    // Obtener todos los favoritos para encontrar el ID
    final favorites = await getMyFavorites();
    final favorite = favorites.firstWhere(
      (f) => f.product.id == productId,
      orElse: () =>
          throw FavoriteException('Producto no encontrado en favoritos'),
    );

    await removeFromFavorites(favorite.id);
  }
}
