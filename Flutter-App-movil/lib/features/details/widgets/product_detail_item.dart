import 'package:flutter/material.dart';

/// Widget reutilizable para mostrar un par clave-valor en detalles del producto
///
/// Renderiza una fila con:
/// - **Título** (izquierda): Texto en negrita seguido de ": " (ej: "Material: ")
/// - **Valor** (derecha): Texto normal con opacidad 0.8
///
/// Características:
/// - El valor usa `Expanded` para que se ajuste al espacio disponible
/// - Si el valor es largo, hace wrap a múltiples líneas
/// - Padding vertical de 6px entre items
///
/// Casos de uso:
/// - Mostrar dimensiones: "Dimensiones: 10x20x30 cm"
/// - Mostrar material: "Material: Madera de roble"
/// - Mostrar peso: "Peso: 2.5 kg"
/// - Mostrar cualquier dato técnico del producto
///
/// Ejemplo de uso:
/// ```dart
/// ProductDetailItem(
///   title: 'Material',
///   value: 'Madera de roble maciza',
/// )
/// ```
class ProductDetailItem extends StatelessWidget {
  /// Texto de la etiqueta (se muestra en negrita)
  final String title;

  /// Valor asociado a la etiqueta (se muestra con opacidad)
  final String value;

  const ProductDetailItem({
    super.key,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorText = theme.colorScheme.onSurface;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(
            "$title: ",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: colorText,
              fontSize: 16,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: colorText.withValues(alpha: 0.8),
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
