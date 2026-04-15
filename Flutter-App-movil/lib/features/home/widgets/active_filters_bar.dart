import 'package:flutter/material.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/core/models/color.dart';
import 'package:proyecto_1/core/models/product_filters.dart';

/// Barra de filtros activos con chips.
///
/// Muestra:
/// - Botón de filtros con badge indicando cantidad de filtros activos
/// - Chips individuales para cada filtro activo (con opción de eliminar)
/// - Botón para limpiar todos los filtros
///
/// Cada chip tiene un icono representativo y permite eliminarlo individualmente.
class ActiveFiltersBar extends StatelessWidget {
  /// Filtros actuales aplicados.
  final ProductFilters currentFilters;

  /// Lista de colores disponibles (para mostrar nombres).
  final List<ColorModel> colors;

  /// Callback cuando se presiona el botón de filtros.
  final VoidCallback onOpenFilters;

  /// Callback cuando se elimina un filtro específico.
  final void Function(ProductFilters) onFiltersChanged;

  /// Callback cuando se presiona "Limpiar todos".
  final VoidCallback onClearAll;

  const ActiveFiltersBar({
    super.key,
    required this.currentFilters,
    required this.colors,
    required this.onOpenFilters,
    required this.onFiltersChanged,
    required this.onClearAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // ========== BOTÓN DE FILTROS CON BADGE ==========
          // Badge muestra el número de filtros activos (si > 0)
          Badge(
            isLabelVisible: currentFilters.activeFiltersCount > 0,
            label: Text(currentFilters.activeFiltersCount.toString()),
            child: FilledButton.tonalIcon(
              onPressed: onOpenFilters,
              icon: const Icon(Icons.filter_list),
              label: Text(context.loc!.filters),
            ),
          ),
          const SizedBox(width: 12),

          // ========== CHIPS DE FILTROS ACTIVOS ==========
          if (currentFilters.hasActiveFilters) ...[
            Expanded(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: _buildFilterChips(context)),
              ),
            ),
            const SizedBox(width: 8),

            // ========== BOTÓN PARA LIMPIAR TODOS LOS FILTROS ==========
            IconButton(
              onPressed: onClearAll,
              icon: const Icon(Icons.clear_all),
              tooltip: context.loc!.clearFilters,
            ),
          ],
        ],
      ),
    );
  }

  /// Construye la lista de chips para cada filtro activo.
  ///
  /// Cada chip muestra:
  /// - Icono representativo del tipo de filtro
  /// - Texto descriptivo del valor
  /// - Botón X para eliminar el filtro
  ///
  /// Retorna: Lista de Widgets (Chips) para mostrar
  List<Widget> _buildFilterChips(BuildContext context) {
    final chips = <Widget>[];

    // ========== CHIP DE BÚSQUEDA ==========
    if (currentFilters.search != null && currentFilters.search!.isNotEmpty) {
      chips.add(
        _buildChip(
          context: context,
          label: '🔍 ${currentFilters.search}',
          onDeleted: () {
            onFiltersChanged(currentFilters.copyWith(clearSearch: true));
          },
        ),
      );
    }

    // ========== CHIP DE COLOR ==========
    if (currentFilters.colorId != null && currentFilters.colorId!.isNotEmpty) {
      final colorName = colors
          .firstWhere(
            (c) => c.id == currentFilters.colorId,
            orElse: () => ColorModel(id: '', name: context.loc!.color),
          )
          .name;

      chips.add(
        _buildChip(
          context: context,
          label: '🎨 $colorName',
          onDeleted: () {
            onFiltersChanged(currentFilters.copyWith(clearColorId: true));
          },
        ),
      );
    }

    // ========== CHIP DE RANGO DE PRECIO ==========
    if (currentFilters.minPrice != null || currentFilters.maxPrice != null) {
      final minPrice = currentFilters.minPrice?.toInt() ?? 0;
      final maxPrice = currentFilters.maxPrice?.toInt();
      final priceLabel = maxPrice != null
          ? '$minPrice - $maxPrice'
          : '$minPrice - ∞';

      chips.add(
        _buildChip(
          context: context,
          label: '€ $priceLabel',
          onDeleted: () {
            onFiltersChanged(
              currentFilters.copyWith(clearMinPrice: true, clearMaxPrice: true),
            );
          },
        ),
      );
    }

    // ========== CHIP DE MODELO 3D ==========
    if (currentFilters.hasModel3D == true) {
      chips.add(
        _buildChip(
          context: context,
          label: '📦 ${context.loc!.model3D}',
          onDeleted: () {
            onFiltersChanged(currentFilters.copyWith(clearHasModel3D: true));
          },
        ),
      );
    }

    // ========== CHIP DE SOLO FAVORITOS ==========
    if (currentFilters.onlyFavorites == true) {
      chips.add(
        _buildChip(
          context: context,
          label: '❤️ ${context.loc!.onlyFavorites}',
          onDeleted: () {
            onFiltersChanged(currentFilters.copyWith(clearOnlyFavorites: true));
          },
        ),
      );
    }

    // ========== CHIP DE ORDENAMIENTO ==========
    if (currentFilters.sortBy != null) {
      chips.add(
        _buildChip(
          context: context,
          label: '⬍ ${currentFilters.sortBy}',
          onDeleted: () {
            onFiltersChanged(
              currentFilters.copyWith(clearSortBy: true, clearOrder: true),
            );
          },
        ),
      );
    }

    return chips;
  }

  /// Construye un chip individual con icono de eliminar.
  ///
  /// Parámetros:
  /// - [context]: BuildContext para acceso al theme
  /// - [label]: Texto a mostrar en el chip
  /// - [onDeleted]: Callback cuando se presiona el botón X
  ///
  /// Retorna: Widget Chip configurado
  Widget _buildChip({
    required BuildContext context,
    required String label,
    required VoidCallback onDeleted,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Chip(
        label: Text(label),
        onDeleted: onDeleted,
        deleteIcon: const Icon(Icons.close, size: 18),
      ),
    );
  }
}
