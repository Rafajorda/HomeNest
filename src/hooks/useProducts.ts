/**
 * ============================================================================
 * HOOK: useProducts
 * ============================================================================
 * 
 * @description
 * Hook personalizado para gestionar el listado completo de productos con funcionalidades
 * avanzadas de filtrado, búsqueda, paginación y operaciones CRUD. Encapsula toda la lógica
 * de interacción con la API de productos, proporcionando una interfaz limpia y reutilizable
 * para componentes que necesiten mostrar, buscar o manipular productos.
 * 
 * @features
 * - ✅ Listado de productos con carga inicial automática
 * - ✅ Filtrado por categoría, color y estado (activo/inactivo/todos)
 * - ✅ Búsqueda por texto en nombre/descripción
 * - ✅ Paginación con carga automática de siguientes páginas
 * - ✅ Pull-to-refresh para actualizar datos
 * - ✅ Eliminación de productos con confirmación
 * - ✅ Toggle de estado activo/inactivo
 * - ✅ Manejo de errores con alertas nativas
 * - ✅ Estados de carga independientes (loading, refreshing)
 * - ✅ Reseteo de filtros a valores iniciales
 * 
 * @architecture
 * ```
 * useProducts (Custom Hook)
 *   ├─> productService.getProducts() - Fetch lista con filtros
 *   ├─> productService.deleteProduct() - Eliminar producto
 *   ├─> productService.toggleProductStatus() - Cambiar estado
 *   ├─> Estado interno (products, filters, pagination)
 *   └─> useEffect - Auto-carga cuando cambian filtros
 * ```
 * 
 * @state_management
 * ```
 * Estado              │ Tipo                  │ Propósito
 * ────────────────────┼───────────────────────┼─────────────────────────
 * products            │ Product[]             │ Array de productos cargados
 * isLoading           │ boolean               │ Carga inicial/cambio de filtros
 * isRefreshing        │ boolean               │ Carga por pull-to-refresh
 * error               │ string | null         │ Mensaje de error actual
 * filters             │ ProductFilters        │ Filtros aplicados (page, limit, search, etc)
 * pagination          │ PaginationInfo        │ Info de paginación (total, pages, etc)
 * ```
 * 
 * @params
 * @param {ProductFilters} [initialFilters] - Filtros iniciales opcionales
 *   - page: número de página inicial (default: 1)
 *   - limit: productos por página (default: 10)
 *   - search: texto de búsqueda
 *   - categoryId: filtrar por categoría específica
 *   - colorId: filtrar por color específico
 *   - status: 'active' | 'inactive' | 'all' (default: 'all')
 * 
 * @returns {Object} Hook con estado y funciones
 * @returns {Product[]} products - Array de productos cargados
 * @returns {boolean} isLoading - Indica carga en progreso
 * @returns {boolean} isRefreshing - Indica refresh en progreso
 * @returns {string|null} error - Mensaje de error si existe
 * @returns {ProductFilters} filters - Filtros actualmente aplicados
 * @returns {PaginationInfo} pagination - Información de paginación
 * @returns {Function} refresh - Función para refrescar lista (pull-to-refresh)
 * @returns {Function} loadMore - Función para cargar siguiente página
 * @returns {Function} applyFilters - Función para aplicar nuevos filtros
 * @returns {Function} search - Función para buscar por texto
 * @returns {Function} resetFilters - Función para resetear filtros a iniciales
 * @returns {Function} deleteProduct - Función async para eliminar producto
 * @returns {Function} toggleStatus - Función async para cambiar estado producto
 * 
 * @usage
 * ```typescript
 * // Ejemplo 1: Listado básico
 * function ProductList() {
 *   const { products, isLoading, refresh, isRefreshing } = useProducts();
 *   
 *   return (
 *     <FlatList
 *       data={products}
 *       refreshing={isRefreshing}
 *       onRefresh={refresh}
 *       renderItem={({ item }) => <ProductCard product={item} />}
 *     />
 *   );
 * }
 * 
 * // Ejemplo 2: Con filtros iniciales
 * function ActiveProducts() {
 *   const { products, isLoading } = useProducts({
 *     status: 'active',
 *     limit: 20,
 *   });
 *   
 *   return <ProductGrid products={products} loading={isLoading} />;
 * }
 * 
 * // Ejemplo 3: Con búsqueda y filtros dinámicos
 * function ProductSearch() {
 *   const {
 *     products,
 *     search,
 *     applyFilters,
 *     resetFilters,
 *     deleteProduct,
 *     toggleStatus,
 *   } = useProducts();
 *   
 *   return (
 *     <>
 *       <SearchBar onChangeText={search} />
 *       <CategoryFilter onSelect={(id) => applyFilters({ categoryId: id })} />
 *       <Button onPress={resetFilters}>Limpiar Filtros</Button>
 *       <ProductList
 *         products={products}
 *         onDelete={deleteProduct}
 *         onToggle={toggleStatus}
 *       />
 *     </>
 *   );
 * }
 * ```
 * 
 * @dependencies
 * - react: useState, useEffect, useCallback
 * - react-native: Alert (alertas nativas)
 * - ../types/product: Tipos de producto y filtros
 * - ../services/productService: Servicios de API
 * 
 * @performance
 * - useCallback para memoizar funciones y evitar re-renders
 * - Carga condicional con showLoader para evitar spinners innecesarios
 * - useEffect optimizado con dependencias específicas de filtros
 * 
 * @error_handling
 * - Captura todos los errores de API con try/catch
 * - Muestra alertas nativas con Alert.alert()
 * - Setea estado de error accesible para UI personalizada
 * - Logs detallados en consola para debugging
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS: Dependencias externas y tipos
// ============================================================================
import { useState, useEffect, useCallback } from 'react'; // Hooks de React
import { Alert } from 'react-native'; // Alertas nativas para feedback visual
import {
  Product,              // Tipo: Producto individual
  ProductFilters,       // Tipo: Objeto de filtros (search, categoryId, page, etc)
  ProductListResponse,  // Tipo: Respuesta de API con productos y paginación
} from '../types/product';
import * as productService from '../services/productService'; // Servicios de API

// ============================================================================
// HOOK PRINCIPAL: useProducts
// ============================================================================
export const useProducts = (initialFilters?: ProductFilters) => {
  // === PASO 1: Declarar estados del hook ===
  
  // Estado: Array de productos cargados desde la API
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estado: Indica si hay una operación de carga en progreso (inicial o filtros)
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado: Indica si hay un refresh en progreso (pull-to-refresh)
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estado: Mensaje de error actual (null si no hay error)
  const [error, setError] = useState<string | null>(null);
  
  // Estado: Filtros aplicados actualmente (con valores por defecto)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {
    page: 1,           // Página inicial
    limit: 10,         // 10 productos por página
    status: 'all',     // Mostrar todos los productos (activos e inactivos)
  });
  
  // Estado: Información de paginación (total de productos, páginas, etc)
  const [pagination, setPagination] = useState({
    total: 0,          // Total de productos en BD
    page: 1,           // Página actual
    limit: 10,         // Productos por página
    totalPages: 0,     // Total de páginas disponibles
  });

  // ============================================================================
  // FUNCIÓN: loadProducts - Carga productos desde la API
  // ============================================================================
  /**
   * Carga la lista de productos aplicando los filtros actuales.
   * Actualiza el estado de productos y paginación.
   * 
   * @param {boolean} showLoader - Si debe mostrar loading spinner (default: true)
   *   - true: para carga inicial o cambio de filtros
   *   - false: para refresh (usa isRefreshing en su lugar)
   */
  const loadProducts = useCallback(async (showLoader = true) => {
    try {
      // === PASO 1: Activar indicador de carga ===
      if (showLoader) {
        setIsLoading(true); // Muestra spinner de carga
      }
      setError(null); // Limpiar cualquier error previo

      // === PASO 2: Llamar a la API con filtros actuales ===
      const response: ProductListResponse = await productService.getProducts(filters);
      // getProducts() retorna: { data: Product[], total: number, page: number, limit: number, totalPages: number }
      
      // === PASO 3: Actualizar estado con productos recibidos ===
      setProducts(response.data); // Array de productos
      
      // === PASO 4: Actualizar información de paginación ===
      setPagination({
        total: response.total,                                                      // Total de productos en BD
        page: response.page || 1,                                                   // Página actual (fallback a 1)
        limit: response.limit || 1000,                                              // Productos por página
        totalPages: response.totalPages || Math.ceil(response.total / (response.limit || 10)), // Calcular total de páginas
      });
    } catch (err: any) {
      // === MANEJO DE ERRORES ===
      const errorMessage = err.message || 'Error al cargar productos';
      setError(errorMessage);                    // Guardar error en estado
      console.error('[useProducts] Error:', err); // Log para debugging
      Alert.alert('Error', errorMessage);         // Mostrar alerta nativa al usuario
    } finally {
      // === PASO 5: Desactivar indicadores de carga ===
      setIsLoading(false);     // Ocultar spinner principal
      setIsRefreshing(false);  // Ocultar indicador de refresh
    }
  }, [filters]); // Dependencia: re-crear función cuando cambian filtros

  // ============================================================================
  // FUNCIÓN: refresh - Refresca la lista (pull-to-refresh)
  // ============================================================================
  /**
   * Recarga la lista de productos sin mostrar el spinner principal.
   * Utilizado para pull-to-refresh en FlatList.
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true); // Activar indicador de refresh (spinner diferente)
    await loadProducts(false); // Cargar sin activar isLoading (usa isRefreshing)
  }, [loadProducts]); // Dependencia: re-crear cuando cambia loadProducts

  // ============================================================================
  // FUNCIÓN: loadMore - Carga la siguiente página (infinite scroll)
  // ============================================================================
  /**
   * Avanza a la siguiente página de productos si hay más disponibles.
   * Utilizado para infinite scroll en FlatList (onEndReached).
   */
  const loadMore = useCallback(async () => {
    // === GUARD: Verificar si hay más páginas disponibles ===
    if (pagination.page < pagination.totalPages && !isLoading) {
      // Solo cargar si:
      // 1. La página actual < total de páginas (hay más datos)
      // 2. No hay carga en progreso (evitar duplicados)
      
      setFilters(prev => ({ 
        ...prev, 
        page: (prev.page || 1) + 1  // Incrementar número de página
      }));
      // Nota: El useEffect detectará el cambio en filters.page y llamará a loadProducts()
    }
  }, [pagination, isLoading]); // Dependencias: info de paginación y estado de carga

  // ============================================================================
  // FUNCIÓN: applyFilters - Aplica nuevos filtros a la lista
  // ============================================================================
  /**
   * Actualiza los filtros de búsqueda y resetea a la primera página.
   * 
   * @param {Partial<ProductFilters>} newFilters - Filtros parciales a aplicar
   *   - search: texto de búsqueda
   *   - categoryId: ID de categoría
   *   - colorId: ID de color
   *   - status: 'active' | 'inactive' | 'all'
   */
  const applyFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,           // Mantener filtros existentes
      ...newFilters,     // Sobrescribir con nuevos valores
      page: 1,           // SIEMPRE resetear a primera página al cambiar filtros
    }));
    // Nota: El useEffect detectará el cambio y recargará productos
  }, []); // Sin dependencias, función estable

  // ============================================================================
  // FUNCIÓN: search - Busca productos por texto
  // ============================================================================
  /**
   * Atajo para buscar productos por texto.
   * Internamente usa applyFilters({ search: ... }).
   * 
   * @param {string} searchText - Texto a buscar en nombre/descripción
   */
  const search = useCallback((searchText: string) => {
    applyFilters({ search: searchText });
  }, [applyFilters]); // Dependencia: función applyFilters

  // ============================================================================
  // FUNCIÓN: resetFilters - Resetea filtros a valores iniciales
  // ============================================================================
  /**
   * Limpia todos los filtros y vuelve a los valores iniciales.
   * Útil para botones de "Limpiar filtros" o "Ver todo".
   */
  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,          // Primera página
      limit: 10,        // 10 productos por página
      status: 'all',    // Todos los productos
      // search, categoryId, colorId quedarán undefined (sin filtrar)
    });
  }, []); // Sin dependencias, función estable

  // ============================================================================
  // FUNCIÓN: deleteProduct - Elimina un producto
  // ============================================================================
  /**
   * Elimina un producto por ID y recarga la lista.
   * Muestra alertas de éxito/error.
   * 
   * @param {string} id - ID del producto a eliminar
   * @throws {Error} Si falla la eliminación
   */
  const deleteProduct = useCallback(async (id: string) => {
    try {
      // === PASO 1: Llamar al servicio de eliminación ===
      await productService.deleteProduct(id);
      // Envía DELETE request al backend
      
      // === PASO 2: Recargar lista actualizada ===
      await loadProducts(false); // Recargar sin mostrar spinner principal
      
      // === PASO 3: Mostrar confirmación de éxito ===
      Alert.alert('Éxito', 'Producto eliminado correctamente');
    } catch (err: any) {
      // === MANEJO DE ERRORES ===
      const errorMessage = err.message || 'Error al eliminar producto';
      Alert.alert('Error', errorMessage); // Alerta nativa de error
      throw err; // Re-lanzar error para que el caller pueda manejarlo
    }
  }, [loadProducts]); // Dependencia: función loadProducts

  // ============================================================================
  // FUNCIÓN: toggleStatus - Cambia el estado activo/inactivo de un producto
  // ============================================================================
  /**
   * Alterna el estado de un producto entre activo e inactivo.
   * Recarga la lista automáticamente después del cambio.
   * 
   * @param {string} id - ID del producto a cambiar estado
   * @throws {Error} Si falla el cambio de estado
   */
  const toggleStatus = useCallback(async (id: string) => {
    try {
      // === PASO 1: Llamar al servicio de toggle status ===
      await productService.toggleProductStatus(id);
      // Envía PATCH request al backend para cambiar is_active
      
      // === PASO 2: Recargar lista actualizada ===
      await loadProducts(false); // Recargar sin mostrar spinner principal
      
      // === PASO 3: Mostrar confirmación de éxito ===
      Alert.alert('Éxito', 'Estado del producto actualizado');
    } catch (err: any) {
      // === MANEJO DE ERRORES ===
      const errorMessage = err.message || 'Error al actualizar estado';
      Alert.alert('Error', errorMessage); // Alerta nativa de error
      throw err; // Re-lanzar error para que el caller pueda manejarlo
    }
  }, [loadProducts]); // Dependencia: función loadProducts

  // ============================================================================
  // EFECTO: Auto-carga cuando cambian los filtros
  // ============================================================================
  /**
   * Efecto que recarga productos automáticamente cuando cambian los filtros.
   * Se activa al cambiar: page, limit, search, categoryId, colorId, status.
   */
  useEffect(() => {
    loadProducts(); // Llamar a carga con los filtros actuales
  }, [filters.page, filters.limit, filters.search, filters.categoryId, filters.colorId, filters.status]);
  // Dependencias específicas: solo propiedades que deben disparar recarga
  // Nota: No se incluye filters completo para evitar loops infinitos

  // ============================================================================
  // RETORNO: API pública del hook
  // ============================================================================
  return {
    // === ESTADO: Datos y metadatos ===
    products,         // Array de productos cargados
    isLoading,        // Boolean: carga inicial/filtros en progreso
    isRefreshing,     // Boolean: refresh en progreso (pull-to-refresh)
    error,            // String | null: mensaje de error actual
    filters,          // ProductFilters: filtros aplicados actualmente
    pagination,       // PaginationInfo: total, page, limit, totalPages
    
    // === ACCIONES: Funciones para manipular datos ===
    refresh,          // () => Promise<void>: refresca la lista
    loadMore,         // () => Promise<void>: carga siguiente página
    applyFilters,     // (filters: Partial<ProductFilters>) => void: aplica nuevos filtros
    search,           // (text: string) => void: busca por texto
    resetFilters,     // () => void: limpia todos los filtros
    deleteProduct,    // (id: string) => Promise<void>: elimina producto
    toggleStatus,     // (id: string) => Promise<void>: cambia estado activo/inactivo
  };
};
