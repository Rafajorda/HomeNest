import 'package:flutter/material.dart';
import '../../../core/models/product.dart';
import '../../../core/widgets/color_chip.dart';
import '../../../core/extensions/context_localization.dart';

/// Widget que muestra los colores disponibles del producto
///
/// Características:
/// - Título "Colores disponibles" (internacionalizado)
/// - Chips de colores con círculo visual usando ColorChipWithCircle
/// - Wrap layout para manejar múltiples colores en varias filas
/// - Se oculta completamente si el producto no tiene colores
///
/// Nota: En esta vista los colores son informativos (no interactivos)
/// El parámetro isSelected siempre es false y onSelected es vacío
class ProductColorsSection extends StatelessWidget {
  /// Producto cuyos colores se mostrarán
  final Product product;

  const ProductColorsSection({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    // Si no hay colores, no mostrar nada (sin ocupar espacio)
    if (product.colors.isEmpty) return const SizedBox.shrink();

    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Título de la sección
        Text(
          context.loc!.availableColors,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 8),

        // Chips de colores en layout Wrap (flujo automático)
        // Wrap permite que los colores se acomoden en múltiples filas
        // si no caben todos en una sola línea
        Wrap(
          spacing: 8, // Espacio horizontal entre chips
          runSpacing: 8, // Espacio vertical entre filas
          children: product.colors.map((color) {
            return ColorChipWithCircle(
              colorModel: color,
              isSelected: false, // No hay selección en vista de detalles
              showLabel: true, // Mostrar nombre del color junto al círculo
              onSelected: () {}, // Sin funcionalidad (solo visual)
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}
