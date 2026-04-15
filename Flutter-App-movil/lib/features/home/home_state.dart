import 'package:proyecto_1/core/models/product.dart';
import 'package:proyecto_1/core/models/category.dart';
import 'package:proyecto_1/core/models/color.dart';
import 'package:proyecto_1/core/models/product_filters.dart';
import 'package:proyecto_1/core/services/product_service.dart';
import 'package:proyecto_1/core/services/category_service.dart';
import 'package:proyecto_1/core/services/color_service.dart';
import 'package:proyecto_1/core/services/favorites_service.dart';

/// Estado de la página Home.
///
/// Agrupa todos los datos y configuraciones necesarios para la pantalla principal:
/// - Filtros activos (categoría, búsqueda, precio, etc.)
/// - Datos cargados (productos, categorías, colores)
/// - Estado de UI (loading, error)
/// - Servicios HTTP inicializados
/// - IDs de favoritos del usuario
///
/// Esta clase se usa para mantener todo el estado en un solo lugar
/// y facilitar el paso de datos entre métodos.
class HomeState {
  // ========== FILTROS DE CATEGORÍA ==========

  /// ID local (hashCode) de la categoría seleccionada.
  /// Este ID se usa solo para la UI de los chips.
  /// Ej: hashCode de la instancia de Category
  int? selectedCategoryId;

  /// UUID real de la categoría seleccionada.
  /// Este UUID se envía al backend para filtrar productos.
  /// Es el identificador único persistente en la base de datos.
  String? selectedCategoryUuid;

  // ========== FILTROS ACTIVOS ==========

  /// Objeto con todos los filtros activos actualmente.
  /// Incluye: búsqueda, color, precio, modelo 3D, favoritos, ordenamiento.
  /// Persiste entre recargas hasta que el usuario lo cambie.
  ProductFilters currentFilters;

  // ========== DATOS CARGADOS DESDE EL BACKEND ==========

  /// Lista de productos filtrados mostrados en el grid.
  List<Product> products;

  /// Lista de todas las categorías disponibles (para chips).
  List<Category> categories;

  /// Lista de todos los colores disponibles (para mostrar nombres en filtros).
  List<ColorModel> colors;

  // ========== ESTADO DE LA UI ==========

  /// Indica si se están cargando datos del backend.
  /// Muestra CircularProgressIndicator cuando es true.
  bool isLoading;

  /// Mensaje de error si hubo algún problema al cargar datos.
  /// Si no es null, se muestra HomeErrorView.
  String? errorMessage;

  // ========== SERVICIOS HTTP ==========
  // Estos servicios se inicializan con el token de autenticación

  /// Servicio para operaciones CRUD de productos.
  ProductService? productService;

  /// Servicio para obtener categorías.
  CategoryService? categoryService;

  /// Servicio para obtener colores.
  ColorService? colorService;

  /// Servicio para operaciones de favoritos (requiere autenticación).
  FavoritesService? favoritesService;

  // ========== LISTA DE FAVORITOS ==========

  /// Set de IDs de productos que están en favoritos del usuario.
  /// Se usa para mostrar corazones llenos en las cards.
  /// Solo se carga si el usuario está autenticado.
  Set<String> favoriteProductIds;

  /// Constructor con valores por defecto.
  HomeState({
    this.selectedCategoryId,
    this.selectedCategoryUuid,
    this.currentFilters = ProductFilters.empty,
    this.products = const [],
    this.categories = const [],
    this.colors = const [],
    this.isLoading = true,
    this.errorMessage,
    this.productService,
    this.categoryService,
    this.colorService,
    this.favoritesService,
    this.favoriteProductIds = const {},
  });

  /// Crea una copia del estado con valores modificados.
  ///
  /// Útil para actualizar el estado de forma inmutable.
  HomeState copyWith({
    int? selectedCategoryId,
    String? selectedCategoryUuid,
    ProductFilters? currentFilters,
    List<Product>? products,
    List<Category>? categories,
    List<ColorModel>? colors,
    bool? isLoading,
    String? errorMessage,
    ProductService? productService,
    CategoryService? categoryService,
    ColorService? colorService,
    FavoritesService? favoritesService,
    Set<String>? favoriteProductIds,
    bool clearCategorySelection = false,
    bool clearError = false,
  }) {
    return HomeState(
      selectedCategoryId: clearCategorySelection
          ? null
          : selectedCategoryId ?? this.selectedCategoryId,
      selectedCategoryUuid: clearCategorySelection
          ? null
          : selectedCategoryUuid ?? this.selectedCategoryUuid,
      currentFilters: currentFilters ?? this.currentFilters,
      products: products ?? this.products,
      categories: categories ?? this.categories,
      colors: colors ?? this.colors,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
      productService: productService ?? this.productService,
      categoryService: categoryService ?? this.categoryService,
      colorService: colorService ?? this.colorService,
      favoritesService: favoritesService ?? this.favoritesService,
      favoriteProductIds: favoriteProductIds ?? this.favoriteProductIds,
    );
  }

  /// Getter que retorna los productos filtrados.
  /// (Actualmente no hace transformaciones adicionales)
  List<Product> get filteredProducts => products;

  /// Limpia la selección de categoría.
  ///
  /// Establece tanto el ID local como el UUID a null.
  void clearCategorySelection() {
    selectedCategoryId = null;
    selectedCategoryUuid = null;
  }

  /// Establece una categoría seleccionada.
  ///
  /// Parámetros:
  /// - [category]: La categoría a seleccionar
  void selectCategory(Category category) {
    selectedCategoryId = category.id; // hashCode para UI
    selectedCategoryUuid = category.uuid; // UUID para backend
  }
}
