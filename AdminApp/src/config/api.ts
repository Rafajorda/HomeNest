/**
 * ========================================
 * CONFIGURACIÓN: API
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Configuración centralizada de la URL base de la API del backend.
 * Usa variables de entorno para diferentes entornos (desarrollo, producción).
 * 
 * VARIABLE DE ENTORNO:
 * - EXPO_PUBLIC_API_URL: URL base del backend (se define en .env)
 * 
 * VALORES POR DEFECTO:
 * - Desarrollo: http://localhost:3000
 * - Producción: Se debe configurar en .env o en Expo EAS Secrets
 * 
 * USO EN SERVICIOS:
 * import { API_URL } from '../config/api';
 * 
 * const response = await fetch(`${API_URL}/products`);
 * 
 * CONFIGURACIÓN DE .ENV:
 * Crear archivo .env en la raíz del proyecto:
 * EXPO_PUBLIC_API_URL=http://192.168.1.100:3000 (para dispositivo físico)
 * EXPO_PUBLIC_API_URL=http://localhost:3000 (para emulador)
 * EXPO_PUBLIC_API_URL=https://api.example.com (para producción)
 */

// ===== IMPORTS DE REACT NATIVE =====
import { Platform } from 'react-native'; // Para detectar plataforma si es necesario

/**
 * URL base de la API del backend
 * 
 * Se obtiene de la variable de entorno EXPO_PUBLIC_API_URL.
 * Si no está definida, usa http://localhost:3000 como fallback.
 * 
 * NOTA: En un dispositivo físico, localhost no funciona.
 * Usar la IP local de tu máquina (ej: http://192.168.1.100:3000).
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
