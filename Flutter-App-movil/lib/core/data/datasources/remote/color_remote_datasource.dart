import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

/// DataSource remoto para colores
///
/// Responsabilidad: realizar peticiones HTTP al backend
class ColorRemoteDataSource {
  final http.Client _client;
  final String? _authToken;

  ColorRemoteDataSource({http.Client? client, String? authToken})
    : _client = client ?? http.Client(),
      _authToken = authToken;

  /// Obtiene todos los colores del backend
  ///
  /// Retorna: Response con JSON de colores
  Future<http.Response> fetchAllColors() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/color');

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
