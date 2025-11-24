import 'package:flutter/material.dart';
import '../../../core/models/product.dart';
import '../../../core/widgets/color_chip.dart';
import '../../../core/extensions/context_localization.dart';

/// Widget para mostrar colores disponibles usando ColorChipWithCircle
///
/// Muestra un título "Colores disponibles" seguido de los chips de colores.
/// Si el producto no tiene colores, no se muestra nada (SizedBox.shrink).
class ProductColorsSection extends StatelessWidget {
  final Product product;

  const ProductColorsSection({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    if (product.colors.isEmpty) return const SizedBox.shrink();

    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.loc!.availableColors,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: product.colors.map((color) {
            return ColorChipWithCircle(
              colorModel: color,
              isSelected: false,
              showLabel: true,
              onSelected: () {}, // No hay selección en vista de detalles
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}
