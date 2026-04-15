import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/order.dart';
import '../../providers/cart_provider.dart';
import 'widgets/order_card.dart';

/// Página de historial de pedidos/ventas
///
/// Muestra todos los pedidos del usuario con:
/// - Número de pedido
/// - Fecha
/// - Estado
/// - Total
/// - Productos incluidos
class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mis Pedidos')),
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return _buildEmptyOrders(context);
          }
          return _buildOrdersList(ref, orders);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _buildError(context, error.toString()),
      ),
    );
  }

  /// Vista cuando no hay pedidos
  Widget _buildEmptyOrders(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 100,
            color: Theme.of(context).colorScheme.onSurface.withAlpha(102),
          ),
          const SizedBox(height: 20),
          Text(
            'No tienes pedidos',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Tus pedidos aparecerán aquí',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
            ),
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

  /// Lista de pedidos
  Widget _buildOrdersList(WidgetRef ref, List<OrderModel> orders) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myOrdersProvider);
        await ref.read(myOrdersProvider.future);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        itemBuilder: (context, index) {
          return OrderCard(order: orders[index]);
        },
      ),
    );
  }

  /// Vista de error
  Widget _buildError(BuildContext context, String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 80,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 20),
          Text(
            'Error al cargar pedidos',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 10),
          Text(
            error,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Volver'),
          ),
        ],
      ),
    );
  }
}
