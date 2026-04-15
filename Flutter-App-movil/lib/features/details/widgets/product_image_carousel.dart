import 'package:flutter/material.dart';
import '../../../core/config/api_config.dart';
import '../../../core/extensions/context_localization.dart';
import '../../../core/widgets/loading_indicator.dart';

/// Widget para el carrusel de imágenes del producto
///
/// Características:
/// - PageView con imágenes del producto
/// - Flechas de navegación izquierda/derecha (si hay más de 1 imagen)
/// - Indicadores de página (dots)
/// - Loading state con CircularProgressIndicator
/// - Error state con icono de imagen rota
/// - Placeholder si no hay imágenes
class ProductImageCarousel extends StatefulWidget {
  final List<String> images;

  const ProductImageCarousel({super.key, required this.images});

  @override
  State<ProductImageCarousel> createState() => _ProductImageCarouselState();
}

class _ProductImageCarouselState extends State<ProductImageCarousel> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _pageController.addListener(() {
      setState(() {
        _currentPage = _pageController.page?.round() ?? 0;
      });
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Si no hay imágenes, mostrar placeholder
    if (widget.images.isEmpty) {
      return SizedBox(
        height: 300,
        child: Image.asset(
          'assets/images/placeholder.png',
          fit: BoxFit.cover,
          width: double.infinity,
        ),
      );
    }

    return SizedBox(
      height: 300,
      child: Stack(
        children: [
          // PageView con imágenes
          PageView.builder(
            controller: _pageController,
            itemCount: widget.images.length,
            itemBuilder: (context, index) {
              return _buildImageItem(widget.images[index], theme);
            },
          ),

          // Flechas de navegación (solo si hay más de 1 imagen)
          if (widget.images.length > 1) ...[
            _buildNavigationArrow(
              isLeft: true,
              isVisible: _currentPage > 0,
              onPressed: () => _pageController.previousPage(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              ),
            ),
            _buildNavigationArrow(
              isLeft: false,
              isVisible: _currentPage < widget.images.length - 1,
              onPressed: () => _pageController.nextPage(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              ),
            ),
            _buildPageIndicators(),
          ],
        ],
      ),
    );
  }

  /// Construye un item de imagen con loading y error states
  Widget _buildImageItem(String imageUrl, ThemeData theme) {
    // Construir URL correcta
    String fullUrl;
    if (imageUrl.startsWith('/')) {
      fullUrl = '${ApiConfig.baseUrl}$imageUrl';
    } else if (imageUrl.startsWith('http://') ||
        imageUrl.startsWith('https://')) {
      fullUrl = imageUrl;
    } else {
      fullUrl = imageUrl;
    }

    return Image.network(
      fullUrl,
      fit: BoxFit.cover,
      width: double.infinity,
      // Optimización: cachear en tamaño menor para ahorrar memoria
      cacheWidth: 800,
      cacheHeight: 800,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Container(
          color: theme.colorScheme.surface,
          alignment: Alignment.center,
          child: const GeneralLoadingIndicator(size: 50),
        );
      },
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: theme.colorScheme.surface,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.broken_image,
                size: 80,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
              const SizedBox(height: 16),
              Text(
                context.loc!.errorLoadingImage,
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  fontSize: 14,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  /// Construye una flecha de navegación (izquierda o derecha)
  Widget _buildNavigationArrow({
    required bool isLeft,
    required bool isVisible,
    required VoidCallback onPressed,
  }) {
    if (!isVisible) return const SizedBox.shrink();

    return Positioned(
      left: isLeft ? 16 : null,
      right: isLeft ? null : 16,
      top: 0,
      bottom: 0,
      child: Center(
        child: Container(
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.5),
            shape: BoxShape.circle,
          ),
          child: IconButton(
            icon: Icon(
              isLeft ? Icons.chevron_left : Icons.chevron_right,
              color: Theme.of(context).colorScheme.onSurface,
              size: 32,
            ),
            onPressed: onPressed,
          ),
        ),
      ),
    );
  }

  /// Construye los indicadores de página (dots)
  Widget _buildPageIndicators() {
    final surfaceColor = Theme.of(context).colorScheme.onSurface;

    return Positioned(
      bottom: 16,
      left: 0,
      right: 0,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(
          widget.images.length,
          (index) => Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _currentPage == index
                  ? surfaceColor
                  : surfaceColor.withValues(alpha: 0.5),
            ),
          ),
        ),
      ),
    );
  }
}
