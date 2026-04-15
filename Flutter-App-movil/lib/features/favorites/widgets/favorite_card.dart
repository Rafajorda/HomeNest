import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/favorite.dart';
import '../../../providers/cart_provider.dart';
import '../../details/details_product_page.dart';

/// Card para mostrar un producto favorito
///
/// Muestra:
/// - Imagen del producto
/// - Nombre
/// - Precio
/// - Botón para eliminar de favoritos
/// - Al hacer tap navega a la página de detalles del producto
class FavoriteCard extends ConsumerWidget {
  final Favorite favorite;

  const FavoriteCard({super.key, required this.favorite});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final product = favorite.product;
    final String? imageUrl = product.images.isNotEmpty
        ? product.images.first
        : null;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProductDetailPage(product: product),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Imagen del producto
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 100,
                  height: 100,
                  child: imageUrl != null && imageUrl.isNotEmpty
                      ? Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: theme.colorScheme.surface,
                              child: Icon(
                                Icons.image_not_supported_outlined,
                                color: theme.colorScheme.onSurface.withAlpha(
                                  102,
                                ),
                              ),
                            );
                          },
                        )
                      : Container(
                          color: theme.colorScheme.surface,
                          child: Icon(
                            Icons.image_not_supported_outlined,
                            color: theme.colorScheme.onSurface.withAlpha(102),
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 16),
              // Información del producto
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Nombre
                    Text(
                      product.name,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    // Descripción
                    if (product.description.isNotEmpty)
                      Text(
                        product.description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withAlpha(179),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 8),
                    // Precio
                    Text(
                      "€${double.parse(product.price.toString()).toStringAsFixed(2)}",
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
              // Botón para eliminar de favoritos
              IconButton(
                icon: const Icon(Icons.favorite),
                color: theme.colorScheme.error,
                onPressed: () async {
                  final favoritesService = ref.read(favoritesServiceProvider);
                  if (favoritesService == null) {
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Debes iniciar sesión')),
                    );
                    return;
                  }

                  try {
                    await favoritesService.removeFromFavorites(favorite.id);
                    ref.invalidate(myFavoritesProvider);

                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${product.name} eliminado de favoritos'),
                      ),
                    );
                  } catch (e) {
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Error al eliminar favorito: ${e.toString().replaceAll('Exception: ', '')}',
                        ),
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
