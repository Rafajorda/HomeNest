import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config/api_config.dart';
import '../../core/models/cart.dart';
import '../../core/utils/snackbar.dart';
import '../../providers/cart_provider.dart';
import '../checkout/checkout_page.dart';

/// Página del carrito de compras
///
/// Muestra todos los productos en el carrito con:
/// - Imagen del producto
/// - Nombre y precio
/// - Cantidad
/// - Botón para eliminar
/// - Total del carrito
/// - Botón para proceder al checkout
class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Carrito de Compras'),
        actions: [
          if (cartState.cart != null && cartState.cart!.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              tooltip: 'Vaciar carrito',
              onPressed: () => _showClearCartDialog(context, ref),
            ),
        ],
      ),
      body: cartState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : cartState.isEmpty
          ? _buildEmptyCart(context)
          : _buildCartContent(context, ref, cartState, accent),
    );
  }

  /// Construye la vista de carrito vacío
  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 100,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 20),
          Text(
            'Tu carrito está vacío',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(color: Colors.grey[600]),
          ),
          const SizedBox(height: 10),
          Text(
            'Añade productos para empezar a comprar',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.shopping_bag),
            label: const Text('Ir a comprar'),
          ),
        ],
      ),
    );
  }

  /// Construye el contenido del carrito con productos
  Widget _buildCartContent(
    BuildContext context,
    WidgetRef ref,
    CartState cartState,
    Color accent,
  ) {
    final cart = cartState.cart!;

    return Column(
      children: [
        // Lista de productos
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: cart.cartProducts.length,
            itemBuilder: (context, index) {
              final item = cart.cartProducts[index];
              return _buildCartItem(context, ref, item);
            },
          ),
        ),

        // Resumen y botón de checkout
        _buildCheckoutSection(context, ref, cart, accent),
      ],
    );
  }

  /// Construye un item del carrito
  Widget _buildCartItem(
    BuildContext context,
    WidgetRef ref,
    CartProductModel item,
  ) {
    final product = item.product;

    // Construir URL correcta de la imagen
    String? imageUrl;
    if (product.images.isNotEmpty) {
      final img = product.images.first;
      if (img.startsWith('/')) {
        imageUrl = '${ApiConfig.baseUrl}$img';
      } else if (img.startsWith('http://') || img.startsWith('https://')) {
        imageUrl = img;
      } else {
        imageUrl = img;
      }
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen del producto
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: imageUrl != null
                  ? Image.network(
                      imageUrl,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                    )
                  : _buildImagePlaceholder(),
            ),
            const SizedBox(width: 12),

            // Información del producto
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '€${product.price.toStringAsFixed(2)}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Cantidad: ${item.quantity}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Subtotal: €${item.total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),

            // Botón eliminar
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: () =>
                  _removeFromCart(context, ref, product.id, product.name),
            ),
          ],
        ),
      ),
    );
  }

  /// Placeholder para imágenes
  Widget _buildImagePlaceholder() {
    return Container(
      width: 80,
      height: 80,
      color: Colors.grey[200],
      child: Icon(Icons.image, color: Colors.grey[400], size: 40),
    );
  }

  /// Sección de resumen y checkout
  Widget _buildCheckoutSection(
    BuildContext context,
    WidgetRef ref,
    CartModel cart,
    Color accent,
  ) {
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
        child: Column(
          children: [
            // Total de items
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total de artículos:',
                  style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                ),
                Text(
                  '${cart.itemCount}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Total a pagar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total:',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                Text(
                  '€${cart.total.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Botón de checkout
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () => _proceedToCheckout(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: accent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.payment, color: Colors.white),
                label: const Text(
                  'Proceder al pago',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Elimina un producto del carrito
  Future<void> _removeFromCart(
    BuildContext context,
    WidgetRef ref,
    String productId,
    String productName,
  ) async {
    final success = await ref
        .read(cartProvider.notifier)
        .removeFromCart(productId);
    if (context.mounted) {
      if (success) {
        GeneralSnackBar.success(context, 'Producto eliminado del carrito');
      } else {
        GeneralSnackBar.error(context, 'Error al eliminar producto');
      }
    }
  }

  /// Muestra diálogo para vaciar el carrito
  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Vaciar carrito'),
        content: const Text(
          '¿Estás seguro de que quieres vaciar todo el carrito?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await ref.read(cartProvider.notifier).clearCart();
              if (context.mounted) {
                if (success) {
                  GeneralSnackBar.success(context, 'Carrito vaciado');
                } else {
                  GeneralSnackBar.error(context, 'Error al vaciar carrito');
                }
              }
            },
            child: const Text('Vaciar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  /// Navega a la página de checkout
  void _proceedToCheckout(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CheckoutPage()),
    );
  }
}
