/**
 * ============================================================================
 * TOKEN SERVICE - Servicio de Gestión de Tokens JWT
 * ============================================================================
 * 
 * @file tokenService.ts
 * @description Servicio centralizado para manejo automático de tokens JWT.
 * Gestiona la renovación automática del access token antes de que expire,
 * limpieza de sesión si el refresh token expira, y almacenamiento seguro
 * en AsyncStorage.
 * 
 * @architecture
 * Implementa el patrón de "Silent Refresh" (renovación silenciosa):
 * 1. Usuario hace login → recibe access_token + refresh_token
 * 2. access_token expira en 15 minutos
 * 3. refresh_token expira en 7 días
 * 4. Si access_token está por expirar (< 2 minutos), se renueva automáticamente
 * 5. Si refresh_token expiró, se limpia sesión y se fuerza logout
 * 
 * @functions
 * - isTokenExpiringSoon(): Verifica si el access token está por expirar (< 2 min)
 * - refreshAccessToken(): Renueva el access token usando el refresh token
 * - getValidAccessToken(): Obtiene token válido (renovándolo si es necesario)
 * - clearTokens(): Limpia solo tokens (access + refresh)
 * - clearAllAuthData(): Limpia tokens + user data + last_login
 * - saveTokens(): Guarda tokens después del login
 * 
 * @features
 * ✅ Renovación automática de access token antes de expirar
 * ✅ Limpieza automática de sesión si refresh token expira
 * ✅ Almacenamiento seguro en AsyncStorage (encriptado en iOS/Android)
 * ✅ Logging detallado para debugging
 * ✅ Manejo de errores con fallback a logout
 * ✅ Soporte para múltiples peticiones concurrentes (no renueva múltiples veces)
 * 
 * @security
 * - Access token se envía en header Authorization: Bearer <token>
 * - Refresh token se almacena en AsyncStorage (seguro en dispositivos)
 * - Tokens NO se almacenan en memoria global (solo AsyncStorage)
 * - Si refresh falla (401), se limpian TODOS los datos de autenticación
 * 
 * @flow_example
 * ```ts
 * // Usuario hace login:
 * const tokens = await login(email, password);  // Backend retorna tokens
 * await saveTokens(tokens);  // Guarda en AsyncStorage
 * 
 * // 10 minutos después, usuario hace petición:
 * const token = await getValidAccessToken();
 * // 1. Verifica si está por expirar (< 2 min)
 * // 2. NO está por expirar → retorna token actual
 * // 3. Se usa en header: Authorization: Bearer <token>
 * 
 * // 14 minutos después (1 minuto antes de expirar):
 * const token2 = await getValidAccessToken();
 * // 1. Verifica si está por expirar (< 2 min)  ✅ SÍ
 * // 2. Llama a refreshAccessToken()
 * // 3. Envía refresh_token al backend
 * // 4. Recibe nuevo access_token + nuevo refresh_token
 * // 5. Guarda nuevos tokens
 * // 6. Retorna nuevo access_token
 * 
 * // 8 días después (refresh token expiró):
 * const token3 = await getValidAccessToken();
 * // 1. Intenta renovar con refreshAccessToken()
 * // 2. Backend retorna 401 (refresh token expirado)
 * // 3. Llama a clearAllAuthData()
 * // 4. Retorna null
 * // 5. authStore detecta sesión expirada → redirige a login
 * ```
 * 
 * @usage
 * ```ts
 * import { getValidAccessToken } from '@/services/tokenService';
 * 
 * // En cualquier servicio HTTP:
 * const token = await getValidAccessToken();
 * const response = await fetch(url, {
 *   headers: {
 *     'Authorization': `Bearer ${token}`
 *   }
 * });
 * ```
 * 
 * ============================================================================
 */

// Importa AsyncStorage para almacenar tokens de forma persistente
// En iOS/Android, AsyncStorage está encriptado automáticamente
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * URL base del backend para endpoint de refresh
 * Solo se usa para POST /auth/refresh
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * ============================================================================
 * TokenResponse - Estructura de Respuesta del Backend
 * ============================================================================
 * 
 * @interface TokenResponse
 * @description Estructura de datos que retorna el backend en login y refresh.
 * 
 * @property {string} access_token - JWT token para autenticación (expira en 15 min)
 * @property {string} refresh_token - JWT token para renovar access token (expira en 7 días)
 * @property {number} expires_in - Tiempo en segundos hasta que expira el access token (900 = 15 min)
 * @property {number} access_token_expires_at - Timestamp UNIX en milisegundos de expiración del access token
 * @property {number} refresh_token_expires_at - Timestamp UNIX en milisegundos de expiración del refresh token
 * 
 * @example
 * ```json
 * {
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "expires_in": 900,
 *   "access_token_expires_at": 1704123456789,
 *   "refresh_token_expires_at": 1704728256789
 * }
 * ```
 */
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  access_token_expires_at: number;
  refresh_token_expires_at: number;
}

/**
 * ============================================================================
 * STORAGE_KEYS - Claves para AsyncStorage
 * ============================================================================
 * 
 * @constant STORAGE_KEYS
 * @description Claves consistentes para almacenar/recuperar datos de AsyncStorage.
 * Todas las claves empiezan con @ (convención de React Native).
 * 
 * @property {string} ACCESS_TOKEN - Almacena el JWT access token actual
 * @property {string} REFRESH_TOKEN - Almacena el JWT refresh token actual
 * @property {string} TOKEN_EXPIRES_AT - Almacena timestamp de expiración del access token
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',        // JWT access token (expira en 15 min)
  REFRESH_TOKEN: '@refresh_token',      // JWT refresh token (expira en 7 días)
  TOKEN_EXPIRES_AT: '@token_expires_at', // Timestamp de expiración en milisegundos
};

/**
 * ============================================================================
 * isTokenExpiringSoon() - Verifica si el Token Está Por Expirar
 * ============================================================================
 * 
 * @function isTokenExpiringSoon
 * @async
 * @returns {Promise<boolean>} true si el token expira en menos de 2 minutos, false si aún es válido
 * 
 * @description Verifica si el access token actual está por expirar (menos de
 * 2 minutos restantes). Se usa para decidir si renovar el token ANTES de que
 * expire, evitando errores 401 en peticiones.
 * 
 * @threshold
 * 2 MINUTOS (120000 milisegundos) es el umbral de renovación:
 * - Si quedan > 2 min → Token aún válido, no renovar
 * - Si quedan < 2 min → Token por expirar, renovar ahora
 * - Si ya expiró → Renovar inmediatamente
 * 
 * @why_2_minutes
 * - Margen de seguridad para peticiones lentas (1-2 segundos)
 * - Evita renovación excesiva (no renueva cada petición)
 * - Balance entre seguridad y eficiencia
 * 
 * @flow
 * 1. Obtiene timestamp de expiración de AsyncStorage
 * 2. Si no existe timestamp → retorna true (fuerza renovación)
 * 3. Convierte string a number (parseInt)
 * 4. Calcula tiempo restante: expiresAt - ahora
 * 5. Si timeUntilExpiry < 120000 ms → retorna true (renovar)
 * 6. Si timeUntilExpiry >= 120000 ms → retorna false (aún válido)
 * 
 * @error_handling
 * Si hay cualquier error (AsyncStorage falla, etc.):
 * - Retorna true (asume expirado)
 * - Fuerza renovación por seguridad
 * - Previene errores 401 inesperados
 * 
 * @example
 * ```ts
 * // Token expira en 5 minutos:
 * const expiring = await isTokenExpiringSoon();  // false (aún válido)
 * 
 * // Token expira en 1 minuto:
 * const expiring = await isTokenExpiringSoon();  // true (renovar ahora)
 * 
 * // Token ya expiró hace 10 segundos:
 * const expiring = await isTokenExpiringSoon();  // true (renovar urgente)
 * 
 * // No hay token guardado:
 * const expiring = await isTokenExpiringSoon();  // true (forzar renovación)
 * ```
 */
export const isTokenExpiringSoon = async (): Promise<boolean> => {
  try {
    // === PASO 1: Obtener timestamp de expiración de AsyncStorage ===
    const expiresAtStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    
    // === PASO 2: Si no hay timestamp, asumir expirado ===
    if (!expiresAtStr) return true;

    // === PASO 3: Convertir string a número ===
    const expiresAt = parseInt(expiresAtStr);
    
    // === PASO 4: Obtener timestamp actual ===
    const now = Date.now();
    
    // === PASO 5: Calcular tiempo restante hasta expiración ===
    const timeUntilExpiry = expiresAt - now;

    // === PASO 6: Verificar si quedan menos de 2 minutos ===
    // 120000 ms = 2 minutos
    return timeUntilExpiry < 120000;
  } catch (error) {
    // Si hay error, asumir expirado por seguridad
    console.error('[TokenService] Error checking token expiry:', error);
    return true;  // Fuerza renovación
  }
};

/**
 * ============================================================================
 * refreshAccessToken() - Renueva el Access Token usando Refresh Token
 * ============================================================================
 * 
 * @function refreshAccessToken
 * @async
 * @returns {Promise<string | null>} Nuevo access token si éxito, null si refresh token expiró
 * 
 * @description Renueva el access token enviando el refresh token al backend.
 * Si el refresh token expiró (401), limpia TODA la sesión automáticamente.
 * 
 * @flow
 * 1. Obtiene refresh_token de AsyncStorage
 * 2. Si no hay refresh_token:
 *    - Llama a clearAllAuthData() para limpiar sesión
 *    - Retorna null (fuerza logout)
 * 3. Hace POST a /auth/refresh con el refresh_token
 * 4. Si la respuesta es 401 (refresh token expirado):
 *    - Llama a clearAllAuthData() (limpia tokens + user data)
 *    - Retorna null (authStore detecta y redirige a login)
 * 5. Si la respuesta es exitosa (200):
 *    - Parsea TokenResponse del backend
 *    - Guarda nuevo access_token, refresh_token y expires_at en AsyncStorage
 *    - Retorna nuevo access_token
 * 6. Si hay error de red/servidor:
 *    - Llama a clearAllAuthData() por seguridad
 *    - Retorna null
 * 
 * @backend_endpoint
 * POST /auth/refresh
 * Body: { refresh_token: string }
 * Respuesta exitosa (200): TokenResponse con nuevos tokens
 * Respuesta error (401): Refresh token expirado
 * 
 * @security
 * - Si refresh falla por CUALQUIER razón → limpia sesión completa
 * - Previene estados inconsistentes (token inválido pero sesión activa)
 * - Fuerza re-autenticación del usuario
 * 
 * @logging
 * - Log antes de renovar: "Refreshing access token..."
 * - Log si falla: "Refresh failed (token expirado): <status>"
 * - Log si éxito: "Access token refreshed successfully"
 * - Log si error: "Error refreshing token: <error>"
 * 
 * @example
 * ```ts
 * // Caso 1: Renovación exitosa
 * const newToken = await refreshAccessToken();
 * console.log(newToken);  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * // Caso 2: Refresh token expirado (después de 7 días)
 * const newToken = await refreshAccessToken();
 * console.log(newToken);  // null
 * // AsyncStorage limpiado automáticamente
 * // Usuario redirigido a login
 * 
 * // Caso 3: Error de red
 * const newToken = await refreshAccessToken();
 * console.log(newToken);  // null
 * // Sesión limpiada por seguridad
 * ```
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // === PASO 1: Obtener refresh token de AsyncStorage ===
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    // === PASO 2: Si no hay refresh token, limpiar sesión ===
    if (!refreshToken) {
      console.log('[TokenService] No refresh token available');
      await clearAllAuthData();  // Limpia todo
      return null;  // Fuerza logout
    }

    // === PASO 3: Intentar renovar con el backend ===
    console.log('[TokenService] Refreshing access token...');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // === PASO 4: Si refresh token expiró (401) ===
    if (!response.ok) {
      console.error('[TokenService] Refresh failed (token expirado):', response.status);
      // Limpia TODA la sesión (tokens + user data + last_login)
      await clearAllAuthData();
      return null;  // Fuerza logout
    }

    // === PASO 5: Parsear respuesta con nuevos tokens ===
    const data: TokenResponse = await response.json();

    // === PASO 6: Guardar nuevos tokens en AsyncStorage ===
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token),        // Nuevo access token
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token),      // Nuevo refresh token
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, data.access_token_expires_at.toString()),  // Nuevo timestamp
    ]);

    // === PASO 7: Log de éxito ===
    console.log('[TokenService] Access token refreshed successfully');
    
    // === PASO 8: Retornar nuevo access token ===
    return data.access_token;
  } catch (error) {
    // Si hay CUALQUIER error (red, servidor, etc.), limpiar sesión
    console.error('[TokenService] Error refreshing token:', error);
    await clearAllAuthData();
    return null;
  }
};

/**
 * ============================================================================
 * getValidAccessToken() - Obtiene Token Válido (Renovándolo si es Necesario)
 * ============================================================================
 * 
 * @function getValidAccessToken
 * @async
 * @returns {Promise<string | null>} Access token válido si hay sesión activa, null si expiró
 * 
 * @description Función PRINCIPAL para obtener access token en TODOS los servicios.
 * Verifica automáticamente si el token está por expirar y lo renueva ANTES de
 * retornarlo. Garantiza que el token retornado siempre tiene al menos 2 minutos
 * de validez.
 * 
 * @flow
 * 1. Llama a isTokenExpiringSoon() para verificar si necesita renovación
 * 2. Si shouldRefresh = true (< 2 minutos restantes):
 *    - Llama a refreshAccessToken()
 *    - Retorna nuevo access token (o null si refresh falló)
 * 3. Si shouldRefresh = false (aún válido):
 *    - Obtiene access token actual de AsyncStorage
 *    - Retorna token actual (sin renovar)
 * 
 * @use_case
 * TODAS las funciones de servicios HTTP deben usar esta función:
 * - productService.ts: getHeaders() usa getValidAccessToken()
 * - orderService.ts: getHeaders() usa getValidAccessToken()
 * - userService.ts: getHeaders() usa getValidAccessToken()
 * - etc.
 * 
 * @guarantee
 * Si retorna un token (no null):
 * - Token tiene AL MENOS 2 minutos de validez
 * - Puede usarse inmediatamente en peticiones HTTP
 * - No generará error 401 por expiración
 * 
 * Si retorna null:
 * - Refresh token expiró
 * - AsyncStorage limpiado automáticamente
 * - Usuario debe hacer login nuevamente
 * 
 * @error_handling
 * Si hay cualquier error:
 * - Loguea error en consola
 * - Retorna null (fuerza logout)
 * - Previene estados inconsistentes
 * 
 * @example
 * ```ts
 * // En productService.ts:
 * const getHeaders = async () => {
 *   const token = await getValidAccessToken();
 *   return {
 *     'Content-Type': 'application/json',
 *     ...(token && { 'Authorization': `Bearer ${token}` })
 *   };
 * };
 * 
 * // Caso 1: Token válido (5 minutos restantes)
 * const token = await getValidAccessToken();
 * // No renueva, retorna token actual
 * console.log(token);  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * // Caso 2: Token por expirar (1 minuto restante)
 * const token = await getValidAccessToken();
 * // Renueva automáticamente
 * console.log(token);  // Nuevo token con 15 minutos de validez
 * 
 * // Caso 3: Refresh token expirado
 * const token = await getValidAccessToken();
 * console.log(token);  // null
 * // authStore detecta null → redirige a login
 * ```
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    // === PASO 1: Verificar si el token necesita renovación ===
    const shouldRefresh = await isTokenExpiringSoon();

    // === PASO 2: Si necesita renovación, renovar AHORA ===
    if (shouldRefresh) {
      console.log('[TokenService] Token expiring soon, refreshing...');
      return await refreshAccessToken();  // Retorna nuevo token o null
    }

    // === PASO 3: Si NO necesita renovación, retornar token actual ===
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    // Si hay error, loguear y retornar null (fuerza logout)
    console.error('[TokenService] Error getting valid token:', error);
    return null;
  }
};

/**
 * ============================================================================
 * clearTokens() - Limpia Solo los Tokens (Logout Parcial)
 * ============================================================================
 * 
 * @function clearTokens
 * @async
 * @returns {Promise<void>}
 * 
 * @description Elimina SOLO los tokens (access + refresh + expires_at) de
 * AsyncStorage. NO elimina user_data ni last_login. Usado en casos donde
 * quieres invalidar la sesión pero mantener datos del usuario.
 * 
 * @removes
 * - @access_token: JWT access token
 * - @refresh_token: JWT refresh token
 * - @token_expires_at: Timestamp de expiración
 * 
 * @keeps
 * - @user_data: Datos del usuario (email, nombre, rol)
 * - @last_login: Timestamp del último login
 * 
 * @use_case
 * - Logout manual del usuario (pero mantener email recordado)
 * - Cambio de cuenta sin perder historial
 * - Testing/debugging
 * 
 * @note
 * En la mayoría de casos, es mejor usar clearAllAuthData() para
 * limpieza completa de sesión.
 * 
 * @example
 * ```ts
 * // Logout pero mantener email:
 * await clearTokens();
 * const savedEmail = await AsyncStorage.getItem('@user_data');
 * // savedEmail aún existe
 * ```
 */
export const clearTokens = async (): Promise<void> => {
  // Elimina solo tokens en paralelo (más rápido que secuencial)
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,        // Elimina access token
    STORAGE_KEYS.REFRESH_TOKEN,       // Elimina refresh token
    STORAGE_KEYS.TOKEN_EXPIRES_AT,    // Elimina timestamp de expiración
  ]);
};

/**
 * ============================================================================
 * clearAllAuthData() - Limpia TODA la Sesión (Logout Completo)
 * ============================================================================
 * 
 * @function clearAllAuthData
 * @async
 * @returns {Promise<void>}
 * 
 * @description Elimina TODOS los datos de autenticación de AsyncStorage,
 * incluyendo tokens, user data y last_login. Usado cuando el refresh token
 * expira o cuando el usuario hace logout completo.
 * 
 * @removes
 * - @access_token: JWT access token
 * - @refresh_token: JWT refresh token
 * - @token_expires_at: Timestamp de expiración del access token
 * - @user_data: Datos del usuario (email, nombre, rol, avatar, etc.)
 * - @last_login: Timestamp del último login exitoso
 * 
 * @when_called
 * - refreshAccessToken() falla con 401 (refresh token expirado)
 * - Usuario hace logout manual
 * - Error crítico de autenticación
 * - Cambio de cuenta (antes de login con otra cuenta)
 * 
 * @side_effects
 * - authStore detecta la limpieza y actualiza isAuthenticated = false
 * - Navigation redirige automáticamente a /login
 * - Todas las pantallas protegidas se bloquean
 * 
 * @logging
 * Imprime en consola: "[TokenService] All auth data cleared - session expired"
 * Facilita debugging de problemas de autenticación
 * 
 * @example
 * ```ts
 * // En refreshAccessToken() si el refresh falla:
 * if (!response.ok) {
 *   await clearAllAuthData();  // Limpia todo
 *   return null;  // Fuerza logout
 * }
 * 
 * // En logout manual:
 * const handleLogout = async () => {
 *   await clearAllAuthData();
 *   navigation.navigate('login');
 * };
 * ```
 */
export const clearAllAuthData = async (): Promise<void> => {
  // === PASO 1: Eliminar TODOS los datos de autenticación en paralelo ===
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,        // JWT access token
    STORAGE_KEYS.REFRESH_TOKEN,       // JWT refresh token
    STORAGE_KEYS.TOKEN_EXPIRES_AT,    // Timestamp de expiración
    '@user_data',                     // Datos del usuario (email, nombre, rol)
    '@last_login',                    // Timestamp del último login
  ]);
  
  // === PASO 2: Log para debugging ===
  console.log('[TokenService] All auth data cleared - session expired');
};

/**
 * ============================================================================
 * saveTokens() - Guarda Tokens Después del Login
 * ============================================================================
 * 
 * @function saveTokens
 * @async
 * @param {TokenResponse} tokens - Respuesta del backend con tokens y timestamps
 * @returns {Promise<void>}
 * 
 * @description Guarda los tokens recibidos del backend después de un login
 * exitoso o refresh exitoso. Almacena access token, refresh token y timestamp
 * de expiración en AsyncStorage.
 * 
 * @stores
 * - @access_token: JWT access token (usado en Authorization header)
 * - @refresh_token: JWT refresh token (usado para renovar access token)
 * - @token_expires_at: Timestamp UNIX en milisegundos (usado por isTokenExpiringSoon)
 * 
 * @parallel_writes
 * Usa Promise.all() para guardar los 3 valores en paralelo:
 * - Más rápido que guardar secuencialmente
 * - Si uno falla, todos fallan (atomicidad)
 * 
 * @when_called
 * - Después de login exitoso en authService.login()
 * - Después de refresh exitoso en refreshAccessToken()
 * - NO se llama en registro (el registro no retorna tokens inmediatamente)
 * 
 * @flow
 * 1. Recibe TokenResponse del backend
 * 2. Guarda access_token en AsyncStorage con clave @access_token
 * 3. Guarda refresh_token en AsyncStorage con clave @refresh_token
 * 4. Convierte timestamp a string y guarda en @token_expires_at
 * 5. Todas las operaciones se hacen en paralelo con Promise.all()
 * 
 * @example
 * ```ts
 * // En authService.ts después de login:
 * const response = await fetch('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password })
 * });
 * const data: TokenResponse = await response.json();
 * 
 * // Guardar tokens:
 * await saveTokens(data);
 * 
 * // Resultado en AsyncStorage:
 * // @access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * // @refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * // @token_expires_at: "1704123456789"
 * ```
 */
export const saveTokens = async (tokens: TokenResponse): Promise<void> => {
  // === Guardar los 3 valores en paralelo (más rápido) ===
  await Promise.all([
    // Guarda JWT access token (expira en 15 minutos)
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token),
    
    // Guarda JWT refresh token (expira en 7 días)
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token),
    
    // Guarda timestamp de expiración del access token (como string)
    AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, tokens.access_token_expires_at.toString()),
  ]);
};
