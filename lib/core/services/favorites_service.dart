import '../models/favorite.dart';
import '../data/repositories/favorites_repository.dart';
import '../data/datasources/remote/favorites_remote_datasource.dart';
import './auth_interceptor.dart';

/// Excepción personalizada para errores del servicio de favoritos
///
/// Encapsula errores específicos de operaciones con favoritos
class FavoriteException implements Exception {
  /// Mensaje descriptivo del error
  final String message;

  /// Código de estado HTTP asociado (si aplica)
  /// Típicamente: 401 (no autenticado), 404 (no encontrado)
  final int? statusCode;

  FavoriteException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de favoritos - Capa de aplicación (Clean Architecture)
///
/// Responsabilidades:
/// - Gestionar lista de favoritos del usuario autenticado
/// - Añadir/eliminar productos de favoritos
/// - Verificar si un producto está en favoritos
/// - Validar autenticación antes de operaciones
///
/// IMPORTANTE: Todas las operaciones requieren autenticación
/// (excepto isFavorite que retorna false si no hay token)
///
/// Arquitectura:
/// ```
/// UI → FavoritesService → FavoritesRepository → FavoritesRemoteDataSource → Backend
/// ```
class FavoritesService {
  /// Repositorio que maneja la lógica de negocio de favoritos
  final FavoritesRepository _repository;

  /// Token de autenticación del usuario actual
  /// null = usuario no autenticado (guest)
  final String? _authToken;

  /// Constructor que inicializa el repositorio con sus dependencias
  ///
  /// Parámetros opcionales:
  /// - [interceptor]: Interceptor HTTP para refrescar tokens automáticamente
  /// - [authToken]: Token JWT del usuario autenticado
  FavoritesService({AuthInterceptor? interceptor, String? authToken})
    : _authToken = authToken,
      _repository = FavoritesRepository(
        FavoritesRemoteDataSource(
          interceptor: interceptor,
          authToken: authToken,
        ),
      );

  /// Obtiene todos los favoritos del usuario autenticado
  ///
  /// Retorna:
  /// - Lista de favoritos con información completa del producto
  /// - Lista vacía si el usuario no tiene favoritos
  ///
  /// Lanza:
  /// - [FavoriteException] con statusCode 401 si no está autenticado
  /// - [FavoriteException] para otros errores (red, servidor)
  ///
  /// Uso:
  /// ```dart
  /// try {
  ///   final favorites = await favoritesService.getMyFavorites();
  /// } catch (e) {
  ///   // Manejar error
  /// }
  /// ```
  Future<List<Favorite>> getMyFavorites() async {
    // Validación: usuario debe estar autenticado
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      return await _repository.getMyFavorites();
    } catch (e) {
      throw FavoriteException(e.toString());
    }
  }

  /// Añade un producto a la lista de favoritos del usuario
  ///
  /// Parámetros:
  /// - [productId]: UUID del producto a añadir
  ///
  /// Retorna:
  /// - Objeto [Favorite] creado con ID y datos del producto
  ///
  /// Lanza:
  /// - [FavoriteException] con statusCode 401 si no está autenticado
  /// - [FavoriteException] si el producto no existe o ya está en favoritos
  ///
  /// Uso:
  /// ```dart
  /// final favorite = await favoritesService.addToFavorites(productId);
  /// print('Favorito creado con ID: ${favorite.id}');
  /// ```
  Future<Favorite> addToFavorites(String productId) async {
    // Validación: usuario debe estar autenticado
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      return await _repository.addToFavorites(productId);
    } catch (e) {
      throw FavoriteException(e.toString());
    }
  }

  /// Verifica si un producto específico está en favoritos del usuario
  ///
  /// Parámetros:
  /// - [productId]: UUID del producto a verificar
  ///
  /// Retorna:
  /// - true si el producto está en favoritos
  /// - false si no está en favoritos o si no hay autenticación
  ///
  /// Nota: NO lanza excepción si no hay token (retorna false)
  /// Esto permite usar este método sin try-catch en la UI
  ///
  /// Uso:
  /// ```dart
  /// final isFav = await favoritesService.isFavorite(productId);
  /// IconButton(
  ///   icon: Icon(isFav ? Icons.favorite : Icons.favorite_border),
  /// );
  /// ```
  Future<bool> isFavorite(String productId) async {
    // Sin autenticación = no puede tener favoritos
    if (_authToken == null) {
      return false;
    }

    try {
      return await _repository.isFavorite(productId);
    } catch (e) {
      // En caso de error (red, etc.), asumir que no es favorito
      return false;
    }
  }

  /// Elimina un favorito usando su ID de favorito (no ID de producto)
  ///
  /// Parámetros:
  /// - [favoriteId]: ID numérico del registro de favorito en el backend
  ///
  /// Lanza:
  /// - [FavoriteException] con statusCode 401 si no está autenticado
  /// - [FavoriteException] si el favorito no existe o hay error de red
  ///
  /// Nota: Para eliminar por productId, usar [removeFromFavoritesByProductId]
  Future<void> removeFromFavorites(int favoriteId) async {
    // Validación: usuario debe estar autenticado
    if (_authToken == null) {
      throw FavoriteException('No autenticado', statusCode: 401);
    }

    try {
      await _repository.removeFromFavorites(favoriteId);
    } catch (e) {
      throw FavoriteException(e.toString());
    }
  }

  /// Elimina un favorito buscándolo por ID de producto
  ///
  /// Este método es más conveniente que [removeFromFavorites] cuando
  /// solo se conoce el productId (no el favoriteId).
  ///
  /// Parámetros:
  /// - [productId]: UUID del producto a eliminar de favoritos
  ///
  /// Proceso:
  /// 1. Obtiene lista de favoritos del usuario
  /// 2. Busca el favorito que corresponde al productId
  /// 3. Elimina usando el favoriteId encontrado
  ///
  /// Lanza:
  /// - [FavoriteException] si el producto no está en favoritos
  /// - [FavoriteException] con statusCode 401 si no está autenticado
  ///
  /// Uso:
  /// ```dart
  /// await favoritesService.removeFromFavoritesByProductId(product.id);
  /// ```
  Future<void> removeFromFavoritesByProductId(String productId) async {
    // Obtener favoritos actuales
    final favorites = await getMyFavorites();

    // Buscar el favorito correspondiente al productId
    final favorite = favorites.firstWhere(
      (f) => f.product.id == productId,
      orElse: () =>
          throw FavoriteException('Producto no encontrado en favoritos'),
    );

    // Eliminar usando el ID del favorito
    await removeFromFavorites(favorite.id);
  }
}
