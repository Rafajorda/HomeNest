import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../config/api_config.dart';

/// Servicio para descargar y gestionar modelos 3D (.glb) desde el backend
class Model3DService {
  /// Descarga un modelo 3D desde el backend y lo guarda localmente
  ///
  /// [model3DPath] - Ruta del modelo en el backend (ej: 'uploads/models/producto.glb')
  /// Retorna la ruta local del archivo descargado
  static Future<String?> downloadModel(String? model3DPath) async {
    if (model3DPath == null || model3DPath.isEmpty) {
      debugPrint('[Model3D] ⚠️ No hay modelo 3D para descargar');
      return null;
    }

    try {
      debugPrint('[Model3D] 📥 Iniciando descarga: $model3DPath');

      // Construir URL completa usando ApiConfig
      final url = '${ApiConfig.baseUrl}/$model3DPath';
      debugPrint('[Model3D] 🌐 URL: $url');

      // Descargar el archivo
      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        debugPrint('[Model3D] ❌ Error HTTP: ${response.statusCode}');
        return null;
      }

      debugPrint(
        '[Model3D] ✅ Descarga exitosa: ${response.bodyBytes.length} bytes',
      );

      // Obtener directorio de documentos de la app
      final directory = await getApplicationDocumentsDirectory();

      // Extraer nombre del archivo
      final fileName = model3DPath.split('/').last;
      final filePath = '${directory.path}/$fileName';

      debugPrint('[Model3D] 💾 Guardando en: $filePath');

      // Guardar archivo
      final file = File(filePath);
      await file.writeAsBytes(response.bodyBytes);

      debugPrint('[Model3D] ✅ Modelo guardado exitosamente');

      // Retornar solo el nombre del archivo (no la ruta completa)
      // El plugin AR lo necesita así
      return fileName;
    } catch (e, stackTrace) {
      debugPrint('[Model3D] ❌ Error descargando modelo: $e');
      debugPrint('[Model3D] 📋 Stack trace: $stackTrace');
      return null;
    }
  }

  /// Verifica si un modelo ya está descargado localmente
  ///
  /// [fileName] - Nombre del archivo .glb
  /// Retorna true si el archivo existe localmente
  static Future<bool> isModelCached(String fileName) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/$fileName');
      final exists = await file.exists();
      debugPrint(
        '[Model3D] 📂 Archivo $fileName ${exists ? 'existe' : 'no existe'} en caché',
      );
      return exists;
    } catch (e) {
      debugPrint('[Model3D] ❌ Error verificando caché: $e');
      return false;
    }
  }

  /// Elimina un modelo descargado del almacenamiento local
  ///
  /// [fileName] - Nombre del archivo .glb a eliminar
  static Future<void> deleteModel(String fileName) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/$fileName');

      if (await file.exists()) {
        await file.delete();
        debugPrint('[Model3D] 🗑️ Modelo $fileName eliminado');
      }
    } catch (e) {
      debugPrint('[Model3D] ❌ Error eliminando modelo: $e');
    }
  }

  /// Limpia todos los modelos descargados
  static Future<void> clearCache() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final files = directory.listSync();

      for (var file in files) {
        if (file.path.endsWith('.glb')) {
          await file.delete();
          debugPrint('[Model3D] 🗑️ Eliminado: ${file.path}');
        }
      }

      debugPrint('[Model3D] ✅ Caché de modelos limpiada');
    } catch (e) {
      debugPrint('[Model3D] ❌ Error limpiando caché: $e');
    }
  }
}
