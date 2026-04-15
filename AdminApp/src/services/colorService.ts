/**
 * ============================================================================
 * COLOR SERVICE - Servicio de Gestión de Colores
 * ============================================================================
 * 
 * @file colorService.ts
 * @description Servicio centralizado para operaciones CRUD de colores.
 * Los colores se usan para clasificar productos por color (ej: Blanco, Negro,
 * Madera Natural, Gris). Solo accesible por usuarios con rol ADMIN.
 * 
 * @functions
 * - getColors(): Obtiene lista completa de colores (sin paginación)
 * - getColorById(): Obtiene un color específico por ID
 * - createColor(): Crea un nuevo color con nombre y código hexadecimal
 * - updateColor(): Actualiza un color existente
 * - deleteColor(): Elimina un color permanentemente
 * 
 * @features
 * ✅ CRUD completo de colores para productos
 * ✅ Soporte para código hexadecimal (#FFFFFF, #000000, etc.)
 * ✅ Autenticación JWT automática con renovación
 * ✅ Manejo de errores HTTP (401, 403, 404, 409, 500)
 * ✅ Logging detallado con prefijo [ColorService]
 * ✅ Solo accesible por ADMIN (validado en backend)
 * 
 * @usage
 * ```tsx
 * import { getColors, createColor } from '@/services/colorService';
 * import { useQuery, useMutation } from '@tanstack/react-query';
 * 
 * // Obtener todos los colores:
 * const { data: colors } = useQuery({
 *   queryKey: ['colors'],
 *   queryFn: getColors
 * });
 * 
 * // Crear color:
 * const createMutation = useMutation({
 *   mutationFn: createColor,
 *   onSuccess: () => queryClient.invalidateQueries(['colors'])
 * });
 * 
 * await createMutation.mutateAsync({
 *   name: 'Blanco',
 *   hexCode: '#FFFFFF'
 * });
 * ```
 * 
 * ============================================================================
 */

// Importa Platform para detectar plataforma (web vs móvil)
import { Platform } from 'react-native';

// Importa tipos TypeScript para colores
// - Color: Estructura de un color (id, name, hexCode, isActive)
// - CreateColorDto: Datos para crear/actualizar color (name, hexCode)
import { Color, CreateColorDto } from '../types/color';

// Importa función de autenticación JWT con renovación automática
import { getValidAccessToken } from './tokenService';

/**
 * URL base del backend para endpoints de colores
 * Configurada dinámicamente según el entorno:
 * - Producción: EXPO_PUBLIC_API_URL del archivo .env
 * - Desarrollo web: http://localhost:3000
 * - Desarrollo móvil: http://10.250.77.96:3000 (IP local del ordenador)
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'web' 
    ? 'http://localhost:3000' 
    : 'http://10.250.77.96:3000');

/**
 * Genera headers HTTP con autenticación JWT para peticiones al backend.
 * Incluye automáticamente el access token renovado si es necesario.
 * 
 * @returns Headers con Content-Type: application/json y Authorization: Bearer <token>
 */
const getHeaders = async (): Promise<HeadersInit_> => {
  const token = await getValidAccessToken();  // Renueva token si está por expirar
  return {
    'Content-Type': 'application/json',  // Todas las peticiones son JSON
    ...(token && { 'Authorization': `Bearer ${token}` }),  // Añade JWT si existe
  };
};

/**
 * ============================================================================
 * getColors() - Obtiene Lista Completa de Colores
 * ============================================================================
 * 
 * @function getColors
 * @async
 * @returns {Promise<Color[]>} Array con todos los colores disponibles
 * 
 * @description Obtiene TODOS los colores sin paginación. Como suele haber
 * pocos colores (< 30), no se usa paginación como en productos/usuarios.
 * 
 * @flow
 * 1. Hace GET a /color
 * 2. Backend retorna array de colores (activos E inactivos)
 * 3. Parsea respuesta JSON
 * 4. Retorna array de colores
 * 
 * @note
 * Retorna TODOS los colores (activos e inactivos). Si solo necesitas activos:
 * ```ts
 * const activeColors = colors.filter(c => c.isActive);
 * ```
 * 
 * @throws {Error} Si la petición falla (4xx, 5xx)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @example
 * ```tsx
 * const colors = await getColors();
 * console.log(colors);
 * // [
 * //   { id: 'col-1', name: 'Blanco', hexCode: '#FFFFFF', isActive: true },
 * //   { id: 'col-2', name: 'Negro', hexCode: '#000000', isActive: true },
 * //   { id: 'col-3', name: 'Gris', hexCode: '#808080', isActive: false }
 * // ]
 * 
 * // Usar en selector de colores:
 * <Picker>
 *   {colors.filter(c => c.isActive).map(color => (
 *     <Picker.Item 
 *       key={color.id} 
 *       label={color.name} 
 *       value={color.id}
 *       color={color.hexCode}
 *     />
 *   ))}
 * </Picker>
 * ```
 */
export const getColors = async (): Promise<Color[]> => {
  try {
    // === PASO 1: Petición GET a /color ===
    const response = await fetch(`${API_BASE_URL}/color`, {
      method: 'GET',
      headers: await getHeaders(),  // Incluye JWT automáticamente
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear respuesta JSON (array de colores) ===
    const data = await response.json();
    return data;
  } catch (error) {
    // Loguear error en consola
    console.error('[ColorService] Error getting colors:', error);
    // Re-lanzar para que el componente lo maneje
    throw error;
  }
};

/**
 * ============================================================================
 * getColorById() - Obtiene un Color Específico por su ID
 * ============================================================================
 * 
 * @function getColorById
 * @async
 * @param {string} id - ID del color a obtener
 * @returns {Promise<Color>} Color encontrado
 * 
 * @description Obtiene los detalles completos de un color específico.
 * Útil para editar colores o mostrar detalles.
 * 
 * @flow
 * 1. Construye URL: /color/{id}
 * 2. Hace GET al backend
 * 3. Si 404: Color no encontrado
 * 4. Si éxito, parsea y retorna color
 * 
 * @throws {Error} Si el color no existe (404)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @example
 * ```ts
 * const color = await getColorById('col-1');
 * console.log(color);
 * // { id: 'col-1', name: 'Blanco', hexCode: '#FFFFFF', isActive: true }
 * 
 * // Usar para editar color:
 * const [colorToEdit, setColorToEdit] = useState<Color | null>(null);
 * const handleEdit = async (colorId: string) => {
 *   const color = await getColorById(colorId);
 *   setColorToEdit(color);
 * };
 * ```
 */
export const getColorById = async (id: string): Promise<Color> => {
  try {
    // === PASO 1: Petición GET a /color/{id} ===
    const response = await fetch(`${API_BASE_URL}/color/${id}`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear y retornar color ===
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ColorService] Error getting color:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * createColor() - Crea un Nuevo Color
 * ============================================================================
 * 
 * @function createColor
 * @async
 * @param {CreateColorDto} colorData - Datos del nuevo color (name, hexCode)
 * @returns {Promise<Color>} Color creado con ID generado
 * 
 * @description Crea un nuevo color para usar en clasificación de productos.
 * Requiere nombre único y código hexadecimal válido.
 * 
 * @required_fields
 * - name: string (debe ser único, ej: 'Blanco', 'Negro', 'Madera Natural')
 * - hexCode: string (formato #RRGGBB, ej: '#FFFFFF', '#000000', '#8B4513')
 * 
 * @validation
 * Backend valida:
 * - Nombre único (no puede haber dos colores con el mismo nombre)
 * - hexCode formato válido (debe empezar con # y tener 6 caracteres hex)
 * 
 * @flow
 * 1. Hace POST a /color con { name, hexCode }
 * 2. Backend valida nombre único
 * 3. Backend valida formato hexCode
 * 4. Backend crea color en BD con isActive: true
 * 5. Retorna color creado con ID generado
 * 
 * @throws {Error} Si el nombre ya existe (409 Conflict)
 * @throws {Error} Si hexCode es inválido (400 Bad Request)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @example
 * ```tsx
 * // Crear color básico:
 * const newColor = await createColor({
 *   name: 'Verde Oliva',
 *   hexCode: '#7B8C5F'
 * });
 * console.log(newColor);
 * // { id: 'col-4', name: 'Verde Oliva', hexCode: '#7B8C5F', isActive: true }
 * 
 * // Crear varios colores comunes:
 * const commonColors = [
 *   { name: 'Rojo', hexCode: '#FF0000' },
 *   { name: 'Azul', hexCode: '#0000FF' },
 *   { name: 'Amarillo', hexCode: '#FFFF00' }
 * ];
 * 
 * for (const color of commonColors) {
 *   await createColor(color);
 * }
 * ```
 */
export const createColor = async (colorData: CreateColorDto): Promise<Color> => {
  try {
    // === PASO 1: POST a /color con datos del nuevo color ===
    const response = await fetch(`${API_BASE_URL}/color`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(colorData),  // { name: 'Blanco', hexCode: '#FFFFFF' }
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear color creado (con ID generado) ===
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ColorService] Error creating color:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * updateColor() - Actualiza un Color Existente
 * ============================================================================
 * 
 * @function updateColor
 * @async
 * @param {string} id - ID del color a actualizar
 * @param {CreateColorDto} colorData - Nuevos datos (name, hexCode)
 * @returns {Promise<Color>} Color actualizado
 * 
 * @description Actualiza el nombre y/o código hexadecimal de un color.
 * 
 * @updatable_fields
 * - name: string (debe ser único si se cambia)
 * - hexCode: string (formato #RRGGBB)
 * 
 * @flow
 * 1. Hace PUT a /color/{id} con nuevos datos
 * 2. Backend valida que el nuevo nombre sea único (si se cambia)
 * 3. Backend valida formato de hexCode
 * 4. Backend actualiza color en BD
 * 5. Retorna color actualizado
 * 
 * @throws {Error} Si el color no existe (404)
 * @throws {Error} Si el nuevo nombre ya existe (409)
 * @throws {Error} Si hexCode es inválido (400)
 * 
 * @example
 * ```ts
 * // Corregir nombre de color:
 * await updateColor('col-1', {
 *   name: 'Blanco Puro',
 *   hexCode: '#FFFFFF'
 * });
 * 
 * // Ajustar código hexadecimal:
 * await updateColor('col-3', {
 *   name: 'Gris',
 *   hexCode: '#A0A0A0'  // Cambiar de #808080 a un gris más claro
 * });
 * ```
 */
export const updateColor = async (id: string, colorData: CreateColorDto): Promise<Color> => {
  try {
    // === PASO 1: PUT a /color/{id} con datos actualizados ===
    const response = await fetch(`${API_BASE_URL}/color/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(colorData),  // { name: '...', hexCode: '...' }
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear color actualizado ===
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ColorService] Error updating color:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * deleteColor() - Elimina un Color Permanentemente
 * ============================================================================
 * 
 * @function deleteColor
 * @async
 * @param {string} id - ID del color a eliminar
 * @returns {Promise<void>}
 * 
 * @description Elimina permanentemente un color del sistema. ACCIÓN IRREVERSIBLE.
 * 
 * @warning
 * ⚠️ ACCIÓN DESTRUCTIVA: La eliminación es PERMANENTE.
 * Si el color tiene productos asociados, el backend puede:
 * - Retornar error 409 (no permitir eliminación)
 * - O cambiar los productos a color "Sin color"
 * - Depende de la configuración del backend (onDelete: RESTRICT vs CASCADE)
 * 
 * @flow
 * 1. Hace DELETE a /color/{id}
 * 2. Backend verifica si hay productos con este color
 * 3. Si hay productos:
 *    - Retorna 409 Conflict (no permite eliminar)
 *    - O actualiza productos a null (según configuración)
 * 4. Si no hay productos, elimina el color
 * 
 * @throws {Error} Si el color no existe (404)
 * @throws {Error} Si el color tiene productos asociados (409)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @best_practice
 * En lugar de eliminar, considera desactivar el color si el backend
 * tiene un campo isActive:
 * ```ts
 * // Mejor que deleteColor (si existe toggleColorStatus):
 * await toggleColorStatus(id);  // ✅ Reversible
 * ```
 * 
 * @example
 * ```tsx
 * // Con confirmación del usuario:
 * const handleDelete = async (colorId: string) => {
 *   Alert.alert(
 *     'Confirmar eliminación',
 *     '¿Eliminar este color? Los productos con este color quedarán sin color asignado.',
 *     [
 *       { text: 'Cancelar', style: 'cancel' },
 *       { text: 'Eliminar', style: 'destructive', onPress: async () => {
 *         try {
 *           await deleteColor(colorId);
 *           showToast('Color eliminado');
 *         } catch (error) {
 *           if (error.message.includes('409')) {
 *             showToast('No se puede eliminar: hay productos con este color');
 *           } else {
 *             showToast('Error al eliminar color');
 *           }
 *         }
 *       }}
 *     ]
 *   );
 * };
 * ```
 */
export const deleteColor = async (id: string): Promise<void> => {
  try {
    // === PASO 1: DELETE a /color/{id} ===
    const response = await fetch(`${API_BASE_URL}/color/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    // === PASO 3: Éxito (200/204) - No retorna nada ===
  } catch (error) {
    console.error('[ColorService] Error deleting color:', error);
    throw error;
  }
};
