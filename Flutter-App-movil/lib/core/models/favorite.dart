import 'product.dart';

/// Modelo de datos para un Favorito.
///
/// Representa la relación Many-to-Many entre Usuario y Producto.
/// Cada favorito vincula un usuario específico con un producto específico.
///
/// Estructura del backend:
/// ```json
/// {
///   "id": 1,
///   "user": { "id": 1, "username": "..." },
///   "product": { "id": "uuid", "name": "...", ... }
/// }
/// ```
class Favorite {
  /// ID único del favorito (auto-increment)
  final int id;

  /// Producto asociado al favorito
  final Product product;

  /// ID del usuario (no necesitamos el objeto completo del usuario en el frontend)
  final int? userId;

  const Favorite({required this.id, required this.product, this.userId});

  /// Crea un Favorite desde JSON recibido del backend
  factory Favorite.fromJson(Map<String, dynamic> json) {
    return Favorite(
      id: json['id'] as int,
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
      userId: json['user']?['id'] as int?,
    );
  }

  /// Convierte el modelo a JSON para enviar al backend
  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': product.id,
    if (userId != null) 'userId': userId,
  };
}
