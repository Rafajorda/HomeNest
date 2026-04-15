/**
 * ============================================================================
 * THEME.TS - SISTEMA DE TEMAS MATERIAL DESIGN 3
 * ============================================================================
 * 
 * @file theme.ts
 * @description Define los temas claro y oscuro de la aplicación AdminApp
 * siguiendo las especificaciones de Material Design 3.
 * 
 * @overview
 * Este archivo contiene la configuración completa de la paleta de colores, 
 * elevaciones y estilos visuales de la aplicación. Implementa dos temas 
 * (claro/oscuro) con una paleta natural inspirada en elementos como el 
 * verde oliva, la madera y la arena, proporcionando una experiencia visual 
 * coherente y agradable.
 * 
 * ============================================================================
 * PALETA DE COLORES - TEMA CLARO (LIGHT THEME)
 * ============================================================================
 * 
 * 🌿 PRIMARY (#7B8C5F - Verde Oliva Suave):
 *    - Usado en botones principales, headers, elementos interactivos
 *    - Color natural que no fatiga la vista
 *    - Evoca naturalidad y tranquilidad
 *    - Contraste adecuado con texto blanco
 * 
 * 🪵 SECONDARY (#D9C6A5 - Madera Clara/Beige):
 *    - Usado en botones secundarios, chips, badges
 *    - Complementa al primary sin competir por atención
 *    - Tonalidad cálida que añade elegancia
 * 
 * 📄 SURFACE (#FFFDF8 - Blanco Cálido):
 *    - Usado en cards, modals, bottom sheets
 *    - No es un blanco puro (#FFFFFF), tiene un toque cálido
 *    - Reduce el cansancio visual
 * 
 * 🏖️ BACKGROUND (#F5EFE6 - Arena Suave):
 *    - Fondo principal de la aplicación
 *    - Tonalidad arena que es cómoda durante uso prolongado
 *    - No es blanco brillante, evita fatiga visual
 * 
 * ✍️ ON_SURFACE (#3E3B32 - Marrón Profundo):
 *    - Color del texto principal sobre surface/background
 *    - Alta legibilidad y contraste
 *    - No es negro puro, más suave para la vista
 * 
 * ============================================================================
 * PALETA DE COLORES - TEMA OSCURO (DARK THEME)
 * ============================================================================
 * 
 * 🌿 PRIMARY (#5A6B3F - Verde Oliva Oscuro):
 *    - Versión más oscura del verde oliva del tema claro
 *    - Mantiene la identidad visual en modo nocturno
 *    - Buena visibilidad sin ser demasiado brillante
 * 
 * 🪵 SECONDARY (#BFAE94 - Madera Oscura):
 *    - Versión oscura del beige del tema claro
 *    - Tonalidad cálida adaptada para fondos oscuros
 * 
 * 📄 SURFACE (#2E2B25 - Gris Oscuro Cálido):
 *    - Superficie para cards en modo oscuro
 *    - No es gris puro, tiene tonalidad cálida
 * 
 * 🌑 BACKGROUND (#1E1C18 - Negro Cálido):
 *    - Fondo principal en modo oscuro
 *    - Reduce emisión de luz en pantallas OLED
 *    - Cómodo para uso nocturno
 * 
 * ✍️ ON_SURFACE (#EFEDE8 - Crema Claro):
 *    - Texto principal en modo oscuro
 *    - No es blanco puro, evita deslumbramiento
 *    - Alta legibilidad sobre fondos oscuros
 * 
 * ============================================================================
 * SISTEMA DE ELEVACIONES (ELEVATION)
 * ============================================================================
 * 
 * Material Design 3 usa elevaciones para crear jerarquía visual:
 * - Level 0: Sin elevación (transparente)
 * - Level 1: Elevación mínima (cards básicos)
 * - Level 2: Elevación baja (botones elevados)
 * - Level 3: Elevación media (modals)
 * - Level 4: Elevación alta (navigation drawer)
 * - Level 5: Elevación máxima (dialogs importantes)
 * 
 * Cada nivel tiene un color ligeramente diferente que simula sombra/luz.
 * 
 * ============================================================================
 * ROUNDNESS (REDONDEO DE BORDES)
 * ============================================================================
 * 
 * Se usa roundness: 12 en ambos temas para:
 * - Botones con bordes redondeados suaves
 * - Cards con esquinas amigables
 * - Inputs con apariencia moderna
 * - Consistencia visual en toda la app
 * 
 * ============================================================================
 * USO
 * ============================================================================
 * 
 * ```tsx
 * import { lightTheme, darkTheme, colors } from '@/theme';
 * import { useThemeStore } from '@/stores/themeStore';
 * 
 * // En un componente:
 * const isDark = useThemeStore(state => state.isDark);
 * const theme = isDark ? darkTheme : lightTheme;
 * const themeColors = isDark ? colors.dark : colors.light;
 * 
 * <PaperProvider theme={theme}>
 *   <Text style={{ color: themeColors.text }}>Hola</Text>
 * </PaperProvider>
 * ```
 * 
 * ============================================================================
 */

// Importa los temas base de Material Design 3 de React Native Paper
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
// Importa el tipo TypeScript para validación de temas MD3
import type { MD3Theme } from 'react-native-paper';

/**
 * ============================================================================
 * LIGHT THEME - Tema Claro con Paleta Natural
 * ============================================================================
 * 
 * @constant lightTheme
 * @type {MD3Theme}
 * @description Tema claro inspirado en elementos naturales como el verde 
 * oliva, la madera y la arena. Diseñado para uso diurno con colores que no 
 * cansan la vista durante sesiones prolongadas.
 * 
 * @features
 * - ✅ Fondo arena suave (#F5EFE6) que reduce fatiga visual
 * - ✅ Verde oliva (#7B8C5F) como color principal para acciones
 * - ✅ Madera clara (#D9C6A5) para elementos secundarios
 * - ✅ Texto marrón profundo (#3E3B32) con alta legibilidad
 * - ✅ Bordes redondeados (12px) para apariencia moderna
 * - ✅ Sistema de elevaciones coherente (6 niveles)
 * - ✅ Paleta cálida que crea sensación de tranquilidad
 * 
 * @example
 * ```tsx
 * import { lightTheme } from '@/theme';
 * <PaperProvider theme={lightTheme}>
 *   <App />
 * </PaperProvider>
 * ```
 */
export const lightTheme: MD3Theme = {
  // Extiende el tema base de Material Design 3 de React Native Paper
  ...MD3LightTheme,
  
  colors: {
    // Mantiene colores base de MD3 (error, warning, etc.)
    ...MD3LightTheme.colors,
    
    // ========== COLORES PRINCIPALES ==========
    
    primary: '#7B8C5F', 
    // Verde oliva suave - usado en:
    // • Botones primarios (GUARDAR, CREAR, ENVIAR)
    // • Headers de navegación
    // • Iconos activos/seleccionados
    // • FABs (Floating Action Buttons)
    // • Progress indicators
    
    secondary: '#D9C6A5', 
    // Madera clara/beige - usado en:
    // • Botones secundarios (CANCELAR, VOLVER)
    // • Chips y badges
    // • Tabs desactivados
    // • Bordes y separadores
    
    // ========== SUPERFICIES ==========
    
    surface: '#FFFDF8', 
    // Blanco cálido (no puro) - usado en:
    // • Cards (ProductCard, OrderCard)
    // • Modals y dialogs
    // • Bottom sheets
    // • Menús desplegables
    
    background: '#F5EFE6', 
    // Arena suave - usado en:
    // • Fondo de screens (Dashboard, Products, Orders)
    // • Fondo de ScrollView
    // • Áreas sin contenido
    
    // ========== TEXTOS ==========
    
    onPrimary: '#FFFFFF', 
    // Blanco - texto sobre botones/elementos primary
    // Asegura contraste WCAG AAA (mínimo 4.5:1)
    
    onSecondary: '#3E3B32', 
    // Marrón profundo - texto sobre elementos secondary
    // Buena legibilidad sobre beige claro
    
    onSurface: '#3E3B32', 
    // Marrón profundo - texto principal de la app
    // Usado en títulos, contenido, párrafos
    // Menos agresivo que negro puro (#000000)
    
    onBackground: '#3E3B32', 
    // Marrón profundo - texto sobre fondo arena
    // Consistente con onSurface
    
    // ========== VARIANTES DE SUPERFICIE ==========
    
    surfaceVariant: '#E8E1D6', 
    // Variante de surface un poco más oscura
    // Usado en:
    // • Inputs/TextFields en estado deshabilitado
    // • Backgrounds de secciones
    // • Áreas de menor importancia
    
    onSurfaceVariant: '#3E3B32', 
    // Texto sobre surfaceVariant
    // Mantiene legibilidad consistente
    
    // ========== BORDES Y LÍNEAS ==========
    
    outline: '#D9C6A5', 
    // Madera clara - usado en:
    // • Bordes de inputs
    // • Separadores de listas
    // • Bordes de cards
    // • Dividers
    
    // ========== SISTEMA DE ELEVACIONES ==========
    // Colores para simular elevación (sombras) de elementos
    
    elevation: {
      level0: 'transparent', 
      // Sin elevación - elementos pegados al fondo
      
      level1: '#FFFDF8', 
      // Elevación mínima - cards básicos, list items
      
      level2: '#F9F7F2', 
      // Elevación baja - botones elevados, FAB normal
      
      level3: '#F5F1EC', 
      // Elevación media - modals, bottom sheets
      
      level4: '#F3EFE9', 
      // Elevación alta - navigation drawer abierto
      
      level5: '#F0EBE5', 
      // Elevación máxima - dialogs críticos, alerts importantes
    },
  },
  
  // Radio de redondeo para bordes (en px)
  roundness: 12, 
  // Aplica a:
  // • Botones (Button, FAB)
  // • Cards
  // • TextInput
  // • Chips
  // • Modals
};

/**
 * ============================================================================
 * DARK THEME - Tema Oscuro con Paleta Natural Profunda
 * ============================================================================
 * 
 * @constant darkTheme
 * @type {MD3Theme}
 * @description Tema oscuro adaptado de la paleta natural del lightTheme,
 * optimizado para uso nocturno y pantallas OLED. Mantiene la identidad visual
 * mientras reduce la emisión de luz para comodidad en entornos con poca luz.
 * 
 * @features
 * - ✅ Fondo negro cálido (#1E1C18) para uso nocturno confortable
 * - ✅ Verde oliva oscuro (#5A6B3F) mantiene identidad de marca
 * - ✅ Madera oscura (#BFAE94) para elementos secundarios
 * - ✅ Texto crema claro (#EFEDE8) sin deslumbramiento
 * - ✅ Reduce consumo de batería en pantallas OLED/AMOLED
 * - ✅ Sistema de elevaciones adaptado a fondos oscuros
 * - ✅ Paleta cálida que evita tonos azules que interfieren con el sueño
 * 
 * @example
 * ```tsx
 * import { darkTheme } from '@/theme';
 * <PaperProvider theme={darkTheme}>
 *   <App />
 * </PaperProvider>
 * ```
 */
export const darkTheme: MD3Theme = {
  // Extiende el tema oscuro base de Material Design 3
  ...MD3DarkTheme,
  
  colors: {
    // Mantiene colores base de MD3 adaptados para modo oscuro
    ...MD3DarkTheme.colors,
    
    // ========== COLORES PRINCIPALES ==========
    
    primary: '#5A6B3F', 
    // Verde oliva oscuro - versión nocturna del primary de lightTheme
    // Usado en:
    // • Botones primarios (GUARDAR, CREAR, ENVIAR)
    // • Headers de navegación en modo oscuro
    // • Iconos activos/seleccionados
    // • FABs en modo oscuro
    // • Progress indicators
    // 🎨 Mantiene identidad visual pero con brillo reducido
    
    secondary: '#BFAE94', 
    // Madera oscura - versión nocturna del beige claro
    // Usado en:
    // • Botones secundarios (CANCELAR, VOLVER)
    // • Chips y badges en modo oscuro
    // • Tabs desactivados
    // • Bordes sutiles
    
    // ========== SUPERFICIES ==========
    
    surface: '#2E2B25', 
    // Gris oscuro con tonalidad cálida (no gris puro)
    // Usado en:
    // • Cards (ProductCard, OrderCard) en modo oscuro
    // • Modals y dialogs
    // • Bottom sheets
    // • Menús desplegables
    // 🎨 Se eleva ligeramente sobre el background
    
    background: '#1E1C18', 
    // Negro cálido (no negro puro #000000)
    // Usado en:
    // • Fondo de screens en modo oscuro
    // • Fondo de ScrollView
    // • Áreas sin contenido
    // 🔋 En pantallas OLED, los píxeles negros se apagan = ahorro batería
    
    // ========== TEXTOS ==========
    
    onPrimary: '#FFFFFF', 
    // Blanco - texto sobre botones/elementos primary
    // Asegura contraste WCAG AAA en modo oscuro
    
    onSecondary: '#1E1C18', 
    // Negro cálido - texto sobre elementos secondary (beige oscuro)
    // Buena legibilidad sobre madera oscura
    
    onSurface: '#EFEDE8', 
    // Crema claro - texto principal en modo oscuro
    // Usado en títulos, contenido, párrafos
    // NO es blanco puro para evitar deslumbramiento
    // 😌 Más cómodo para la vista en uso nocturno
    
    onBackground: '#EFEDE8', 
    // Crema claro - texto sobre fondo negro cálido
    // Consistente con onSurface
    
    // ========== VARIANTES DE SUPERFICIE ==========
    
    surfaceVariant: '#3E3B35', 
    // Variante de surface un poco más clara que surface
    // Usado en:
    // • Inputs/TextFields en estado deshabilitado
    // • Backgrounds de secciones
    // • Áreas de menor importancia
    
    onSurfaceVariant: '#D4CFC5', 
    // Texto sobre surfaceVariant
    // Un tono más claro que onSurface para diferenciar
    
    // ========== BORDES Y LÍNEAS ==========
    
    outline: '#8A837A', 
    // Gris cálido - versión oscura del outline de lightTheme
    // Usado en:
    // • Bordes de inputs en modo oscuro
    // • Separadores de listas
    // • Bordes de cards
    // • Dividers
    // 🎨 Sutil pero visible sobre fondo oscuro
    
    // ========== SISTEMA DE ELEVACIONES ==========
    // En modo oscuro, elevación se simula con tonos más CLAROS (no más oscuros)
    // Elementos elevados son LIGERAMENTE MÁS CLAROS que el fondo
    
    elevation: {
      level0: 'transparent', 
      // Sin elevación - elementos pegados al fondo
      
      level1: '#2E2B25', 
      // Elevación mínima - cards básicos, list items
      
      level2: '#34312A', 
      // Elevación baja - botones elevados, FAB normal
      
      level3: '#3A372F', 
      // Elevación media - modals, bottom sheets
      
      level4: '#3C3931', 
      // Elevación alta - navigation drawer abierto
      
      level5: '#403D34', 
      // Elevación máxima - dialogs críticos, alerts importantes
    },
  },
  
  // Radio de redondeo para bordes (igual que lightTheme)
  roundness: 12, 
  // Mantiene consistencia visual entre temas
};

/**
 * ============================================================================
 * COLORS - Colores Adicionales para Componentes Personalizados
 * ============================================================================
 * 
 * @constant colors
 * @description Paleta de colores extendida que complementa los temas de 
 * Material Design 3. Incluye colores específicos para componentes 
 * personalizados que no están cubiertos por el sistema de temas de MD3.
 * 
 * @structure
 * - light: Colores para tema claro
 * - dark: Colores para tema oscuro
 * 
 * @usage
 * ```tsx
 * import { colors } from '@/theme';
 * import { useThemeStore } from '@/stores/themeStore';
 * 
 * const isDark = useThemeStore(state => state.isDark);
 * const themeColors = isDark ? colors.dark : colors.light;
 * 
 * // Para estados de pedidos:
 * const statusColor = themeColors.orderStatus.pending.background;
 * ```
 */
export const colors = {
  /**
   * ========================================================================
   * LIGHT - Colores para Tema Claro
   * ========================================================================
   */
  light: {
    // === COLORES BASE (duplicados de lightTheme para fácil acceso) ===
    
    primary: '#7B8C5F', 
    // Verde oliva suave
    
    secondary: '#D9C6A5', 
    // Madera clara/beige
    
    background: '#F5EFE6', 
    // Arena suave
    
    surface: '#FFFDF8', 
    // Blanco cálido
    
    text: '#3E3B32', 
    // Texto principal (marrón profundo)
    
    textSecondary: '#6B6860', 
    // Texto secundario/deshabilitado
    // Un tono más claro que text para jerarquía visual
    
    border: '#D9C6A5', 
    // Bordes y separadores
    
    // === COLORES SEMÁNTICOS ===
    
    error: '#BA1A1A', 
    // Rojo para errores
    // Usado en: mensajes de error, validaciones fallidas, alertas
    
    success: '#6B8C5F', 
    // Verde para éxito
    // Usado en: confirmaciones, validaciones exitosas, operaciones completadas
    
    warning: '#D9A05F', 
    // Naranja para advertencias
    // Usado en: alertas, acciones que requieren atención
    
    // === ESTADOS DE PEDIDOS (ORDER STATUS) ===
    // Cada estado tiene background + text para crear chips/badges visuales
    
    orderStatus: {
      /**
       * PENDING - Pedido Pendiente
       * Estado inicial cuando se crea un pedido
       */
      pending: {
        background: '#FFF3E0', 
        // Naranja muy claro (casi crema)
        
        text: '#E65100', 
        // Naranja oscuro para contraste
        // 🔔 Indica que requiere atención pero no es urgente
      },
      
      /**
       * PROCESSING - Pedido en Proceso
       * El pedido está siendo preparado/procesado
       */
      processing: {
        background: '#E3F2FD', 
        // Azul muy claro
        
        text: '#1565C0', 
        // Azul oscuro para contraste
        // ⏳ Indica trabajo en progreso activo
      },
      
      /**
       * SHIPPED - Pedido Enviado
       * El pedido ha sido enviado al cliente
       */
      shipped: {
        background: '#F3E5F5', 
        // Púrpura muy claro
        
        text: '#6A1B9A', 
        // Púrpura oscuro para contraste
        // 🚚 Indica que está en camino
      },
      
      /**
       * COMPLETED - Pedido Completado
       * El pedido ha sido entregado y completado exitosamente
       */
      completed: {
        background: '#E8F5E9', 
        // Verde muy claro
        
        text: '#2E7D32', 
        // Verde oscuro para contraste
        // ✅ Indica finalización exitosa
      },
      
      /**
       * CANCELLED - Pedido Cancelado
       * El pedido fue cancelado por el cliente o administrador
       */
      cancelled: {
        background: '#FFEBEE', 
        // Rojo muy claro (casi rosa)
        
        text: '#C62828', 
        // Rojo oscuro para contraste
        // ❌ Indica operación abortada
      },
    },
  },

  /**
   * ========================================================================
   * DARK - Colores para Tema Oscuro
   * ========================================================================
   */
  dark: {
    // === COLORES BASE (duplicados de darkTheme para fácil acceso) ===
    
    primary: '#5A6B3F', 
    // Verde oliva oscuro
    
    secondary: '#BFAE94', 
    // Madera oscura
    
    background: '#1E1C18', 
    // Negro cálido
    
    surface: '#2E2B25', 
    // Superficie oscura
    
    text: '#EFEDE8', 
    // Texto principal (crema claro)
    
    textSecondary: '#C4BFB5', 
    // Texto secundario/deshabilitado
    // Un tono más oscuro que text para jerarquía visual
    
    border: '#8A837A', 
    // Bordes y separadores
    
    // === COLORES SEMÁNTICOS ===
    
    error: '#FFB4AB', 
    // Rojo claro para errores en modo oscuro
    // Menos agresivo que #BA1A1A pero visible
    
    success: '#8AAF7F', 
    // Verde claro para éxito en modo oscuro
    
    warning: '#FFB871', 
    // Naranja claro para advertencias en modo oscuro
    
    // === ESTADOS DE PEDIDOS (ORDER STATUS) - MODO OSCURO ===
    // En modo oscuro, los backgrounds son MUCHO MÁS OSCUROS para no deslumbrar
    // Los textos son más CLAROS para mantener legibilidad
    
    orderStatus: {
      /**
       * PENDING - Pedido Pendiente (Modo Oscuro)
       */
      pending: {
        background: '#4A3000', 
        // Naranja muy oscuro (casi marrón)
        // Reduce brillo en modo nocturno
        
        text: '#FFB871', 
        // Naranja claro para contraste
        // 🔔 Visible sin deslumbrar
      },
      
      /**
       * PROCESSING - Pedido en Proceso (Modo Oscuro)
       */
      processing: {
        background: '#003B5C', 
        // Azul muy oscuro
        
        text: '#90CAF9', 
        // Azul claro para contraste
        // ⏳ Mantiene identidad visual del estado
      },
      
      /**
       * SHIPPED - Pedido Enviado (Modo Oscuro)
       */
      shipped: {
        background: '#4A1458', 
        // Púrpura muy oscuro
        
        text: '#CE93D8', 
        // Púrpura claro para contraste
        // 🚚 Diferenciable de otros estados
      },
      
      /**
       * COMPLETED - Pedido Completado (Modo Oscuro)
       */
      completed: {
        background: '#1B5E20', 
        // Verde muy oscuro
        
        text: '#A5D6A7', 
        // Verde claro para contraste
        // ✅ Claramente positivo pero sin brillar demasiado
      },
      
      /**
       * CANCELLED - Pedido Cancelado (Modo Oscuro)
       */
      cancelled: {
        background: '#5F1010', 
        // Rojo muy oscuro (casi negro rojizo)
        
        text: '#FFB4AB', 
        // Rojo claro para contraste
        // ❌ Claramente negativo sin ser agresivo
      },
    },
  },
};
