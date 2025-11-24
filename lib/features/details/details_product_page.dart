import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/extensions/context_localization.dart';
import '../../core/models/product.dart';
import '../../core/services/favorites_service.dart';
import '../../core/utils/snackbar.dart';
import '../../providers/auth_provider.dart';
import 'widgets/widgets.dart';

/// Página de detalles de un producto.
///
/// Muestra toda la información del producto de forma organizada:
/// - Carrusel de imágenes con navegación (ProductImageCarousel)
/// - Información principal: nombre, precio, descripción (ProductInfoSection)
/// - Colores disponibles con ColorChipWithCircle (ProductColorsSection)
/// - Detalles adicionales: dimensiones, favoritos (ProductAdditionalDetails)
/// - Botón de añadir al carrito
/// - FAB para añadir/quitar de favoritos (requiere autenticación)
class ProductDetailPage extends ConsumerStatefulWidget {
  final Product product;

  const ProductDetailPage({super.key, required this.product});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
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
    _localFavoritesCount = widget.product.favoritesCount;
    _checkFavoriteStatus();
  }

  /// Verifica si el producto está en favoritos
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
      debugPrint('Error checking favorite status: $e');
    }
  }

  /// Alterna el estado de favorito del producto
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
        await _favoritesService!.removeFromFavorites(_favoriteId!);
        if (mounted) {
          setState(() {
            _isFavorite = false;
            _favoriteId = null;
            _isTogglingFavorite = false;
            _localFavoritesCount = (_localFavoritesCount - 1)
                .clamp(0, double.infinity)
                .toInt();
          });
          GeneralSnackBar.success(context, context.loc!.removedFromFavorites);
        }
      } else {
        final favorite = await _favoritesService!.addToFavorites(
          widget.product.id,
        );
        if (mounted) {
          setState(() {
            _isFavorite = true;
            _favoriteId = favorite.id;
            _isTogglingFavorite = false;
            _localFavoritesCount++;
          });
          GeneralSnackBar.success(context, context.loc!.addedToFavorites);
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
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(widget.product.name),
        backgroundColor: theme.appBarTheme.backgroundColor,
        foregroundColor: theme.appBarTheme.foregroundColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Carrusel de imágenes
            ProductImageCarousel(images: widget.product.images),

            const SizedBox(height: 20),

            // Información principal
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ProductInfoSection(product: widget.product),
            ),

            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 10),

            // Colores disponibles y detalles
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ProductColorsSection(product: widget.product),
                  ProductAdditionalDetails(
                    product: widget.product,
                    favoritesCount: _localFavoritesCount,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // Botón de añadir al carrito
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
                    GeneralSnackBar.success(
                      context,
                      context.loc!.addedToCartMessage,
                    );
                  },
                  child: Text(
                    context.loc!.addToCartButton,
                    style: const TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
      floatingActionButton: _buildFavoriteFAB(theme),
    );
  }

  /// Construye el FAB de favoritos
  Widget? _buildFavoriteFAB(ThemeData theme) {
    if (!ref.watch(authProvider).isAuthenticated) return null;

    return FloatingActionButton.extended(
      onPressed: _isTogglingFavorite ? null : _toggleFavorite,
      backgroundColor: _isFavorite
          ? theme.colorScheme.error
          : theme.colorScheme.surfaceContainerHighest,
      icon: _isTogglingFavorite
          ? SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: theme.colorScheme.onError,
              ),
            )
          : Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite
                  ? theme.colorScheme.onError
                  : theme.colorScheme.onSurface,
            ),
      label: Text(
        _isFavorite ? context.loc!.inFavorites : context.loc!.addToFavorites,
        style: TextStyle(
          color: _isFavorite
              ? theme.colorScheme.onError
              : theme.colorScheme.onSurface,
        ),
      ),
    );
  }
}
