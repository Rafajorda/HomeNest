import 'package:flutter/material.dart';
import 'package:proyecto_1/core/models/category.dart';
import 'package:proyecto_1/core/widgets/general_chip.dart';

/// Lista horizontal scrolleable de chips para filtrar productos por categoría
///
/// Características:
/// - Scroll horizontal para múltiples categorías
/// - Un chip puede estar seleccionado a la vez
/// - Tap en chip seleccionado lo deselecciona (muestra todos los productos)
/// - Usa GeneralChip para estilos consistentes
///
/// Flujo de interacción:
/// 1. Usuario toca un chip → filtra productos de esa categoría
/// 2. Usuario toca el mismo chip → deselecciona (muestra todo)
/// 3. Usuario toca otro chip → cambia el filtro a la nueva categoría
class CategoryChipsList extends StatelessWidget {
  /// Lista de categorías disponibles
  final List<Category> categories;

  /// ID de la categoría actualmente seleccionada
  /// null = no hay filtro activo (muestra todos los productos)
  final int? selectedCategoryId;

  /// Callback que se ejecuta cuando se selecciona/deselecciona una categoría
  /// Recibe:
  /// - Category: categoría seleccionada
  /// - null: se deseleccionó (mostrar todo)
  final Function(Category?) onCategorySelected;

  const CategoryChipsList({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      // Altura fija para el scroll horizontal
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: GeneralChip(
              label: category.name,
              // Chip está seleccionado si su ID coincide con selectedCategoryId
              isSelected: category.id == selectedCategoryId,
              onSelected: () {
                // Comportamiento toggle:
                // Si ya está seleccionada → deseleccionar (null)
                // Si no está seleccionada → seleccionar esta categoría
                if (selectedCategoryId == category.id) {
                  onCategorySelected(null);
                } else {
                  onCategorySelected(category);
                }
              },
            ),
          );
        },
      ),
    );
  }
}
