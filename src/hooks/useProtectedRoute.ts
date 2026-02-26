/**
 * ============================================================================
 * HOOK: useProtectedRoute
 * ============================================================================
 * 
 * @description
 * Hook personalizado para proteger rutas que requieren autenticación en la aplicación.
 * Implementa la lógica de redirección automática basada en el estado de autenticación
 * del usuario, garantizando que solo usuarios autenticados accedan a rutas protegidas
 * y que usuarios ya autenticados no vean pantallas de login innecesariamente.
 * 
 * @features
 * - ✅ Protección automática de rutas privadas
 * - ✅ Redirección a login para usuarios no autenticados
 * - ✅ Redirección a dashboard para usuarios ya autenticados
 * - ✅ Detección de grupos de rutas (auth vs protegidas)
 * - ✅ Manejo de estados de carga para evitar redirecciones prematuras
 * - ✅ Integración con Expo Router para navegación
 * - ✅ Logs de debugging para seguimiento de redirecciones
 * 
 * @architecture
 * ```
 * useProtectedRoute (Custom Hook)
 *   ├─> useAuth (Context) - Estado de autenticación global
 *   ├─> useSegments (Expo Router) - Segmentos de URL actual
 *   ├─> useRouter (Expo Router) - Navegación programática
 *   └─> useEffect - Reacción a cambios de autenticación/ruta
 * ```
 * 
 * @routing_logic
 * ```
 * Estado Actual              │ Ruta Actual    │ Acción
 * ─────────────────────────────┼────────────────┼──────────────────────
 * NO autenticado              │ Protegida      │ → Redirect a /login
 * NO autenticado              │ Auth (login)   │ → Permitir acceso
 * Autenticado                 │ Protegida      │ → Permitir acceso
 * Autenticado                 │ Auth (login)   │ → Redirect a /dashboard
 * Cargando estado auth        │ Cualquiera     │ → Esperar (no action)
 * ```
 * 
 * @usage
 * ```typescript
 * // En _layout.tsx o componente de ruta raíz
 * import { useProtectedRoute } from '@/hooks/useProtectedRoute';
 * 
 * export default function RootLayout() {
 *   // Ejecutar protección de rutas
 *   useProtectedRoute();
 *   
 *   return (
 *     <Stack>
 *       <Stack.Screen name="login" />
 *       <Stack.Screen name="dashboard" />
 *     </Stack>
 *   );
 * }
 * ```
 * 
 * @dependencies
 * - react: useEffect para reactividad
 * - expo-router: useRouter (navegación), useSegments (detección de ruta)
 * - AuthContext: useAuth (estado de autenticación)
 * 
 * @side_effects
 * - Redirecciones automáticas mediante router.replace()
 * - Logs en consola para debugging de flujo de navegación
 * 
 * @performance
 * - Hook ligero sin estado interno
 * - Ejecución solo cuando cambian: isAuthenticated, segments, isLoading
 * - Previene redirecciones durante carga inicial (isLoading check)
 * 
 * @see {@link ../contexts/AuthContext.tsx} - Contexto de autenticación
 * @see {@link ../app/_layout.tsx} - Implementación en layout raíz
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS: Dependencias externas
// ============================================================================
import { useEffect } from 'react'; // Hook de React para efectos secundarios
import { useRouter, useSegments } from 'expo-router'; // Hooks de Expo Router para navegación
import { useAuth } from '../contexts/AuthContext'; // Contexto con estado de autenticación global

// ============================================================================
// HOOK PRINCIPAL: useProtectedRoute
// ============================================================================
export const useProtectedRoute = () => {
  // === PASO 1: Obtener estado de autenticación desde contexto global ===
  const { isAuthenticated, isLoading } = useAuth();
  // isAuthenticated: boolean que indica si hay usuario autenticado
  // isLoading: boolean que indica si aún se está verificando el token

  // === PASO 2: Obtener información de navegación actual ===
  const segments = useSegments(); // Array de segmentos de la URL actual (ej: ['dashboard', 'products'])
  const router = useRouter(); // Router de Expo para navegación programática

  // === PASO 3: Efecto para redirecciones basadas en autenticación ===
  useEffect(() => {
    // === GUARD: Esperar a que termine la verificación inicial ===
    // Si isLoading=true, aún estamos verificando el token en AsyncStorage
    // Hacer return para evitar redirecciones prematuras
    if (isLoading) return;

    // === PASO 4: Detectar si estamos en grupo de rutas de autenticación ===
    // En Expo Router, las rutas dentro de (auth) son públicas (login, registro)
    // segments[0] es el primer segmento de la URL
    const inAuthGroup = segments[0] === '(auth)';
    // Ejemplos:
    // - /login → segments[0] = '(auth)' → inAuthGroup = true
    // - /dashboard → segments[0] = 'dashboard' → inAuthGroup = false

    // === CASO 1: Usuario NO autenticado intentando acceder a ruta protegida ===
    if (!isAuthenticated && !inAuthGroup) {
      // Usuario sin sesión válida en ruta privada → redirigir a login
      console.log('[useProtectedRoute] Redirecting to login - not authenticated');
      // router.replace() navega sin agregar a historial (no puede volver atrás)
      router.replace('/login');
    } 
    // === CASO 2: Usuario autenticado en página de login ===
    else if (isAuthenticated && inAuthGroup) {
      // Usuario ya logueado viendo login → redirigir a dashboard
      // Esto sucede si el usuario intenta acceder a /login manualmente
      console.log('[useProtectedRoute] Redirecting to dashboard - already authenticated');
      router.replace('/dashboard');
    }
    // === CASO 3: Estados válidos (no requieren acción) ===
    // - Usuario autenticado en ruta protegida → ✅ Permitir
    // - Usuario no autenticado en ruta auth → ✅ Permitir
  }, [isAuthenticated, segments, isLoading]); // Re-ejecutar cuando cambia autenticación o ruta
  // Dependencias:
  // - isAuthenticated: cambios en estado de login/logout
  // - segments: cambios en la ruta actual
  // - isLoading: fin de verificación inicial
};
