import 'package:http/http.dart' as http;
import '../models/category.dart';
import '../data/repositories/category_repository.dart';
import '../data/datasources/remote/category_remote_datasource.dart';

/// Excepción personalizada para errores del servicio de categorías
///
/// Encapsula errores durante operaciones con categorías del catálogo
class CategoryException implements Exception {
  /// Mensaje descriptivo del error
  final String message;

  /// Código de estado HTTP asociado (si aplica)
  final int? statusCode;

  CategoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de categorías - Capa de aplicación (Clean Architecture)
///
/// Responsabilidades:
/// - Coordinar casos de uso relacionados con categorías
/// - Delegar operaciones al CategoryRepository
/// - Gestionar ciclo de vida de recursos HTTP (dispose)
/// - Transformar excepciones técnicas en CategoryException
///
/// Arquitectura:
/// ```
/// UI → CategoryService → CategoryRepository → CategoryRemoteDataSource → Backend
/// ```
class CategoryService {
  /// Repositorio que maneja la lógica de negocio de categorías
  final CategoryRepository _repository;

  /// DataSource para gestionar recursos HTTP
  /// Se mantiene referencia para poder hacer dispose()
  final CategoryRemoteDataSource _dataSource;

  /// Constructor que inicializa el repositorio y datasource
  ///
  /// Parámetros opcionales:
  /// - [client]: Cliente HTTP personalizado (útil para testing)
  /// - [authToken]: Token de autenticación si el endpoint lo requiere
  CategoryService({http.Client? client, String? authToken})
    : _dataSource = CategoryRemoteDataSource(
        client: client,
        authToken: authToken,
      ),
      _repository = CategoryRepository(
        CategoryRemoteDataSource(client: client, authToken: authToken),
      );

  /// Obtiene todas las categorías disponibles en el catálogo
  ///
  /// Retorna:
  /// - Lista de categorías activas
  /// - Lista vacía si no hay categorías
  ///
  /// Lanza:
  /// - [CategoryException] si hay error de red o del servidor
  ///
  /// Uso:
  /// ```dart
  /// final categories = await categoryService.getAllCategories();
  /// ```
  Future<List<Category>> getAllCategories() async {
    try {
      return await _repository.getAllCategories();
    } catch (e) {
      throw CategoryException(e.toString());
    }
  }

  /// Libera recursos del cliente HTTP
  ///
  /// IMPORTANTE: Llamar cuando el servicio ya no se use
  /// para evitar memory leaks.
  ///
  /// Uso típico en StatefulWidget:
  /// ```dart
  /// @override
  /// void dispose() {
  ///   categoryService.dispose();
  ///   super.dispose();
  /// }
  /// ```
  void dispose() {
    _dataSource.dispose();
  }
}
