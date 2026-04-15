import 'package:flutter/material.dart';

/// Chip de selección general reutilizable
///
/// Basado en ChoiceChip de Material Design, con estilos personalizados.
/// Se usa para filtros, categorías y opciones de selección única.
///
/// Características:
/// - Estado seleccionado/no seleccionado
/// - Colores personalizables
/// - Tipografía configurable
/// - Callback de selección
///
/// Ejemplo de uso:
/// ```dart
/// GeneralChip(
///   label: 'Electrónica',
///   isSelected: selectedCategory == 'electronics',
///   onSelected: () => setState(() => selectedCategory = 'electronics'),
/// )
/// ```
class GeneralChip extends StatelessWidget {
  /// Texto que se muestra en el chip
  final String label;

  /// Si el chip está actualmente seleccionado
  final bool isSelected;

  /// Callback que se ejecuta cuando el usuario toca el chip
  final VoidCallback onSelected;

  /// Color de fondo cuando el chip está seleccionado
  /// Por defecto: #D9C6A5 (beige claro)
  final Color? selectedColor;

  /// Color de fondo cuando el chip NO está seleccionado
  /// Por defecto: #7B8C5F (verde oliva)
  final Color? backgroundColor;

  /// Estilo del texto del chip
  /// Por defecto: Negro cuando está seleccionado, blanco cuando no lo está
  final TextStyle? textStyle;

  const GeneralChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onSelected,
    this.selectedColor,
    this.backgroundColor,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(
        label,
        style:
            textStyle ??
            TextStyle(
              // Texto oscuro cuando está seleccionado, claro cuando no
              color: isSelected ? const Color(0xFF3E3B32) : Colors.white,
              fontWeight: FontWeight.w600,
            ),
      ),
      selected: isSelected,
      onSelected: (_) => onSelected(),
      // Colores por defecto del tema de la app
      selectedColor: selectedColor ?? const Color(0xFFD9C6A5),
      backgroundColor: backgroundColor ?? const Color(0xFF7B8C5F),
    );
  }
}
