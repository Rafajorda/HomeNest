import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config/api_config.dart';
import '../../core/utils/snackbar.dart';
import '../../providers/cart_provider.dart';
import '../orders/orders_page.dart';

/// Página de checkout - confirmar compra
///
/// Muestra un resumen del pedido y permite al usuario confirmar la compra.
/// Al confirmar, se crea un pedido en el servidor y se vacía el carrito.
class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final cart = cartState.cart;
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    if (cart == null || cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: const Center(child: Text('El carrito está vacío')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Confirmar Pedido')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Resumen del pedido
                  _buildOrderSummary(context, cart, accent),
                  const SizedBox(height: 24),

                  // Nota informativa
                  _buildInfoNote(),
                ],
              ),
            ),
          ),

          // Botón de confirmar compra
          _buildConfirmButton(context, accent),
        ],
      ),
    );
  }

  /// Resumen del pedido
  Widget _buildOrderSummary(BuildContext context, cart, Color accent) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Resumen del Pedido',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const Divider(height: 24),

            // Lista de productos
            ...cart.cartProducts.map((item) {
              final product = item.product;
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
                              errorBuilder: (_, __, ___) =>
                                  _buildImagePlaceholder(),
                            )
                          : _buildImagePlaceholder(),
                    ),
                    const SizedBox(width: 12),

                    // Info del producto
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
                            'x${item.quantity}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Precio
                    Text(
                      '€${item.total.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: accent,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),

            const Divider(height: 24),

            // Total de items
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total de artículos:',
                  style: TextStyle(fontSize: 15, color: Colors.grey[700]),
                ),
                Text(
                  '${cart.itemCount}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'TOTAL:',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  '€${cart.total.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: accent,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Nota informativa
  Widget _buildInfoNote() {
    return Card(
      color: Colors.blue[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.info_outline, color: Colors.blue[700]),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Al confirmar tu pedido, se creará automáticamente. Por ahora no se requiere método de pago.',
                style: TextStyle(color: Colors.blue[900], fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Botón de confirmar compra
  Widget _buildConfirmButton(BuildContext context, Color accent) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton.icon(
            onPressed: _isProcessing ? null : _confirmOrder,
            style: ElevatedButton.styleFrom(
              backgroundColor: accent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: _isProcessing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.check_circle, color: Colors.white),
            label: Text(
              _isProcessing ? 'Procesando...' : 'Confirmar Pedido',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Placeholder para imágenes
  Widget _buildImagePlaceholder() {
    return Container(
      width: 60,
      height: 60,
      color: Colors.grey[200],
      child: Icon(Icons.image, color: Colors.grey[400], size: 30),
    );
  }

  /// Confirma el pedido
  Future<void> _confirmOrder() async {
    setState(() => _isProcessing = true);

    try {
      final order = await ref.read(cartProvider.notifier).checkout();

      if (!mounted) return;

      if (order != null) {
        // Mostrar diálogo de éxito
        _showSuccessDialog(order.id);
      } else {
        GeneralSnackBar.error(context, 'Error al crear el pedido');
      }
    } catch (e) {
      if (mounted) {
        GeneralSnackBar.error(context, 'Error: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  /// Muestra diálogo de éxito
  void _showSuccessDialog(int orderId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green[600], size: 32),
            const SizedBox(width: 12),
            const Text('¡Pedido Confirmado!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Tu pedido ha sido creado exitosamente.'),
            const SizedBox(height: 12),
            Text(
              'Número de pedido: #$orderId',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Cerrar diálogo, checkout page y cart page
              Navigator.of(context).pop(); // Cerrar diálogo
              Navigator.of(context).pop(); // Cerrar checkout
              Navigator.of(context).pop(); // Cerrar cart
            },
            child: const Text('Continuar Comprando'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop(); // Cerrar diálogo
              Navigator.of(context).pop(); // Cerrar checkout
              Navigator.of(context).pop(); // Cerrar cart
              // Navegar a mis pedidos
              Navigator.of(
                context,
              ).push(MaterialPageRoute(builder: (_) => const OrdersPage()));
            },
            child: const Text('Ver Mis Pedidos'),
          ),
        ],
      ),
    );
  }
}
