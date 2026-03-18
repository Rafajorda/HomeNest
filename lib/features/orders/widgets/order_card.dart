import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/order.dart';
import '../order_detail_page.dart';
import '../models/order_status_config.dart';
import 'order_status_chip.dart';
import 'order_line_item.dart';
import 'order_summary.dart';

/// Widget de tarjeta expandible para mostrar un pedido
///
/// Incluye:
/// - Header: ID del pedido, fecha, estado, total
/// - Avatar con icono del estado
/// - Lista expandible de productos
/// - Resumen del pedido
class OrderCard extends StatelessWidget {
  final OrderModel order;

  const OrderCard({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusConfig = OrderStatusConfig.fromStatus(order.status);
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      child: ExpansionTile(
        tilePadding: const EdgeInsets.all(16),
        childrenPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          backgroundColor: statusConfig.backgroundColor,
          child: Icon(statusConfig.icon, color: statusConfig.color),
        ),
        title: Text(
          'Pedido #${order.id}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              dateFormat.format(order.createdAt),
              style: TextStyle(
                color: theme.textTheme.bodySmall?.color?.withAlpha(153),
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 4),
            OrderStatusChip(status: order.status),
          ],
        ),
        trailing: Text(
          '€${order.total.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
        children: [
          const Divider(),
          const SizedBox(height: 8),

          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => OrderDetailPage(order: order),
                  ),
                );
              },
              icon: const Icon(Icons.open_in_new, size: 18),
              label: const Text('Ver detalle'),
            ),
          ),
          const SizedBox(height: 8),

          // Lista de productos del pedido
          ...order.orderLines.map((line) => OrderLineItem(line: line)),

          const SizedBox(height: 16),
          const Divider(),

          // Resumen del pedido
          OrderSummary(order: order),
        ],
      ),
    );
  }
}
