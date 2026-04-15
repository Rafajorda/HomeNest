import 'dart:convert';
import '../../models/product.dart';
import '../../models/product_filters.dart';
import '../datasources/remote/product_remote_datasource.dart';

/// Excepción del repositorio de productos
class ProductRepositoryException implements Exception {
  final String message;
  final int? statusCode;

  ProductRepositoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Repositorio de productos
///
/// Responsabilidad: contener la lógica de negocio y transformar datos
/// Usa ProductRemoteDataSource para comunicación HTTP
class ProductRepository {
  final ProductRemoteDataSource _dataSource;

  ProductRepository(this._dataSource);

  /// Obtiene todos los productos (con filtros opcionales)
  ///
  /// Parámetros:
  /// - [filters]: Objeto con criterios de filtrado
  ///
  /// Retorna: Lista de productos parseados
  Future<List<Product>> getAllProducts([ProductFilters? filters]) async {
    try {
      final response = await _dataSource.fetchAllProducts(
        filters?.toQueryParameters(),
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        // Lógica para manejar diferentes formatos de respuesta del backend
        List<dynamic> data;

        if (decoded is List) {
          // Array directo
          data = decoded;
        } else if (decoded is Map<String, dynamic>) {
          // Objeto con campo "data", "products" o "items"
          if (decoded.containsKey('data')) {
            data = decoded['data'] as List<dynamic>;
          } else if (decoded.containsKey('products')) {
            data = decoded['products'] as List<dynamic>;
          } else if (decoded.containsKey('items')) {
            data = decoded['items'] as List<dynamic>;
          } else {
            // Objeto único, convertir a array
            data = [decoded];
          }
        } else {
          throw ProductRepositoryException('Formato de respuesta inesperado');
        }

        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw ProductRepositoryException(
          'Error al obtener productos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ProductRepositoryException) rethrow;
      throw ProductRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Obtiene un producto por su ID
  ///
  /// Parámetros:
  /// - [id]: ID único del producto
  ///
  /// Retorna: Producto parseado
  Future<Product> getProductById(String id) async {
    try {
      final response = await _dataSource.fetchProductById(id);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Product.fromJson(data);
      } else if (response.statusCode == 404) {
        throw ProductRepositoryException(
          'Producto no encontrado',
          statusCode: 404,
        );
      } else {
        throw ProductRepositoryException(
          'Error al obtener producto',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ProductRepositoryException) rethrow;
      throw ProductRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Obtiene productos por categoría
  ///
  /// Parámetros:
  /// - [category]: Nombre o ID de categoría
  ///
  /// Retorna: Lista de productos de esa categoría
  Future<List<Product>> getProductsByCategory(String category) async {
    try {
      final response = await _dataSource.fetchProductsByCategory(category);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw ProductRepositoryException(
          'Error al obtener productos por categoría',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ProductRepositoryException) rethrow;
      throw ProductRepositoryException('Error: ${e.toString()}');
    }
  }

  /// Busca productos por texto
  ///
  /// Parámetros:
  /// - [query]: Texto de búsqueda
  ///
  /// Retorna: Lista de productos que coinciden con la búsqueda
  Future<List<Product>> searchProducts(String query) async {
    try {
      final response = await _dataSource.searchProducts(query);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw ProductRepositoryException(
          'Error al buscar productos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ProductRepositoryException) rethrow;
      throw ProductRepositoryException('Error: ${e.toString()}');
    }
  }
}
