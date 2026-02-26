/**
 * ========================================
 * SERVICIO: authService
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Servicio para manejar todas las peticiones relacionadas con autenticación
 * al backend NestJS.
 * 
 * ENDPOINTS:
 * - POST /auth/login: Autenticar usuario con email y contraseña
 * - POST /auth/forgot-password: Envíar email de recuperación de contraseña
 * 
 * CONFIGURACIÓN DE URL:
 * La URL base se configura con variables de entorno:
 * - EXPO_PUBLIC_API_URL en archivo .env
 * - Fallback automático según plataforma:
 *   * Web: http://localhost:3000
 *   * Nativo: http://10.250.77.96:3000 (IP de clase WiFi Conselleria)
 * 
 * CONFIGURACIÓN RECOMENDADA:
 * Crear archivo .env en la raíz:
 * - Clase (WiFi Conselleria): EXPO_PUBLIC_API_URL=http://10.250.77.96:3000
 * - Casa: EXPO_PUBLIC_API_URL=http://192.168.1.X:3000 (sustituir X por tu IP)
 * - Web local: EXPO_PUBLIC_API_URL=http://localhost:3000
 * - Producción: EXPO_PUBLIC_API_URL=https://api.example.com
 * 
 * TIPOS:
 * - LoginCredentials: { email, password }
 * - LoginResponse: { user, access_token, refresh_token, expires_in, ... }
 * - User: { id, email, username, role, ... }
 * - UserRole: enum { ADMIN, USER }
 */

// ===== IMPORTS DE REACT NATIVE =====
import { Platform } from 'react-native'; // Detectar plataforma (iOS/Android/Web)

/**
 * URL base de la API del backend
 * 
 * Prioridad de configuración:
 * 1. Variable de entorno EXPO_PUBLIC_API_URL (recomendado)
 * 2. Fallback según plataforma:
 *    - Web: http://localhost:3000
 *    - Nativo: http://10.250.77.96:3000
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'web' 
    ? 'http://localhost:3000' // Desarrollo web
    : 'http://10.250.77.96:3000'); // IP actualizada de tu PC en clase

// ===== INTERFACES Y TIPOS =====

/**
 * Credenciales de login
 * 
 * @interface LoginCredentials
 * @property {string} email - Email del usuario
 * @property {string} password - Contraseña del usuario
 */
export interface LoginCredentials {
  email: string; // Email del usuario
  password: string; // Contraseña en texto plano (se envía encriptado por HTTPS)
}

/**
 * Enum de roles de usuario
 * 
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'admin', // Administrador (acceso completo)
  USER = 'user' // Usuario normal (solo lectura)
}

/**
 * Interfaz del usuario
 * 
 * @interface User
 * @property {number} id - ID único del usuario
 * @property {string} email - Email del usuario
 * @property {string} username - Nombre de usuario
 * @property {UserRole} role - Rol del usuario (admin/user)
 * @property {string} [firstName] - Nombre (opcional)
 * @property {string} [lastName] - Apellido (opcional)
 * @property {string} status - Estado del usuario
 * @property {boolean} isActive - Indica si el usuario está activo
 */
export interface User {
  id: number; // ID único
  email: string; // Email
  username: string; // Nombre de usuario
  role: UserRole; // Rol (admin/user)
  firstName?: string; // Nombre (opcional)
  lastName?: string; // Apellido (opcional)
  status: string; // Estado del usuario
  isActive: boolean; // Usuario activo/inactivo
}

/**
 * Respuesta del endpoint de login
 * 
 * @interface LoginResponse
 * @property {User} user - Datos del usuario autenticado
 * @property {string} access_token - Token JWT de acceso
 * @property {string} refresh_token - Token JWT de refresco
 * @property {number} expires_in - Tiempo de expiración en segundos
 * @property {string} token_type - Tipo de token (normalmente "Bearer")
 * @property {number} access_token_expires_at - Timestamp de expiración del access_token
 * @property {number} refresh_token_expires_at - Timestamp de expiración del refresh_token
 */
export interface LoginResponse {
  user: User; // Datos del usuario
  access_token: string; // Token de acceso JWT
  refresh_token: string; // Token de refresco JWT
  expires_in: number; // Expiración en segundos
  token_type: string; // Tipo de token ("Bearer")
  access_token_expires_at: number; // Timestamp de expiración del access token
  refresh_token_expires_at: number; // Timestamp de expiración del refresh token
}

// ===== FUNCIONES DEL SERVICIO =====

/**
 * FUNCIÓN: login
 * 
 * Realiza la autenticación del usuario llamando al endpoint POST /auth/login del backend.
 * 
 * PROCESO:
 * 1. Construye la URL del endpoint
 * 2. Envía petición POST con email y password
 * 3. Verifica que la respuesta sea exitosa (status 2xx)
 * 4. Devuelve los datos del usuario y los tokens JWT
 * 
 * LOGGING:
 * - Log de inicio de login
 * - Log de URL utilizada
 * - Log de email (sin contraseña por seguridad)
 * - Log de plataforma (iOS/Android/Web)
 * - Log de login exitoso con email y rol
 * - Log de errores si ocurren
 * 
 * @async
 * @param {LoginCredentials} credentials - Email y contraseña del usuario
 * @returns {Promise<LoginResponse>} Datos del usuario y tokens
 * @throws {Error} Si las credenciales son inválidas o hay error de red
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // ===== PASO 1: CONSTRUIR URL =====
    const url = `${API_BASE_URL}/auth/login`;
    
    // ===== LOGGING PARA DEBUG =====
    console.log('[AuthService] Intentando login...');
    console.log('[AuthService] URL:', url);
    console.log('[AuthService] Email:', credentials.email); // NO loguear password por seguridad
    console.log('[AuthService] Platform:', Platform.OS);
    
    // ===== PASO 2: HACER PETICIÓN POST =====
    const response = await fetch(url, {
      method: 'POST', // Método HTTP POST
      headers: {
        'Content-Type': 'application/json', // Indicar que enviamos JSON
      },
      body: JSON.stringify(credentials), // Convertir credenciales a JSON
    });

    // ===== PASO 3: VERIFICAR RESPUESTA =====
    if (!response.ok) {
      // Respuesta no exitosa (4xx o 5xx)
      const errorData = await response.json().catch(() => ({})); // Intentar parsear error
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // ===== PASO 4: PARSEAR RESPUESTA =====
    const data: LoginResponse = await response.json();
    
    // ===== LOGGING DE ÉXITO =====
    console.log('[AuthService] Login exitoso:', data.user.email, 'Role:', data.user.role);
    
    // ===== RETORNAR DATOS =====
    return data;
    
  } catch (error) {
    // ===== MANEJO DE ERRORES =====
    console.error('[AuthService] Error en login:', error);
    throw error; // Propagar el error para que lo maneje el store o el componente
  }
};

/**
 * FUNCIÓN: forgotPassword
 * 
 * Envía una petición para recuperar la contraseña del usuario.
 * El backend debe enviar un email con un link de recuperación.
 * 
 * @async
 * @param {string} email - Email del usuario que olvidó su contraseña
 * @returns {Promise<void>} No devuelve datos
 * @throws {Error} Si hay error de red o el email no existe
 */
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    // ===== PETICIÓN AL ENDPOINT DE RECUPERACIÓN =====
    await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST', // Método HTTP POST
      headers: {
        'Content-Type': 'application/json', // Indicar que enviamos JSON
      },
      body: JSON.stringify({ email }), // Enviar solo el email
    });
    
    // No se verifica la respuesta, simplemente se envía la petición
    // El backend debe manejar el envío del email
    
  } catch (error) {
    // ===== MANEJO DE ERRORES =====
    console.error('Error en recuperación de contraseña:', error);
    throw error; // Propagar el error
  }
};
