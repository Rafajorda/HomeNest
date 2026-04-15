/**
 * Pantalla de Detalles de Pedido
 * 
 * Muestra información completa de un pedido:
 * - Información del cliente
 * - Estado del pedido
 * - Lista de productos
 * - Totales
 * - Acciones (cambiar estado, eliminar)
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Appbar,
  Divider,
  Portal,
  Dialog,
  useTheme,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { OrderStatusChip } from '../components/orders';
import { getOrderStatusText, ORDER_STATUSES } from '../utils/orderStatus';
import { 
  useOrderQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from '../hooks/queries';

export const OrderDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = parseInt(id || '0', 10);
  const theme = useTheme();
  const styles = getStyles(theme);

  const { data: order, isLoading } = useOrderQuery(orderId);
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);

  /**
   * Formatea fecha
   */
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Cambia estado del pedido
   */
  const handleChangeStatus = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      Alert.alert('Éxito', 'Estado actualizado correctamente');
      setStatusDialogVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  /**
   * Elimina el pedido
   */
  const handleDelete = async () => {
    try {
      await deleteOrderMutation.mutateAsync(orderId);
      Alert.alert('Éxito', 'Pedido eliminado correctamente');
      setDeleteDialogVisible(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el pedido');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium">Pedido no encontrado</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={`Pedido #${order.id}`} />
        <Appbar.Action 
          icon="delete" 
          onPress={() => setDeleteDialogVisible(true)}
          color={theme.colors.error}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Estado e información general */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View>
                <Text variant="titleLarge" style={styles.orderId}>
                  Pedido #{order.id}
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>
              <OrderStatusChip status={order.status} compact={false} />
            </View>

            <Divider style={styles.divider} />

            {/* Cliente */}
            {order.user && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Cliente
                </Text>
                <Text variant="bodyMedium">{order.user.email}</Text>
                {order.user.name && (
                  <Text variant="bodySmall" style={styles.secondaryText}>
                    {order.user.name}
                  </Text>
                )}
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Total */}
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Total
              </Text>
              <Text variant="headlineMedium" style={styles.total}>
                €{order.total.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Productos */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Productos ({order.orderLines?.length || 0})
            </Text>
            
            {order.orderLines && order.orderLines.length > 0 ? (
              order.orderLines.map((line, index) => (
                <View key={line.id}>
                  {index > 0 && <Divider style={styles.productDivider} />}
                  <View style={styles.productItem}>
                    {line.product.images && line.product.images.length > 0 && (
                      <Image
                        source={{ uri: line.product.images[0].src }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.productInfo}>
                      <Text variant="bodyMedium" style={styles.productName}>
                        {line.product.name}
                      </Text>
                      {line.product.description && (
                        <Text variant="bodySmall" style={styles.productDescription} numberOfLines={2}>
                          {line.product.description}
                        </Text>
                      )}
                      <View style={styles.productPricing}>
                        <Text variant="bodySmall">
                          Cantidad: {line.quantity}
                        </Text>
                        <Text variant="bodySmall">
                          Precio unitario: €{line.price.toFixed(2)}
                        </Text>
                        <Text variant="bodyMedium" style={styles.lineTotal}>
                          Subtotal: €{(line.quantity * line.price).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text variant="bodySmall" style={styles.emptyText}>
                No hay productos en este pedido
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Acciones */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Acciones
            </Text>
            
            <Button
              mode="contained"
              icon="pencil"
              onPress={() => setStatusDialogVisible(true)}
              style={styles.actionButton}
            >
              Cambiar Estado
            </Button>

            <Button
              mode="outlined"
              icon="delete"
              onPress={() => setDeleteDialogVisible(true)}
              textColor={theme.colors.error}
              style={[styles.actionButton, { borderColor: theme.colors.error }]}
            >
              Eliminar Pedido
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Diálogo de cambio de estado */}
      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Cambiar Estado</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Selecciona el nuevo estado para el pedido:
            </Text>
            {ORDER_STATUSES.map((status) => (
              <Button
                key={status}
                mode={order.status === status ? 'contained' : 'outlined'}
                onPress={() => handleChangeStatus(status)}
                style={styles.statusButton}
                disabled={order.status === status}
              >
                {getOrderStatusText(status)}
              </Button>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Eliminar Pedido</Dialog.Title>
          <Dialog.Content>
            <Text>
              ¿Estás seguro que deseas eliminar el Pedido #{order.id}?
              Esta acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button 
              onPress={handleDelete} 
              textColor={theme.colors.error}
              loading={deleteOrderMutation.isPending}
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  backButton: {
    marginTop: 16,
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  date: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.onSurfaceVariant,
  },
  secondaryText: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  total: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productDivider: {
    marginVertical: 12,
  },
  productItem: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  productPricing: {
    gap: 2,
  },
  lineTotal: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    padding: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  dialogText: {
    marginBottom: 16,
  },
  statusButton: {
    marginBottom: 8,
  },
  bottomPadding: {
    height: 32,
  },
});

export default OrderDetailsScreen;
