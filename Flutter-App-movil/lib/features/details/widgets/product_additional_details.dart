import 'package:flutter/material.dart';
import '../../../core/models/product.dart';
import '../../../core/extensions/context_localization.dart';
import 'product_detail_item.dart';

/// Widget para detalles adicionales del producto
///
/// Muestra:
/// - Dimensiones del producto
/// - Contador de favoritos con emoji ❤️
class ProductAdditionalDetails extends StatelessWidget {
  final Product product;
  final int favoritesCount;

  const ProductAdditionalDetails({
    super.key,
    required this.product,
    required this.favoritesCount,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ProductDetailItem(
          title: context.loc!.dimensionsLabel,
          value: product.dimensions,
        ),
        ProductDetailItem(
          title: context.loc!.favoritesLabel,
          value: "$favoritesCount ❤️",
        ),
      ],
    );
  }
}
