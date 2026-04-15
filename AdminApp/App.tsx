import React from 'react';
import { View, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { lightTheme } from './src/theme';

/**
 * Componente de navegación
 * Muestra Login o Dashboard según el estado de autenticación
 */
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  // Mostrar Dashboard si está autenticado, sino Login
  return isAuthenticated ? <DashboardScreen /> : <LoginScreen />;
};

/**
 * Componente principal de la aplicación
 *
 * Configura:
 * - AuthProvider para manejo de autenticación
 * - PaperProvider con el tema personalizado
 * - Navegación condicional (Login/Dashboard)
 */
const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider theme={lightTheme}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={lightTheme.colors.background}
          />
          <View style={styles.container}>
            <AppNavigator />
          </View>
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;

