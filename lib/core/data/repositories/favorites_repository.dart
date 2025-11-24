import 'dart:convert';
import '../../models/favorite.dart';
import '../datasources/remote/favorites_remote_datasource.dart';

/// Excepción del repositorio de favoritos
class FavoritesRepositoryException implements Exception {
  final String message;
  final int? statusCode;

  FavoritesRepositoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Repositorio de favoritos
///
/// Responsabilidad: lógica de negocio y transformación de datos
class FavoritesRepository {
  final FavoritesRemoteDataSource _dataSource;

  FavoritesRepository(this._dataSource);

  /// Obtiene todos los favoritos del usuario
  ///
  /// Retorna: Lista de favoritos parseados
  Future<List<Favorite>> getMyFavorites() async {
    try {
      final response = await _dataSource.fetchMyFavorites();

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        // Manejar diferentes formatos de respuesta
        List<dynamic> data;
        if (decoded is List) {
          data = decoded;
        } else if (decoded is Map<String, dynamic>) {
          data =
              (decoded['data'] ?? decoded['favorites'] ?? []) as List<dynamic>;
        } else {
          throw FavoritesRepositoryException('Formato de respuesta inesperado');
        }

        return data.map((json) => Favorite.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        throw FavoritesRepositoryException('No autorizado', statusCode: 401);
      } else {
        throw FavoritesRepositoryException(
          'Error al obtener favoritos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is FavoritesRepositoryException) rethrow;
      throw FavoritesRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Añade un producto a favoritos
  ///
  /// Parámetros:
  /// - [productId]: ID del producto
  ///
  /// Retorna: Favorito creado
  Future<Favorite> addToFavorites(String productId) async {
    try {
      final response = await _dataSource.addToFavorites(productId);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return Favorite.fromJson(data);
      } else if (response.statusCode == 409) {
        throw FavoritesRepositoryException(
          'El producto ya está en favoritos',
          statusCode: 409,
        );
      } else if (response.statusCode == 401) {
        throw FavoritesRepositoryException('No autorizado', statusCode: 401);
      } else {
        throw FavoritesRepositoryException(
          'Error al añadir a favoritos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is FavoritesRepositoryException) rethrow;
      throw FavoritesRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Verifica si un producto está en favoritos
  ///
  /// Parámetros:
  /// - [productId]: ID del producto
  ///
  /// Retorna: true si está en favoritos
  Future<bool> isFavorite(String productId) async {
    try {
      final response = await _dataSource.checkIsFavorite(productId);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['isFavorite'] ?? false;
      } else if (response.statusCode == 401) {
        throw FavoritesRepositoryException('No autorizado', statusCode: 401);
      } else {
        return false; // Por defecto no está en favoritos si hay error
      }
    } catch (e) {
      if (e is FavoritesRepositoryException) rethrow;
      return false;
    }
  }

  /// Elimina un favorito
  ///
  /// Parámetros:
  /// - [favoriteId]: ID del favorito (no del producto)
  ///
  /// Retorna: true si fue exitoso
  Future<bool> removeFromFavorites(int favoriteId) async {
    try {
      final response = await _dataSource.removeFromFavorites(favoriteId);

      if (response.statusCode == 200 || response.statusCode == 204) {
        return true;
      } else if (response.statusCode == 401) {
        throw FavoritesRepositoryException('No autorizado', statusCode: 401);
      } else if (response.statusCode == 404) {
        throw FavoritesRepositoryException(
          'Favorito no encontrado',
          statusCode: 404,
        );
      } else {
        throw FavoritesRepositoryException(
          'Error al eliminar favorito',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is FavoritesRepositoryException) rethrow;
      throw FavoritesRepositoryException('Error: ${e.toString()}');
    }
  }
}
