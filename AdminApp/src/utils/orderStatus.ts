/**
 * Utilidad para manejo de estados de pedidos
 * 
 * Proporciona funciones centralizadas para:
 * - Obtener textos de estados en español
 * - Obtener colores de estados desde el tema
 */

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

/**
 * Configuración de estado de pedido
 */
export interface OrderStatusConfig {
  text: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Obtiene el texto en español para un estado de pedido
 */
export function getOrderStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'processing':
      return 'Procesando';
    case 'shipped':
      return 'Enviado';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
}

/**
 * Obtiene la configuración completa de un estado
 * (colores desde el tema + texto)
 */
export function getOrderStatusConfig(status: string, theme: any): OrderStatusConfig {
  const text = getOrderStatusText(status);

  switch (status) {
    case 'pending':
      return {
        text,
        backgroundColor: '#FFF3E0',
        textColor: '#E65100',
      };
    case 'processing':
      return {
        text,
        backgroundColor: '#E3F2FD',
        textColor: '#1976D2',
      };
    case 'shipped':
      return {
        text,
        backgroundColor: '#F3E5F5',
        textColor: '#7B1FA2',
      };
    case 'completed':
      return {
        text,
        backgroundColor: '#E8F5E9',
        textColor: '#2E7D32',
      };
    case 'cancelled':
      return {
        text,
        backgroundColor: '#FFEBEE',
        textColor: '#C62828',
      };
    default:
      // Estado desconocido usa colores neutros del tema
      return {
        text: status,
        backgroundColor: theme.colors.surface,
        textColor: theme.colors.onSurfaceVariant,
      };
  }
}

/**
 * Lista de todos los estados disponibles
 */
export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'completed',
  'cancelled',
];
