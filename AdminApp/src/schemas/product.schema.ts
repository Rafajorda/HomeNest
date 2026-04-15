/**
 * Schemas de validación de productos usando Zod
 * 
 * Define los schemas de validación para:
 * - Productos completos (lectura desde API)
 * - Creación de productos
 * - Actualización de productos
 */

import { z } from 'zod';

/**
 * Schema para Category (desde el backend)
 */
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.string(),
});

/**
 * Schema para Color (desde el backend)
 */
export const ColorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un color hexadecimal válido').nullable(),
});

/**
 * Schema para ImagesProduct (desde el backend)
 */
export const ImageProductSchema = z.object({
  id: z.number(), // El backend devuelve id como número, no UUID string
  src: z.string(),
  alt: z.string(),
  productId: z.string().uuid().optional(), // productId no viene en la respuesta
});

/**
 * Schema para Product completo (lectura desde API)
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  material: z.string().optional().or(z.literal('')), // Material es opcional o vacío
  price: z.coerce.number().positive('El precio debe ser mayor a 0'), // Coerce string to number
  dimensions: z.string().optional().nullable(),
  favoritesCount: z.number().default(0),
  status: z.string().default('active'),
  model3DPath: z.string().optional().nullable(),
  images: z.array(ImageProductSchema).optional().default([]),
  categories: z.array(CategorySchema),
  colors: z.array(ColorSchema),
});

/**
 * Schema para crear un producto (sin id, sin favoritesCount, sin status)
 * El backend asigna automáticamente status='active'
 */
export const CreateProductSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500),
  material: z.string().min(2, 'El material debe tener al menos 2 caracteres').max(50),
  price: z.coerce.number().positive('El precio debe ser mayor a 0').max(999999.99),
  dimensions: z.string().optional().or(z.literal('')).nullable(),
  // Campos de imagen (completamente opcionales)
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')).nullable(),
  imageAlt: z.string().optional().or(z.literal('')).nullable(),
  categoryIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos una categoría'),
  colorIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos un color'),
});

/**
 * Schema para actualizar un producto (todos los campos opcionales excepto id)
 */
export const UpdateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  material: z.string().min(2).max(50).optional(),
  price: z.coerce.number().positive().max(999999.99).optional(),
  dimensions: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
  model3DPath: z.string().url().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).optional(),
  colorIds: z.array(z.string().uuid()).optional(),
});

/**
 * Schema para filtros de búsqueda de productos
 */
export const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  colorId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

/**
 * Schema para respuesta paginada de productos
 */
export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  total: z.number(),
  // Backend doesn't return these pagination fields, so make them optional
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});

// Exportar tipos TypeScript inferidos desde los schemas
export type Product = z.infer<typeof ProductSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Color = z.infer<typeof ColorSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
