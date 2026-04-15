/**
 * ========================================
 * ESTILOS: ProductCard
 * ========================================
 * 
 * Define todos los estilos del componente ProductCard
 * con soporte completo para tema claro/oscuro.
 * 
 * ESTRUCTURA DE ESTILOS:
 * - card: Contenedor principal con elevación
 * - content: Padding interno del contenido
 * - header: Fila superior con imagen, info y estado
 * - productImage: Imagen 50x50 con border radius
 * - info: Contenedor de nombre y material/precio
 * - name: Texto del nombre del producto
 * - material: Texto de material y precio
 * - headerRight: Contenedor del chip de estado
 * - statusChip: Chip base para estado
 * - activeChip: Fondo verde para estado activo
 * - inactiveChip: Fondo rojo para estado inactivo
 * - chipText: Texto pequeño con peso bold
 * - metaRow: Fila de categorías y colores
 * - categoriesContainer: Contenedor de chips de categorías
 * - categoryChip: Chip con fondo primario
 * - categoryText: Texto blanco pequeño
 * - colorsContainer: Contenedor de puntos de colores
 * - colorDot: Círculo de 18x18 con borde
 * - moreText: Texto contador (+2, +3, etc.)
 * - actions: Fila de botones de acción
 */

import { StyleSheet } from 'react-native'; // Sistema de estilos de React Native

/**
 * Función generadora de estilos dinámicos
 * 
 * @param {any} theme - Objeto de tema de React Native Paper (light/dark)
 * @returns {Object} StyleSheet con todos los estilos del componente
 */
export const getStyles = (theme: any) => StyleSheet.create({
  // ===== CONTENEDOR PRINCIPAL =====
  card: {
    marginBottom: 8, // Separación entre tarjetas en lista
    backgroundColor: theme.colors.surface, // Color de superficie del tema
    elevation: 2, // Sombra en Android (profundidad)
  },
  
  // ===== CONTENIDO INTERNO =====
  content: {
    paddingVertical: 8, // Padding vertical reducido para compactar
    paddingHorizontal: 12, // Padding horizontal
  },
  
  // ===== HEADER: IMAGEN + INFO + ESTADO =====
  header: {
    flexDirection: 'row', // Disposición horizontal
    justifyContent: 'space-between', // Espacio entre elementos
    alignItems: 'flex-start', // Alinear arriba para que el chip esté al nivel del nombre
    marginBottom: 6, // Separación con la siguiente sección
  },
  
  // ===== IMAGEN DEL PRODUCTO =====
  productImage: {
    width: 50, // Ancho fijo
    height: 50, // Alto fijo (cuadrado)
    borderRadius: 8, // Esquinas redondeadas
    marginRight: 10, // Separación con el texto
    backgroundColor: theme.colors.background, // Fondo mientras carga la imagen
  },
  
  // ===== INFORMACIÓN TEXTUAL =====
  info: {
    flex: 1, // Ocupar espacio disponible entre imagen y chip
    marginRight: 8, // Separación con el chip de estado
  },
  
  // ===== NOMBRE DEL PRODUCTO =====
  name: {
    fontWeight: '600', // Peso semi-bold para destacar
    color: theme.colors.onBackground, // Color de texto sobre fondo
    fontSize: 14, // Tamaño mediano
  },
  
  // ===== MATERIAL Y PRECIO =====
  material: {
    color: theme.colors.onSurfaceVariant, // Color de texto secundario
    marginTop: 2, // Pequeña separación con el nombre
    fontSize: 12, // Tamaño pequeño
  },
  
  // ===== CONTENEDOR DEL CHIP DE ESTADO =====
  headerRight: {
    flexDirection: 'row', // Por si se añaden más elementos
    alignItems: 'center', // Centrar verticalmente
  },
  
  // ===== CHIP DE ESTADO BASE =====
  statusChip: {
    height: 24, // Altura compacta
    alignItems: 'center', // Centrar texto verticalmente
  },
  
  // ===== CHIP ACTIVO (VERDE) =====
  activeChip: {
    backgroundColor: theme.dark ? '#1B5E20' : '#E8F5E9', // Verde oscuro en dark mode, verde claro en light
  },
  
  // ===== CHIP INACTIVO (ROJO) =====
  inactiveChip: {
    backgroundColor: theme.dark ? '#B71C1C' : '#FFEBEE', // Rojo oscuro en dark mode, rojo claro en light
  },
  
  // ===== TEXTO DEL CHIP =====
  chipText: {
    fontSize: 10, // Texto muy pequeño
    color: theme.dark ? '#FFFFFF' : undefined, // Blanco en dark mode, dejar color por defecto en light
    fontWeight: '600', // Peso bold para legibilidad
    lineHeight: 14, // Altura de línea para centrar verticalmente
  },
  
  // ===== FILA DE CATEGORÍAS Y COLORES =====
  metaRow: {
    flexDirection: 'row', // Disposición horizontal
    justifyContent: 'space-between', // Categorías a la izquierda, colores a la derecha
    alignItems: 'center', // Centrar verticalmente
    marginBottom: 4, // Separación con acciones
    minHeight: 24, // Altura mínima para evitar saltos visuales
  },
  
  // ===== CONTENEDOR DE CATEGORÍAS =====
  categoriesContainer: {
    flexDirection: 'row', // Chips en fila
    flexWrap: 'wrap', // Permitir salto de línea si no caben
    gap: 4, // Separación entre chips
    flex: 1, // Ocupar espacio disponible
  },
  
  // ===== CHIP DE CATEGORÍA =====
  categoryChip: {
    height: 24, // Altura compacta
    backgroundColor: theme.colors.primary, // Fondo con color primario
    justifyContent: 'center', // Centrar texto verticalmente
  },
  
  // ===== TEXTO DE CATEGORÍA =====
  categoryText: {
    fontSize: 10, // Texto muy pequeño
    color: theme.colors.surface, // Texto blanco (sobre fondo primario)
    lineHeight: 12, // Altura de línea ajustada
  },
  
  // ===== CONTENEDOR DE PUNTOS DE COLORES =====
  colorsContainer: {
    flexDirection: 'row', // Puntos en fila
    gap: 6, // Separación entre puntos
    alignItems: 'center', // Centrar verticalmente
  },
  
  // ===== PUNTO DE COLOR =====
  colorDot: {
    width: 18, // Ancho del círculo
    height: 18, // Alto del círculo
    borderRadius: 9, // Radio para hacerlo circular (mitad del ancho)
    borderWidth: 1.5, // Borde para resaltar
    borderColor: theme.colors.primary, // Borde con color primario
    elevation: 1, // Sombra sutil en Android
  },
  
  // ===== TEXTO CONTADOR (+2, +3, etc.) =====
  moreText: {
    fontSize: 10, // Texto muy pequeño
    color: theme.colors.onSurfaceVariant, // Color de texto secundario
    marginLeft: 4, // Separación con el último elemento
  },
  
  // ===== FILA DE BOTONES DE ACCIÓN =====
  actions: {
    flexDirection: 'row', // Botones en fila
    justifyContent: 'flex-end', // Alinear a la derecha
    marginTop: 4, // Separación con la fila de meta
    marginRight: -8, // Compensar padding de IconButton para alinear al borde
  },
});
