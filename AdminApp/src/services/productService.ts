/**
 * ============================================================================
 * PRODUCT SERVICE - Servicio de Gestión de Productos
 * ============================================================================
 * 
 * @file productService.ts
 * @description Servicio centralizado para todas las operaciones CRUD de 
 * productos. Maneja peticiones HTTP al backend, validación de datos con Zod,
 * autenticación con JWT, y renovación automática de tokens.
 * 
 * @functions
 * - getProducts(): Obtiene lista de productos con filtros opcionales (búsqueda, categoría, color, precio, paginación)
 * - getProductById(): Obtiene un producto específico por su ID
 * - createProduct(): Crea un nuevo producto (con opción de subir imagen)
 * - updateProduct(): Actualiza un producto existente
 * - deleteProduct(): Elimina un producto permanentemente
 * - toggleProductStatus(): Cambia el estado activo/inactivo de un producto
 * 
 * @features
 * ✅ Validación de tipos con Zod schemas (ProductSchema, ProductListResponseSchema)
 * ✅ Renovación automática de access token si está por expirar
 * ✅ Manejo centralizado de errores HTTP (401, 404, 500, etc.)
 * ✅ Limpieza de sesión automática si el refresh token expiró (401)
 * ✅ Logging detallado en consola con prefijo [ProductService]
 * ✅ Soporte para filtros avanzados (búsqueda, categoría, color, rango de precios)
 * ✅ Configuración de URL dinámica según plataforma (web vs móvil)
 * 
 * @architecture
 * Este servicio sigue el patrón Repository, abstrayendo la lógica de
 * comunicación HTTP del resto de la aplicación. Los componentes consumen
 * este servicio a través de React Query (useQuery, useMutation).
 * 
 * @authentication
 * Todas las funciones usan getValidAccessToken() de tokenService.ts, que:
 * 1. Verifica si el access token está por expirar (< 2 minutos)
 * 2. Si está por expirar, renueva automáticamente con el refresh token
 * 3. Si el refresh token expiró, limpia AsyncStorage y devuelve null
 * 4. Retorna el token válido para incluirlo en el header Authorization
 * 
 * @validation
 * Usa Zod para runtime validation de las respuestas del backend:
 * - ProductSchema: Valida estructura de un producto individual
 * - ProductListResponseSchema: Valida estructura de lista paginada
 * Si la validación falla, lanza error con detalles del problema.
 * 
 * @error_handling
 * - 400: Error de validación (datos inválidos)
 * - 401: Token expirado → Limpia AsyncStorage y fuerza logout
 * - 404: Recurso no encontrado
 * - 500: Error interno del servidor
 * - Network error: Sin conexión o backend caído
 * 
 * @usage
 * ```tsx
 * import { getProducts, createProduct } from '@/services/productService';
 * import { useQuery, useMutation } from '@tanstack/react-query';
 * 
 * // Obtener productos con React Query:
 * const { data } = useQuery({
 *   queryKey: ['products', filters],
 *   queryFn: () => getProducts(filters)
 * });
 * 
 * // Crear producto:
 * const createMutation = useMutation({
 *   mutationFn: createProduct,
 *   onSuccess: () => queryClient.invalidateQueries(['products'])
 * });
 * ```
 * 
 * ============================================================================
 */

// Importa Platform para detectar si la app corre en web o móvil (Android/iOS)
// Usado para configurar correctamente la URL del backend
import { Platform } from 'react-native';

// Importa tipos TypeScript y schemas Zod para productos
// - Product: Tipo de un producto individual
// - CreateProductInput: Datos necesarios para crear un producto
// - UpdateProductInput: Datos para actualizar un producto (parcial)
// - ProductFilters: Filtros opcionales para getProducts (búsqueda, categoría, precio)
// - ProductListResponse: Estructura de respuesta de lista paginada
// - ProductSchema: Schema Zod para validar un producto individual
// - ProductListResponseSchema: Schema Zod para validar lista paginada
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ProductListResponse,
  ProductSchema,
  ProductListResponseSchema,
} from '../types/product';

// Importa función que obtiene access token válido (renovándolo si es necesario)
// Esta función maneja automáticamente la renovación del token y limpieza de sesión
import { getValidAccessToken } from './tokenService';

/**
 * ============================================================================
 * API_BASE_URL - Configuración Dinámica de URL del Backend
 * ============================================================================
 * 
 * @constant API_BASE_URL
 * @type {string}
 * @description URL base del backend, configurada dinámicamente según el entorno:
 * 
 * 1. PRODUCCIÓN: Usa EXPO_PUBLIC_API_URL del archivo .env
 *    - Ejemplo: https://api.adminapp.com
 *    - Se configura en .env: EXPO_PUBLIC_API_URL=https://api.adminapp.com
 * 
 * 2. DESARROLLO WEB: Si corre en navegador → http://localhost:3000
 *    - Platform.OS === 'web' detecta ejecución en navegador
 *    - Asume backend corriendo localmente en puerto 3000
 * 
 * 3. DESARROLLO MÓVIL: Si corre en Android/iOS → http://10.250.77.96:3000
 *    - 10.250.77.96 es la IP local del ordenador con el backend
 *    - localhost NO funciona en emuladores/dispositivos físicos
 *    - ⚠️ IMPORTANTE: Cambiar esta IP por la IP local de tu ordenador
 * 
 * @example
 * // Para obtener tu IP local:
 * // Windows: ipconfig (buscar IPv4 Address)
 * // Mac/Linux: ifconfig (buscar inet)
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'web' 
    ? 'http://localhost:3000'        // Backend local para desarrollo web
    : 'http://10.250.77.96:3000');   // IP local del ordenador para desarrollo móvil

/**
 * ============================================================================
 * getHeaders() - Genera Headers HTTP con Autenticación JWT
 * ============================================================================
 * 
 * @function getHeaders
 * @async
 * @returns {Promise<HeadersInit>} Headers HTTP con Content-Type y Authorization
 * 
 * @description Genera headers HTTP estándar para todas las peticiones al backend.
 * Incluye automáticamente el access token JWT en el header Authorization.
 * 
 * @flow
 * 1. Llama a getValidAccessToken() de tokenService
 *    - Verifica si el token está por expirar (< 2 minutos)
 *    - Si está por expirar, renueva automáticamente con refresh token
 *    - Si el refresh token expiró, retorna null
 * 2. Construye objeto de headers con Content-Type JSON
 * 3. Si hay token válido, añade header Authorization: Bearer <token>
 * 4. Si no hay token (null), omite Authorization (para endpoints públicos)
 * 
 * @returns Objeto con headers:
 * - Content-Type: application/json (siempre presente)
 * - Authorization: Bearer <token> (solo si hay token válido)
 * 
 * @example
 * ```ts
 * const headers = await getHeaders();
 * // Resultado si hay token válido:
 * // {
 * //   'Content-Type': 'application/json',
 * //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * // }
 * 
 * // Resultado si no hay token:
 * // {
 * //   'Content-Type': 'application/json'
 * // }
 * ```
 */
const getHeaders = async (): Promise<HeadersInit_> => {
  // Obtiene token válido (renovándolo automáticamente si es necesario)
  const token = await getValidAccessToken();
  
  // Retorna headers base + Authorization si hay token
  return {
    'Content-Type': 'application/json',  // Todas las peticiones son JSON
    ...(token && { 'Authorization': `Bearer ${token}` }),  // Añade Authorization solo si hay token
  };
};

/**
 * ============================================================================
 * getProducts() - Obtiene Lista Paginada de Productos con Filtros
 * ============================================================================
 * 
 * @function getProducts
 * @async
 * @param {ProductFilters} [filters] - Filtros opcionales para la búsqueda
 * @returns {Promise<ProductListResponse>} Lista paginada de productos validada con Zod
 * 
 * @description Obtiene lista de productos del backend con soporte para filtros
 * avanzados (búsqueda, categoría, color, precio, paginación). La respuesta es
 * validada automáticamente con ProductListResponseSchema de Zod.
 * 
 * @filters_available
 * - search: string - Búsqueda por nombre/descripción del producto
 * - categoryId: string - Filtra por ID de categoría
 * - colorId: string - Filtra por ID de color
 * - status: 'all' | 'active' | 'inactive' - Filtra por estado del producto
 * - minPrice: number - Precio mínimo
 * - maxPrice: number - Precio máximo
 * - page: number - Número de página (para paginación)
 * - limit: number - Cantidad de productos por página
 * 
 * @flow
 * 1. Crea URLSearchParams vacío
 * 2. Añade cada filtro como query param si existe (search, categoryId, etc.)
 * 3. Construye URL completa: ${API_BASE_URL}/product?search=...&categoryId=...
 * 4. Llama a getHeaders() para obtener headers con JWT
 * 5. Hace petición GET al backend
 * 6. Si la respuesta es 4xx/5xx, extrae mensaje de error y lanza excepción
 * 7. Parsea respuesta JSON
 * 8. Valida estructura con ProductListResponseSchema.parse()
 *    - Si la validación falla, lanza error con detalles del problema
 * 9. Retorna datos validados
 * 
 * @response_structure
 * ```ts
 * {
 *   products: Product[],        // Array de productos
 *   total: number,              // Total de productos (para paginación)
 *   page: number,               // Página actual
 *   totalPages: number          // Total de páginas
 * }
 * ```
 * 
 * @throws {Error} Si la petición HTTP falla (4xx, 5xx)
 * @throws {ZodError} Si la respuesta del backend no tiene la estructura esperada
 * 
 * @example
 * ```tsx
 * // Sin filtros (obtiene todos):
 * const allProducts = await getProducts();
 * 
 * // Con búsqueda:
 * const searchResults = await getProducts({ search: 'mesa' });
 * 
 * // Filtrando por categoría y precio:
 * const filtered = await getProducts({
 *   categoryId: '123',
 *   minPrice: 50,
 *   maxPrice: 200,
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export const getProducts = async (filters?: ProductFilters): Promise<ProductListResponse> => {
  try {
    // === PASO 1: Construir query params dinámicamente ===
    const params = new URLSearchParams();
    
    // Añadir parámetro de búsqueda si existe
    if (filters?.search) params.append('search', filters.search);
    
    // Añadir filtro de categoría si existe
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    
    // Añadir filtro de color si existe
    if (filters?.colorId) params.append('colorId', filters.colorId);
    
    // Añadir filtro de estado si existe y NO es 'all' (all = sin filtro)
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    
    // Añadir filtro de precio mínimo si existe
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    
    // Añadir filtro de precio máximo si existe
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    // Añadir paginación: número de página
    if (filters?.page) params.append('page', filters.page.toString());
    
    // Añadir paginación: cantidad de items por página
    if (filters?.limit) params.append('limit', filters.limit.toString());

    // === PASO 2: Construir URL completa ===
    // Si hay params: /product?search=mesa&categoryId=123
    // Si NO hay params: /product
    const url = `${API_BASE_URL}/product${params.toString() ? `?${params.toString()}` : ''}`;
    
    // === PASO 3: Hacer petición GET con autenticación ===
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders(),  // Incluye JWT automáticamente
    });

    // === PASO 4: Manejar errores HTTP (4xx, 5xx) ===
    if (!response.ok) {
      // Intenta extraer mensaje de error del backend
      const errorData = await response.json().catch(() => ({}));
      // Lanza error con mensaje del backend o mensaje genérico
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 5: Parsear respuesta JSON ===
    const data = await response.json();
    
    // === PASO 6: Validar estructura con Zod ===
    // Si la estructura no coincide con ProductListResponseSchema, lanza ZodError
    return ProductListResponseSchema.parse(data);
  } catch (error) {
    // Loguear error en consola con prefijo [ProductService]
    console.error('[ProductService] Error getting products:', error);
    // Re-lanzar error para que el componente lo maneje (mostrar toast, etc.)
    throw error;
  }
};

/**
 * ============================================================================
 * getProductById() - Obtiene un Producto Específico por su ID
 * ============================================================================
 * 
 * @function getProductById
 * @async
 * @param {string} id - ID del producto a obtener
 * @returns {Promise<Product>} Producto validado con ProductSchema de Zod
 * 
 * @description Obtiene los detalles completos de un producto específico del
 * backend usando su ID. La respuesta es validada automáticamente con ProductSchema.
 * 
 * @flow
 * 1. Construye URL: ${API_BASE_URL}/product/${id}
 * 2. Llama a getHeaders() para obtener headers con JWT
 * 3. Hace petición GET al backend
 * 4. Si la respuesta es 4xx/5xx, extrae mensaje de error:
 *    - 404: Producto no encontrado
 *    - 401: Token expirado
 *    - 500: Error interno del servidor
 * 5. Parsea respuesta JSON
 * 6. Valida estructura con ProductSchema.parse()
 *    - Asegura que todos los campos requeridos estén presentes
 *    - Valida tipos de datos (números, strings, booleans)
 * 7. Retorna producto validado
 * 
 * @throws {Error} Si el producto no existe (404)
 * @throws {Error} Si la petición HTTP falla (4xx, 5xx)
 * @throws {ZodError} Si la respuesta no tiene la estructura esperada
 * 
 * @use_case
 * - Ver detalles de un producto en ProductDetailsScreen
 * - Editar un producto (cargar datos existentes en formulario)
 * - Mostrar vista previa de producto
 * 
 * @example
 * ```tsx
 * // En un componente con React Query:
 * const { data: product, isLoading } = useQuery({
 *   queryKey: ['product', productId],
 *   queryFn: () => getProductById(productId)
 * });
 * 
 * // Resultado:
 * // {
 * //   id: '123',
 * //   name: 'Mesa de madera',
 * //   description: 'Mesa artesanal...',
 * //   price: 150,
 * //   stock: 10,
 * //   isActive: true,
 * //   categoryId: 'cat-1',
 * //   colorId: 'col-2',
 * //   images: [...]
 * // }
 * ```
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    // === PASO 1: Construir URL con el ID del producto ===
    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'GET',
      headers: await getHeaders(),  // Incluye JWT automáticamente
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      // Intenta extraer mensaje de error del backend
      const errorData = await response.json().catch(() => ({}));
      // Lanza error con mensaje específico (ej: "Producto no encontrado")
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear respuesta JSON ===
    const data = await response.json();
    
    // === PASO 4: Validar estructura con Zod ===
    // ProductSchema asegura que el objeto tiene todos los campos requeridos
    return ProductSchema.parse(data);
  } catch (error) {
    // Loguear error en consola
    console.error('[ProductService] Error getting product:', error);
    // Re-lanzar para que el componente lo maneje
    throw error;
  }
};

/**
 * ============================================================================
 * createProduct() - Crea un Nuevo Producto (con opción de subir imagen)
 * ============================================================================
 * 
 * @function createProduct
 * @async
 * @param {CreateProductInput} product - Datos del producto a crear
 * @returns {Promise<Product>} Producto creado y validado con ProductSchema
 * 
 * @description Crea un nuevo producto en el backend. Soporta opcionalmente
 * subir una imagen asociada al producto. Si el token expiró, limpia la
 * sesión automáticamente y fuerza logout.
 * 
 * @flow
 * 1. Destructura product para separar imageUrl/imageAlt del resto de datos
 *    - imageUrl e imageAlt se envían a un endpoint separado (/images)
 *    - El resto de datos se envían al endpoint de productos (/product)
 * 2. Construye URL: ${API_BASE_URL}/product
 * 3. Llama a getHeaders() para autenticación JWT
 * 4. Hace petición POST con los datos del producto (sin imagen)
 * 5. Si la respuesta es 401 (Unauthorized):
 *    - Limpia TODOS los datos de AsyncStorage (tokens, user_data, last_login)
 *    - Lanza error específico: "Tu sesión ha expirado..."
 *    - Esto fuerza al usuario a volver a login
 * 6. Si la respuesta es otro error (400, 500), lanza error con mensaje del backend
 * 7. Parsea respuesta JSON (producto creado con su ID generado)
 * 8. SI se proporcionó imageUrl e imageAlt:
 *    - Hace petición POST a /images para crear la imagen
 *    - Asocia la imagen al producto recién creado (productId: data.id)
 *    - Si falla la subida de imagen, solo muestra warning (no lanza error)
 *    - El producto YA fue creado, solo falta la imagen
 * 9. Valida producto creado con ProductSchema.parse()
 * 10. Retorna producto validado
 * 
 * @special_cases
 * ⚠️ ERROR 401 (Token Expirado):
 * - Limpia AsyncStorage completo: access_token, refresh_token, user_data, last_login
 * - Lanza error con mensaje amigable: "Tu sesión ha expirado..."
 * - authStore detecta el error y redirige a login
 * 
 * ⚠️ ERROR EN SUBIDA DE IMAGEN:
 * - NO lanza error (solo console.warn)
 * - Producto se crea correctamente SIN imagen
 * - Usuario puede editar el producto después para añadir imagen
 * 
 * @throws {Error} 'Tu sesión ha expirado...' si el token está expirado (401)
 * @throws {Error} Mensaje del backend si hay error de validación (400)
 * @throws {Error} Error genérico si hay problema en el servidor (500)
 * @throws {ZodError} Si la respuesta no tiene la estructura esperada
 * 
 * @example
 * ```tsx
 * // Crear producto SIN imagen:
 * const newProduct = await createProduct({
 *   name: 'Mesa de roble',
 *   description: 'Mesa artesanal de roble macizo',
 *   price: 250,
 *   stock: 5,
 *   categoryId: 'cat-1',
 *   colorId: 'col-2'
 * });
 * 
 * // Crear producto CON imagen:
 * const newProductWithImage = await createProduct({
 *   name: 'Silla moderna',
 *   description: 'Silla ergonómica',
 *   price: 80,
 *   stock: 15,
 *   categoryId: 'cat-1',
 *   colorId: 'col-3',
 *   imageUrl: 'https://example.com/silla.jpg',
 *   imageAlt: 'Silla moderna ergonómica'
 * });
 * ```
 */
export const createProduct = async (product: CreateProductInput): Promise<Product> => {
  try {
    // === PASO 1: Separar imageUrl/imageAlt del producto ===
    // imageUrl e imageAlt se manejan en un endpoint separado (/images)
    const { imageUrl, imageAlt, ...productData } = product;
    
    // === PASO 2: Crear el producto (sin imagen) ===
    const response = await fetch(`${API_BASE_URL}/product`, {
      method: 'POST',
      headers: await getHeaders(),  // JWT automático
      body: JSON.stringify(productData),  // Solo datos del producto (sin imagen)
    });

    // === PASO 3: Manejar errores HTTP ===
    if (!response.ok) {
      // Intenta extraer mensaje de error del backend
      const errorData = await response.json().catch(() => ({}));
      
      // === CASO ESPECIAL: ERROR 401 (Token expirado) ===
      if (response.status === 401) {
        // Importa AsyncStorage dinámicamente para limpieza de sesión
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        // Elimina TODOS los datos de autenticación
        await AsyncStorage.default.multiRemove([
          '@access_token',      // JWT access token
          '@refresh_token',     // JWT refresh token
          '@user_data',         // Datos del usuario (email, nombre, rol)
          '@last_login',        // Timestamp del último login
        ]);
        // Lanza error específico que authStore detectará para redirigir a login
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      // === OTROS ERRORES (400, 500, etc.) ===
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 4: Parsear respuesta JSON (producto creado) ===
    const data = await response.json();
    
    // === PASO 5: Si se proporcionó imagen, subirla ===
    if (imageUrl && imageAlt) {
      try {
        // Crear imagen asociada al producto recién creado
        await fetch(`${API_BASE_URL}/images`, {
          method: 'POST',
          headers: await getHeaders(),
          body: JSON.stringify({
            src: imageUrl,           // URL de la imagen
            alt: imageAlt,           // Texto alternativo
            productId: data.id,      // ID del producto recién creado
          }),
        });
      } catch (imageError) {
        // Si falla la subida de imagen, solo muestra warning
        // El producto YA fue creado exitosamente, solo falta la imagen
        console.warn('[ProductService] Error creating product image:', imageError);
        // NO lanza error - permite continuar sin imagen
      }
    }
    
    // === PASO 6: Validar producto creado con Zod ===
    return ProductSchema.parse(data);
  } catch (error) {
    // Loguear error en consola
    console.error('[ProductService] Error creating product:', error);
    // Re-lanzar para que el componente lo maneje
    throw error;
  }
};

/**
 * ============================================================================
 * updateProduct() - Actualiza un Producto Existente
 * ============================================================================
 * 
 * @function updateProduct
 * @async
 * @param {string} id - ID del producto a actualizar
 * @param {Partial<UpdateProductInput>} product - Datos a actualizar (parcial)
 * @returns {Promise<Product>} Producto actualizado y validado
 * 
 * @description Actualiza campos específicos de un producto existente. Solo
 * los campos proporcionados serán actualizados, el resto permanece sin cambios.
 * 
 * @partial_update
 * Usa Partial<UpdateProductInput> para actualizar solo campos específicos:
 * - Ejemplo 1: Solo actualizar precio: { price: 99.99 }
 * - Ejemplo 2: Solo actualizar stock: { stock: 50 }
 * - Ejemplo 3: Actualizar varios campos: { price: 150, stock: 20, isActive: false }
 * 
 * @flow
 * 1. Construye URL con ID: ${API_BASE_URL}/product/${id}
 * 2. Llama a getHeaders() para JWT
 * 3. Hace petición PUT con datos parciales del producto
 * 4. Si 404: Producto no encontrado
 * 5. Si 401: Token expirado
 * 6. Si 400: Datos de validación inválidos
 * 7. Parsea respuesta JSON (producto actualizado)
 * 8. Valida con ProductSchema.parse()
 * 9. Retorna producto actualizado
 * 
 * @throws {Error} Si el producto no existe (404)
 * @throws {Error} Si los datos son inválidos (400)
 * @throws {Error} Si la petición falla (4xx, 5xx)
 * @throws {ZodError} Si la respuesta no tiene estructura válida
 * 
 * @example
 * ```tsx
 * // Actualizar solo precio:
 * await updateProduct('prod-123', { price: 199.99 });
 * 
 * // Actualizar varios campos:
 * await updateProduct('prod-123', {
 *   name: 'Mesa de roble premium',
 *   price: 350,
 *   stock: 8,
 *   description: 'Mesa premium de roble macizo'
 * });
 * 
 * // Desactivar producto:
 * await updateProduct('prod-123', { isActive: false });
 * ```
 */
export const updateProduct = async (id: string, product: Partial<UpdateProductInput>): Promise<Product> => {
  try {
    // === PASO 1: Petición PUT con datos parciales ===
    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),  // JWT automático
      body: JSON.stringify(product),  // Solo campos a actualizar
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear respuesta (producto actualizado) ===
    const data = await response.json();
    
    // === PASO 4: Validar con Zod ===
    return ProductSchema.parse(data);
  } catch (error) {
    console.error('[ProductService] Error updating product:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * deleteProduct() - Elimina un Producto Permanentemente
 * ============================================================================
 * 
 * @function deleteProduct
 * @async
 * @param {string} id - ID del producto a eliminar
 * @returns {Promise<void>} No retorna nada si la eliminación fue exitosa
 * 
 * @description Elimina permanentemente un producto del backend. Esta acción
 * NO es reversible. El producto y todas sus relaciones (imágenes, cart items,
 * order lines) serán eliminados o actualizados según la configuración del backend.
 * 
 * @warning
 * ⚠️ ACCIÓN DESTRUCTIVA: La eliminación es PERMANENTE y NO se puede deshacer.
 * Considera usar toggleProductStatus() para desactivar en lugar de eliminar.
 * 
 * @flow
 * 1. Construye URL con ID: ${API_BASE_URL}/product/${id}
 * 2. Llama a getHeaders() para autenticación JWT
 * 3. Hace petición DELETE al backend
 * 4. Si 404: Producto no encontrado (ya fue eliminado)
 * 5. Si 401: Token expirado
 * 6. Si 409: Conflicto (producto tiene pedidos asociados)
 * 7. Si la respuesta es exitosa (200/204), no retorna nada
 * 8. Si hay error, lanza excepción con mensaje del backend
 * 
 * @throws {Error} Si el producto no existe (404)
 * @throws {Error} Si el producto tiene pedidos asociados (409)
 * @throws {Error} Si la petición falla (4xx, 5xx)
 * 
 * @use_case
 * - Eliminar productos creados por error
 * - Limpiar productos duplicados
 * - Eliminar productos que nunca se usarán
 * 
 * @alternative
 * Si quieres "ocultar" un producto sin eliminarlo, usa toggleProductStatus():
 * ```tsx
 * // En lugar de eliminar:
 * await deleteProduct(id);  // ❌ Permanente
 * 
 * // Mejor: desactivar
 * await toggleProductStatus(id);  // ✅ Reversible
 * ```
 * 
 * @example
 * ```tsx
 * // Eliminar producto con confirmación:
 * const handleDelete = async (productId: string) => {
 *   const confirmed = await Alert.alert(
 *     'Confirmar eliminación',
 *     '¿Estás seguro? Esta acción no se puede deshacer',
 *     [
 *       { text: 'Cancelar', style: 'cancel' },
 *       { text: 'Eliminar', style: 'destructive', onPress: async () => {
 *         await deleteProduct(productId);
 *         showToast('Producto eliminado exitosamente');
 *       }}
 *     ]
 *   );
 * };
 * ```
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // === PASO 1: Petición DELETE ===
    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),  // JWT automático
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      // Intenta extraer mensaje de error del backend
      const errorData = await response.json().catch(() => ({}));
      // Lanza error con mensaje específico del backend
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // === PASO 3: Éxito (200/204) - No retorna nada ===
    // void significa que la función no retorna valor
  } catch (error) {
    // Loguear error en consola
    console.error('[ProductService] Error deleting product:', error);
    // Re-lanzar para que el componente lo maneje
    throw error;
  }
};

/**
 * ============================================================================
 * toggleProductStatus() - Cambia Estado Activo/Inactivo de un Producto
 * ============================================================================
 * 
 * @function toggleProductStatus
 * @async
 * @param {string} id - ID del producto a cambiar de estado
 * @returns {Promise<Product>} Producto con el estado actualizado
 * 
 * @description Alterna el estado isActive de un producto entre true/false.
 * Si el producto está activo, lo desactiva. Si está inactivo, lo activa.
 * Es una alternativa REVERSIBLE a deleteProduct().
 * 
 * @behavior
 * - Si isActive = true → cambia a false (producto OCULTO en tienda)
 * - Si isActive = false → cambia a true (producto VISIBLE en tienda)
 * 
 * @flow
 * 1. Construye URL: ${API_BASE_URL}/product/${id}/toggle-status
 * 2. Llama a getHeaders() para JWT
 * 3. Hace petición PUT al endpoint toggle-status
 * 4. Si 401: Token expirado → lanza error específico
 * 5. Si 404: Producto no encontrado
 * 6. Si éxito, parsea respuesta (producto con isActive actualizado)
 * 7. Valida con ProductSchema.parse()
 * 8. Retorna producto actualizado
 * 
 * @throws {Error} 'Token expirado' si el JWT está expirado (401)
 * @throws {Error} Mensaje del backend si hay error (404, 500)
 * @throws {ZodError} Si la respuesta no tiene estructura válida
 * 
 * @use_case
 * - Ocultar producto temporalmente sin eliminarlo
 * - Desactivar productos agotados hasta nuevo stock
 * - Activar/desactivar productos según temporada
 * - "Archivar" productos sin perder sus datos
 * 
 * @advantage_over_delete
 * ✅ REVERSIBLE: Se puede reactivar en cualquier momento
 * ✅ MANTIENE DATOS: No pierde imágenes, descripciones, categorías
 * ✅ MANTIENE HISTORIAL: Pedidos antiguos siguen vinculados al producto
 * ✅ MÁS SEGURO: No hay riesgo de eliminar por error
 * 
 * @example
 * ```tsx
 * // Desactivar producto agotado:
 * const product = await toggleProductStatus('prod-123');
 * console.log(product.isActive);  // false
 * 
 * // Reactivar producto cuando haya stock:
 * const reactivated = await toggleProductStatus('prod-123');
 * console.log(reactivated.isActive);  // true
 * 
 * // Con React Query y optimistic update:
 * const toggleMutation = useMutation({
 *   mutationFn: toggleProductStatus,
 *   onMutate: async (productId) => {
 *     // Actualiza UI inmediatamente (optimistic)
 *     await queryClient.cancelQueries(['products']);
 *     const previous = queryClient.getQueryData(['products']);
 *     
 *     queryClient.setQueryData(['products'], (old) => ({
 *       ...old,
 *       products: old.products.map(p => 
 *         p.id === productId ? { ...p, isActive: !p.isActive } : p
 *       )
 *     }));
 *     
 *     return { previous };
 *   },
 *   onError: (err, variables, context) => {
 *     // Si falla, revierte el cambio
 *     queryClient.setQueryData(['products'], context.previous);
 *   }
 * });
 * ```
 */
export const toggleProductStatus = async (id: string): Promise<Product> => {
  try {
    // === PASO 1: Petición PUT al endpoint toggle-status ===
    const response = await fetch(`${API_BASE_URL}/product/${id}/toggle-status`, {
      method: 'PUT',
      headers: await getHeaders(),  // JWT automático
    });

    // === PASO 2: Manejar error 401 (Token expirado) PRIMERO ===
    // Se verifica ANTES de !response.ok para mensaje específico
    if (response.status === 401) {
      throw new Error('Token expirado');
    }

    // === PASO 3: Manejar otros errores HTTP (404, 500) ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 4: Parsear respuesta (producto con isActive actualizado) ===
    const data = await response.json();
    
    // === PASO 5: Validar con Zod ===
    return ProductSchema.parse(data);
  } catch (error) {
    // Loguear error en consola
    console.error('[ProductService] Error toggling product status:', error);
    // Re-lanzar para que el componente lo maneje
    throw error;
  }
};
