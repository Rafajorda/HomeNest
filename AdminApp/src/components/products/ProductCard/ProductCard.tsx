/**
 * ========================================
 * COMPONENTE: ProductCard
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Tarjeta compacta para mostrar información resumida de un producto
 * en formato de lista con todas las acciones principales disponibles.
 * 
 * FUNCIONALIDADES:
 * - Muestra imagen, nombre, material y precio del producto
 * - Chip de estado visual (Activo/Inactivo) con colores adaptativos al tema
 * - Categorías asociadas (máximo 2 visibles + contador)
 * - Colores disponibles (máximo 3 puntos + contador)
 * - Acciones rápidas: editar, generar etiqueta QR, toggle status, eliminar
 * 
 * ACCIONES DISPONIBLES:
 * - Editar: Botón de lápiz para modificar el producto
 * - Generar etiqueta: Botón QR para crear etiqueta con código
 * - Toggle status: Botón ojo/ojo-cerrado para activar/desactivar
 * - Eliminar: Botón rojo de papelera para borrar
 * 
 * USO:
 * <ProductCard
 *   product={productData}
 *   onEdit={(id) => router.push(`/edit-product/${id}`)}
 *   onToggleStatus={handleToggleStatus}
 *   onDelete={handleDelete}
 *   onGenerateLabel={handleGenerateLabel}
 * />
 * 
 * TEMA:
 * Todos los colores se adaptan automáticamente al tema claro/oscuro
 * usando theme.colors y getStyles(theme).
 */

// ===== IMPORTS DE REACT Y REACT NATIVE =====
import React from 'react'; // Biblioteca principal de React
import { View, Image } from 'react-native'; // Componentes básicos de React Native
// ===== IMPORTS DE REACT NATIVE PAPER =====
import { Card, Text, Chip, IconButton, useTheme } from 'react-native-paper'; // Componentes Material Design 3
// ===== IMPORTS DE TIPOS =====
import { Product } from '../../../types/product'; // Interfaz TypeScript del producto
// ===== IMPORTS DE ESTILOS =====
import { getStyles } from './ProductCard.styles'; // Estilos dinámicos basados en tema

/**
 * Props del componente ProductCard
 * 
 * @interface ProductCardProps
 * @property {Product} product - Objeto producto con toda su información
 * @property {Function} onEdit - Callback cuando se presiona editar, recibe el ID del producto
 * @property {Function} onToggleStatus - Callback para activar/desactivar, recibe el ID
 * @property {Function} onDelete - Callback para eliminar, recibe ID y nombre del producto
 * @property {Function} [onGenerateLabel] - (Opcional) Callback para generar etiqueta QR
 */
interface ProductCardProps {
  product: Product; // Producto a mostrar
  onEdit: (id: string) => void; // Handler para editar
  onToggleStatus: (id: string) => void; // Handler para cambiar estado
  onDelete: (id: string, name: string) => void; // Handler para eliminar
  onGenerateLabel?: (product: Product) => void; // Handler opcional para generar etiqueta
}

/**
 * Componente principal ProductCard
 * 
 * Renderiza una tarjeta Material Design con la información del producto
 * y todas las acciones disponibles.
 * 
 * @param {ProductCardProps} props - Propiedades del componente
 * @returns {JSX.Element} Card con información y acciones del producto
 */
export const ProductCard = ({ product, onEdit, onToggleStatus, onDelete, onGenerateLabel }: ProductCardProps) => {
  // Obtener la primera imagen del producto (si existe)
  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
  
  // Hook para obtener el tema actual (light/dark)
  const theme = useTheme();
  
  // Generar estilos dinámicos basados en el tema
  const styles = getStyles(theme);

  // ===== RENDER =====
  return (
    // Card principal con elevación y color de superficie
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        
        {/* ========================================
            SECCIÓN: HEADER DEL PRODUCTO
            Muestra imagen, nombre, material, precio y estado
            ======================================== */}
        <View style={styles.header}>
          {/* IMAGEN DEL PRODUCTO */}
          {/* Solo se renderiza si existe al menos una imagen */}
          {firstImage && (
            <Image
              source={{ uri: firstImage.src }} // URL de la primera imagen
              style={styles.productImage} // Tamaño 50x50 con border radius
              resizeMode="cover" // Rellenar el espacio manteniendo proporción
            />
          )}
          
          {/* INFORMACIÓN PRINCIPAL */}
          {/* Nombre del producto y material con precio */}
          <View style={styles.info}>
            <Text variant="titleSmall" style={styles.name}>
              {product.name} {/* Nombre del producto */}
            </Text>
            <Text variant="bodySmall" style={styles.material}>
              {product.material} • €{Number(product.price).toFixed(2)} {/* Material y precio formateado */}
            </Text>
          </View>
          
          {/* CHIP DE ESTADO */}
          {/* Muestra "Activo" (verde) o "Inactivo" (rojo) */}
          <View style={styles.headerRight}>
            <Chip
              mode="flat" // Modo plano sin bordes
              compact // Tamaño reducido para ahorrar espacio
              style={[
                styles.statusChip, // Estilos base del chip
                product.status === 'active' ? styles.activeChip : styles.inactiveChip, // Color según estado
              ]}
              textStyle={[
                styles.chipText, // Tamaño y peso de fuente
                product.status === 'active' 
                  ? { color: theme.dark ? '#FFFFFF' : '#2E7D32' } // Verde oscuro en light, blanco en dark
                  : { color: theme.dark ? '#FFFFFF' : '#C62828' } // Rojo oscuro en light, blanco en dark
              ]}
            >
              {product.status === 'active' ? 'Activo' : 'Inactivo'} {/* Texto del estado */}
            </Chip>
          </View>
        </View>

        {/* ========================================
            SECCIÓN: CATEGORÍAS Y COLORES
            Muestra categorías (máximo 2) y colores (máximo 3)
            ======================================== */}
        <View style={styles.metaRow}>
          {/* CATEGORÍAS */}
          {/* Solo se renderizan si el producto tiene categorías */}
          {product.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {/* Mostrar solo las primeras 2 categorías */}
              {product.categories.slice(0, 2).map((category) => (
                <Chip
                  key={category.id} // Key única para React
                  compact // Tamaño reducido
                  style={styles.categoryChip} // Fondo color primary
                  textStyle={styles.categoryText} // Texto blanco pequeño
                >
                  {category.name} {/* Nombre de la categoría */}
                </Chip>
              ))}
              {/* Si hay más de 2 categorías, mostrar contador */}
              {product.categories.length > 2 && (
                <Text style={styles.moreText}>+{product.categories.length - 2}</Text>
              )}
            </View>
          )}
          
          {/* COLORES DISPONIBLES */}
          {/* Solo se renderizan si el producto tiene colores */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.colorsContainer}>
              {/* Mostrar solo los primeros 3 colores como puntos circulares */}
              {product.colors.slice(0, 3).map((color) => color && color.id && (
                <View
                  key={color.id} // Key única para React
                  style={[styles.colorDot, { backgroundColor: color.hexCode || '#CCCCCC' }]} // Círculo con color hexadecimal
                />
              ))}
              {/* Si hay más de 3 colores, mostrar contador */}
              {product.colors.length > 3 && (
                <Text style={styles.moreText}>+{product.colors.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        {/* ========================================
            SECCIÓN: ACCIONES
            Botones para editar, generar etiqueta, toggle status y eliminar
            ======================================== */}
        <View style={styles.actions}>
          {/* BOTÓN EDITAR */}
          {/* Icono de lápiz para navegar a la pantalla de edición */}
          <IconButton
            icon="pencil" // Icono de lápiz (Material Design Icons)
            size={18} // Tamaño compacto
            onPress={() => onEdit(product.id)} // Llamar callback con ID del producto
          />
          
          {/* BOTÓN GENERAR ETIQUETA QR */}
          {/* Solo se renderiza si se pasó la prop onGenerateLabel */}
          {onGenerateLabel && (
            <IconButton
              icon="qrcode" // Icono de código QR
              size={18} // Tamaño compacto
              onPress={() => onGenerateLabel(product)} // Llamar callback con producto completo
              iconColor={theme.colors.primary} // Color primario del tema
            />
          )}
          
          {/* BOTÓN TOGGLE STATUS */}
          {/* Icono ojo/ojo-cerrado para activar/desactivar */}
          <IconButton
            icon={product.status === 'active' ? 'eye-off' : 'eye'} // Cambiar icono según estado
            size={18} // Tamaño compacto
            onPress={() => onToggleStatus(product.id)} // Llamar callback con ID
          />
          
          {/* BOTÓN ELIMINAR */}
          {/* Icono de papelera en color rojo */}
          <IconButton
            icon="delete" // Icono de papelera
            size={18} // Tamaño compacto
            iconColor={theme.colors.error} // Color rojo del tema
            onPress={() => onDelete(product.id, product.name)} // Llamar callback con ID y nombre
          />
        </View>
      </Card.Content>
    </Card>
  );
};
