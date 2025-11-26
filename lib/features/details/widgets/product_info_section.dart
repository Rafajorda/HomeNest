import 'package:flutter/material.dart';
import '../../../core/models/product.dart';

/// Widget para la información principal del producto en la página de detalles
///
/// Muestra la "tarjeta de presentación" del producto con:
/// - **Nombre**: Título grande (24px) en negrita
/// - **Precio**: Texto de 20px en color primary (verde oliva) con símbolo €
/// - **Descripción**: Texto de 16px con interlineado 1.4 para legibilidad
///
/// Diseño:
/// - Alineación a la izquierda para lectura natural
/// - Espaciado vertical entre elementos (8-12px)
/// - Opacidad 0.8 en descripción para jerarquía visual
///
/// Ejemplo de uso:
/// ```dart
/// ProductInfoSection(product: product)
/// ```
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
