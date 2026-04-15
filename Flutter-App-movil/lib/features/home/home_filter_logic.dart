import 'package:proyecto_1/core/models/product.dart';
import 'package:proyecto_1/core/models/product_filters.dart';

/// Lógica para aplicar filtros locales a productos.
///
/// Esta clase contiene métodos estáticos para filtrar y ordenar productos
/// en el lado del cliente. Se usa principalmente cuando se carga desde
/// favoritos, ya que el backend de favoritos no soporta filtros complejos.
class HomeFilterLogic {
  // Constructor privado para evitar instanciación
  HomeFilterLogic._();

  /// Aplica filtros locales a una lista de productos.
  ///
  /// Este método se usa cuando se carga desde favoritos, ya que el backend
  /// de favoritos no soporta filtros complejos. Los aplicamos en el cliente.
  ///
  /// Filtros soportados:
  /// - Búsqueda por texto (nombre + descripción)
  /// - Precio mínimo y máximo
  /// - Modelo 3D (tiene/no tiene)
  /// - Color específico
  /// - Ordenamiento (nombre, precio, favoritos)
  /// - Orden ascendente/descendente
  ///
  /// Parámetros:
  /// - [products]: Lista de productos a filtrar
  /// - [filters]: Objeto con los criterios de filtro
  ///
  /// Retorna: Lista filtrada y ordenada de productos
  static List<Product> applyLocalFilters(
    List<Product> products,
    ProductFilters filters,
  ) {
    var filtered = products;

    // ========== FILTRO DE BÚSQUEDA ==========
    // Busca el término en nombre y descripción (case insensitive)
    if (filters.search != null && filters.search!.isNotEmpty) {
      filtered = _applySearchFilter(filtered, filters.search!);
    }

    // ========== FILTROS DE PRECIO ==========
    filtered = _applyPriceFilters(filtered, filters);

    // ========== FILTRO DE MODELO 3D ==========
    if (filters.hasModel3D != null) {
      filtered = _applyModel3DFilter(filtered, filters.hasModel3D!);
    }

    // ========== FILTRO DE COLOR ==========
    if (filters.colorId != null && filters.colorId!.isNotEmpty) {
      filtered = _applyColorFilter(filtered, filters.colorId!);
    }

    // ========== ORDENAMIENTO ==========
    if (filters.sortBy != null) {
      filtered = _applySorting(filtered, filters.sortBy!, filters.order);
    }

    return filtered;
  }

  /// Aplica filtro de búsqueda por texto.
  ///
  /// Busca el término en nombre y descripción del producto (case insensitive).
  ///
  /// Parámetros:
  /// - [products]: Lista de productos a filtrar
  /// - [searchTerm]: Término de búsqueda
  ///
  /// Retorna: Lista filtrada de productos que coinciden con la búsqueda
  static List<Product> _applySearchFilter(
    List<Product> products,
    String searchTerm,
  ) {
    final searchLower = searchTerm.toLowerCase();
    return products.where((product) {
      return product.name.toLowerCase().contains(searchLower) ||
          product.description.toLowerCase().contains(searchLower);
    }).toList();
  }

  /// Aplica filtros de precio mínimo y máximo.
  ///
  /// Parámetros:
  /// - [products]: Lista de productos a filtrar
  /// - [filters]: Objeto con minPrice y maxPrice
  ///
  /// Retorna: Lista filtrada por rango de precio
  static List<Product> _applyPriceFilters(
    List<Product> products,
    ProductFilters filters,
  ) {
    var filtered = products;

    // Filtro de precio mínimo
    if (filters.minPrice != null) {
      filtered = filtered.where((p) => p.price >= filters.minPrice!).toList();
    }

    // Filtro de precio máximo
    if (filters.maxPrice != null) {
      filtered = filtered.where((p) => p.price <= filters.maxPrice!).toList();
    }

    return filtered;
  }

  /// Aplica filtro de modelo 3D.
  ///
  /// Simplificado: si tiene imágenes, asumimos que puede tener modelo 3D.
  ///
  /// Parámetros:
  /// - [products]: Lista de productos a filtrar
  /// - [hasModel3D]: true para productos con modelo, false para sin modelo
  ///
  /// Retorna: Lista filtrada según disponibilidad de modelo 3D
  static List<Product> _applyModel3DFilter(
    List<Product> products,
    bool hasModel3D,
  ) {
    return products.where((product) {
      final hasModel = product.images.isNotEmpty; // Simplificado
      return hasModel3D ? hasModel : !hasModel;
    }).toList();
  }

  /// Aplica filtro de color.
  ///
  /// Busca si el producto tiene un color específico en su lista de colores.
  ///
  /// Parámetros:
  /// - [products]: Lista de productos a filtrar
  /// - [colorId]: ID del color a buscar
  ///
  /// Retorna: Lista filtrada de productos que tienen el color especificado
  static List<Product> _applyColorFilter(
    List<Product> products,
    String colorId,
  ) {
    return products.where((product) {
      return product.colors.any((color) => color.id == colorId);
    }).toList();
  }

  /// Aplica ordenamiento a la lista de productos.
  ///
  /// Ordena por nombre, precio o cantidad de favoritos.
  /// Soporta orden ascendente (ASC) y descendente (DESC).
  ///
  /// Parámetros:
  /// - [products]: Lista de productos a ordenar
  /// - [sortBy]: Campo por el cual ordenar (name, price, favoritesCount)
  /// - [order]: Dirección del orden (ASC o DESC), por defecto ASC
  ///
  /// Retorna: Lista ordenada de productos
  static List<Product> _applySorting(
    List<Product> products,
    String sortBy,
    String? order,
  ) {
    // Crear copia para no modificar la lista original
    final sorted = List<Product>.from(products);

    // Aplicar ordenamiento según el campo seleccionado
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.compareTo(b.name));
        break;
      case 'price':
        sorted.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'favoritesCount':
        sorted.sort((a, b) => a.favoritesCount.compareTo(b.favoritesCount));
        break;
      default:
        // Si el campo no es reconocido, no ordenar
        return sorted;
    }

    // Invertir orden si es descendente
    if (order == 'DESC') {
      return sorted.reversed.toList();
    }

    return sorted;
  }
}
