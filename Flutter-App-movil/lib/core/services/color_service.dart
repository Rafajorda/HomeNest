import 'package:http/http.dart' as http;
import '../models/color.dart';
import '../data/repositories/color_repository.dart';
import '../data/datasources/remote/color_remote_datasource.dart';

/// Excepción personalizada para errores del servicio de colores
///
/// Encapsula errores durante operaciones con colores del catálogo
class ColorException implements Exception {
  /// Mensaje descriptivo del error
  final String message;

  /// Código de estado HTTP asociado (si aplica)
  final int? statusCode;

  ColorException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de colores - Capa de aplicación (Clean Architecture)
///
/// Responsabilidades:
/// - Coordinar casos de uso relacionados con colores de productos
/// - Delegar operaciones al ColorRepository
/// - Gestionar ciclo de vida de recursos HTTP (dispose)
/// - Transformar excepciones técnicas en ColorException
///
/// Los colores se usan en:
/// - Filtrado de productos por color
/// - Visualización de colores disponibles en detalle de producto
/// - Chips de selección de color en la UI
///
/// Arquitectura:
/// ```
/// UI → ColorService → ColorRepository → ColorRemoteDataSource → Backend
/// ```
class ColorService {
  /// Repositorio que maneja la lógica de negocio de colores
  final ColorRepository _repository;

  /// DataSource para gestionar recursos HTTP
  /// Se mantiene referencia para poder hacer dispose()
  final ColorRemoteDataSource _dataSource;

  /// Constructor que inicializa el repositorio y datasource
  ///
  /// Parámetros opcionales:
  /// - [client]: Cliente HTTP personalizado (útil para testing con mocks)
  /// - [authToken]: Token de autenticación si el endpoint lo requiere
  ColorService({http.Client? client, String? authToken})
    : _dataSource = ColorRemoteDataSource(client: client, authToken: authToken),
      _repository = ColorRepository(
        ColorRemoteDataSource(client: client, authToken: authToken),
      );

  /// Obtiene todos los colores disponibles en el catálogo
  ///
  /// Los colores incluyen:
  /// - ID único (UUID)
  /// - Nombre descriptivo ("Rojo", "Azul Marino")
  /// - Código hexadecimal (#RRGGBB) para renderizado
  ///
  /// Retorna:
  /// - Lista de colores activos en el catálogo
  /// - Lista vacía si no hay colores disponibles
  ///
  /// Lanza:
  /// - [ColorException] si hay error de red o respuesta inválida del servidor
  ///
  /// Uso típico:
  /// ```dart
  /// final colors = await colorService.getAllColors();
  /// for (var color in colors) {
  ///   print('${color.name}: ${color.hexCode}');
  /// }
  /// ```
  Future<List<ColorModel>> getAllColors() async {
    try {
      return await _repository.getAllColors();
    } catch (e) {
      throw ColorException(e.toString());
    }
  }

  /// Libera recursos del cliente HTTP
  ///
  /// IMPORTANTE: Llamar cuando el servicio ya no se use
  /// para evitar memory leaks y conexiones abiertas.
  ///
  /// Uso típico en StatefulWidget:
  /// ```dart
  /// @override
  /// void dispose() {
  ///   colorService.dispose();
  ///   super.dispose();
  /// }
  /// ```
  void dispose() {
    _dataSource.dispose();
  }
}
