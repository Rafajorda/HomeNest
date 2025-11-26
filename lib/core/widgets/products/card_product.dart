import 'package:flutter/material.dart';
import 'package:proyecto_1/features/details/details_product_page.dart';
import '../../models/product.dart';
import '../loading_indicator.dart';

/// Card de producto para mostrar en grids o listas.
///
/// Muestra:
/// - Imagen del producto (con loading y manejo de errores)
/// - Ícono de corazón si el producto está en favoritos
/// - Contador de favoritos
/// - Precio destacado en verde
/// - Nombre del producto (bold)
/// - Descripción (máx 2 líneas con ellipsis)
///
/// Características:
/// - Navegación a ProductDetailPage al hacer tap
/// - Loading progresivo de imágenes
/// - Fallback a placeholder si no hay imagen
/// - Error handling elegante con icono y mensaje
/// - Elevación y bordes redondeados para mejor estética
/// - Ícono de favorito en la esquina superior derecha (cuando isFavorite=true)
/// - Callback onReturn para recargar datos cuando vuelve de detalles
class ProductCard extends StatelessWidget {
  final String title;
  final String description;
  final double price;
  final String? imageUrl;
  final Product product;
  final bool isFavorite;
  final VoidCallback? onReturn;

  const ProductCard({
    super.key,
    required this.title,
    required this.description,
    required this.price,
    this.imageUrl,
    required this.product,
    this.isFavorite = false,
    this.onReturn,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      // Navegar a detalles del producto al hacer tap
      onTap: () async {
        // Navegar y esperar a que vuelva
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductDetailPage(product: product),
          ),
        );
        // Cuando vuelva, llamar callback para recargar
        onReturn?.call();
      },
      child: Card(
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖼 Imagen del producto con manejo de estados
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                  child: imageUrl != null && imageUrl!.isNotEmpty
                      ? Image.network(
                          imageUrl!,
                          height: 160,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          // Optimización: reduce memoria cacheando en tamaño menor
                          cacheWidth: 400,
                          cacheHeight: 400,
                          // Estado de carga con loading indicator personalizado
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              height: 160,
                              color: Theme.of(
                                context,
                              ).colorScheme.surfaceContainerHighest,
                              alignment: Alignment.center,
                              child: const GeneralLoadingIndicator(size: 40),
                            );
                          },
                          // Estado de error con icono y mensaje
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              height: 160,
                              color: Theme.of(
                                context,
                              ).colorScheme.surfaceContainerHighest,
                              alignment: Alignment.center,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.broken_image,
                                    size: 60,
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Error al cargar',
                                    style: TextStyle(
                                      color: Theme.of(
                                        context,
                                      ).colorScheme.onSurfaceVariant,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        )
                      // Fallback a imagen placeholder si no hay URL
                      : Image.asset(
                          'assets/images/placeholder.png',
                          height: 160,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                ),
                // ❤️ Ícono de favorito en la esquina superior derecha
                if (isFavorite)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.favorite,
                        color: Colors.red,
                        size: 20,
                      ),
                    ),
                  ),
              ],
            ),

            // 🧱 Contenido de la tarjeta
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$${price.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(color: Colors.green[700]),
                      ),
                      // Contador de favoritos
                      Row(
                        children: [
                          Icon(
                            Icons.favorite,
                            size: 16,
                            color: Theme.of(context).colorScheme.error,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${product.favoritesCount}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
