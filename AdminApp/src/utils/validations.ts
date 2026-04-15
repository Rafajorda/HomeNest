/**
 * ========================================
 * UTILIDADES: Validaciones de Formularios
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Conjunto de funciones reutilizables para validar campos de formularios
 * en toda la aplicación.
 * 
 * FUNCIONES:
 * - validateEmail: Valida formato de email con regex
 * - validatePassword: Valida longitud mínima de contraseña (6 caracteres)
 * - validateRequired: Valida que un campo no esté vacío
 * - getEmailError: Devuelve mensaje de error para email
 * - getPasswordError: Devuelve mensaje de error para contraseña
 * 
 * USO:
 * import { validateEmail, getEmailError } from '../utils/validations';
 * 
 * if (!validateEmail(email)) {
 *   const error = getEmailError(email);
 *   // Mostrar error al usuario
 * }
 */

/**
 * VALIDACIÓN: Formato de email
 * 
 * Valida que un string tenga el formato correcto de email
 * usando una expresión regular.
 * 
 * FORMATO ACEPTADO:
 * - Debe tener al menos un carácter antes del @
 * - Debe tener un @ en el medio
 * - Debe tener un dominio después del @
 * - Debe tener un punto y extensión (.com, .es, etc.)
 * 
 * EJEMPLOS VÁLIDOS:
 * - usuario@example.com
 * - admin@tienda.es
 * - test.user@domain.co.uk
 * 
 * EJEMPLOS INVÁLIDOS:
 * - usuario@
 * - @example.com
 * - usuario.example.com
 * - usuario@example
 * 
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido, false en caso contrario
 */
export const validateEmail = (email: string): boolean => {
  // Expresión regular para formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * VALIDACIÓN: Contraseña con requisitos mínimos
 * 
 * Valida que una contraseña cumpla con el requisito mínimo de longitud.
 * 
 * REQUISITOS:
 * - Mínimo 6 caracteres de longitud
 * 
 * @param {string} password - Contraseña a validar
 * @returns {boolean} true si la contraseña es válida, false en caso contrario
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6; // Mínimo 6 caracteres
};

/**
 * VALIDACIÓN: Campo requerido (no vacío)
 * 
 * Valida que un campo tenga al menos un carácter (sin contar espacios).
 * 
 * @param {string} value - Valor del campo a validar
 * @returns {boolean} true si el campo no está vacío, false en caso contrario
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0; // trim() elimina espacios al inicio y final
};

/**
 * MENSAJE DE ERROR: Email inválido
 * 
 * Devuelve un mensaje de error apropiado para el campo email
 * según el tipo de error (vacío o formato inválido).
 * 
 * @param {string} email - Email a validar
 * @returns {string} Mensaje de error, o string vacío si es válido
 */
export const getEmailError = (email: string): string => {
  if (!email) return 'El email es requerido'; // Campo vacío
  if (!validateEmail(email)) return 'Email inválido'; // Formato incorrecto
  return ''; // Email válido, no hay error
};

/**
 * MENSAJE DE ERROR: Contraseña inválida
 * 
 * Devuelve un mensaje de error apropiado para el campo contraseña
 * según el tipo de error (vacío o demasiado corto).
 * 
 * @param {string} password - Contraseña a validar
 * @returns {string} Mensaje de error, o string vacío si es válida
 */
export const getPasswordError = (password: string): string => {
  if (!password) return 'La contraseña es requerida'; // Campo vacío
  if (!validatePassword(password)) return 'La contraseña debe tener al menos 6 caracteres'; // Demasiado corta
  return ''; // Contraseña válida, no hay error
};
