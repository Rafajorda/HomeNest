/**
 * ============================================================================
 * CATEGORY SERVICE - Servicio de Gestión de Categorías
 * ============================================================================
 * 
 * @file categoryService.ts
 * @description Servicio centralizado para operaciones CRUD de categorías.
 * Las categorías se usan para clasificar productos (ej: Muebles, Decoración,
 * Iluminación). Solo accesible por usuarios con rol ADMIN.
 * 
 * @functions
 * - getCategories(): Obtiene lista completa de categorías (sin paginación)
 * - getCategoryById(): Obtiene una categoría específica por ID
 * - createCategory(): Crea una nueva categoría
 * - updateCategory(): Actualiza una categoría existente
 * - deleteCategory(): Elimina una categoría permanentemente
 * - toggleCategoryStatus(): Cambia estado activo/inactivo
 * 
 * @features
 * ✅ CRUD completo de categorías
 * ✅ Autenticación JWT automática con renovación
 * ✅ Toggle de estado activo/inactivo (reversible)
 * ✅ Manejo de errores HTTP
 * ✅ Logging detallado con [CategoryService]
 * ✅ Solo accesible por ADMIN
 * 
 * @usage
 * ```tsx
 * import { getCategories, createCategory } from '@/services/categoryService';
 * 
 * // Obtener todas las categorías:
 * const categories = await getCategories();
 * 
 * // Crear categoría:
 * await createCategory({ name: 'Muebles', description: 'Muebles de madera' });
 * ```
 * 
 * ============================================================================
 */

// Importa Platform para detectar plataforma (web vs móvil)
import { Platform } from 'react-native';

// Importa tipos de categorías
// - Category: Estructura de una categoría (id, name, description, isActive)
// - CreateCategoryDto: Datos para crear/actualizar categoría (name, description)
import { Category, CreateCategoryDto } from '../types/category';

// Importa función de autenticación JWT con renovación automática
import { getValidAccessToken } from './tokenService';

/**
 * URL base del backend para endpoints de categorías
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'web' 
    ? 'http://localhost:3000' 
    : 'http://10.250.77.96:3000');

/**
 * Genera headers HTTP con autenticación JWT
 */
const getHeaders = async (): Promise<HeadersInit_> => {
  const token = await getValidAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };};

/**
 * ============================================================================
 * getCategories() - Obtiene Lista Completa de Categorías
 * ============================================================================
 * 
 * @function getCategories
 * @async
 * @returns {Promise<Category[]>} Array con todas las categorías
 * 
 * @description Obtiene TODAS las categorías sin paginación. Como suele
 * haber pocas categorías (< 50), no se usa paginación como en productos/usuarios.
 * 
 * @flow
 * 1. Hace GET a /category
 * 2. Backend retorna array de categorías (activas E inactivas)
 * 3. Parsea y retorna array
 * 
 * @note
 * Retorna TODAS las categorías (activas e inactivas). Si solo necesitas
 * activas, filtra con: categories.filter(c => c.isActive)
 * 
 * @example
 * ```tsx
 * const categories = await getCategories();
 * console.log(categories);
 * // [
 * //   { id: '1', name: 'Muebles', description: '...', isActive: true },
 * //   { id: '2', name: 'Decoración', description: '...', isActive: true }
 * // ]
 * 
 * // Obtener solo activas:
 * const activeCategories = categories.filter(c => c.isActive);
 * ```
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[CategoryService] Error getting categories:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * createCategory() - Crea una Nueva Categoría
 * ============================================================================
 * 
 * @function createCategory
 * @async
 * @param {CreateCategoryDto} categoryData - Datos de la nueva categoría
 * @returns {Promise<Category>} Categoría creada
 * 
 * @description Crea una nueva categoría para clasificar productos.
 * 
 * @required_fields
 * - name: string (debe ser único, ej: 'Muebles', 'Decoración')
 * - description: string (opcional, ej: 'Muebles de madera maciza')
 * 
 * @throws {Error} Si el nombre ya existe (409 Conflict)
 * @throws {Error} Si los datos son inválidos (400)
 * 
 * @example
 * ```tsx
 * const newCategory = await createCategory({
 *   name: 'Iluminación',
 *   description: 'Lámparas y luces para el hogar'
 * });
 * console.log(newCategory);
 * // { id: 'cat-3', name: 'Iluminación', description: '...', isActive: true }
 * ```
 */
export const createCategory = async (categoryData: CreateCategoryDto): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[CategoryService] Error creating category:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * updateCategory() - Actualiza una Categoría Existente
 * ============================================================================
 * 
 * @function updateCategory
 * @async
 * @param {string} id - ID de la categoría a actualizar
 * @param {CreateCategoryDto} categoryData - Nuevos datos (name, description)
 * @returns {Promise<Category>} Categoría actualizada
 * 
 * @description Actualiza name y/o description de una categoría.
 * 
 * @throws {Error} Si la categoría no existe (404)
 * @throws {Error} Si el nuevo nombre ya existe (409)
 * 
 * @example
 * ```ts
 * await updateCategory('cat-1', {
 *   name: 'Muebles Premium',
 *   description: 'Muebles de alta calidad'
 * });
 * ```
 */
export const updateCategory = async (id: string, categoryData: CreateCategoryDto): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[CategoryService] Error updating category:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * deleteCategory() - Elimina una Categoría Permanentemente
 * ============================================================================
 * 
 * @function deleteCategory
 * @async
 * @param {string} id - ID de la categoría a eliminar
 * @returns {Promise<void>}
 * 
 * @description Elimina permanentemente una categoría. ACCIÓN IRREVERSIBLE.
 * 
 * @warning
 * ⚠️ Si la categoría tiene productos asociados, el backend puede:
 * - Retornar error 409 (no permitir eliminación)
 * - O cambiar los productos a categoría "Sin categoría"
 * 
 * @alternative
 * Mejor usar toggleCategoryStatus() para desactivar:
 * ```ts
 * await toggleCategoryStatus(id);  // ✅ Reversible
 * ```
 * 
 * @example
 * ```tsx
 * await deleteCategory('cat-1');
 * ```
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('[CategoryService] Error deleting category:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * toggleCategoryStatus() - Cambia Estado Activo/Inactivo de Categoría
 * ============================================================================
 * 
 * @function toggleCategoryStatus
 * @async
 * @param {string} id - ID de la categoría a cambiar de estado
 * @returns {Promise<Category>} Categoría con estado actualizado
 * 
 * @description Alterna isActive entre true/false. Las categorías inactivas
 * pueden no mostrarse en filtros de la tienda.
 * 
 * @behavior
 * - isActive = true → false (categoría OCULTA en filtros)
 * - isActive = false → true (categoría VISIBLE en filtros)
 * 
 * @use_case
 * - Ocultar categorías temporalmente sin eliminarlas
 * - Desactivar categorías fuera de temporada
 * - Probar nuevas categorías antes de activarlas
 * 
 * @example
 * ```tsx
 * // Desactivar categoría:
 * const category = await toggleCategoryStatus('cat-1');
 * console.log(category.isActive);  // false
 * 
 * // Reactivar:
 * const reactivated = await toggleCategoryStatus('cat-1');
 * console.log(reactivated.isActive);  // true
 * ```
 */
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${id}/toggle-status`, {
      method: 'PUT',
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[CategoryService] Error toggling category status:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * getCategoryById() - Obtiene una Categoría Específica por ID
 * ============================================================================
 * 
 * @function getCategoryById
 * @async
 * @param {string} id - ID de la categoría a obtener
 * @returns {Promise<Category>} Categoría encontrada
 * 
 * @description Obtiene los detalles de una categoría específica.
 * 
 * @throws {Error} Si la categoría no existe (404)
 * 
 * @example
 * ```ts
 * const category = await getCategoryById('cat-1');
 * console.log(category);
 * // { id: 'cat-1', name: 'Muebles', description: 'Muebles de madera', isActive: true }
 * ```
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[CategoryService] Error getting category:', error);
    throw error;
  }
};
