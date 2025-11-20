import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/extensions/context_localization.dart';
import '../../core/models/product.dart';
import '../../core/config/api_config.dart';
import '../../core/services/favorites_service.dart';
import '../../core/utils/snackbar.dart';
import '../../providers/auth_provider.dart';

/// Página de detalles de un producto.
///
/// Muestra:
/// - Carrusel de imágenes con navegación (flechas izq/der y dots)
/// - Información del producto (nombre, precio, descripción)
/// - Colores disponibles como chips
/// - Dimensiones y contador de favoritos
/// - Botón de añadir a favoritos (requiere autenticación)
///
/// Funcionalidades:
/// - Navegación entre imágenes con flechas (si hay más de una imagen)
/// - Indicadores de página (dots)
/// - Manejo de errores de carga de imágenes
/// - Conversión de códigos hexadecimales a colores visuales
/// - Toggle de favoritos con actualización en tiempo real
class ProductDetailPage extends ConsumerStatefulWidget {
  final Product product;

  const ProductDetailPage({super.key, required this.product});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  /// Controlador para el carrusel de imágenes
  late PageController _pageController;

  /// Índice de la imagen actual en el carrusel
  int _currentPage = 0;

  /// Servicio de favoritos
  FavoritesService? _favoritesService;

  /// Estado de favorito del producto
  bool _isFavorite = false;

  /// ID del favorito (necesario para eliminación)
  int? _favoriteId;

  /// Estado de carga del toggle de favorito
  bool _isTogglingFavorite = false;

  /// Contador local de favoritos (actualizado tras añadir/quitar)
  late int _localFavoritesCount;

  @override
  void initState() {
    super.initState();
    // Inicializar contador local con el valor del producto
    _localFavoritesCount = widget.product.favoritesCount;

    // Inicializar el controlador del PageView
    _pageController = PageController();

    // Escuchar cambios de página para actualizar el índice actual
    _pageController.addListener(() {
      setState(() {
        _currentPage = _pageController.page?.round() ?? 0;
      });
    });

    // Verificar si el producto está en favoritos
    _checkFavoriteStatus();
  }

  /// Verifica si el producto actual está en la lista de favoritos del usuario.
  ///
  /// Solo se ejecuta si el usuario está autenticado.
  /// Actualiza [_isFavorite] y [_favoriteId] según el resultado.
  Future<void> _checkFavoriteStatus() async {
    final authState = ref.read(authProvider);
    if (!authState.isAuthenticated || authState.accessToken == null) {
      return;
    }

    try {
      final interceptor = ref.read(authInterceptorProvider);
      _favoritesService = FavoritesService(
        interceptor: interceptor,
        authToken: authState.accessToken!,
      );
      final isFav = await _favoritesService!.isFavorite(widget.product.id);

      if (isFav && mounted) {
        // Si es favorito, obtener el favoriteId
        final favorites = await _favoritesService!.getMyFavorites();
        final favorite = favorites.firstWhere(
          (f) => f.product.id == widget.product.id,
          orElse: () => favorites.first,
        );

        if (mounted) {
          setState(() {
            _isFavorite = true;
            _favoriteId = favorite.id;
          });
        }
      }
    } catch (e) {
      // Error silencioso al verificar estado
      debugPrint('Error checking favorite status: $e');
    }
  }

  /// Alterna el estado de favorito del producto.
  ///
  /// Si el producto está en favoritos, lo elimina.
  /// Si no está en favoritos, lo añade.
  ///
  /// Muestra feedback al usuario mediante SnackBar.
  /// Requiere autenticación.
  Future<void> _toggleFavorite() async {
    final authState = ref.read(authProvider);
    if (!authState.isAuthenticated || authState.accessToken == null) {
      if (mounted) {
        GeneralSnackBar.error(context, context.loc!.mustLoginToAddFavorites);
      }
      return;
    }

    setState(() {
      _isTogglingFavorite = true;
    });

    try {
      final interceptor = ref.read(authInterceptorProvider);
      _favoritesService ??= FavoritesService(
        interceptor: interceptor,
        authToken: authState.accessToken!,
      );

      if (_isFavorite && _favoriteId != null) {
        // Eliminar de favoritos
        await _favoritesService!.removeFromFavorites(_favoriteId!);
        if (mounted) {
          setState(() {
            _isFavorite = false;
            _favoriteId = null;
            _isTogglingFavorite = false;
            // Decrementar el contador localmente
            _localFavoritesCount = (_localFavoritesCount - 1)
                .clamp(0, double.infinity)
                .toInt();
          });
          GeneralSnackBar.success(context, context.loc!.removedFromFavorites);
        }
      } else {
        // Añadir a favoritos
        final favorite = await _favoritesService!.addToFavorites(
          widget.product.id,
        );
        if (mounted) {
          setState(() {
            _isFavorite = true;
            _favoriteId = favorite.id;
            _isTogglingFavorite = false;
            // Incrementar el contador localmente
            _localFavoritesCount++;
          });
          GeneralSnackBar.success(context, '¡Añadido a favoritos!');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isTogglingFavorite = false;
        });
        GeneralSnackBar.error(
          context,
          'Error: ${e.toString().replaceAll('Exception: ', '')}',
        );
      }
    }
  }

  @override
  void dispose() {
    // Liberar recursos del controlador
    _pageController.dispose();
    super.dispose();
  }

  /// Convierte un código hexadecimal (#FF0000) a un objeto Color de Flutter.
  ///
  /// Formatos soportados:
  /// - Con '#': "#FF0000"
  /// - Sin '#': "FF0000"
  ///
  /// Retorna Colors.grey si el formato es inválido.
  Color _parseHexColor(String hexCode) {
    try {
      final hex = hexCode.replaceAll('#', '');
      if (hex.length == 6) {
        // Añadir opacidad completa (FF) al inicio
        return Color(int.parse('FF$hex', radix: 16));
      }
      return Colors.grey; // Color por defecto si el formato es incorrecto
    } catch (e) {
      return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorText = const Color(0xFF3E3B32);
    final accent = const Color(0xFF7B8C5F);

    return Scaffold(
      backgroundColor: const Color(0xFFF5EFE6),
      appBar: AppBar(
        title: Text(widget.product.name),
        backgroundColor: const Color(0xFFF5EFE6),
        foregroundColor: colorText,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🔹 Carrusel de imágenes con flechas
            SizedBox(
              height: 300,
              child: widget.product.images.isEmpty
                  ? Image.asset(
                      'assets/images/placeholder.png',
                      fit: BoxFit.cover,
                      width: double.infinity,
                    )
                  : Stack(
                      children: [
                        // PageView
                        PageView.builder(
                          controller: _pageController,
                          itemCount: widget.product.images.length,
                          itemBuilder: (context, index) {
                            // Construir URL correcta
                            String imageUrl;
                            final rawUrl = widget.product.images[index];
                            if (rawUrl.startsWith('/')) {
                              imageUrl = '${ApiConfig.baseUrl}$rawUrl';
                            } else if (rawUrl.startsWith('http://') ||
                                rawUrl.startsWith('https://')) {
                              imageUrl = rawUrl;
                            } else {
                              imageUrl = rawUrl;
                            }

                            return Image.network(
                              imageUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              loadingBuilder:
                                  (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return Container(
                                      color: Colors.grey[200],
                                      alignment: Alignment.center,
                                      child: CircularProgressIndicator(
                                        value:
                                            loadingProgress
                                                    .expectedTotalBytes !=
                                                null
                                            ? loadingProgress
                                                      .cumulativeBytesLoaded /
                                                  loadingProgress
                                                      .expectedTotalBytes!
                                            : null,
                                      ),
                                    );
                                  },
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.grey[200],
                                  alignment: Alignment.center,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.broken_image,
                                        size: 80,
                                        color: Colors.grey,
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        context.loc!.errorLoadingImage,
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            );
                          },
                        ),

                        // Flechas de navegación (solo si hay más de 1 imagen)
                        if (widget.product.images.length > 1) ...[
                          // Flecha izquierda
                          Positioned(
                            left: 16,
                            top: 0,
                            bottom: 0,
                            child: Center(
                              child: _currentPage > 0
                                  ? Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(
                                          alpha: 0.5,
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                      child: IconButton(
                                        icon: const Icon(
                                          Icons.chevron_left,
                                          color: Colors.white,
                                          size: 32,
                                        ),
                                        onPressed: () {
                                          _pageController.previousPage(
                                            duration: const Duration(
                                              milliseconds: 300,
                                            ),
                                            curve: Curves.easeInOut,
                                          );
                                        },
                                      ),
                                    )
                                  : const SizedBox.shrink(),
                            ),
                          ),

                          // Flecha derecha
                          Positioned(
                            right: 16,
                            top: 0,
                            bottom: 0,
                            child: Center(
                              child:
                                  _currentPage <
                                      widget.product.images.length - 1
                                  ? Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(
                                          alpha: 0.5,
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                      child: IconButton(
                                        icon: const Icon(
                                          Icons.chevron_right,
                                          color: Colors.white,
                                          size: 32,
                                        ),
                                        onPressed: () {
                                          _pageController.nextPage(
                                            duration: const Duration(
                                              milliseconds: 300,
                                            ),
                                            curve: Curves.easeInOut,
                                          );
                                        },
                                      ),
                                    )
                                  : const SizedBox.shrink(),
                            ),
                          ),

                          // Indicador de página
                          Positioned(
                            bottom: 16,
                            left: 0,
                            right: 0,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                widget.product.images.length,
                                (index) => Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: _currentPage == index
                                        ? Colors.white
                                        : Colors.white.withValues(alpha: 0.5),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
            ),

            const SizedBox(height: 20),

            // 🔹 Información principal
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.product.name,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: colorText,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "${widget.product.price.toStringAsFixed(2)} €",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: accent,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.product.description,
                    style: TextStyle(
                      fontSize: 16,
                      color: colorText.withValues(alpha: 0.8),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 10),

            // 🔹 Detalles adicionales
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Colores disponibles
                  if (widget.product.colors.isNotEmpty) ...[
                    Text(
                      "Colores disponibles:",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: colorText,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.product.colors.map((color) {
                        return Chip(
                          label: Text(color.name),
                          avatar: color.hexCode != null
                              ? CircleAvatar(
                                  backgroundColor: _parseHexColor(
                                    color.hexCode!,
                                  ),
                                  radius: 12,
                                )
                              : null,
                          backgroundColor: Colors.grey[200],
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 12),
                  ],
                  _DetailItem(
                    title: "Dimensiones",
                    value: widget.product.dimensions,
                  ),
                  _DetailItem(
                    title: "Favoritos",
                    value: "$_localFavoritesCount ❤️",
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // Boton de añadir al carrito
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Producto añadido al carrito 🛒"),
                      ),
                    );
                  },
                  child: const Text(
                    "Añadir al carrito",
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
      floatingActionButton: ref.watch(authProvider).isAuthenticated
          ? FloatingActionButton.extended(
              onPressed: _isTogglingFavorite ? null : _toggleFavorite,
              backgroundColor: _isFavorite ? Colors.red : Colors.grey[300],
              icon: _isTogglingFavorite
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: _isFavorite ? Colors.white : Colors.grey[700],
                    ),
              label: Text(
                _isFavorite ? context.loc!.inFavorites : context.loc!.addToFavorites,
                style: TextStyle(
                  color: _isFavorite ? Colors.white : Colors.grey[700],
                ),
              ),
            )
          : null,
    );
  }
}

class _DetailItem extends StatelessWidget {
  final String title;
  final String value;

  const _DetailItem({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    final colorText = const Color(0xFF3E3B32);

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
