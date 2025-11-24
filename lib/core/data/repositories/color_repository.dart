import 'dart:convert';
import '../../models/color.dart';
import '../datasources/remote/color_remote_datasource.dart';

/// Excepción del repositorio de colores
class ColorRepositoryException implements Exception {
  final String message;
  final int? statusCode;

  ColorRepositoryException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Repositorio de colores
///
/// Responsabilidad: lógica de negocio y transformación de datos
class ColorRepository {
  final ColorRemoteDataSource _dataSource;

  ColorRepository(this._dataSource);

  /// Obtiene todos los colores
  ///
  /// Retorna: Lista de colores parseados
  Future<List<ColorModel>> getAllColors() async {
    try {
      final response = await _dataSource.fetchAllColors();

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        // Manejar diferentes formatos de respuesta
        List<dynamic> data;

        if (decoded is List) {
          data = decoded;
        } else if (decoded is Map<String, dynamic>) {
          if (decoded.containsKey('data')) {
            data = decoded['data'] as List<dynamic>;
          } else if (decoded.containsKey('colors')) {
            data = decoded['colors'] as List<dynamic>;
          } else if (decoded.containsKey('items')) {
            data = decoded['items'] as List<dynamic>;
          } else {
            data = [decoded];
          }
        } else {
          throw ColorRepositoryException('Formato de respuesta inesperado');
        }

        return data.map((json) => ColorModel.fromJson(json)).toList();
      } else {
        throw ColorRepositoryException(
          'Error al obtener colores',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ColorRepositoryException) rethrow;
      throw ColorRepositoryException('Error: ${e.toString()}');
    }
  }
}
