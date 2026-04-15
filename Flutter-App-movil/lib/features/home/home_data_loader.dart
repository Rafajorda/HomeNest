import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/models/product.dart';
import 'package:proyecto_1/core/models/category.dart';
import 'package:proyecto_1/core/models/color.dart';
import 'package:proyecto_1/core/models/product_filters.dart';
import 'package:proyecto_1/core/services/product_service.dart';
import 'package:proyecto_1/core/services/category_service.dart';
import 'package:proyecto_1/core/services/color_service.dart';
import 'package:proyecto_1/core/services/favorites_service.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'home_state.dart';
import 'home_filter_logic.dart';

/// Lógica para cargar datos desde el backend.
///
/// Esta clase maneja toda la comunicación con la API:
/// - Inicialización de servicios HTTP
/// - Carga de productos con filtros
/// - Carga de categorías y colores
/// - Carga de favoritos del usuario
/// - Manejo de errores
///
/// Usa el patrón de callback para actualizar el estado en la UI.
class HomeDataLoader {
  /// Referencia al WidgetRef de Riverpod para acceder a providers.
  final WidgetRef ref;

  /// Callback para actualizar el estado en la UI.
  final void Function(HomeState) onStateUpdate;

  /// Constructor que requiere ref y callback.
  HomeDataLoader({required this.ref, required this.onStateUpdate});

  /// Carga datos desde el backend: productos, categorías y colores.
  ///
  /// Este es el método principal de carga de datos. Se ejecuta:
  /// - Al inicializar la página (initState)
  /// - Al cambiar de categoría
  /// - Al aplicar nuevos filtros
  /// - Al volver de la página de detalles
  ///
  /// Proceso detallado:
  /// 1. Obtiene token de autenticación del authProvider (Riverpod)
  /// 2. Inicializa servicios HTTP con el token y el interceptor
  /// 3. Combina filtros actuales + categoría seleccionada
  /// 4. Si onlyFavorites es true, carga desde FavoritesService
  /// 5. Si onlyFavorites es false, carga desde ProductService
  /// 6. Hace peticiones paralelas con Future.wait (optimización)
  /// 7. Carga IDs de favoritos si el usuario está autenticado
  /// 8. Actualiza estado con los datos recibidos
  ///
  /// Parámetros:
  /// - [currentState]: Estado actual de la página home
  /// - [filters]: Filtros opcionales a aplicar (si null, usa currentState.currentFilters)
  ///
  /// Nota importante: Usa UUID de categoría para el backend, no el hashCode local.
  Future<void> loadData(
    HomeState currentState, [
    ProductFilters? filters,
  ]) async {
    // ========== 1. ESTABLECER ESTADO DE CARGA ==========
    onStateUpdate(currentState.copyWith(isLoading: true, clearError: true));

    try {
      // ========== 2. OBTENER AUTENTICACIÓN ==========
      final authState = ref.read(authProvider);
      final interceptor = ref.read(authInterceptorProvider);

      // ========== 3. INICIALIZAR SERVICIOS HTTP ==========
      final productService = ProductService(
        interceptor: interceptor,
        authToken: authState.accessToken,
      );
      final categoryService = CategoryService(authToken: authState.accessToken);
      final colorService = ColorService(authToken: authState.accessToken);
      final favoritesService = FavoritesService(
        interceptor: interceptor,
        authToken: authState.accessToken,
      );

      // ========== 4. PREPARAR FILTROS ==========
      final finalFilters = _prepareFinalFilters(
        currentState,
        filters ?? currentState.currentFilters,
      );

      // ========== 5. CARGAR PRODUCTOS ==========
      final loadedProducts = await _loadProducts(
        finalFilters,
        productService,
        favoritesService,
        authState.isAuthenticated,
      );

      // ========== 6. CARGAR DATOS AUXILIARES ==========
      final results = await Future.wait([
        categoryService.getAllCategories(),
        colorService.getAllColors(),
      ]);

      final loadedCategories = results[0] as List<Category>;
      final loadedColors = results[1] as List<ColorModel>;

      // ========== 7. CARGAR IDS DE FAVORITOS ==========
      final favoriteIds = await _loadFavoriteIds(
        favoritesService,
        authState.isAuthenticated,
      );

      // ========== 8. ACTUALIZAR ESTADO ==========
      onStateUpdate(
        currentState.copyWith(
          products: loadedProducts,
          categories: loadedCategories,
          colors: loadedColors,
          currentFilters: finalFilters,
          favoriteProductIds: favoriteIds,
          productService: productService,
          categoryService: categoryService,
          colorService: colorService,
          favoritesService: favoritesService,
          isLoading: false,
        ),
      );
    } catch (e) {
      // ========== MANEJO DE ERRORES ==========
      onStateUpdate(
        currentState.copyWith(isLoading: false, errorMessage: e.toString()),
      );
    }
  }

  /// Prepara los filtros finales a enviar al backend.
  ///
  /// Combina los filtros base con la categoría seleccionada.
  /// Si no hay categoría seleccionada, crea un nuevo objeto sin categoryId.
  ///
  /// IMPORTANTE: Usa el UUID de la categoría (no el hashCode) para el backend.
  /// El hashCode es solo para la UI, el UUID es el identificador real en BD.
  ///
  /// Parámetros:
  /// - [state]: Estado actual con la categoría seleccionada
  /// - [baseFilters]: Filtros base a aplicar
  ///
  /// Retorna: ProductFilters con la categoría incluida o excluida
  ProductFilters _prepareFinalFilters(
    HomeState state,
    ProductFilters baseFilters,
  ) {
    // Crear filtros con la categoría seleccionada actual
    final filtersWithCategory = baseFilters.copyWith(
      categoryId: state.selectedCategoryUuid,
    );

    // Si no hay categoría seleccionada, limpiar el filtro de categoría
    if (state.selectedCategoryUuid == null) {
      return ProductFilters(
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
        // categoryId: null (no incluir en el request)
      );
    }

    return filtersWithCategory;
  }

  /// Carga productos desde el backend.
  ///
  /// Si el filtro "Solo favoritos" está activo, carga desde FavoritesService.
  /// Si no, carga desde ProductService con filtros en el backend.
  ///
  /// Parámetros:
  /// - [filters]: Filtros a aplicar
  /// - [productService]: Servicio de productos
  /// - [favoritesService]: Servicio de favoritos
  /// - [isAuthenticated]: Si el usuario está autenticado
  ///
  /// Retorna: Lista de productos cargados y filtrados
  Future<List<Product>> _loadProducts(
    ProductFilters filters,
    ProductService productService,
    FavoritesService favoritesService,
    bool isAuthenticated,
  ) async {
    // Si el filtro "Solo favoritos" está activo
    if (filters.onlyFavorites == true) {
      if (isAuthenticated) {
        // Usuario autenticado: obtener favoritos desde el backend
        final favorites = await favoritesService.getMyFavorites();
        final products = favorites.map((f) => f.product).toList();

        // Aplicar filtros locales (búsqueda, precio, etc)
        // El backend de favoritos no soporta estos filtros
        return HomeFilterLogic.applyLocalFilters(products, filters);
      } else {
        // Usuario no autenticado: no puede ver favoritos
        return [];
      }
    }

    // Carga normal desde ProductService con filtros en el backend
    return await productService.getAllProducts(filters);
  }

  /// Carga los IDs de favoritos del usuario.
  ///
  /// Solo se ejecuta si el usuario está autenticado.
  /// Si falla, retorna un Set vacío (no es crítico para la app).
  ///
  /// Parámetros:
  /// - [favoritesService]: Servicio de favoritos
  /// - [isAuthenticated]: Si el usuario está autenticado
  ///
  /// Retorna: Set de IDs de productos favoritos
  Future<Set<String>> _loadFavoriteIds(
    FavoritesService favoritesService,
    bool isAuthenticated,
  ) async {
    if (!isAuthenticated) {
      return {};
    }

    try {
      final favorites = await favoritesService.getMyFavorites();
      return favorites.map((f) => f.product.id).toSet();
    } catch (e) {
      // Si falla, simplemente dejar vacío (no es crítico)
      return {};
    }
  }
}
