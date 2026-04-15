import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';
import '../../../services/auth_interceptor.dart';

/// Excepción de la capa de datos
class DataSourceException implements Exception {
  final String message;
  final int? statusCode;

  DataSourceException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// DataSource remoto para productos
///
/// Responsabilidad: realizar peticiones HTTP al backend
/// No contiene lógica de negocio, solo comunicación con API
class ProductRemoteDataSource {
  final AuthInterceptor? _interceptor;
  final String? _authToken;

  ProductRemoteDataSource({AuthInterceptor? interceptor, String? authToken})
    : _interceptor = interceptor,
      _authToken = authToken;

  /// Ejecuta una petición GET con manejo de interceptor
  Future<http.Response> _get(Uri uri, Map<String, String> headers) async {
    if (_interceptor != null) {
      return await _interceptor.get(uri, headers: headers);
    } else {
      return await http
          .get(uri, headers: headers)
          .timeout(ApiConfig.connectionTimeout);
    }
  }

  /// Obtiene todos los productos del backend
  ///
  /// Parámetros:
  /// - [queryParameters]: Parámetros de consulta para filtros
  ///
  /// Retorna: Response con JSON de productos
  Future<http.Response> fetchAllProducts(
    Map<String, String>? queryParameters,
  ) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.productsEndpoint}',
      ).replace(queryParameters: queryParameters ?? {'status': 'active'});

      final headers = _authToken != null
          ? ApiConfig.authHeaders(_authToken)
          : ApiConfig.defaultHeaders;

      return await _get(uri, headers);
    } catch (e) {
      throw DataSourceException('Error de conexión: ${e.toString()}');
    }
  }

  /// Obtiene un producto por su ID
  ///
  /// Parámetros:
  /// - [id]: ID único del producto
  ///
  /// Retorna: Response con JSON del producto
  Future<http.Response> fetchProductById(String id) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.productByIdEndpoint(id)}',
      );

      final headers = _authToken != null
          ? ApiConfig.authHeaders(_authToken)
          : ApiConfig.defaultHeaders;

      return await _get(uri, headers);
    } catch (e) {
      throw DataSourceException('Error de conexión: ${e.toString()}');
    }
  }

  /// Obtiene productos por categoría
  ///
  /// Parámetros:
  /// - [category]: Nombre o ID de la categoría
  ///
  /// Retorna: Response con JSON de productos
  Future<http.Response> fetchProductsByCategory(String category) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.productsByCategoryEndpoint}/$category',
      );

      final headers = _authToken != null
          ? ApiConfig.authHeaders(_authToken)
          : ApiConfig.defaultHeaders;

      return await _get(uri, headers);
    } catch (e) {
      throw DataSourceException('Error de conexión: ${e.toString()}');
    }
  }

  /// Busca productos por query
  ///
  /// Parámetros:
  /// - [query]: Texto de búsqueda
  ///
  /// Retorna: Response con JSON de productos
  Future<http.Response> searchProducts(String query) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.productsEndpoint}/search',
      ).replace(queryParameters: {'q': query});

      final headers = _authToken != null
          ? ApiConfig.authHeaders(_authToken)
          : ApiConfig.defaultHeaders;

      return await _get(uri, headers);
    } catch (e) {
      throw DataSourceException('Error de conexión: ${e.toString()}');
    }
  }
}
