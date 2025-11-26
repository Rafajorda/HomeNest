import 'package:flutter/material.dart';
import 'package:proyecto_1/core/models/product.dart';
import 'package:proyecto_1/core/widgets/products/card_product.dart';
import 'package:proyecto_1/core/config/api_config.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';

/// Grid de productos con diseño responsive
///
/// Características:
/// - **Diseño adaptativo**: Usa `maxCrossAxisExtent: 300` para que el grid
///   se ajuste según el ancho de pantalla (móvil: 2 columnas, tablet: 3+)
/// - **Aspect ratio 0.45**: Tarjetas verticales (altura > ancho)
/// - **Gestión de imágenes**: Construye URLs correctas desde paths relativos
/// - **Favoritos**: Muestra corazón rojo si el producto está en favoritos
/// - **Callback onReturn**: Refresca lista al volver de detalles
///
/// Manejo de imágenes:
/// 1. Si product.images está vacío → Usa placeholder local
/// 2. Si URL comienza con "/" → Construye URL completa (baseUrl + path)
/// 3. Si URL comienza con "http" → La usa directamente
/// 4. Caso contrario → Asume que es asset local
///
/// Espaciado:
/// - 12px entre cards (crossAxisSpacing y mainAxisSpacing)
/// - 12px de padding exterior
///
/// Ejemplo de uso:
/// ```dart
/// ProductGrid(
///   products: productList,
///   favoriteProductIds: {'uuid-1', 'uuid-2'},
///   onProductReturn: () => _refreshProducts(),
/// )
/// ```
class ProductGrid extends StatelessWidget {
  /// Lista de productos a mostrar en el grid
  final List<Product> products;

  /// Set de IDs de productos marcados como favoritos (opcional)
  final Set<String>? favoriteProductIds;

  /// Callback ejecutado cuando el usuario vuelve de la página de detalles
  /// (útil para refrescar favoritos o datos)
  final VoidCallback? onProductReturn;

  const ProductGrid({
    super.key,
    required this.products,
    this.favoriteProductIds,
    this.onProductReturn,
  });

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return Center(child: Text(context.loc!.noProductsAvailable));
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth == 0) return const SizedBox.shrink();

        return Padding(
          padding: const EdgeInsets.all(12),
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 300,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.45,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];

              // Usar la primera imagen del producto, o placeholder si no hay
              String imageUrl;
              if (product.images.isEmpty) {
                imageUrl = 'assets/images/placeholder.png';
              } else {
                final rawUrl = product.images.first;
                // Si la URL es relativa (comienza con /), agregar el baseUrl
                if (rawUrl.startsWith('/')) {
                  imageUrl = '${ApiConfig.baseUrl}$rawUrl';
                } else if (rawUrl.startsWith('http://') ||
                    rawUrl.startsWith('https://')) {
                  // Ya es una URL completa
                  imageUrl = rawUrl;
                } else {
                  // Es un asset local
                  imageUrl = rawUrl;
                }
              }

              return ProductCard(
                title: product.name,
                description: product.description,
                price: product.price,
                imageUrl: imageUrl,
                product: product,
                isFavorite: favoriteProductIds?.contains(product.id) ?? false,
                onReturn: onProductReturn,
              );
            },
          ),
        );
      },
    );
  }
}
