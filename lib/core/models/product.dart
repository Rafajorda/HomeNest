import 'color.dart';

/// Modelo de datos para un Producto.
///
/// Representa un producto en el catálogo con toda su información:
/// - Datos básicos: nombre, descripción, precio
/// - Multimedia: imágenes, dimensiones
/// - Clasificación: categorías, colores, estado
/// - Engagement: contador de favoritos
class Product {
  /// ID único del producto (UUID desde backend)
  final String id;

  /// Nombre del producto
  final String name;

  /// Descripción detallada del producto
  final String description;

  /// Precio del producto en formato decimal
  final double price;

  /// Lista de colores disponibles para este producto (relación Many-to-Many)
  final List<ColorModel> colors;

  /// Dimensiones físicas del producto (formato texto, ej: "10x20x5 cm")
  final String dimensions;

  /// Cantidad de usuarios que han marcado este producto como favorito
  final int favoritesCount;

  /// Estado del producto: 'active', 'inactive', 'discontinued', etc.
  final String status;

  /// IDs de las categorías a las que pertenece el producto
  final List<int> categories;

  /// URLs de las imágenes del producto (múltiples imágenes soportadas)
  final List<String> images;

  /// Ruta del modelo 3D (.glb) del producto
  final String? model3DPath;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.colors,
    required this.dimensions,
    required this.favoritesCount,
    required this.status,
    required this.categories,
    required this.images,
    this.model3DPath,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    /// Helper: Parsea el precio que puede venir en diferentes formatos desde el backend
    /// - Como número: 123.45
    /// - Como string: "123.45"
    /// - Como null: retorna 0.0
    double parsePrice(dynamic priceValue) {
      if (priceValue == null) return 0.0;
      if (priceValue is num) return priceValue.toDouble();
      if (priceValue is String) {
        return double.tryParse(priceValue) ?? 0.0;
      }
      return 0.0;
    }

    /// Helper: Parsea las categorías que pueden venir en diferentes formatos:
    /// - Array de números: [1, 2, 3]
    /// - Array de strings: ["1", "2", "3"]
    /// - Array de objetos: [{"id": "uuid", "name": "..."}]
    /// En el caso de objetos, se usa el hashCode del UUID como int temporal
    List<int> parseCategories(dynamic categoriesValue) {
      if (categoriesValue == null) return [];
      if (categoriesValue is! List) return [];

      List<int> result = [];
      for (var item in categoriesValue) {
        if (item is int) {
          // Caso 1: Array de números [1, 2, 3]
          result.add(item);
        } else if (item is String) {
          // Caso 2: Array de strings ["1", "2", "3"]
          final parsed = int.tryParse(item);
          if (parsed != null) result.add(parsed);
        } else if (item is Map<String, dynamic>) {
          // Caso 3: Array de objetos [{"id": "uuid", "name": "..."}]
          // Por ahora, usar hashCode del id como int
          final id = item['id']?.toString() ?? '';
          if (id.isNotEmpty) {
            result.add(id.hashCode);
          }
        }
      }
      return result;
    }

    /// Helper: Parsea las imágenes que pueden venir en diferentes formatos:
    /// - Array de URLs: ["https://...", "https://..."]
    /// - Array de objetos: [{"src": "https://..."}, {"url": "https://..."}]
    /// Soporta múltiples nombres de campo: src, url, path, imageUrl
    List<String> parseImages(dynamic imagesValue) {
      if (imagesValue == null) return [];
      if (imagesValue is! List) return [];

      List<String> result = [];
      for (var item in imagesValue) {
        if (item is String) {
          // Caso 1: URL directa como string
          result.add(item);
        } else if (item is Map<String, dynamic>) {
          // Caso 2: Objeto con campo de URL
          // Intentar diferentes nombres de campo comunes
          final url =
              item['src'] ?? // Backend actual: { "src": "..." }
              item['url'] ?? // Alternativa: { "url": "..." }
              item['path'] ?? // Alternativa: { "path": "..." }
              item['imageUrl'] ?? // Alternativa: { "imageUrl": "..." }
              '';
          if (url is String && url.isNotEmpty) {
            result.add(url);
          }
        }
      }
      return result;
    }

    /// Helper: Parsea los colores desde el array de objetos Color del backend.
    /// Cada color tiene: id (UUID), name (String), hexCode (String opcional)
    /// Si un color falla al parsearse, se omite y continúa con el siguiente.
    List<ColorModel> parseColors(dynamic colorsValue) {
      if (colorsValue == null) return [];
      if (colorsValue is! List) return [];

      List<ColorModel> result = [];
      for (var item in colorsValue) {
        if (item is Map<String, dynamic>) {
          try {
            result.add(ColorModel.fromJson(item));
          } catch (e) {
            // Si falla el parsing, continuar con el siguiente
            continue;
          }
        }
      }
      return result;
    }

    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: parsePrice(json['price']),
      colors: parseColors(json['colors']),
      dimensions: json['dimensions']?.toString() ?? '',
      favoritesCount: json['favoritesCount'] is int
          ? json['favoritesCount']
          : (int.tryParse(json['favoritesCount']?.toString() ?? '0') ?? 0),
      status: json['status']?.toString() ?? 'active',
      categories: parseCategories(json['categories']),
      images: parseImages(json['images']),
      model3DPath: json['model3DPath']?.toString(),
    );
  }
}
