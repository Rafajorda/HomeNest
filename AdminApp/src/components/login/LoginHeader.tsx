/**
 * ========================================
 * COMPONENTE: LoginHeader
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Header decorativo de la pantalla de login con logo y títulos.
 * Componente puramente presentacional (no tiene lógica).
 * 
 * ELEMENTOS:
 * - Logo circular con emoji de tienda (🛍️)
 * - Título "Admin Panel"
 * - Subtítulo "Inicia sesión para continuar"
 * 
 * DISEÑO:
 * - Contenedor centrado
 * - Logo circular de 100x100 con fondo color primario
 * - Tipografía Material Design 3 (headlineLarge, bodyLarge)
 * - Colores del tema light (TODO: migrar a tema dinámico)
 * 
 * USO:
 * <LoginHeader />
 * 
 * @returns {JSX.Element} Header con logo y títulos
 */

// ===== IMPORTS DE REACT =====
import React from 'react'; // Biblioteca principal de React
// ===== IMPORTS DE REACT NATIVE =====
import { View, StyleSheet } from 'react-native'; // Componentes básicos
// ===== IMPORTS DE REACT NATIVE PAPER =====
import { Text, useTheme } from 'react-native-paper'; // Texto con variantes MD3

/**
 * Componente LoginHeader
 * 
 * Header decorativo de la pantalla de login.
 * No recibe props, es un componente estático.
 * 
 * @returns {JSX.Element} Header con logo y títulos
 */
export const LoginHeader = () => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    // Contenedor principal centrado
    <View style={styles.header}>
      {/* ========================================
          SECCIÓN: LOGO
          Círculo con emoji de tienda
          ======================================== */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🛍️</Text> {/* Emoji de tienda */}
      </View>
      
      {/* ========================================
          SECCIÓN: TÍTULO PRINCIPAL
          "Admin Panel" en tipografía grande
          ======================================== */}
      <Text variant="headlineLarge" style={styles.title}>
        Admin Panel
      </Text>
      
      {/* ========================================
          SECCIÓN: SUBTÍTULO
          "Inicia sesión para continuar"
          ======================================== */}
      <Text variant="bodyLarge" style={styles.subtitle}>
        Inicia sesión para continuar
      </Text>
    </View>
  );
};

/**
 * Estilos del componente LoginHeader
 * Usa el tema dinámico para soportar modo claro/oscuro
 */
const getStyles = (theme: any) => StyleSheet.create({
  // ===== CONTENEDOR PRINCIPAL =====
  header: {
    alignItems: 'center', // Centrar todo horizontalmente
    marginBottom: 32, // Separación con el formulario
    width: '100%', // Ancho completo
    maxWidth: 400, // Máximo ancho para pantallas grandes
  },
  
  // ===== CONTENEDOR DEL LOGO =====
  logoContainer: {
    width: 100, // Ancho del círculo
    height: 100, // Alto del círculo
    borderRadius: 50, // Radio para hacerlo circular (mitad del ancho)
    backgroundColor: theme.colors.primary, // Fondo color primario
    justifyContent: 'center', // Centrar verticalmente
    alignItems: 'center', // Centrar horizontalmente
    marginBottom: 24, // Separación con el título
  },
  
  // ===== EMOJI DEL LOGO =====
  logoText: {
    fontSize: 48, // Tamaño grande para el emoji
  },
  
  // ===== TÍTULO "ADMIN PANEL" =====
  title: {
    fontWeight: 'bold', // Texto en negrita
    color: theme.colors.onBackground, // Color de texto principal
    marginBottom: 8, // Separación con el subtítulo
  },
  
  // ===== SUBTÍTULO "INICIA SESIÓN..." =====
  subtitle: {
    color: theme.colors.onSurfaceVariant, // Color de texto secundario (más tenue)
  },
});
