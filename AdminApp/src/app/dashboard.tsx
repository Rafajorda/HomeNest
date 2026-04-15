import { Redirect } from 'expo-router';
import { DashboardScreen } from '../screens/DashboardScreen';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../services/authService';

/**
 * Ruta /dashboard
 * Protegida: Si no está autenticado o no es ADMIN, redirige a /login
 */
export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return null;
  }

  // Verificar autenticación Y rol de ADMIN
  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) {
    return <Redirect href="/login" />;
  }

  return <DashboardScreen />;
}
