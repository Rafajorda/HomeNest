import 'package:flutter/material.dart';
import 'package:proyecto_1/core/models/category.dart';
import 'package:proyecto_1/core/widgets/general_chip.dart';

/// Lista horizontal de chips para filtrar por categoría
class CategoryChipsList extends StatelessWidget {
  final List<Category> categories;
  final int? selectedCategoryId;
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
              isSelected: category.id == selectedCategoryId,
              onSelected: () {
                // Toggle: si ya está seleccionada, deseleccionar
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
