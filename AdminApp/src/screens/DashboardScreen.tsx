/**
 * ============================================================================
 * DASHBOARD SCREEN - Pantalla Principal de Administración
 * ============================================================================
 * 
 * DESCRIPCIÓN:
 * Pantalla principal que se muestra después del login exitoso.
 * Funciona como hub central de navegación para todas las funcionalidades
 * administrativas de la aplicación.
 * 
 * FUNCIONALIDADES:
 * - Muestra información del usuario administrador autenticado
 * - Proporciona acceso rápido a todas las secciones del panel admin
 * - Gestión de productos, usuarios, pedidos y entidades
 * - Opción de cerrar sesión
 * - Mensaje de bienvenida temporal al iniciar sesión
 * 
 * SECCIONES DISPONIBLES:
 * 1. Productos - CRUD completo del catálogo
 * 2. Usuarios - Gestión de usuarios del sistema
 * 3. Pedidos - Revisión y actualización de pedidos
 * 4. Entidades - Categorías, colores y otras entidades relacionadas
 * 5. Configuración - Ajustes de la aplicación (tema, etc.)
 * 
 * NAVEGACIÓN:
 * - Se accede desde: Login exitoso
 * - Navega hacia: Products, Users, Orders, Entities, Settings
 * - Cierra sesión: Vuelve al Login
 * 
 * @module DashboardScreen
 */

// ============================================================================
// IMPORTS - Librerías y Dependencias
// ============================================================================

// React y React Native core
import React, { useState, useEffect } from 'react'; // Hooks de React para estado y efectos
import { View, StyleSheet, ScrollView } from 'react-native'; // Componentes básicos de RN

// React Native Paper (Material Design 3)
import { Text, Button, Card, Avatar, Snackbar, useTheme } from 'react-native-paper';
// - Text: Componente de texto con variantes tipográficas
// - Button: Botones con estilos MD3
// - Card: Contenedor con elevación para cada opción
// - Avatar: Icono circular para el perfil del usuario
// - Snackbar: Notificación temporal en la parte inferior
// - useTheme: Hook para acceder al tema actual (claro/oscuro)

// Expo Router - Sistema de navegación basado en archivos
import { useRouter, useLocalSearchParams } from 'expo-router';
// - useRouter: Hook para navegar entre pantallas
// - useLocalSearchParams: Obtener parámetros de la URL

// Store de autenticación global (Zustand)
import { useAuthStore } from '../stores/authStore';
// Proporciona acceso al usuario autenticado y función de logout

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL - DashboardScreen
 * ============================================================================
 * 
 * Componente funcional que renderiza la pantalla principal del dashboard.
 * Utiliza hooks de React y Zustand para manejar estado y navegación.
 * 
 * @returns {JSX.Element} Pantalla de dashboard con opciones de administración
 */
export const DashboardScreen = () => {
  // ========================================================================
  // HOOKS - Estado, Navegación y Tema
  // ========================================================================

  /**
   * Router para navegación entre pantallas
   * Proporciona métodos: push, replace, back
   */
  const router = useRouter();

  /**
   * Parámetros de la URL actual
   * Se espera "fromLogin=true" cuando se viene desde el login
   */
  const { fromLogin } = useLocalSearchParams();

  /**
   * Usuario autenticado desde el store global
   * Contiene: { id, username, email, role }
   */
  const user = useAuthStore((state) => state.user);

  /**
   * Función para cerrar sesión desde el store
   * Limpia el token y redirige al login
   */
  const logout = useAuthStore((state) => state.logout);

  /**
   * Estado local para controlar visibilidad del Snackbar de bienvenida
   * true = mostrar mensaje, false = ocultar mensaje
   */
  const [showWelcome, setShowWelcome] = useState(false);

  /**
   * Tema actual de la aplicación (light o dark)
   * Proporciona colors, dark, fonts, etc.
   */
  const theme = useTheme();

  /**
   * Estilos dinámicos basados en el tema actual
   * Se recalculan cuando cambia el tema
   */
  const styles = getStyles(theme);

  // ========================================================================
  // EFECTOS - Lógica que se ejecuta al montar/actualizar el componente
  // ========================================================================

  /**
   * Efecto: Mostrar mensaje de bienvenida al venir desde login
   * 
   * Se ejecuta cuando cambia el parámetro fromLogin
   * Si fromLogin='true':
   *   1. Muestra el Snackbar de bienvenida
   *   2. Limpia el parámetro de la URL para que no se muestre en futuras visitas
   * 
   * Dependencias: [fromLogin]
   */
  useEffect(() => {
    if (fromLogin === 'true') {
      setShowWelcome(true);
      // Reemplazar la ruta actual sin el parámetro fromLogin
      router.replace('/dashboard');
    }
  }, [fromLogin]);

  // ========================================================================
  // HANDLERS - Funciones para manejar eventos de usuario
  // ========================================================================

  /**
   * Maneja el cierre de sesión del usuario
   * 
   * Proceso:
   * 1. Llama a la función logout del store
   * 2. El store limpia el usuario y token
   * 3. Redirige automáticamente al login (manejado por el store)
   * 4. Si hay error, lo registra en consola
   * 
   * @async
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // ========================================================================
  // RENDER - Estructura visual de la pantalla
  // ========================================================================
  
  return (
    <ScrollView style={styles.container}>
      {/* 
        ===================================================================
        SECCIÓN 1: TARJETA DE USUARIO
        ===================================================================
        Muestra la información del administrador autenticado:
        - Avatar circular con icono de cuenta
        - Nombre de usuario (username)
        - Email del usuario
        
        Background: Color primario del tema para destacar
      */}
      <Card style={styles.userCard}>
        <Card.Content style={styles.userCardContent}>
          {/* Avatar circular con icono de Material Design */}
          <Avatar.Icon 
            size={64} 
            icon="account-circle" 
            style={styles.avatar}
          />
          {/* Información textual del usuario */}
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              {user?.username}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* 
        ===================================================================
        SNACKBAR DE BIENVENIDA
        ===================================================================
        Notificación temporal que aparece por 3 segundos
        Solo se muestra cuando fromLogin='true'
        Se auto-oculta después del timeout
      */}
      <Snackbar
        visible={showWelcome}
        onDismiss={() => setShowWelcome(false)}
        duration={3000}
        style={styles.snackbar}
      >
        ✅ Sesión iniciada como administrador
      </Snackbar>

      {/* 
        ===================================================================
        SECCIÓN 2: PANEL DE ADMINISTRACIÓN
        ===================================================================
        Colección de tarjetas (Cards) que funcionan como menú principal
        Cada tarjeta representa una sección del admin panel
      */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Panel de Administración
        </Text>

        {/* 
          OPCIÓN 1: PRODUCTOS
          Navega a: /products
          Funcionalidad: CRUD completo de productos
        */}
        <Card style={styles.optionCard}>
          <Card.Content>
            <Text variant="titleMedium">📦 Productos</Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Gestiona el catálogo de productos
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => router.push('/products')}
              style={styles.optionButton}
            >
              Ver Productos
            </Button>
          </Card.Actions>
        </Card>

        {/* 
          OPCIÓN 2: USUARIOS
          Navega a: /users-dashboard
          Funcionalidad: Gestión de usuarios del sistema
        */}
        <Card style={styles.optionCard}>
          <Card.Content>
            <Text variant="titleMedium">👥 Usuarios</Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Administra usuarios del sistema
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => router.push('/users-dashboard')}
              style={styles.optionButton}
            >
              Ver Usuarios
            </Button>
          </Card.Actions>
        </Card>

        {/* 
          OPCIÓN 3: PEDIDOS
          Navega a: /orders
          Funcionalidad: Revisar y actualizar pedidos
        */}
        <Card style={styles.optionCard}>
          <Card.Content>
            <Text variant="titleMedium">📊 Pedidos</Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Revisa y gestiona los pedidos
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => router.push('/orders')}
              style={styles.optionButton}
            >
              Ver Pedidos
            </Button>
          </Card.Actions>
        </Card>

        {/* 
          OPCIÓN 4: ENTIDADES
          Navega a: /entities-dashboard
          Funcionalidad: Gestión de categorías, colores, etc.
        */}
        <Card style={styles.optionCard}>
          <Card.Content>
            <Text variant="titleMedium">🏷️ Entidades</Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Gestiona categorías, colores y más
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => router.push('/entities-dashboard')}
              style={styles.optionButton}
            >
              Ver Entidades
            </Button>
          </Card.Actions>
        </Card>

        {/* 
          OPCIÓN 5: CONFIGURACIÓN
          Navega a: /settings
          Funcionalidad: Ajustes de la app (tema, etc.)
        */}
        <Card style={styles.optionCard}>
          <Card.Content>
            <Text variant="titleMedium">⚙️ Configuración</Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Ajustes de la aplicación
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => router.push('/settings')}
              style={styles.optionButton}
            >
              Configuración
            </Button>
          </Card.Actions>
        </Card>
      </View>

      {/* 
        ===================================================================
        SECCIÓN 3: CERRAR SESIÓN
        ===================================================================
        Botón para finalizar la sesión del administrador
        Estilo: outlined con color de error (rojo)
        Acción: Llama a handleLogout()
      */}
      <View style={styles.logoutSection}>
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          icon="logout"
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
};

/**
 * ============================================================================
 * ESTILOS - StyleSheet dinámico basado en el tema
 * ============================================================================
 * 
 * Función que genera estilos adaptados al tema actual (light/dark).
 * Se recalcula automáticamente cuando el usuario cambia el tema.
 * 
 * @param {any} theme - Objeto de tema de React Native Paper
 * @param {object} theme.colors - Paleta de colores del tema
 * @param {boolean} theme.dark - Indica si el tema es oscuro
 * @returns {StyleSheet} Conjunto de estilos para el componente
 */
const getStyles = (theme: any) => StyleSheet.create({
  /**
   * Container principal - Fondo de toda la pantalla
   * flex: 1 = ocupa todo el espacio disponible
   */
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  /**
   * Tarjeta de usuario en la parte superior
   * Background primario para destacar
   * margin: 16 = espaciado uniforme alrededor
   */
  userCard: {
    margin: 16,
    backgroundColor: theme.colors.primary,
  },

  /**
   * Contenido dentro de la tarjeta de usuario
   * flexDirection: row = elementos en horizontal
   * alignItems: center = centrado vertical
   */
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  /**
   * Avatar del usuario
   * Background de superficie para crear contraste con el fondo primario
   */
  avatar: {
    backgroundColor: theme.colors.surface,
  },

  /**
   * Contenedor de información del usuario (nombre y email)
   * flex: 1 = ocupa el espacio restante
   */
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },

  /**
   * Texto de bienvenida (nombre de usuario)
   * Color de superficie para contraste con fondo primario
   */
  welcomeText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },

  /**
   * Email del usuario
   * Color de superficie con menos énfasis que el nombre
   */
  userEmail: {
    color: theme.colors.surface,
    marginTop: 4,
  },

  /**
   * Snackbar de bienvenida temporal
   * Background primario para coherencia con la tarjeta de usuario
   */
  snackbar: {
    backgroundColor: theme.colors.primary,
  },

  /**
   * Sección que contiene todas las opciones del panel
   * padding: 16 = espaciado interno
   */
  section: {
    padding: 16,
  },

  /**
   * Título de la sección "Panel de Administración"
   * marginBottom: 16 = separación con las tarjetas
   */
  sectionTitle: {
    marginBottom: 16,
    color: theme.colors.onBackground,
    fontWeight: 'bold',
  },

  /**
   * Tarjeta de cada opción del menú
   * marginBottom: 12 = separación entre tarjetas
   */
  optionCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },

  /**
   * Descripción de cada opción
   * Color secundario para menos énfasis que el título
   */
  optionDescription: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },

  /**
   * Botón dentro de cada tarjeta de opción
   * Background primario para llamar a la acción
   */
  optionButton: {
    backgroundColor: theme.colors.primary,
  },

  /**
   * Sección del botón de cerrar sesión
   * paddingBottom: 32 = espacio extra en la parte inferior
   */
  logoutSection: {
    padding: 16,
    paddingBottom: 32,
  },

  /**
   * Botón de cerrar sesión
   * Borde con color de error (rojo) para indicar acción destructiva
   */
  logoutButton: {
    borderColor: theme.colors.error,
  },
});
