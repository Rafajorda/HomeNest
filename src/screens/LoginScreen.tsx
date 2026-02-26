/**
 * ========================================
 * PANTALLA: LoginScreen
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Pantalla de autenticación para administradores del panel AdminApp.
 * Permite el acceso al sistema mediante email y contraseña.
 * 
 * CARACTERÍSTICAS:
 * - Formulario con campos email y password
 * - Validación de email en tiempo real
 * - Opción de mostrar/ocultar contraseña
 * - Botón "Olvidé mi contraseña" para recuperación
 * - Diseño responsive que se adapta al teclado
 * - Loading state durante el proceso de login
 * - Tema claro/oscuro adaptativo
 * 
 * FLUJO:
 * 1. Usuario ingresa email y contraseña
 * 2. Se valida el formato del email
 * 3. Se habilita el botón solo si ambos campos son válidos
 * 4. Al presionar Login, se autentica con el backend
 * 5. Si es exitoso, se guarda el token y navega al Dashboard
 * 6. Si falla, se muestra un error
 * 
 * COMPONENTES USADOS:
 * - LoginHeader: Logo y título de la app
 * - LoginForm: Formulario con inputs y botones
 * 
 * LÓGICA:
 * Toda la lógica del formulario (validación, estado, handlers)
 * está encapsulada en el hook useLoginForm.
 */

// ===== IMPORTS DE REACT =====
import React from 'react'; // Biblioteca principal de React
// ===== IMPORTS DE REACT NATIVE =====
import {
  StyleSheet, // Sistema de estilos de React Native
  KeyboardAvoidingView, // Componente que evita que el teclado tape el contenido
  Platform, // Detectar plataforma (iOS/Android)
  ScrollView, // Vista desplazable
} from 'react-native';
// ===== IMPORTS DE REACT NATIVE PAPER =====
import { useTheme } from 'react-native-paper'; // Hook para obtener el tema actual
// ===== IMPORTS DE HOOKS =====
import { useLoginForm } from '../hooks/useLoginForm'; // Hook personalizado con toda la lógica del login
// ===== IMPORTS DE COMPONENTES =====
import { LoginHeader, LoginForm } from '../components/login'; // Componentes del formulario de login

/**
 * Componente principal de la pantalla de Login
 * 
 * Renderiza un formulario de autenticación con validación y manejo de estado.
 * Todo el comportamiento está delegado al hook useLoginForm.
 * 
 * @returns {JSX.Element} Pantalla de login con formulario
 */
export const LoginScreen = () => {
  // Hook para obtener el tema actual (light/dark)
  const theme = useTheme();
  
  // Generar estilos dinámicos basados en el tema
  const styles = getStyles(theme);
  
  // Hook personalizado que maneja toda la lógica del formulario
  const {
    email, // Valor del campo email
    password, // Valor del campo password
    showPassword, // Estado para mostrar/ocultar password
    emailError, // Mensaje de error de validación del email
    isLoading, // Estado de carga durante la autenticación
    isFormValid, // Indica si el formulario es válido para enviar
    setEmail, // Setter para actualizar el email
    setPassword, // Setter para actualizar el password
    setShowPassword, // Setter para toggle de visibilidad del password
    handleLogin, // Handler para ejecutar el login
    handleForgotPassword, // Handler para recuperación de contraseña
  } = useLoginForm();

  // ===== RENDER =====
  return (
    // KeyboardAvoidingView: Evita que el teclado tape el formulario
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Comportamiento diferente según plataforma
      style={styles.container} // Fondo y flex:1
    >
      {/* ScrollView: Permite desplazar el contenido si el teclado lo tapa */}
      <ScrollView
        contentContainerStyle={styles.scrollContent} // Centrar verticalmente el contenido
        keyboardShouldPersistTaps="handled" // Cerrar teclado al tocar fuera de los inputs
      >
        {/* ========================================
            SECCIÓN: HEADER
            Logo y título de la aplicación
            ======================================== */}
        <LoginHeader />
        
        {/* ========================================
            SECCIÓN: FORMULARIO DE LOGIN
            Inputs de email y password con validación
            ======================================== */}
        <LoginForm
          email={email} // Valor del input email
          password={password} // Valor del input password
          showPassword={showPassword} // Control de visibilidad del password
          emailError={emailError} // Mensaje de error si el email es inválido
          isLoading={isLoading} // Estado de carga (deshabilita botón y muestra spinner)
          isFormValid={isFormValid} // Habilitar/deshabilitar botón de login
          onEmailChange={setEmail} // Handler para actualizar email
          onPasswordChange={setPassword} // Handler para actualizar password
          onTogglePassword={() => setShowPassword(!showPassword)} // Handler para toggle de visibilidad
          onSubmit={handleLogin} // Handler para ejecutar el login
          onForgotPassword={handleForgotPassword} // Handler para recuperación de contraseña
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Función generadora de estilos dinámicos
 * 
 * @param {any} theme - Objeto de tema de React Native Paper (light/dark)
 * @returns {Object} StyleSheet con los estilos del componente
 */
const getStyles = (theme: any) => StyleSheet.create({
  // ===== CONTENEDOR PRINCIPAL =====
  container: {
    flex: 1, // Ocupar toda la pantalla
    backgroundColor: theme.colors.background, // Fondo del tema
  },
  
  // ===== CONTENIDO DEL SCROLL =====
  scrollContent: {
    flexGrow: 1, // Crecer para ocupar todo el espacio disponible
    justifyContent: 'center', // Centrar verticalmente el formulario
    alignItems: 'center', // Centrar horizontalmente el formulario
    padding: 24, // Padding alrededor del contenido
  },
});
