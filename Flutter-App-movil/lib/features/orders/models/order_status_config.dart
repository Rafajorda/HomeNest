import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Configuración de visualización para cada estado de pedido
///
/// Contiene:
/// - Color del estado
/// - Color de fondo claro
/// - Icono representativo
/// - Texto en español
class OrderStatusConfig {
  final String status;
  final Color color;
  final Color backgroundColor;
  final IconData icon;
  final String label;

  const OrderStatusConfig({
    required this.status,
    required this.color,
    required this.backgroundColor,
    required this.icon,
    required this.label,
  });

  /// Obtiene la configuración según el estado
  static OrderStatusConfig fromStatus(String status) {
    switch (status) {
      case 'pending':
        return const OrderStatusConfig(
          status: 'pending',
          color: AppTheme.orderPendingColor,
          backgroundColor: AppTheme.orderPendingLight,
          icon: Icons.schedule,
          label: 'Pendiente',
        );
      case 'processing':
        return const OrderStatusConfig(
          status: 'processing',
          color: AppTheme.orderProcessingColor,
          backgroundColor: AppTheme.orderProcessingLight,
          icon: Icons.autorenew,
          label: 'Procesando',
        );
      case 'shipped':
        return const OrderStatusConfig(
          status: 'shipped',
          color: AppTheme.orderShippedColor,
          backgroundColor: AppTheme.orderShippedLight,
          icon: Icons.local_shipping,
          label: 'Enviado',
        );
      case 'delivered':
        return const OrderStatusConfig(
          status: 'delivered',
          color: AppTheme.orderCompletedColor,
          backgroundColor: AppTheme.orderCompletedLight,
          icon: Icons.check_circle,
          label: 'Entregado',
        );
      case 'completed':
        return const OrderStatusConfig(
          status: 'completed',
          color: AppTheme.orderCompletedColor,
          backgroundColor: AppTheme.orderCompletedLight,
          icon: Icons.check_circle,
          label: 'Completado',
        );
      case 'cancelled':
        return const OrderStatusConfig(
          status: 'cancelled',
          color: AppTheme.orderCancelledColor,
          backgroundColor: AppTheme.orderCancelledLight,
          icon: Icons.cancel,
          label: 'Cancelado',
        );
      default:
        return const OrderStatusConfig(
          status: 'unknown',
          color: AppTheme.orderDefaultColor,
          backgroundColor: AppTheme.orderDefaultLight,
          icon: Icons.receipt,
          label: 'Desconocido',
        );
    }
  }
}
