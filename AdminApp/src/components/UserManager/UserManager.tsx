import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, IconButton, Portal, Dialog, Chip, Button, Searchbar, FAB, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { User, UserRole } from '../../types/user';
import { useUsersQuery, useDeleteUserMutation, useToggleUserStatusMutation } from '../../hooks/queries';
import { useAuthStore } from '../../stores/authStore';
import { getStyles } from './UserManager.styles';

export const UserManager = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useUsersQuery(currentPage, 20);
  const deleteUserMutation = useDeleteUserMutation();
  const toggleStatusMutation = useToggleUserStatusMutation();

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const filteredUsers = searchQuery.trim()
    ? users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query)
        );
      })
    : users;

  const handleEdit = (id: number) => {
    router.push(`/edit-user/${id}`);
  };

  const confirmDelete = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete);
      setDeleteDialogVisible(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const loading = isLoading || deleteUserMutation.isPending || toggleStatusMutation.isPending;

  return (
    <View style={styles.container}>
      {/* Buscador y contador */}
      <View style={styles.headerSection}>
        <Searchbar
          placeholder="Buscar por nombre, email..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Text style={styles.totalText}>Total: {total} usuarios</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isCurrentUser = currentUser?.id === item.id;
          
          return (
            <View style={styles.itemCard}>
              <View style={styles.leftSection}>
                <View style={styles.userInfo}>
                  <Text style={styles.username} numberOfLines={1}>
                    {item.username}{isCurrentUser && <Text style={styles.youBadge}> (Tú)</Text>}
                  </Text>
                  <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                </View>
                <Chip
                  compact
                  textStyle={styles.roleChipText}
                  style={[
                    styles.roleChip,
                    item.role === UserRole.ADMIN ? styles.adminChip : styles.userChip
                  ]}
                >
                  {item.role === UserRole.ADMIN ? 'Admin' : 'User'}
                </Chip>
                <View style={[
                  styles.statusBadge,
                  item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                ]} />
              </View>
              <View style={styles.actions}>
                <IconButton
                  icon={item.status === 'active' ? 'eye-off' : 'eye'}
                  size={18}
                  onPress={() => handleToggleStatus(item.id)}
                  iconColor={item.status === 'active' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  disabled={isCurrentUser}
                  style={styles.actionButton}
                />
                <IconButton
                  icon="pencil"
                  size={18}
                  onPress={() => handleEdit(item.id)}
                  style={styles.actionButton}
                />
              </View>
            </View>
          );
        }}
        refreshing={loading}
        onRefresh={() => refetch()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay usuarios</Text>
        }
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <IconButton
            icon="chevron-left"
            size={24}
            disabled={currentPage === 1 || loading}
            onPress={() => handlePageChange(currentPage - 1)}
          />
          <Text style={styles.pageText}>
            Página {currentPage} de {totalPages}
          </Text>
          <IconButton
            icon="chevron-right"
            size={24}
            disabled={currentPage === totalPages || loading}
            onPress={() => handlePageChange(currentPage + 1)}
          />
        </View>
      )}

      {/* FAB para crear nuevo usuario */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/create-user')}
      />

      {/* Dialog de confirmación */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar eliminación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de eliminar este usuario? Esta acción es irreversible.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleDelete}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};
