/**
 * Schemas de validación de pedidos usando Zod
 * 
 * Define los schemas de validación para:
 * - Pedidos completos (lectura desde API)
 * - Líneas de pedido
 */

import { z } from 'zod';

/**
 * Schema para User (información básica en pedidos)
 */
export const OrderUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional().nullable(),
});

/**
 * Schema para Product (información básica en líneas de pedido)
 */
export const OrderProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  description: z.string().optional(),
  images: z.array(z.object({
    id: z.number(),
    src: z.string(),
    alt: z.string(),
  })).optional().default([]),
});

/**
 * Schema para OrderLine (línea de pedido)
 */
export const OrderLineSchema = z.object({
  id: z.number(),
  quantity: z.number().positive(),
  price: z.number(),
  status: z.string().default('active'),
  product: OrderProductSchema,
});

/**
 * Schema para Order completo (lectura desde API)
 */
export const OrderSchema = z.object({
  id: z.number(),
  slug: z.string().nullable(),
  total: z.number(),
  status: z.string().default('pending'),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  user: OrderUserSchema.optional(),
  orderLines: z.array(OrderLineSchema).default([]),
});

/**
 * Schema para lista de pedidos
 */
export const OrderListResponseSchema = z.object({
  data: z.array(OrderSchema),
  total: z.number().optional(),
});

// Inferir tipos TypeScript desde schemas
export type Order = z.infer<typeof OrderSchema>;
export type OrderLine = z.infer<typeof OrderLineSchema>;
export type OrderUser = z.infer<typeof OrderUserSchema>;
export type OrderProduct = z.infer<typeof OrderProductSchema>;
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;
