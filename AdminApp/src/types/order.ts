/**
 * Tipos de pedidos (orders)
 * 
 * Re-exporta los tipos desde el schema de Zod
 * para mantener compatibilidad con el código existente
 */

export type {
  Order,
  OrderLine,
  OrderUser,
  OrderProduct,
  OrderListResponse,
} from '../schemas/order.schema';

// Re-exportar schemas para validaciones
export {
  OrderSchema,
  OrderLineSchema,
  OrderUserSchema,
  OrderProductSchema,
  OrderListResponseSchema,
} from '../schemas/order.schema';
