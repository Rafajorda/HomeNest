import '../models/product.dart';
import '../models/product_filters.dart';
import '../data/repositories/product_repository.dart';
import '../data/datasources/remote/product_remote_datasource.dart';
import './auth_interceptor.dart';

/// Excepciones para el servicio de productos
class ProductException implements Exception {
  final String message;
  final int? statusCode;

  ProductException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de productos
///
/// Capa de aplicación que coordina casos de uso
/// Usa ProductRepository para acceder a los datos
class ProductService {
  final ProductRepository _repository;

  /// Constructor que inicializa el repositorio con sus dependencias
  ProductService({AuthInterceptor? interceptor, String? authToken})
    : _repository = ProductRepository(
        ProductRemoteDataSource(interceptor: interceptor, authToken: authToken),
      );

  /// Obtiene todos los productos (opcionalmente con filtros)
  Future<List<Product>> getAllProducts([ProductFilters? filters]) async {
    try {
      return await _repository.getAllProducts(filters);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }

  /// Obtiene un producto por ID
  Future<Product> getProductById(String id) async {
    try {
      return await _repository.getProductById(id);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }

  /// Obtiene productos por categoría
  Future<List<Product>> getProductsByCategory(String category) async {
    try {
      return await _repository.getProductsByCategory(category);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }

  /// Busca productos por nombre o descripción
  Future<List<Product>> searchProducts(String query) async {
    try {
      return await _repository.searchProducts(query);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }
}
