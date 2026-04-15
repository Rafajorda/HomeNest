import 'package:flutter/material.dart';
import '../../../core/config/api_config.dart';
import '../../../core/models/order.dart';

/// Widget que muestra un item de línea de pedido (producto)
///
/// Incluye:
/// - Imagen del producto
/// - Nombre del producto
/// - Cantidad y precio unitario
/// - Subtotal
class OrderLineItem extends StatelessWidget {
  final OrderLineModel line;

  const OrderLineItem({super.key, required this.line});

  @override
  Widget build(BuildContext context) {
    final product = line.product;
    final imageUrl = product.images.isNotEmpty
        ? '${ApiConfig.baseUrl}/${product.images.first}'
        : null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          // Imagen
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: imageUrl != null
                ? Image.network(
                    imageUrl,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                  )
                : _buildImagePlaceholder(),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'Cantidad: ${line.quantity}',
                  style: TextStyle(
                    color: Theme.of(
                      context,
                    ).textTheme.bodySmall?.color?.withAlpha(153),
                    fontSize: 13,
                  ),
                ),
                Text(
                  'Precio unitario: €${line.price.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: Theme.of(
                      context,
                    ).textTheme.bodySmall?.color?.withAlpha(153),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),

          // Subtotal
          Text(
            '€${line.total.toStringAsFixed(2)}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ],
      ),
    );
  }

  /// Placeholder para imágenes
  Widget _buildImagePlaceholder() {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(Icons.image, color: Colors.grey[400], size: 30),
    );
  }
}
