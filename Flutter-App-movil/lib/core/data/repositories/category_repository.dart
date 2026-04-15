import 'dart:convert';
import '../../models/category.dart';
import '../datasources/remote/category_remote_datasource.dart';

/// Excepción del repositorio de categorías
class CategoryRepositoryException implements Exception {
  final String message;
  final int? statusCode;

  CategoryRepositoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Repositorio de categorías
///
/// Responsabilidad: lógica de negocio y transformación de datos
class CategoryRepository {
  final CategoryRemoteDataSource _dataSource;

  CategoryRepository(this._dataSource);

  /// Obtiene todas las categorías
  ///
  /// Retorna: Lista de categorías parseadas
  Future<List<Category>> getAllCategories() async {
    try {
      final response = await _dataSource.fetchAllCategories();

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        // Manejar diferentes formatos de respuesta
        List<dynamic> data;

        if (decoded is List) {
          data = decoded;
        } else if (decoded is Map<String, dynamic>) {
          if (decoded.containsKey('data')) {
            data = decoded['data'] as List<dynamic>;
          } else if (decoded.containsKey('categories')) {
            data = decoded['categories'] as List<dynamic>;
          } else if (decoded.containsKey('items')) {
            data = decoded['items'] as List<dynamic>;
          } else {
            data = [decoded];
          }
        } else {
          throw CategoryRepositoryException('Formato de respuesta inesperado');
        }

        return data.map((json) => Category.fromJson(json)).toList();
      } else {
        throw CategoryRepositoryException(
          'Error al obtener categorías',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is CategoryRepositoryException) rethrow;
      throw CategoryRepositoryException('Error: ${e.toString()}');
    }
  }
}
