import 'package:flutter/material.dart';
import 'package:proyecto_1/core/models/product.dart';
import 'package:proyecto_1/core/widgets/products/card_product.dart';
import 'package:proyecto_1/core/config/api_config.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';

class ProductGrid extends StatelessWidget {
  final List<Product> products;
  final Set<String>? favoriteProductIds;
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
