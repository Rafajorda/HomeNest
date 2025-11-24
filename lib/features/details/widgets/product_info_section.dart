import 'package:flutter/material.dart';
import '../../../core/models/product.dart';

/// Widget para la información principal del producto
///
/// Muestra:
/// - Nombre del producto (título grande y bold)
/// - Precio con formato (color accent)
/// - Descripción del producto (texto normal)
class ProductInfoSection extends StatelessWidget {
  final Product product;

  const ProductInfoSection({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorText = theme.colorScheme.onSurface;
    final accent = theme.colorScheme.primary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          product.name,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: colorText,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          "${product.price.toStringAsFixed(2)} €",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: accent,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          product.description,
          style: TextStyle(
            fontSize: 16,
            color: colorText.withValues(alpha: 0.8),
            height: 1.4,
          ),
        ),
      ],
    );
  }
}
