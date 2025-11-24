import 'package:http/http.dart' as http;
import '../models/color.dart';
import '../data/repositories/color_repository.dart';
import '../data/datasources/remote/color_remote_datasource.dart';

/// Excepciones para el servicio de colores
class ColorException implements Exception {
  final String message;
  final int? statusCode;

  ColorException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de colores
///
/// Capa de aplicación que coordina casos de uso
class ColorService {
  final ColorRepository _repository;
  final ColorRemoteDataSource _dataSource;

  /// Constructor que inicializa el repositorio
  ColorService({http.Client? client, String? authToken})
    : _dataSource = ColorRemoteDataSource(client: client, authToken: authToken),
      _repository = ColorRepository(
        ColorRemoteDataSource(client: client, authToken: authToken),
      );

  /// Obtiene todos los colores disponibles desde el backend
  ///
  /// Lanza [ColorException] si hay error de red o respuesta inválida
  Future<List<ColorModel>> getAllColors() async {
    try {
      return await _repository.getAllColors();
    } catch (e) {
      throw ColorException(e.toString());
    }
  }

  /// Cierra el cliente HTTP
  void dispose() {
    _dataSource.dispose();
  }
}
