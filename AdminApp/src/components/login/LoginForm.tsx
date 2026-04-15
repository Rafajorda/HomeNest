/**
 * ========================================
 * COMPONENTE: LoginForm
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Formulario de login con campos de email y contraseña.
 * Componente controlado que recibe valores y callbacks desde el hook useLoginForm.
 * 
 * CAMPOS:
 * - Email: TextInput con validación, icono de email y teclado email-address
 * - Contraseña: TextInput con toggle show/hide, icono de candado
 * 
 * FUNCIONALIDADES:
 * - Validación visual de email (borde rojo si hay error)
 * - Mensaje de error debajo del campo email
 * - Botón para mostrar/ocultar contraseña
 * - Botón "Olvidé mi contraseña" (texto)
 * - Botón "Iniciar Sesión" (contained) con loading state
 * - Deshabilita el botón si el formulario no es válido o está cargando
 * 
 * PROPS:
 * - email, password: Valores de los campos
 * - showPassword: Control de visibilidad de la contraseña
 * - emailError: Mensaje de error del email
 * - isLoading: Estado de carga durante autenticación
 * - isFormValid: Indica si el formulario es válido
 * - onEmailChange, onPasswordChange: Callbacks para cambios en inputs
 * - onTogglePassword: Callback para mostrar/ocultar contraseña
 * - onSubmit: Callback para ejecutar el login
 * - onForgotPassword: Callback para recuperación de contraseña
 * 
 * USO:
 * const { email, password, handleLogin, ... } = useLoginForm();
 * 
 * <LoginForm
 *   email={email}
 *   password={password}
 *   onSubmit={handleLogin}
 *   ...
 * />
 */

// ===== IMPORTS DE REACT =====
import React from 'react'; // Biblioteca principal de React
// ===== IMPORTS DE REACT NATIVE =====
import { View, StyleSheet } from 'react-native'; // Componentes básicos
// ===== IMPORTS DE REACT NATIVE PAPER =====
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper'; // Componentes MD3

/**
 * Props del componente LoginForm
 * 
 * @interface LoginFormProps
 */
interface LoginFormProps {
  email: string; // Valor del campo email
  password: string; // Valor del campo password
  showPassword: boolean; // Control de visibilidad de la contraseña
  emailError: string | null; // Mensaje de error del email (null si no hay error)
  isLoading: boolean; // Estado de carga durante autenticación
  isFormValid: boolean; // Indica si el formulario es válido para enviar
  onEmailChange: (text: string) => void; // Callback para cambio en el campo email
  onPasswordChange: (text: string) => void; // Callback para cambio en el campo password
  onTogglePassword: () => void; // Callback para toggle de visibilidad de password
  onSubmit: () => void; // Callback para ejecutar el login
  onForgotPassword: () => void; // Callback para recuperación de contraseña
}

/**
 * Componente LoginForm
 * 
 * Formulario controlado de login con validación visual.
 * Toda la lógica está en el hook useLoginForm.
 * 
 * @param {LoginFormProps} props - Propiedades del componente
 * @returns {JSX.Element} Formulario de login
 */
export const LoginForm = ({
  email, // Valor del campo email
  password, // Valor del campo password
  showPassword, // Control de visibilidad
  emailError, // Mensaje de error
  isLoading, // Estado de carga
  isFormValid, // Validez del formulario
  onEmailChange, // Handler de cambio de email
  onPasswordChange, // Handler de cambio de password
  onTogglePassword, // Handler de toggle de visibilidad
  onSubmit, // Handler de submit
  onForgotPassword, // Handler de olvidé mi contraseña
}: LoginFormProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    // Contenedor del formulario
    <View style={styles.form}>
      {/* ========================================
          CAMPO: EMAIL
          Input con validación, icono y teclado email-address
          ======================================== */}
      <TextInput
        label="Email" // Etiqueta flotante
        value={email} // Valor controlado
        onChangeText={onEmailChange} // Callback de cambio
        mode="outlined" // Modo con borde
        keyboardType="email-address" // Teclado de email
        autoCapitalize="none" // No capitalizar automáticamente
        autoComplete="email" // Autocompletado de email (nativamente)
        error={!!emailError} // Mostrar error visualmente (borde rojo)
        left={<TextInput.Icon icon="email" />} // Icono de email a la izquierda
        style={styles.input} // Estilos personalizados
      />
      {/* MENSAJE DE ERROR DEL EMAIL */}
      {/* Solo se muestra si hay error */}
      <HelperText type="error" visible={!!emailError}>
        {emailError}
      </HelperText>

      {/* ========================================
          CAMPO: CONTRASEÑA
          Input con secureTextEntry y toggle show/hide
          ======================================== */}
      <TextInput
        label="Contraseña" // Etiqueta flotante
        value={password} // Valor controlado
        onChangeText={onPasswordChange} // Callback de cambio
        mode="outlined" // Modo con borde
        secureTextEntry={!showPassword} // Ocultar texto si showPassword=false
        autoCapitalize="none" // No capitalizar automáticamente
        autoComplete="password" // Autocompletado de password (nativamente)
        left={<TextInput.Icon icon="lock" />} // Icono de candado a la izquierda
        right={
          // Icono de ojo/ojo-cerrado a la derecha para toggle
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'} // Cambiar icono según estado
            onPress={onTogglePassword} // Llamar callback para toggle
          />
        }
        style={styles.input} // Estilos personalizados
      />

      {/* ========================================
          BOTÓN: OLVIDÉ MI CONTRASEÑA
          Botón de texto alineado a la derecha
          ======================================== */}
      <Button
        mode="text" // Modo de texto (sin fondo)
        onPress={onForgotPassword} // Llamar callback de recuperación
        style={styles.forgotButton} // Estilos personalizados
        labelStyle={styles.forgotButtonLabel} // Estilos del texto
      >
        ¿Olvidaste tu contraseña?
      </Button>

      {/* ========================================
          BOTÓN: INICIAR SESIÓN
          Botón principal con loading state
          ======================================== */}
      <Button
        mode="contained" // Modo con fondo (botón principal)
        onPress={onSubmit} // Llamar callback de login
        loading={isLoading} // Mostrar spinner si está cargando
        disabled={isLoading || !isFormValid} // Deshabilitar si está cargando o el formulario no es válido
        style={styles.loginButton} // Estilos personalizados
        contentStyle={styles.loginButtonContent} // Estilos del contenido interno
        labelStyle={styles.loginButtonLabel} // Estilos del texto
      >
        Iniciar Sesión
      </Button>
    </View>
  );
};

/**
 * Estilos del componente LoginForm
 * Usa el tema dinámico para soportar modo claro/oscuro
 */
const getStyles = (theme: any) => StyleSheet.create({
  // ===== CONTENEDOR DEL FORMULARIO =====
  form: {
    width: '100%', // Ancho completo
    maxWidth: 400, // Máximo ancho para pantallas grandes
  },
  
  // ===== INPUTS (EMAIL Y PASSWORD) =====
  input: {
    marginBottom: 4, // Pequeña separación con el HelperText
    backgroundColor: theme.colors.surface, // Fondo color surface
  },
  
  // ===== BOTÓN "OLVIDÉ MI CONTRASEÑA" =====
  forgotButton: {
    alignSelf: 'flex-end', // Alinear a la derecha
    marginTop: 8, // Separación con el input de password
    marginBottom: 24, // Separación con el botón de login
  },
  forgotButtonLabel: {
    color: theme.colors.primary, // Texto color primario
    fontSize: 14, // Tamaño medio
  },
  
  // ===== BOTÓN "INICIAR SESIÓN" =====
  loginButton: {
    backgroundColor: theme.colors.primary, // Fondo color primario
  },
  loginButtonContent: {
    paddingVertical: 8, // Padding vertical para altura
  },
  loginButtonLabel: {
    fontSize: 16, // Tamaño grande
    fontWeight: '600', // Peso semi-bold
  },
});
