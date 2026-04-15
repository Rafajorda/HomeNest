/**
 * ========================================
 * COMPONENTE: OrderCard
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Tarjeta compacta para mostrar información resumida de un pedido
 * con capacidad de expandir para ver detalles de productos.
 * 
 * FUNCIONALIDADES:
 * - Muestra ID, usuario, fecha y total del pedido
 * - Chip de estado visual (pending, completed, cancelled)
 * - Lista de productos colapsable (expandible con botón chevron)
 * - Acciones rápidas: ver detalles, cambiar estado, eliminar
 * - Formato de fecha localizado en español
 * 
 * ESTADOS DEL PEDIDO:
 * - pending: Pedido pendiente de procesar
 * - completed: Pedido completado
 * - cancelled: Pedido cancelado
 * 
 * ACCIONES DISPONIBLES:
 * - Ver detalles: Navega a la pantalla de detalles completos
 * - Cambiar estado: Marca pedido como completado (solo si está pending)
 * - Eliminar: Elimina el pedido (con confirmación)
 * 
 * USO:
 * <OrderCard
 *   order={orderData}
 *   onViewDetails={(id) => router.push(`/order-details/${id}`)}
 *   onUpdateStatus={handleUpdateStatus}
 *   onDelete={handleDelete}
 * />
 */

// ===== IMPORTS DE REACT =====
import React, { useState } from 'react'; // Biblioteca principal de React
// ===== IMPORTS DE REACT NATIVE =====
import { View } from 'react-native'; // Componente de contenedor
// ===== IMPORTS DE REACT NATIVE PAPER =====
import { Card, Text, IconButton, Divider, useTheme } from 'react-native-paper'; // Componentes MD3
// ===== IMPORTS DE TIPOS =====
import { Order } from '../../../types/order'; // Interfaz TypeScript del pedido
// ===== IMPORTS DE COMPONENTES =====
import { OrderStatusChip } from '../OrderStatusChip'; // Chip de estado del pedido
// ===== IMPORTS DE ESTILOS =====
import { getStyles } from './OrderCard.styles'; // Estilos dinámicos basados en tema

/**
 * Props del componente OrderCard
 * 
 * @interface OrderCardProps
 * @property {Order} order - Objeto pedido con toda su información
 * @property {Function} [onViewDetails] - (Opcional) Callback para ver detalles completos
 * @property {Function} [onUpdateStatus] - (Opcional) Callback para cambiar estado del pedido
 * @property {Function} [onDelete] - (Opcional) Callback para eliminar pedido
 */
interface OrderCardProps {
  order: Order; // Pedido a mostrar
  onViewDetails?: (id: number) => void; // Handler opcional para ver detalles
  onUpdateStatus?: (id: number, status: string) => void; // Handler opcional para cambiar estado
  onDelete?: (id: number) => void; // Handler opcional para eliminar
}

/**
 * Componente principal OrderCard
 * 
 * Renderiza una tarjeta Material Design con la información del pedido
 * y opciones de expandir/colapsar la lista de productos.
 * 
 * @param {OrderCardProps} props - Propiedades del componente
 * @returns {JSX.Element} Card con información y acciones del pedido
 */
export const OrderCard = ({ order, onViewDetails, onUpdateStatus, onDelete }: OrderCardProps) => {
  // Estado para controlar si la lista de productos está expandida
  const [expanded, setExpanded] = useState(false);
  
  // Hook para obtener el tema actual (light/dark)
  const theme = useTheme();
  
  // Generar estilos dinámicos basados en el tema
  const styles = getStyles(theme);

  /**
   * UTILIDAD: Formatear fecha
   * 
   * Convierte una fecha (string o Date) a formato localizado español
   * con día, mes, año, hora y minutos.
   * 
   * @param {string | Date} dateString - Fecha a formatear
   * @returns {string} Fecha formateada (ej: "25/12/2024, 14:30")
   */
  const formatDate = (dateString: string | Date) => {
    // Convertir a Date si es string
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Formatear con toLocaleDateString
    return date.toLocaleDateString('es-ES', {
      day: '2-digit', // Día con 2 dígitos
      month: '2-digit', // Mes con 2 dígitos
      year: 'numeric', // Año completo
      hour: '2-digit', // Hora con 2 dígitos
      minute: '2-digit', // Minutos con 2 dígitos
    });
  };

  // ===== RENDER =====
  return (
    // Card principal con elevación y color de superficie
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        
        {/* ========================================
            SECCIÓN: HEADER DEL PEDIDO
            Muestra ID, usuario, fecha, total y estado
            ======================================== */}
        <View style={styles.header}>
          {/* INFORMACIÓN PRINCIPAL */}
          {/* ID del pedido, email del usuario y fecha de creación */}
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.orderId}>
              Pedido #{order.id} {/* ID del pedido con formato #123 */}
            </Text>
            {/* EMAIL DEL USUARIO */}
            {/* Solo se muestra si existe el usuario */}
            {order.user && (
              <Text variant="bodySmall" style={styles.email}>
                {order.user.email} {/* Email del usuario que hizo el pedido */}
              </Text>
            )}
            {/* FECHA DE CREACIÓN */}
            {/* Formateada en español con día/mes/año y hora */}
            <Text variant="bodySmall" style={styles.date}>
              {formatDate(order.createdAt)} {/* Fecha formateada */}
            </Text>
          </View>
          
          {/* TOTAL Y ESTADO */}
          {/* Precio total del pedido y chip de estado */}
          <View style={styles.headerRight}>
            <Text variant="titleLarge" style={styles.total}>
              €{order.total.toFixed(2)} {/* Total con 2 decimales */}
            </Text>
            {/* CHIP DE ESTADO */}
            {/* Muestra "Pending", "Completed" o "Cancelled" con colores */}
            <OrderStatusChip status={order.status} />
          </View>
        </View>

        {/* ========================================
            SECCIÓN: PRODUCTOS DEL PEDIDO
            Lista colapsable/expandible de productos
            ======================================== */}
        {/* Solo se renderiza si hay productos en el pedido */}
        {order.orderLines && order.orderLines.length > 0 && (
          <>
            {/* DIVIDER */}
            {/* Línea separadora entre header y productos */}
            <Divider style={styles.divider} />
            
            {/* CONTENEDOR DE PRODUCTOS */}
            <View style={styles.productsSection}>
              {/* TÍTULO DE SECCIÓN */}
              {/* "Productos (3)" */}
              <Text variant="bodyMedium" style={styles.productsTitle}>
                Productos ({order.orderLines.length})
              </Text>
              
              {/* LISTA EXPANDIDA O PREVIEW */}
              {/* Si expanded=true, muestra lista completa */}
              {expanded ? (
                // LISTA COMPLETA DE PRODUCTOS
                <View style={styles.productsList}>
                  {order.orderLines.map((line) => (
                    <View key={line.id} style={styles.productItem}>
                      {/* NOMBRE DEL PRODUCTO */}
                      <Text variant="bodySmall" style={styles.productName}>
                        {line.product.name}
                      </Text>
                      {/* CANTIDAD Y PRECIO */}
                      {/* Formato: "x2 • €19.99" */}
                      <Text variant="bodySmall" style={styles.productQuantity}>
                        x{line.quantity} • €{line.price.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                // PREVIEW COLAPSADO
                // Muestra solo los primeros 2 productos + contador si hay más
                <Text variant="bodySmall" style={styles.productsPreview}>
                  {order.orderLines.slice(0, 2).map(line => line.product.name).join(', ')}
                  {order.orderLines.length > 2 && ` +${order.orderLines.length - 2} más`}
                </Text>
              )}
              
              {/* BOTÓN EXPANDIR/COLAPSAR */}
              {/* Chevron arriba/abajo */}
              <IconButton
                icon={expanded ? 'chevron-up' : 'chevron-down'} // Cambiar icono según estado
                size={20} // Tamaño compacto
                onPress={() => setExpanded(!expanded)} // Toggle del estado
                style={styles.expandButton}
              />
            </View>
          </>
        )}

        {/* ========================================
            SECCIÓN: ACCIONES
            Botones para ver detalles, cambiar estado y eliminar
            ======================================== */}
        <View style={styles.actions}>
          {/* BOTÓN VER DETALLES */}
          {/* Solo se renderiza si se pasó la prop onViewDetails */}
          {onViewDetails && (
            <IconButton
              icon="eye" // Icono de ojo
              size={18} // Tamaño compacto
              onPress={() => onViewDetails(order.id)} // Llamar callback con ID
              iconColor={theme.colors.primary} // Color primario del tema
            />
          )}
          
          {/* BOTÓN COMPLETAR PEDIDO */}
          {/* Solo se renderiza si se pasó onUpdateStatus Y el pedido está pending */}
          {onUpdateStatus && order.status === 'pending' && (
            <IconButton
              icon="check-circle" // Icono de check circular
              size={18} // Tamaño compacto
              onPress={() => onUpdateStatus(order.id, 'completed')} // Cambiar a completed
              iconColor="#4CAF50" // Verde para completar
            />
          )}
          
          {/* BOTÓN ELIMINAR */}
          {/* Solo se renderiza si se pasó la prop onDelete */}
          {onDelete && (
            <IconButton
              icon="delete" // Icono de papelera
              size={18} // Tamaño compacto
              iconColor={theme.colors.error} // Color rojo del tema
              onPress={() => onDelete(order.id)} // Llamar callback con ID
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
};
