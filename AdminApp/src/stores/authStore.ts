/**
 * ========================================
 * STORE: authStore (Zustand)
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Store global para manejo de autenticación usando Zustand.
 * Gestiona el estado de autenticación y persistencia de datos del usuario.
 * 
 * RESPONSABILIDADES:
 * - Login y logout de usuarios
 * - Persistencia de tokens (access + refresh) en AsyncStorage
 * - Persistencia de datos del usuario
 * - Validación de rol ADMIN (solo admins pueden usar la app)
 * - Control de expiración de sesión (24 horas)
 * - Carga automática de sesión al iniciar la app
 * 
 * SEGURIDAD:
 * - Solo usuarios con role=ADMIN pueden autenticarse
 * - Tokens se guardan en AsyncStorage (encriptado por el OS)
 * - Timestamp de último login para validar expiración
 * - Sesión expira automáticamente después de 24 horas
 * 
 * STORAGE KEYS:
 * - @access_token: Token JWT de acceso
 * - @refresh_token: Token JWT de refresco
 * - @user_data: Datos del usuario (JSON)
 * - @last_login: Timestamp del último login
 * 
 * FLUJO DE LOGIN:
 * 1. Usuario ingresa email y password
 * 2. Se llama a authService.login() para autenticar con el backend
 * 3. Se valida que el usuario sea ADMIN
 * 4. Se guardan tokens usando tokenService
 * 5. Se guardan datos de usuario y timestamp en AsyncStorage
 * 6. Se actualiza el estado global (user, isAuthenticated)
 * 
 * FLUJO DE LOGOUT:
 * 1. Se elimina toda la data de AsyncStorage
 * 2. Se limpia el estado global
 * 3. Usuario es redirigido al login
 * 
 * USO:
 * const { user, login, logout } = useAuthStore();
 */

// ===== IMPORTS DE ZUSTAND =====
import { create } from 'zustand'; // Biblioteca de state management
// ===== IMPORTS DE ASYNC STORAGE =====
import AsyncStorage from '@react-native-async-storage/async-storage'; // Persistencia local
// ===== IMPORTS DE SERVICIOS =====
import * as authService from '../services/authService'; // Servicio de autenticación (API calls)
import { User, UserRole } from '../services/authService'; // Tipos de usuario y rol
import { saveTokens } from '../services/tokenService'; // Servicio de manejo de tokens

/**
 * Claves de AsyncStorage para datos de autenticación
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token', // Token de acceso JWT
  REFRESH_TOKEN: '@refresh_token', // Token de refresco JWT
  USER_DATA: '@user_data', // Datos del usuario (nombre, email, rol)
  LAST_LOGIN: '@last_login', // Timestamp del último login exitoso
};

/**
 * Tiempo de expiración de la sesión
 * 24 horas en milisegundos
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Interfaz del estado de autenticación
 * 
 * @interface AuthState
 */
interface AuthState {
  user: User | null; // Usuario autenticado (null si no está logueado)
  isAuthenticated: boolean; // Indica si hay un usuario autenticado
  isLoading: boolean; // Indica si se está cargando la sesión (al iniciar la app)
  login: (email: string, password: string) => Promise<void>; // Método para login
  logout: () => Promise<void>; // Método para logout
  loadUserData: () => Promise<void>; // Método para cargar datos al iniciar
  checkSessionValidity: () => Promise<void>; // Método para verificar validez de sesión
}

/**
 * Store de autenticación
 * 
 * Creado con Zustand, proporciona estado global de autenticación
 * accesible desde cualquier componente.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // ===== ESTADO INICIAL =====
  user: null, // No hay usuario al inicio
  isAuthenticated: false, // No está autenticado al inicio
  isLoading: true, // Está cargando hasta que se verifique AsyncStorage

  // ===== MÉTODOS =====

  /**
   * MÉTODO: loadUserData
   * 
   * Carga los datos del usuario desde AsyncStorage al iniciar la aplicación.
   * Verifica que la sesión no haya expirado (máximo 24 horas).
   * Valida que el usuario sea ADMIN.
   * 
   * PROCESO:
   * 1. Lee access_token, user_data y last_login desde AsyncStorage
   * 2. Verifica que no hayan pasado más de 24 horas desde el último login
   * 3. Valida que el usuario sea ADMIN
   * 4. Si todo es válido, restaura la sesión
   * 5. Si algo falla, hace logout automático
   * 
   * @async
   */
  loadUserData: async () => {
    try {
      // ===== PASO 1: LEER DATOS DE ASYNCSTORAGE =====
      const [accessToken, userData, lastLoginStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN), // Token de acceso
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA), // Datos del usuario
        AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN), // Timestamp del último login
      ]);

      // ===== PASO 2: VERIFICAR QUE EXISTAN LOS DATOS =====
      if (accessToken && userData && lastLoginStr) {
        // Parsear datos del usuario
        const parsedUser: User = JSON.parse(userData);
        
        // Parsear timestamp del último login
        const lastLogin = new Date(lastLoginStr);
        const now = new Date();
        const timeDiff = now.getTime() - lastLogin.getTime();

        // ===== PASO 3: VERIFICAR EXPIRACIÓN (24 HORAS) =====
        if (timeDiff > ONE_DAY_MS) {
          // Sesión expirada, hacer logout
          await get().logout();
          console.log('[AuthStore] Sesión expirada (>24h), se requiere nuevo login');
          return;
        }
        
        // ===== PASO 4: VALIDAR ROL ADMIN =====
        if (parsedUser.role === UserRole.ADMIN) {
          // Usuario válido, restaurar sesión
          set({ user: parsedUser, isAuthenticated: true, isLoading: false });
          console.log('[AuthStore] Usuario restaurado:', parsedUser.email);
        } else {
          // Usuario no es ADMIN, limpiar datos
          await get().logout();
          console.log('[AuthStore] Usuario no es ADMIN, sesión limpiada');
        }
      } else {
        // No hay datos guardados, terminar carga
        set({ isLoading: false });
      }
    } catch (error) {
      // Error al cargar datos, hacer logout por seguridad
      console.error('[AuthStore] Error cargando datos:', error);
      await get().logout();
      set({ isLoading: false });
    }
  },

  /**
   * MÉTODO: checkSessionValidity
   * 
   * Verifica si la sesión actual sigue siendo válida.
   * Hace logout automático si los datos de usuario ya no existen en AsyncStorage.
   * 
   * CASO DE USO:
   * Se puede llamar periódicamente o al navegar para verificar la sesión.
   * 
   * @async
   */
  checkSessionValidity: async () => {
    // Leer datos de usuario desde AsyncStorage
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    // Si no hay datos de usuario pero el store dice que sí hay, hacer logout
    if (!userData && get().user) {
      console.log('[AuthStore] Session expired - logging out');
      await get().logout();
    }
  },

  /**
   * MÉTODO: login
   * 
   * Autentica al usuario con email y contraseña.
   * Solo permite el acceso a usuarios con rol ADMIN.
   * 
   * PROCESO:
   * 1. Llama al servicio de autenticación (authService.login)
   * 2. Valida que el usuario sea ADMIN
   * 3. Guarda los tokens usando tokenService
   * 4. Guarda datos del usuario y timestamp en AsyncStorage
   * 5. Actualiza el estado global
   * 
   * @async
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @throws {Error} Si las credenciales son inválidas o el usuario no es ADMIN
   */
  login: async (email: string, password: string) => {
    try {
      // ===== PASO 1: AUTENTICAR CON EL BACKEND =====
      const response = await authService.login({ email, password });

      // ===== PASO 2: VALIDAR ROL ADMIN =====
      if (response.user.role !== UserRole.ADMIN) {
        throw new Error('Acceso denegado. Solo administradores pueden acceder a esta aplicación.');
      }

      // ===== PASO 3: GUARDAR TOKENS =====
      // Usa tokenService para guardar con información de expiración
      await saveTokens({
        access_token: response.access_token, // Token de acceso
        refresh_token: response.refresh_token, // Token de refresco
        expires_in: response.expires_in || 900, // Expiración en segundos (default 15 min)
        access_token_expires_at: response.access_token_expires_at || Date.now() + 900000, // Timestamp de expiración
        refresh_token_expires_at: response.refresh_token_expires_at || Date.now() + 86400000, // Timestamp de expiración
      });

      // ===== PASO 4: GUARDAR DATOS DE USUARIO Y TIMESTAMP =====
      const now = new Date().toISOString(); // Timestamp actual
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user)), // Datos del usuario
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, now), // Timestamp del login
      ]);

      // ===== PASO 5: ACTUALIZAR ESTADO GLOBAL =====
      set({ user: response.user, isAuthenticated: true });
      console.log('[AuthStore] Login exitoso:', response.user.email, '- Timestamp:', now);
      
    } catch (error) {
      // Error en el proceso de login
      console.error('[AuthStore] Error en login:', error);
      throw error; // Propagar el error para que el UI lo maneje
    }
  },

  /**
   * MÉTODO: logout
   * 
   * Cierra la sesión del usuario y limpia todos los datos de autenticación.
   * 
   * PROCESO:
   * 1. (TODO) Llamar al endpoint de logout del backend
   * 2. Eliminar todos los datos de AsyncStorage
   * 3. Limpiar el estado global
   * 
   * @async
   */
  logout: async () => {
    try {
      // TODO: Llamar al endpoint de logout del backend si existe
      // await authService.logout();
      
      // ===== PASO 1: ELIMINAR TODOS LOS DATOS DE ASYNCSTORAGE =====
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN), // Eliminar token de acceso
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN), // Eliminar token de refresco
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA), // Eliminar datos del usuario
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN), // Eliminar timestamp de login
      ]);

      // ===== PASO 2: LIMPIAR ESTADO GLOBAL =====
      set({ user: null, isAuthenticated: false });
      console.log('[AuthStore] Logout exitoso');
      
    } catch (error) {
      // Error durante el logout, limpiar de todas formas por seguridad
      console.error('[AuthStore] Error en logout:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
