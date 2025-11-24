import 'package:http/http.dart' as http;
import '../models/category.dart';
import '../data/repositories/category_repository.dart';
import '../data/datasources/remote/category_remote_datasource.dart';

/// Excepciones para el servicio de categorías
class CategoryException implements Exception {
  final String message;
  final int? statusCode;

  CategoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de categorías
///
/// Capa de aplicación que coordina casos de uso
class CategoryService {
  final CategoryRepository _repository;
  final CategoryRemoteDataSource _dataSource;

  /// Constructor que inicializa el repositorio
  CategoryService({http.Client? client, String? authToken})
    : _dataSource = CategoryRemoteDataSource(
        client: client,
        authToken: authToken,
      ),
      _repository = CategoryRepository(
        CategoryRemoteDataSource(client: client, authToken: authToken),
      );

  /// Obtiene todas las categorías
  Future<List<Category>> getAllCategories() async {
    try {
      return await _repository.getAllCategories();
    } catch (e) {
      throw CategoryException(e.toString());
    }
  }

  /// Cierra el cliente HTTP
  void dispose() {
    _dataSource.dispose();
  }
}
