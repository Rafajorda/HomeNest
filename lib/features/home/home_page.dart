import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/core/models/product.dart';
import 'package:proyecto_1/core/models/category.dart';
import 'package:proyecto_1/core/models/color.dart';
import 'package:proyecto_1/core/models/product_filters.dart';
import 'package:proyecto_1/core/services/product_service.dart';
import 'package:proyecto_1/core/services/category_service.dart';
import 'package:proyecto_1/core/services/color_service.dart';
import 'package:proyecto_1/core/services/favorites_service.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/settings/settings_page.dart';
import 'package:proyecto_1/features/profile/profile_page.dart';
import 'widgets/product_grid.dart';
import 'widgets/user_greeting.dart';
import 'widgets/product_filters_dialog.dart';
import 'widgets/home_error_view.dart';
import 'widgets/category_chips_list.dart';
import 'widgets/home_app_bar.dart';

/// Página principal de la aplicación (Home).
///
/// Funcionalidades:
/// - Muestra grid de productos con filtros aplicados
/// - Permite filtrar por categoría mediante chips
/// - Botón flotante para abrir diálogo de filtros avanzados
/// - Navegación a perfil y configuración
/// - Carga paralela de productos, categorías y colores
/// - Manejo de estados: loading, error, data
///
/// Características técnicas:
/// - Usa Riverpod para gestión de estado de autenticación
/// - Integración con servicios REST para backend
/// - Filtros dinámicos con preservación de estado
/// - UUID-based filtering para categorías (no hashCode)
class MyHomePage extends ConsumerStatefulWidget {
  const MyHomePage({super.key});

  @override
  ConsumerState<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends ConsumerState<MyHomePage> {
  // Filtros de categoría
  int? selectedCategoryId; // ID local (hashCode) para UI
  String? selectedCategoryUuid; // UUID real para enviar al backend

  // Filtros activos
  ProductFilters _currentFilters = ProductFilters.empty;

  // Datos cargados
  List<Product> products = [];
  List<Category> categories = [];
  List<ColorModel> colors = []; // Para mostrar nombres de colores en filtros

  // Estado de la UI
  bool isLoading = true;
  String? errorMessage;

  // Servicios HTTP
  ProductService? _productService;
  CategoryService? _categoryService;
  ColorService? _colorService;
  FavoritesService? _favoritesService;

  // Lista de IDs de productos favoritos (para mostrar corazones)
  Set<String> _favoriteProductIds = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _categoryService?.dispose();
    _colorService?.dispose();
    super.dispose();
  }

  /// Carga datos desde el backend: productos, categorías y colores.
  ///
  /// Proceso:
  /// 1. Obtiene token de autenticación del authProvider
  /// 2. Inicializa servicios HTTP con el token
  /// 3. Combina filtros actuales + categoría seleccionada
  /// 4. Si onlyFavorites es true, carga desde FavoritesService
  /// 5. Hace peticiones paralelas con Future.wait (optimización)
  /// 6. Actualiza estado con los datos recibidos
  ///
  /// Parámetros:
  /// - [filters]: Filtros opcionales a aplicar (si null, usa los actuales)
  ///
  /// Nota: Usa UUID de categoría para el backend, no el hashCode local.
  Future<void> _loadData([ProductFilters? filters]) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // Obtener el token de autenticación y el interceptor si está disponible
      final authState = ref.read(authProvider);
      final interceptor = ref.read(authInterceptorProvider);

      _productService = ProductService(
        interceptor: interceptor,
        authToken: authState.accessToken,
      );
      _categoryService = CategoryService(authToken: authState.accessToken);
      _colorService = ColorService(authToken: authState.accessToken);
      _favoritesService = FavoritesService(
        interceptor: interceptor,
        authToken: authState.accessToken,
      );

      // Crear filtros con la categoría seleccionada actual
      final baseFilters = filters ?? _currentFilters;

      // ✅ IMPORTANTE: Usar el UUID de la categoría (no el hashCode) para el backend
      final filtersWithCategory = baseFilters.copyWith(
        categoryId: selectedCategoryUuid,
      );

      // Si no hay categoría seleccionada, limpiar el filtro de categoría
      final finalFilters = selectedCategoryUuid == null
          ? ProductFilters(
              search: filtersWithCategory.search,
              colorId: filtersWithCategory.colorId,
              minPrice: filtersWithCategory.minPrice,
              maxPrice: filtersWithCategory.maxPrice,
              hasModel3D: filtersWithCategory.hasModel3D,
              onlyFavorites: filtersWithCategory.onlyFavorites,
              status: filtersWithCategory.status ?? 'active',
              sortBy: filtersWithCategory.sortBy,
              order: filtersWithCategory.order,
              limit: filtersWithCategory.limit,
              offset: filtersWithCategory.offset,
              // categoryId: null (no incluir)
            )
          : filtersWithCategory;

      List<Product> loadedProducts;

      // Si el filtro "Solo favoritos" está activo, cargar desde FavoritesService
      if (finalFilters.onlyFavorites == true) {
        if (authState.isAuthenticated) {
          final favorites = await _favoritesService!.getMyFavorites();
          loadedProducts = favorites.map((f) => f.product).toList();

          // Aplicar filtros locales (búsqueda, precio, etc)
          loadedProducts = _applyLocalFilters(loadedProducts, finalFilters);
        } else {
          // Usuario no autenticado, no puede ver favoritos
          loadedProducts = [];
        }
      } else {
        // Carga normal desde ProductService
        loadedProducts = await _productService!.getAllProducts(finalFilters);
      }

      // Cargar categorías y colores en paralelo
      final results = await Future.wait([
        _categoryService!.getAllCategories(),
        _colorService!.getAllColors(),
      ]);

      final loadedCategories = results[0] as List<Category>;
      final loadedColors = results[1] as List<ColorModel>;

      // Cargar IDs de favoritos para mostrar corazones (solo si está autenticado)
      if (authState.isAuthenticated) {
        try {
          final favorites = await _favoritesService!.getMyFavorites();
          _favoriteProductIds = favorites.map((f) => f.product.id).toSet();
        } catch (e) {
          _favoriteProductIds = {};
        }
      }

      setState(() {
        products = loadedProducts;
        categories = loadedCategories;
        colors = loadedColors;
        _currentFilters = finalFilters;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  /// Aplica filtros locales a una lista de productos.
  /// Usado cuando se carga desde favoritos (no hay filtros backend).
  List<Product> _applyLocalFilters(
    List<Product> products,
    ProductFilters filters,
  ) {
    var filtered = products;

    // Filtro de búsqueda
    if (filters.search != null && filters.search!.isNotEmpty) {
      final searchLower = filters.search!.toLowerCase();
      filtered = filtered.where((p) {
        return p.name.toLowerCase().contains(searchLower) ||
            p.description.toLowerCase().contains(searchLower);
      }).toList();
    }

    // Filtro de precio mínimo
    if (filters.minPrice != null) {
      filtered = filtered.where((p) => p.price >= filters.minPrice!).toList();
    }

    // Filtro de precio máximo
    if (filters.maxPrice != null) {
      filtered = filtered.where((p) => p.price <= filters.maxPrice!).toList();
    }

    // Filtro de modelo 3D
    if (filters.hasModel3D != null) {
      filtered = filtered.where((p) {
        final hasModel = p.images.isNotEmpty; // Simplificado
        return filters.hasModel3D! ? hasModel : !hasModel;
      }).toList();
    }

    // Filtro de color
    if (filters.colorId != null && filters.colorId!.isNotEmpty) {
      filtered = filtered.where((p) {
        return p.colors.any((c) => c.id == filters.colorId);
      }).toList();
    }

    // Ordenamiento
    if (filters.sortBy != null) {
      filtered = List.from(filtered);
      switch (filters.sortBy) {
        case 'name':
          filtered.sort((a, b) => a.name.compareTo(b.name));
          break;
        case 'price':
          filtered.sort((a, b) => a.price.compareTo(b.price));
          break;
        case 'favoritesCount':
          filtered.sort((a, b) => a.favoritesCount.compareTo(b.favoritesCount));
          break;
      }

      // Orden descendente si se especifica
      if (filters.order == 'DESC') {
        filtered = filtered.reversed.toList();
      }
    }

    return filtered;
  }

  List<Product> get filteredProducts => products;

  /// Abre el diálogo de filtros avanzados y aplica los filtros seleccionados.
  ///
  /// Si el usuario confirma los filtros, recarga los productos con los nuevos criterios.
  Future<void> _openFiltersDialog() async {
    final result = await showDialog<ProductFilters>(
      context: context,
      builder: (context) =>
          ProductFiltersDialog(initialFilters: _currentFilters),
    );

    if (result != null) {
      // Aplicar los nuevos filtros
      await _loadData(result);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Mostrar error si hubo algún problema
    if (errorMessage != null) {
      return HomeErrorView(errorMessage: errorMessage!, onRetry: _loadData);
    }

    return Scaffold(
      appBar: HomeAppBar(
        onSettingsTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SettingsPage()),
        ),
        onProfileTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ProfilePage()),
        ),
      ),
      body: Column(
        children: [
          const UserGreeting(),

          // Chips de categorías
          CategoryChipsList(
            categories: categories,
            selectedCategoryId: selectedCategoryId,
            onCategorySelected: (category) {
              setState(() {
                if (category == null) {
                  selectedCategoryId = null;
                  selectedCategoryUuid = null;
                } else {
                  selectedCategoryId = category.id;
                  selectedCategoryUuid = category.uuid;
                }
              });
              _loadData();
            },
          ),

          // Barra de filtros y búsqueda
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                // Botón de filtros con badge si hay filtros activos
                Badge(
                  isLabelVisible: _currentFilters.activeFiltersCount > 0,
                  label: Text(_currentFilters.activeFiltersCount.toString()),
                  child: FilledButton.tonalIcon(
                    onPressed: _openFiltersDialog,
                    icon: const Icon(Icons.filter_list),
                    label: Text(context.loc!.filters),
                  ),
                ),
                const SizedBox(width: 12),

                // Indicador de filtros activos
                if (_currentFilters.hasActiveFilters) ...[
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          if (_currentFilters.search != null) ...[
                            Chip(
                              label: Text('🔍 ${_currentFilters.search}'),
                              onDeleted: () {
                                _loadData(
                                  _currentFilters.copyWith(clearSearch: true),
                                );
                              },
                              deleteIcon: const Icon(Icons.close, size: 18),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (_currentFilters.colorId != null) ...[
                            Chip(
                              label: Text(
                                '🎨 ${colors.firstWhere(
                                  (c) => c.id == _currentFilters.colorId,
                                  orElse: () => ColorModel(id: '', name: context.loc!.color),
                                ).name}',
                              ),
                              onDeleted: () {
                                _loadData(
                                  _currentFilters.copyWith(clearColorId: true),
                                );
                              },
                              deleteIcon: const Icon(Icons.close, size: 18),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (_currentFilters.minPrice != null ||
                              _currentFilters.maxPrice != null) ...[
                            Chip(
                              label: Text(
                                '€ ${_currentFilters.minPrice?.toInt() ?? 0} - ${_currentFilters.maxPrice?.toInt() ?? '∞'}',
                              ),
                              onDeleted: () {
                                _loadData(
                                  _currentFilters.copyWith(
                                    clearMinPrice: true,
                                    clearMaxPrice: true,
                                  ),
                                );
                              },
                              deleteIcon: const Icon(Icons.close, size: 18),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (_currentFilters.hasModel3D == true) ...[
                            Chip(
                              label: Text('📦 ${context.loc!.model3D}'),
                              onDeleted: () {
                                _loadData(
                                  _currentFilters.copyWith(
                                    clearHasModel3D: true,
                                  ),
                                );
                              },
                              deleteIcon: const Icon(Icons.close, size: 18),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (_currentFilters.onlyFavorites == true) ...[
                            Chip(
                              label: Text('❤️ ${context.loc!.onlyFavorites}'),
                              onDeleted: () {
                                _loadData(
                                  _currentFilters.copyWith(
                                    clearOnlyFavorites: true,
                                  ),
                                );
                              },
                              deleteIcon: const Icon(Icons.close, size: 18),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (_currentFilters.sortBy != null) ...[
                            Chip(
                              label: Text('⬍ ${_currentFilters.sortBy}'),
                              onDeleted: () {
                                _loadData(
                                  _currentFilters.copyWith(
                                    clearSortBy: true,
                                    clearOrder: true,
                                  ),
                                );
                              },
                              deleteIcon: const Icon(Icons.close, size: 18),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Botón para limpiar todos los filtros
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _currentFilters = ProductFilters.empty;
                      });
                      _loadData();
                    },
                    icon: const Icon(Icons.clear_all),
                    tooltip: 'Limpiar filtros',
                  ),
                ],
              ],
            ),
          ),

          // Grid de productos
          Expanded(
            child: ProductGrid(
              products: filteredProducts,
              favoriteProductIds: _favoriteProductIds,
              onProductReturn: () {
                // Recargar productos cuando vuelve de detalles
                _loadData(_currentFilters);
              },
            ),
          ),
        ],
      ),
    );
  }
}
