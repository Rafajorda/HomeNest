/**
 * ========================================
 * TIPOS: Product
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Re-exporta los tipos y schemas de producto desde product.schema.ts
 * para mantener compatibilidad con el código existente.
 * 
 * TIPOS EXPORTADOS:
 * - Product: Interfaz completa del producto
 * - Category: Interfaz de categoría
 * - Color: Interfaz de color
 * - CreateProductInput: Datos para crear un producto
 * - UpdateProductInput: Datos para actualizar un producto
 * - ProductFilters: Filtros de búsqueda de productos
 * - ProductListResponse: Respuesta de lista paginada de productos
 * 
 * SCHEMAS EXPORTADOS (ZOD):
 * - ProductSchema: Schema de validación del producto
 * - CategorySchema: Schema de validación de categoría
 * - ColorSchema: Schema de validación de color
 * - CreateProductSchema: Schema para creación
 * - UpdateProductSchema: Schema para actualización
 * - ProductFiltersSchema: Schema para filtros
 * - ProductListResponseSchema: Schema para respuesta de lista
 * 
 * USO:
 * import { Product, CreateProductInput } from '../types/product';
 * import { ProductSchema } from '../types/product';
 * 
 * const product: Product = { ... };
 * ProductSchema.parse(product); // Validar con Zod
 */

// ===== RE-EXPORTACIÓN DE TIPOS =====
// Los tipos TypeScript se generan automáticamente desde los schemas de Zod
export type {
  Product, // Interfaz completa del producto
  Category, // Interfaz de categoría del producto
  Color, // Interfaz de color del producto
  CreateProductInput, // Datos para crear un nuevo producto
  UpdateProductInput, // Datos para actualizar un producto existente
  ProductFilters, // Filtros para búsqueda de productos
  ProductListResponse, // Respuesta de la API con lista paginada de productos
} from '../schemas/product.schema';

// ===== RE-EXPORTACIÓN DE SCHEMAS =====
// Los schemas de Zod se usan para validación en tiempo de ejecución
export {
  ProductSchema, // Schema de validación de producto completo
  CategorySchema, // Schema de validación de categoría
  ColorSchema, // Schema de validación de color
  CreateProductSchema, // Schema de validación para creación de producto
  UpdateProductSchema, // Schema de validación para actualización de producto
  ProductFiltersSchema, // Schema de validación de filtros de búsqueda
  ProductListResponseSchema, // Schema de validación de respuesta de lista paginada
} from '../schemas/product.schema';
