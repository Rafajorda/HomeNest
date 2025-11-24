import '../models/favorite.dart';
import '../data/repositories/favorites_repository.dart';
import '../data/datasources/remote/favorites_remote_datasource.dart';
import './auth_interceptor.dart';

/// Excepciones para el servicio de favoritos
class FavoriteException implements Exception {
  final String message;
  final int? statusCode;

  FavoriteException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de favoritos
///
/// Capa de aplicación que coordina casos de uso de favoritos
class FavoritesService {
  final FavoritesRepository _repository;
  final String? _authToken;

  /// Constructor que inicializa el repositorio con sus dependencias
  FavoritesService({AuthInterceptor? interceptor, String? authToken})
    : _authToken = authToken,
      _repository = FavoritesRepository(
        FavoritesRemoteDataSource(
          interceptor: interceptor,
          authToken: authToken,
        ),
      );

  /// Obtiene todos los favoritos del usuario autenticado
  Future<List<Favorite>> getMyFavorites() async {
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      return await _repository.getMyFavorites();
    } catch (e) {
      throw FavoriteException(e.toString());
    }
  }

  /// Añade un producto a favoritos
  Future<Favorite> addToFavorites(String productId) async {
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      return await _repository.addToFavorites(productId);
    } catch (e) {
      throw FavoriteException(e.toString());
    }
  }

  /// Verifica si un producto está en favoritos
  Future<bool> isFavorite(String productId) async {
    if (_authToken == null) {
      return false;
    }

    try {
      return await _repository.isFavorite(productId);
    } catch (e) {
      return false;
    }
  }

  /// Elimina un favorito por su ID
  Future<void> removeFromFavorites(int favoriteId) async {
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      await _repository.removeFromFavorites(favoriteId);
    } catch (e) {
      throw FavoriteException(e.toString());
    }
  }

  /// Elimina un favorito buscando por productId
  Future<void> removeFromFavoritesByProductId(String productId) async {
    final favorites = await getMyFavorites();
    final favorite = favorites.firstWhere(
      (f) => f.product.id == productId,
      orElse: () =>
          throw FavoriteException('Producto no encontrado en favoritos'),
    );

    await removeFromFavorites(favorite.id);
  }
}
