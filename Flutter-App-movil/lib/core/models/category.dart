/// Modelo de datos para una Categoría de productos.
///
/// Representa una categoría del catálogo que agrupa productos relacionados.
/// El backend puede enviar IDs como números enteros o UUIDs, este modelo
/// maneja ambos casos automáticamente.
///
/// Estructura del backend:
/// ```json
/// {
///   "id": 1,  // o "uuid-string"
///   "name": "Electrónica",
///   "status": "active"
/// }
/// ```
class Category {
  /// ID numérico de la categoría (convertido desde UUID si es necesario)
  /// Se usa para identificación local y filtrado en la UI
  final int id;

  /// Nombre descriptivo de la categoría (ej: "Electrónica", "Ropa")
  final String name;

  /// UUID original del backend (si el backend usa UUIDs)
  /// Se preserva para mantener compatibilidad con el backend
  final String? uuid;

  /// Estado de la categoría: 'active', 'inactive', 'archived', etc.
  /// Opcional - permite al backend gestionar categorías desactivadas
  final String? status;

  const Category({
    required this.id,
    required this.name,
    this.uuid,
    this.status,
  });

  /// Crea una Category desde JSON recibido del backend
  ///
  /// Maneja diferentes formatos de ID:
  /// - Entero directo: 123
  /// - String numérico: "123"
  /// - UUID: "550e8400-e29b-41d4-a716-446655440000" (usa hashCode)
  factory Category.fromJson(Map<String, dynamic> json) {
    /// Helper: Parsea el ID que puede venir en diferentes formatos
    ///
    /// Estrategia de conversión:
    /// 1. Si es null → retorna 0
    /// 2. Si es int → retorna el valor directo
    /// 3. Si es String numérico → parsea a int
    /// 4. Si es UUID → usa hashCode como int temporal
    int parseId(dynamic idValue) {
      if (idValue == null) return 0;
      if (idValue is int) return idValue;
      if (idValue is String) {
        // Intentar parsear como número
        final parsed = int.tryParse(idValue);
        if (parsed != null) return parsed;
        // Si no es número (probablemente UUID), usar hashCode
        // Nota: El hashCode puede colisionar, pero es suficiente para uso local
        return idValue.hashCode;
      }
      return 0;
    }

    return Category(
      id: parseId(json['id']),
      name: json['name']?.toString() ?? '',
      uuid: json['id']?.toString(), // Preservar UUID original
      status: json['status']?.toString(),
    );
  }

  /// Convierte el modelo a JSON para enviar al backend
  ///
  /// Solo incluye campos opcionales si tienen valor (uso de if)
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    if (uuid != null) 'uuid': uuid,
    if (status != null) 'status': status,
  };
}
