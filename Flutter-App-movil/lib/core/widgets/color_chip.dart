import 'package:flutter/material.dart';
import 'package:proyecto_1/core/models/color.dart';

/// Widget especializado para mostrar chips de colores con círculo visual.
///
/// Combina un FilterChip con un CircleAvatar que muestra el color real del producto.
/// Se usa en filtros de productos y en la página de detalles.
///
/// Ejemplo de uso:
/// ```dart
/// ColorChipWithCircle(
///   colorModel: ColorModel(id: '1', name: 'Rojo', hexCode: '#FF0000'),
///   isSelected: selectedColorId == '1',
///   onSelected: () => setState(() => selectedColorId = '1'),
///   showLabel: true,
/// )
/// ```
class ColorChipWithCircle extends StatelessWidget {
  /// Modelo del color que contiene id, nombre y código hexadecimal
  final ColorModel colorModel;

  /// Si el chip está seleccionado actualmente
  final bool isSelected;

  /// Callback que se ejecuta cuando se selecciona el chip
  final VoidCallback onSelected;

  /// Si debe mostrar el nombre del color junto al círculo
  final bool showLabel;

  /// Radio del círculo de color
  final double circleRadius;

  const ColorChipWithCircle({
    super.key,
    required this.colorModel,
    required this.isSelected,
    required this.onSelected,
    this.showLabel = true,
    this.circleRadius = 12.0,
  });

  /// Convierte un código hexadecimal (#FF0000) a un objeto Color de Flutter
  Color _parseHexColor(String? hexCode) {
    if (hexCode == null || hexCode.isEmpty) {
      return Colors.grey; // Color por defecto si no hay hexCode
    }

    // Eliminar el '#' si existe y añadir opacidad completa (FF)
    final hex = hexCode.replaceAll('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    // Parsear el color desde el código hexadecimal
    final color = _parseHexColor(colorModel.hexCode);

    return FilterChip(
      selected: isSelected,
      onSelected: (_) => onSelected(),
      // Avatar con el círculo de color
      avatar: CircleAvatar(
        radius: circleRadius,
        backgroundColor: color,
        // Borde blanco para mejorar visibilidad en colores claros
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.3),
              width: 2,
            ),
          ),
        ),
      ),
      // Mostrar nombre del color si showLabel es true
      label: showLabel ? Text(colorModel.name) : const SizedBox.shrink(),
      // Estilos del chip
      selectedColor: Theme.of(context).colorScheme.primaryContainer,
      checkmarkColor: Theme.of(context).colorScheme.primary,
    );
  }
}
