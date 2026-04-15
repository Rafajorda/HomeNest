/// Modelo de datos para un Color de producto.
///
/// Representa un color disponible en el catálogo que puede estar asociado
/// a uno o más productos mediante una relación Many-to-Many.
///
/// Estructura del backend:
/// ```json
/// {
///   "id": "uuid-string",
///   "name": "Rojo",
///   "hexCode": "#FF0000"
/// }
/// ```
class ColorModel {
  /// ID único del color (UUID desde backend)
  final String id;

  /// Nombre descriptivo del color (ej: "Rojo", "Azul Marino")
  final String name;

  /// Código hexadecimal del color (formato: #RRGGBB)
  /// Opcional - si no se proporciona, se usa un color por defecto en la UI
  final String? hexCode;

  const ColorModel({required this.id, required this.name, this.hexCode});

  /// Crea un ColorModel desde JSON recibido del backend
  factory ColorModel.fromJson(Map<String, dynamic> json) {
    return ColorModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      hexCode: json['hexCode']?.toString(),
    );
  }

  /// Convierte el modelo a JSON para enviar al backend
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    if (hexCode != null) 'hexCode': hexCode,
  };

  /// Representación en string del color (devuelve el nombre)
  @override
  String toString() => name;
}
