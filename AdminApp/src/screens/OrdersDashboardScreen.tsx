/**
 * Pantalla de Dashboard de Pedidos
 * 
 * Gestión completa de pedidos:
 * - Lista de pedidos con detalles
 * - Filtrar por estado
 * - Cambiar estado de pedidos
 * - Eliminar pedidos
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Text,
  Portal,
  Dialog,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { getOrderStatusText } from '../utils/orderStatus';
import { 
  useOrdersQuery, 
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
} from '../hooks/queries';
import { Order } from '../types/order';
import { OrderCard } from '../components/orders';

export const OrdersDashboardScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  
  // React Query hooks
  const { data: orders = [], isLoading, refetch, isRefetching } = useOrdersQuery();
  const deleteOrderMutation = useDeleteOrderMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: number; text: string } | null>(null);

  /**
   * Refresca la lista cuando la pantalla obtiene el foco
   */
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  /**
   * Pedidos filtrados por estado
   */
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  /**
   * Navega a los detalles del pedido
   */
  const handleViewDetails = (id: number) => {
    router.push(`/order-details/${id}`);
  };

  /**
   * Actualiza el estado del pedido
   */
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      Alert.alert('Éxito', 'Estado del pedido actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
  };

  /**
   * Confirma eliminación de pedido
   */
  const handleDeleteOrder = (id: number) => {
    setOrderToDelete({ id, text: `Pedido #${id}` });
    setDeleteDialogVisible(true);
  };

  /**
   * Confirma y ejecuta eliminación
   */
  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrderMutation.mutateAsync(orderToDelete.id);
      Alert.alert('Éxito', 'Pedido eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el pedido');
    } finally {
      setDeleteDialogVisible(false);
      setOrderToDelete(null);
    }
  };

  /**
   * Renderiza cada pedido en la lista
   */
  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onViewDetails={handleViewDetails}
      onUpdateStatus={handleUpdateStatus}
      onDelete={handleDeleteOrder}
    />
  );

  /**
   * Footer de la lista con indicador de carga
   */
  const renderFooter = () => {
    if (!isRefetching || orders.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  /**
   * Placeholder cuando no hay pedidos
   */
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No hay pedidos
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {statusFilter !== 'all'
            ? `No hay pedidos con estado: ${getOrderStatusText(statusFilter)}`
            : 'Aún no se han realizado pedidos'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Pedidos" />
      </Appbar.Header>

      {/* Filtros de estado */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'completed', label: 'Completados' },
            { value: 'cancelled', label: 'Cancelados' },
          ]}
          style={styles.segmentedButtons}
        />
        <Text variant="bodySmall" style={styles.countText}>
          {filteredOrders.length} pedido(s)
        </Text>
      </View>

      {/* Lista de pedidos */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Eliminar Pedido</Dialog.Title>
          <Dialog.Content>
            <Text>
              ¿Estás seguro que deseas eliminar {orderToDelete?.text}?
              Esta acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
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
  filterContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  countText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    paddingBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    color: theme.colors.onBackground,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
});
