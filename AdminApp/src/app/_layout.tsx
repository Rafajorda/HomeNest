import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { lightTheme, darkTheme } from '../theme';
import { UserRole } from '../services/authService';

// Configurar React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
    },
  },
});

/**
 * Componente interno que maneja la navegación protegida
 */
function RootLayoutNav() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inLoginPage = segments[0] === 'login' || !segments[0];

    // Si no está autenticado y no está en login, redirigir a login
    if (!isAuthenticated && !inLoginPage) {
      console.log('[Guard] Not authenticated - redirecting to login');
      router.replace('/login');
      return;
    }

    // Si está autenticado pero no es ADMIN, cerrar sesión
    if (isAuthenticated && user && user.role !== UserRole.ADMIN) {
      console.log('[Guard] Usuario no es ADMIN, cerrando sesión automáticamente');
      logout();
      router.replace('/login');
      return;
    }

    // Si está autenticado y en la página de login, redirigir al dashboard
    if (isAuthenticated && inLoginPage) {
      console.log('[Guard] Already authenticated - redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, segments, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}

/**
 * Layout principal de la aplicación
 * Configura los providers globales y el Stack Navigator
 */
export default function RootLayout() {
  const loadUserData = useAuthStore((state) => state.loadUserData);
  const { themeMode, loadThemePreference } = useThemeStore();

  // Seleccionar el tema según la preferencia del usuario
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  // Cargar datos del usuario y tema al iniciar la app
  useEffect(() => {
    loadUserData();
    loadThemePreference();

    // Verificar validez de sesión cada 30 segundos
    const interval = setInterval(() => {
      useAuthStore.getState().checkSessionValidity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={currentTheme}>
        <RootLayoutNav />
      </PaperProvider>
    </QueryClientProvider>
  );
}
