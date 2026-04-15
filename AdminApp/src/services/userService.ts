/**
 * ============================================================================
 * USER SERVICE - Servicio de Gestión de Usuarios
 * ============================================================================
 * 
 * @file userService.ts
 * @description Servicio centralizado para todas las operaciones CRUD de usuarios.
 * Maneja peticiones HTTP al backend, autenticación con JWT, y paginación de resultados.
 * Solo accesible por usuarios con rol ADMIN.
 * 
 * @functions
 * - getUsers(): Obtiene lista paginada de usuarios
 * - getUserById(): Obtiene un usuario específico por su ID
 * - createUser(): Crea un nuevo usuario (con contraseña encriptada)
 * - updateUser(): Actualiza datos de un usuario existente
 * - deleteUser(): Elimina un usuario permanentemente
 * - toggleUserStatus(): Cambia estado activo/inactivo de un usuario
 * 
 * @features
 * ✅ Paginación de resultados (evita cargar todos los usuarios a la vez)
 * ✅ Autenticación JWT automática con renovación de tokens
 * ✅ Manejo de errores HTTP (401, 403, 404, 500)
 * ✅ Logging detallado con prefijo [UserService]
 * ✅ Solo accesible por administradores (validado en backend)
 * ✅ Configuración de URL dinámica según plataforma
 * 
 * @security
 * - TODOS los endpoints requieren autenticación (Authorization: Bearer <token>)
 * - TODOS los endpoints requieren rol ADMIN (validado en backend)
 * - Si un usuario normal intenta acceder → Backend retorna 403 Forbidden
 * - Contraseñas se envían en texto plano al backend (backend las encripta)
 * 
 * @usage
 * ```tsx
 * import { getUsers, createUser } from '@/services/userService';
 * import { useQuery, useMutation } from '@tanstack/react-query';
 * 
 * // Obtener usuarios paginados:
 * const { data } = useQuery({
 *   queryKey: ['users', page],
 *   queryFn: () => getUsers(page, 20)
 * });
 * 
 * // Crear usuario:
 * const createMutation = useMutation({
 *   mutationFn: createUser,
 *   onSuccess: () => queryClient.invalidateQueries(['users'])
 * });
 * ```
 * 
 * ============================================================================
 */

// Importa Platform para detectar plataforma (web vs móvil)
import { Platform } from 'react-native';

// Importa tipos TypeScript para usuarios
// - User: Tipo de un usuario (id, email, nombre, rol, isActive, etc.)
// - CreateUserDto: Datos necesarios para crear un usuario (email, nombre, contraseña, rol)
// - UpdateUserDto: Datos para actualizar un usuario (parcial)
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

// Importa función que obtiene access token válido (renovándolo si es necesario)
import { getValidAccessToken } from './tokenService';

/**
 * ============================================================================
 * PaginatedResponse - Estructura de Respuesta Paginada
 * ============================================================================
 * 
 * @interface PaginatedResponse
 * @description Estructura de datos para listas paginadas de usuarios.
 * Incluye los datos, total de registros, y metadata de paginación.
 * 
 * @property {User[]} data - Array de usuarios de la página actual
 * @property {number} total - Total de usuarios en la base de datos
 * @property {number} page - Número de página actual (empezando en 1)
 * @property {number} totalPages - Total de páginas disponibles
 * 
 * @example
 * ```ts
 * // Respuesta del backend:
 * {
 *   data: [
 *     { id: 1, email: 'admin@example.com', name: 'Admin', role: 'ADMIN', isActive: true },
 *     { id: 2, email: 'user@example.com', name: 'User', role: 'CLIENT', isActive: true }
 *   ],
 *   total: 50,
 *   page: 1,
 *   totalPages: 3
 * }
 * ```
 */
export interface PaginatedResponse {
  data: User[];        // Array de usuarios de la página actual
  total: number;       // Total de registros en la BD
  page: number;        // Página actual (1, 2, 3, ...)
  totalPages: number;  // Total de páginas (calculado: total / limit)
}

/**
 * URL base del backend para endpoints de usuarios
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
 * getUsers() - Obtiene Lista Paginada de Usuarios
 * ============================================================================
 * 
 * @function getUsers
 * @async
 * @param {number} [page=1] - Número de página (empezando en 1)
 * @param {number} [limit=20] - Cantidad de usuarios por página
 * @returns {Promise<PaginatedResponse>} Lista paginada de usuarios
 * 
 * @description Obtiene lista paginada de usuarios del backend. Solo accesible
 * por usuarios con rol ADMIN. Incluye metadata de paginación (total, totalPages).
 * 
 * @pagination
 * - page: Número de página (1, 2, 3, ...)
 * - limit: Usuarios por página (por defecto 20)
 * - total: Total de usuarios en la BD
 * - totalPages: Total de páginas (calculado: Math.ceil(total / limit))
 * 
 * @flow
 * 1. Construye URL con query params: /users?page=1&limit=20
 * 2. Llama a getHeaders() para obtener JWT
 * 3. Hace petición GET al backend
 * 4. Si 403: Usuario no es ADMIN → lanza error
 * 5. Si 401: Token expirado → lanza error
 * 6. Si éxito, parsea respuesta JSON (PaginatedResponse)
 * 7. Retorna datos paginados
 * 
 * @throws {Error} Si el usuario no es ADMIN (403)
 * @throws {Error} Si la petición falla (4xx, 5xx)
 * 
 * @example
 * ```tsx
 * // Obtener primera página (20 usuarios):
 * const response = await getUsers(1, 20);
 * console.log(response);
 * // {
 * //   data: [{ id: 1, email: 'admin@example.com', ... }, ...],
 * //   total: 50,
 * //   page: 1,
 * //   totalPages: 3
 * // }
 * 
 * // Obtener segunda página:
 * const page2 = await getUsers(2, 20);
 * ```
 */
export const getUsers = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse> => {
  try {
    // === PASO 1: Construir URL con query params ===
    const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: await getHeaders(),  // Incluye JWT automáticamente
    });

    // === PASO 2: Manejar errores HTTP ===
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // === PASO 3: Parsear respuesta JSON (PaginatedResponse) ===
    const data = await response.json();
    return data;
  } catch (error) {
    // Loguear error en consola
    console.error('[UserService] Error getting users:', error);
    // Re-lanzar para que el componente lo maneje
    throw error;
  }
};

/**
 * ============================================================================
 * getUserById() - Obtiene un Usuario Específico por su ID
 * ============================================================================
 * 
 * @function getUserById
 * @async
 * @param {number} id - ID del usuario a obtener
 * @returns {Promise<User>} Usuario encontrado
 * 
 * @description Obtiene los detalles completos de un usuario específico.
 * Solo accesible por usuarios con rol ADMIN.
 * 
 * @flow
 * 1. Construye URL: /users/{id}
 * 2. Llama a getHeaders() para JWT
 * 3. Hace petición GET
 * 4. Si 404: Usuario no encontrado
 * 5. Si 403: No es ADMIN
 * 6. Si éxito, parsea y retorna usuario
 * 
 * @throws {Error} Si el usuario no existe (404)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @example
 * ```ts
 * const user = await getUserById(1);
 * console.log(user);
 * // { id: 1, email: 'admin@example.com', name: 'Admin', role: 'ADMIN', isActive: true }
 * ```
 */
export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
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
    console.error('[UserService] Error getting user:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * createUser() - Crea un Nuevo Usuario
 * ============================================================================
 * 
 * @function createUser
 * @async
 * @param {CreateUserDto} userData - Datos del usuario a crear
 * @returns {Promise<User>} Usuario creado
 * 
 * @description Crea un nuevo usuario en el backend. Solo accesible por ADMIN.
 * La contraseña se envía en texto plano y el backend la encripta automáticamente.
 * 
 * @required_fields
 * - email: string (debe ser único)
 * - name: string
 * - password: string (mínimo 6 caracteres)
 * - role: 'ADMIN' | 'CLIENT'
 * 
 * @flow
 * 1. Valida que userData tenga todos los campos requeridos
 * 2. Hace POST a /users con los datos
 * 3. Backend valida email único
 * 4. Backend encripta la contraseña (bcrypt)
 * 5. Backend crea usuario en BD
 * 6. Retorna usuario creado (SIN contraseña)
 * 
 * @throws {Error} Si el email ya existe (409 Conflict)
 * @throws {Error} Si los datos son inválidos (400)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @example
 * ```tsx
 * const newUser = await createUser({
 *   email: 'newuser@example.com',
 *   name: 'New User',
 *   password: 'password123',
 *   role: 'CLIENT'
 * });
 * console.log(newUser);
 * // { id: 3, email: 'newuser@example.com', name: 'New User', role: 'CLIENT', isActive: true }
 * // La contraseña NO se retorna por seguridad
 * ```
 */
export const createUser = async (userData: CreateUserDto): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(userData),  // Incluye email, name, password, role
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[UserService] Error creating user:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * updateUser() - Actualiza un Usuario Existente
 * ============================================================================
 * 
 * @function updateUser
 * @async
 * @param {number} id - ID del usuario a actualizar
 * @param {UpdateUserDto} userData - Datos a actualizar (puede ser parcial)
 * @returns {Promise<User>} Usuario actualizado
 * 
 * @description Actualiza campos específicos de un usuario. Solo accesible por ADMIN.
 * 
 * @updatable_fields
 * - name: string (nombre del usuario)
 * - email: string (debe ser único si se cambia)
 * - password: string (se encripta automáticamente)
 * - role: 'ADMIN' | 'CLIENT'
 * - isActive: boolean (estado del usuario)
 * 
 * @flow
 * 1. Hace PUT a /users/{id} con datos parciales
 * 2. Backend valida que el email sea único (si se cambia)
 * 3. Backend encripta la nueva contraseña (si se proporciona)
 * 4. Backend actualiza usuario en BD
 * 5. Retorna usuario actualizado
 * 
 * @throws {Error} Si el usuario no existe (404)
 * @throws {Error} Si el email ya existe (409)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @example
 * ```ts
 * // Actualizar solo nombre:
 * await updateUser(1, { name: 'Admin Actualizado' });
 * 
 * // Cambiar contraseña:
 * await updateUser(1, { password: 'newpassword123' });
 * 
 * // Actualizar varios campos:
 * await updateUser(1, {
 *   name: 'New Name',
 *   email: 'newemail@example.com',
 *   role: 'ADMIN'
 * });
 * ```
 */
export const updateUser = async (id: number, userData: UpdateUserDto): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(userData),  // Solo campos a actualizar
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[UserService] Error updating user:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * deleteUser() - Elimina un Usuario Permanentemente
 * ============================================================================
 * 
 * @function deleteUser
 * @async
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<void>}
 * 
 * @description Elimina permanentemente un usuario del backend. Esta acción
 * NO es reversible. Solo accesible por ADMIN.
 * 
 * @warning
 * ⚠️ ACCIÓN DESTRUCTIVA: La eliminación es PERMANENTE.
 * Consider usar toggleUserStatus() para desactivar en lugar de eliminar.
 * 
 * @flow
 * 1. Hace DELETE a /users/{id}
 * 2. Backend verifica que el usuario no tenga pedidos activos
 * 3. Backend elimina usuario de BD
 * 4. Si éxito, no retorna nada (void)
 * 
 * @throws {Error} Si el usuario no existe (404)
 * @throws {Error} Si el usuario tiene pedidos activos (409)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @alternative
 * En lugar de eliminar, desactivar:
 * ```ts
 * // En lugar de:
 * await deleteUser(id);  // ❌ Permanente
 * 
 * // Mejor:
 * await toggleUserStatus(id);  // ✅ Reversible
 * ```
 * 
 * @example
 * ```tsx
 * // Con confirmación:
 * const handleDelete = async (userId: number) => {
 *   Alert.alert(
 *     'Confirmar eliminación',
 *     '¿Estás seguro? Esta acción no se puede deshacer',
 *     [
 *       { text: 'Cancelar', style: 'cancel' },
 *       { text: 'Eliminar', style: 'destructive', onPress: async () => {
 *         await deleteUser(userId);
 *         showToast('Usuario eliminado');
 *       }}
 *     ]
 *   );
 * };
 * ```
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    // Éxito - no retorna nada (void)
  } catch (error) {
    console.error('[UserService] Error deleting user:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * toggleUserStatus() - Cambia Estado Activo/Inactivo de un Usuario
 * ============================================================================
 * 
 * @function toggleUserStatus
 * @async
 * @param {number} id - ID del usuario a cambiar de estado
 * @returns {Promise<User>} Usuario con estado actualizado
 * 
 * @description Alterna el estado isActive de un usuario entre true/false.
 * Si el usuario está activo, lo desactiva. Si está inactivo, lo activa.
 * Es una alternativa REVERSIBLE a deleteUser().
 * 
 * @behavior
 * - Si isActive = true → cambia a false (usuario BLOQUEADO, no puede hacer login)
 * - Si isActive = false → cambia a true (usuario DESBLOQUEADO, puede hacer login)
 * 
 * @flow
 * 1. Hace PUT a /users/{id}/toggle-status
 * 2. Backend alterna el campo isActive
 * 3. Backend guarda cambio en BD
 * 4. Retorna usuario actualizado
 * 
 * @throws {Error} Si el usuario no existe (404)
 * @throws {Error} Si no es ADMIN (403)
 * 
 * @use_case
 * - Bloquear usuario temporalmente por comportamiento inapropiado
 * - Desactivar cuentas inactivas sin perder datos
 * - Bloquear usuarios con facturas impagas
 * - Reactivar usuarios después de resolver issues
 * 
 * @advantage_over_delete
 * ✅ REVERSIBLE: Se puede reactivar en cualquier momento
 * ✅ MANTIENE DATOS: No pierde email, nombre, historial de pedidos
 * ✅ MÁS SEGURO: No hay riesgo de eliminar por error
 * 
 * @example
 * ```tsx
 * // Bloquear usuario:
 * const user = await toggleUserStatus(1);
 * console.log(user.isActive);  // false
 * // Usuario no puede hacer login hasta reactivarse
 * 
 * // Reactivar usuario:
 * const reactivated = await toggleUserStatus(1);
 * console.log(reactivated.isActive);  // true
 * // Usuario puede hacer login nuevamente
 * ```
 */
export const toggleUserStatus = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
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
    console.error('[UserService] Error toggling user status:', error);
    throw error;
  }
};
