import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

/// DataSource remoto para categorías
///
/// Responsabilidad: realizar peticiones HTTP al backend
class CategoryRemoteDataSource {
  final http.Client _client;
  final String? _authToken;

  CategoryRemoteDataSource({http.Client? client, String? authToken})
    : _client = client ?? http.Client(),
      _authToken = authToken;

  /// Obtiene todas las categorías del backend
  ///
  /// Retorna: Response con JSON de categorías
  Future<http.Response> fetchAllCategories() async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.categoriesEndpoint}',
      );

      final headers = _authToken != null
          ? ApiConfig.authHeaders(_authToken)
          : ApiConfig.defaultHeaders;

      return await _client
          .get(uri, headers: headers)
          .timeout(ApiConfig.connectionTimeout);
    } catch (e) {
      throw Exception('Error de conexión: ${e.toString()}');
    }
  }

  /// Cierra el cliente HTTP
  void dispose() {
    _client.close();
  }
}
