/**
 * ========================================
 * HOOK: useLoginForm
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Hook personalizado que encapsula TODA la lógica del formulario de login.
 * Separa la lógica de negocio de la presentación visual.
 * 
 * RESPONSABILIDADES:
 * - Manejo del estado de los campos (email, password)
 * - Validación en tiempo real del email
 * - Control de visibilidad de la contraseña
 * - Proceso de autenticación con el backend
 * - Navegación después del login exitoso
 * - Manejo de errores y mensajes al usuario
 * - Recuperación de contraseña
 * 
 * ESTADO INTERNO:
 * - email: Valor del campo email
 * - password: Valor del campo password
 * - showPassword: Mostrar/ocultar contraseña (toggle)
 * - emailError: Mensaje de error de validación del email
 * - isLoading: Estado de carga durante autenticación
 * 
 * VALIDACIONES:
 * - Email: Formato válido de correo electrónico
 * - Password: Campo no vacío (validación básica)
 * 
 * FLUJO DE LOGIN:
 * 1. Usuario ingresa email y password
 * 2. Se valida el formato del email en tiempo real
 * 3. Al presionar Login, se validan ambos campos
 * 4. Se llama a authStore.login() con las credenciales
 * 5. Si es exitoso, navega al dashboard con fromLogin=true
 * 6. Si falla, muestra un Alert con el error
 * 
 * USO:
 * const { email, password, handleLogin, ... } = useLoginForm();
 */

// ===== IMPORTS DE REACT =====
import { useState } from 'react'; // Hook de estado
// ===== IMPORTS DE REACT NATIVE =====
import { Alert } from 'react-native'; // Mostrar alertas nativas
// ===== IMPORTS DE EXPO ROUTER =====
import { useRouter } from 'expo-router'; // Hook de navegación
// ===== IMPORTS DE STORES =====
import { useAuthStore } from '../stores/authStore'; // Store de autenticación (Zustand)
// ===== IMPORTS DE UTILIDADES =====
import { validateEmail, getEmailError } from '../utils/validations'; // Funciones de validación

/**
 * Hook personalizado para el formulario de login
 * 
 * @returns {Object} Estado y handlers del formulario
 */
export const useLoginForm = () => {
  // ===== ESTADO LOCAL =====
  // Valor del campo email
  const [email, setEmail] = useState('');
  
  // Valor del campo password
  const [password, setPassword] = useState('');
  
  // Control de visibilidad de la contraseña (ojo/ojo-cerrado)
  const [showPassword, setShowPassword] = useState(false);
  
  // Mensaje de error de validación del email
  const [emailError, setEmailError] = useState('');
  
  // Estado de carga durante el proceso de autenticación
  const [isLoading, setIsLoading] = useState(false);
  
  // ===== ZUSTAND STORE =====
  // Función de login del store de autenticación
  const login = useAuthStore((state) => state.login);
  
  // ===== ROUTER =====
  // Hook de navegación de Expo Router
  const router = useRouter();

  // ===== HANDLERS =====
  
  /**
   * HANDLER: Cambio de email con validación en tiempo real
   * 
   * Se ejecuta cada vez que el usuario escribe en el campo email.
   * Valida automáticamente el formato del email y muestra error si es inválido.
   * 
   * @param {string} text - Texto ingresado en el campo email
   */
  const handleEmailChange = (text: string) => {
    setEmail(text); // Actualizar el estado
    
    // Validar solo si hay texto ingresado
    if (text && !validateEmail(text)) {
      setEmailError('Email inválido'); // Mostrar error
    } else {
      setEmailError(''); // Limpiar error
    }
  };

  /**
   * HANDLER: Proceso de login
   * 
   * Ejecuta el flujo completo de autenticación:
   * 1. Valida email y password
   * 2. Llama al backend vía authStore.login()
   * 3. Navega al dashboard si es exitoso
   * 4. Muestra error si falla
   * 
   * @async
   */
  const handleLogin = async () => {
    // ===== PASO 1: VALIDACIÓN DE EMAIL =====
    const emailErr = getEmailError(email);
    if (emailErr) {
      setEmailError(emailErr); // Mostrar error de validación
      return; // Detener el proceso
    }

    // ===== PASO 2: VALIDACIÓN DE PASSWORD =====
    if (!password) {
      Alert.alert('Error', 'La contraseña es requerida');
      return; // Detener el proceso
    }

    // ===== PASO 3: INICIAR ESTADO DE CARGA =====
    setIsLoading(true);

    try {
      // ===== PASO 4: AUTENTICACIÓN CON EL BACKEND =====
      // Llamar al método login del store (hace fetch al backend)
      await login(email, password);
      
      console.log('✅ Login exitoso, redirigiendo a dashboard...');
      
      // ===== PASO 5: NAVEGACIÓN EXITOSA =====
      // Navegar al dashboard con parámetro fromLogin para mostrar mensaje de bienvenida
      router.replace('/dashboard?fromLogin=true');
      
    } catch (error: any) {
      // ===== PASO 6: MANEJO DE ERRORES =====
      console.error('❌ Error en login:', error);
      
      // Mensaje de error por defecto
      let errorMessage = 'No se pudo conectar con el servidor. Por favor, intenta de nuevo.';
      
      // Usar el mensaje del error si está disponible
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar alerta al usuario
      Alert.alert('Error de Login', errorMessage);
      
    } finally {
      // ===== PASO 7: FINALIZAR ESTADO DE CARGA =====
      // Se ejecuta siempre, haya éxito o error
      setIsLoading(false);
    }
  };

  /**
   * HANDLER: Recuperación de contraseña
   * 
   * Ejecuta el flujo de recuperación de contraseña:
   * 1. Valida que haya un email ingresado
   * 2. Valida el formato del email
   * 3. Envía email de recuperación (actualmente simulado)
   * 
   * @async
   * @todo Conectar con el backend cuando esté implementado
   */
  const handleForgotPassword = async () => {
    // ===== VALIDACIÓN: EMAIL REQUERIDO =====
    if (!email) {
      Alert.alert('Email requerido', 'Por favor ingresa tu email primero');
      return; // Detener el proceso
    }

    // ===== VALIDACIÓN: FORMATO DE EMAIL =====
    const emailErr = getEmailError(email);
    if (emailErr) {
      setEmailError(emailErr); // Mostrar error
      return; // Detener el proceso
    }

    try {
      // TODO: Descomentar para conectar con el backend
      // await authService.forgotPassword(email);
      // Alert.alert('Email enviado', 'Revisa tu correo para restablecer tu contraseña');

      // ===== SIMULACIÓN (TEMPORAL) =====
      console.log('===== FORGOT PASSWORD =====');
      console.log('Email:', email);
      console.log('===========================');
      Alert.alert('Email enviado', 'Revisa tu correo para restablecer tu contraseña (simulado)');
      
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      Alert.alert('Error', 'No se pudo procesar tu solicitud');
    }
  };

  /**
   * COMPUTED: Validez del formulario
   * 
   * El formulario es válido si:
   * - Hay un email ingresado
   * - Hay una contraseña ingresada
   * - No hay errores de validación en el email
   */
  const isFormValid = email && password && !emailError;

  // ===== RETURN: API PÚBLICA DEL HOOK =====
  return {
    // ===== ESTADO =====
    email, // Valor del campo email
    password, // Valor del campo password
    showPassword, // Control de visibilidad de la contraseña
    emailError, // Mensaje de error del email
    isLoading, // Estado de carga durante autenticación
    isFormValid, // Indica si el formulario es válido para enviar
    
    // ===== ACCIONES =====
    setEmail: handleEmailChange, // Setter con validación en tiempo real
    setPassword, // Setter simple de password
    setShowPassword, // Setter de visibilidad de password
    handleLogin, // Handler para ejecutar el login
    handleForgotPassword, // Handler para recuperación de contraseña
  };
};
