import 'package:flutter/material.dart';
import '../models/order_status_config.dart';

/// Widget de chip que muestra el estado del pedido
///
/// Usa la configuración de [OrderStatusConfig] para mostrar:
/// - Color del estado
/// - Fondo con opacidad
/// - Texto del estado en español
class OrderStatusChip extends StatelessWidget {
  final String status;

  const OrderStatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final config = OrderStatusConfig.fromStatus(status);

    return Chip(
      label: Text(
        config.label,
        style: TextStyle(
          color: config.color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
      backgroundColor: config.backgroundColor,
      padding: EdgeInsets.zero,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
