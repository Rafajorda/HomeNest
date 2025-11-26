import '../models/product.dart';
import '../models/product_filters.dart';
import '../data/repositories/product_repository.dart';
import '../data/datasources/remote/product_remote_datasource.dart';
import './auth_interceptor.dart';

/// Excepción personalizada para errores del servicio de productos
///
/// Encapsula errores que pueden ocurrir durante operaciones con productos:
/// - Errores de red (timeout, sin conexión)
/// - Errores HTTP (404, 500, etc.)
/// - Errores de parsing de datos
class ProductException implements Exception {
  /// Mensaje descriptivo del error
  final String message;

  /// Código de estado HTTP asociado (si aplica)
  /// null si el error no es de HTTP (ej: timeout, parsing)
  final int? statusCode;

  ProductException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de productos - Capa de aplicación (Clean Architecture)
///
/// Responsabilidades:
/// - Coordinar casos de uso relacionados con productos
/// - Delegar operaciones de datos al ProductRepository
/// - Transformar excepciones técnicas en ProductException
/// - Actuar como fachada simple para la UI
///
/// Arquitectura:
/// ```
/// UI/Widgets → ProductService → ProductRepository → ProductRemoteDataSource → Backend API
/// ```
///
/// Uso típico desde un widget:
/// ```dart
/// final service = ProductService(authToken: token);
/// try {
///   final products = await service.getAllProducts();
/// } catch (e) {
///   // Manejar error
/// }
/// ```
class ProductService {
  /// Repositorio que maneja la lógica de negocio de productos
  /// Privado - solo el servicio debe acceder al repositorio
  final ProductRepository _repository;

  /// Constructor que inicializa el repositorio con sus dependencias
  ///
  /// Parámetros opcionales:
  /// - [interceptor]: Interceptor HTTP para refrescar tokens automáticamente
  /// - [authToken]: Token de autenticación para requests protegidos
  ///
  /// Crea la cadena completa de dependencias:
  /// Service → Repository → RemoteDataSource
  ProductService({AuthInterceptor? interceptor, String? authToken})
    : _repository = ProductRepository(
        ProductRemoteDataSource(interceptor: interceptor, authToken: authToken),
      );

  /// Obtiene todos los productos del catálogo
  ///
  /// Parámetros:
  /// - [filters]: Filtros opcionales (categoría, búsqueda, precio)
  ///
  /// Retorna:
  /// - Lista de productos que cumplen los filtros
  /// - Lista vacía si no hay productos
  ///
  /// Lanza:
  /// - [ProductException] si hay error de red o del servidor
  Future<List<Product>> getAllProducts([ProductFilters? filters]) async {
    try {
      return await _repository.getAllProducts(filters);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }

  /// Obtiene un producto específico por su ID
  ///
  /// Parámetros:
  /// - [id]: UUID del producto
  ///
  /// Retorna:
  /// - El producto encontrado
  ///
  /// Lanza:
  /// - [ProductException] con statusCode 404 si no existe
  /// - [ProductException] para otros errores (red, servidor)
  Future<Product> getProductById(String id) async {
    try {
      return await _repository.getProductById(id);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }

  /// Obtiene productos de una categoría específica
  ///
  /// Parámetros:
  /// - [category]: Nombre o ID de la categoría
  ///
  /// Retorna:
  /// - Lista de productos de esa categoría
  /// - Lista vacía si la categoría no tiene productos
  ///
  /// Lanza:
  /// - [ProductException] si hay error de red o del servidor
  Future<List<Product>> getProductsByCategory(String category) async {
    try {
      return await _repository.getProductsByCategory(category);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }

  /// Busca productos por texto en nombre o descripción
  ///
  /// Parámetros:
  /// - [query]: Texto a buscar (case-insensitive en el backend)
  ///
  /// Retorna:
  /// - Lista de productos que coinciden con la búsqueda
  /// - Lista vacía si no hay coincidencias
  ///
  /// Lanza:
  /// - [ProductException] si hay error de red o del servidor
  ///
  /// Nota: La búsqueda se realiza en el backend (no local)
  Future<List<Product>> searchProducts(String query) async {
    try {
      return await _repository.searchProducts(query);
    } catch (e) {
      throw ProductException(e.toString());
    }
  }
}
