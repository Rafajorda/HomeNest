import React, { useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Text, Button, TextInput, Card, IconButton, Portal, Dialog, useTheme } from 'react-native-paper';
import { Category, CreateCategoryDto } from '../../types/category';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
} from '../../hooks/queries';
import { getStyles } from './CategoryManager.styles';

export const CategoryManager = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const toggleStatusMutation = useToggleCategoryStatusMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({ name: '' });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const loading = loadingCategories || 
    createMutation.isPending || 
    updateMutation.isPending || 
    deleteMutation.isPending || 
    toggleStatusMutation.isPending;

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormData({ name: '' });
      setIsEditing(false);
      setEditingId(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al guardar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name });
    setIsEditing(true);
    setEditingId(category.id);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteMutation.mutateAsync(categoryToDelete);
      setDeleteDialogVisible(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al eliminar la categoría');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cambiar el estado');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>Categorías</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <TextInput
          label="Nombre de categoría"
          value={formData.name}
          onChangeText={(text) => setFormData({ name: text })}
          mode="outlined"
          style={styles.input}
        />
        <View style={styles.buttonRow}>
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            disabled={loading || !formData.name.trim()}
            style={styles.submitButton}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
          {isEditing && (
            <Button 
              mode="outlined" 
              onPress={handleCancelEdit}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
          )}
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <Text variant="bodyMedium">{item.name}</Text>
                <View style={styles.statusRow}>
                  <Text variant="bodySmall" style={[
                    styles.itemStatus,
                    item.status === 'active' ? styles.activeStatus : styles.inactiveStatus
                  ]}>
                    {item.status === 'active' ? '✓ Activo' : '✕ Inactivo'}
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <IconButton
                  icon={item.status === 'active' ? 'eye-off' : 'eye'}
                  size={18}
                  onPress={() => handleToggleStatus(item.id)}
                  style={styles.iconButton}
                  iconColor={item.status === 'active' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <IconButton
                  icon="pencil"
                  size={18}
                  onPress={() => handleEdit(item)}
                  style={styles.iconButton}
                />
                <IconButton
                  icon="delete"
                  size={18}
                  onPress={() => confirmDelete(item.id)}
                  style={styles.iconButton}
                />
              </View>
            </View>
          </View>
        )}
        refreshing={loading}
        onRefresh={() => {}}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay categorías</Text>
        }
      />

      {/* Dialog de confirmación */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar eliminación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de eliminar esta categoría?</Text>
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
