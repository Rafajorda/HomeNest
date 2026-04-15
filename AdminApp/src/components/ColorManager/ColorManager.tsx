import React, { useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Text, Button, TextInput, Card, IconButton, Portal, Dialog, useTheme } from 'react-native-paper';
import { Color, CreateColorDto } from '../../types/color';
import {
  useColorsQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} from '../../hooks/queries';
import { getStyles } from './ColorManager.styles';

export const ColorManager = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { data: colorList = [], isLoading: loadingColors } = useColorsQuery();
  const createMutation = useCreateColorMutation();
  const updateMutation = useUpdateColorMutation();
  const deleteMutation = useDeleteColorMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateColorDto>({ name: '', hexCode: '' });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<string | null>(null);

  const loading = loadingColors || 
    createMutation.isPending || 
    updateMutation.isPending || 
    deleteMutation.isPending;

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      const dataToSend: CreateColorDto = {
        name: formData.name,
        ...(formData.hexCode && { hexCode: formData.hexCode }),
      };
      
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: dataToSend });
      } else {
        await createMutation.mutateAsync(dataToSend);
      }
      setFormData({ name: '', hexCode: '' });
      setIsEditing(false);
      setEditingId(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al guardar el color');
    }
  };

  const handleEdit = (color: Color) => {
    setFormData({ name: color.name, hexCode: color.hexCode || '' });
    setIsEditing(true);
    setEditingId(color.id);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', hexCode: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    setColorToDelete(id);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!colorToDelete) return;

    try {
      await deleteMutation.mutateAsync(colorToDelete);
      setDeleteDialogVisible(false);
      setColorToDelete(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al eliminar el color');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>Colores</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <TextInput
          label="Nombre del color"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Código hexadecimal (opcional)"
          value={formData.hexCode}
          onChangeText={(text) => setFormData({ ...formData, hexCode: text })}
          mode="outlined"
          placeholder="#FF0000"
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
        data={colorList}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <View style={styles.colorRow}>
                  {item.hexCode && (
                    <View 
                      style={[styles.colorPreview, { backgroundColor: item.hexCode }]} 
                    />
                  )}
                  <Text variant="bodyMedium">{item.name}</Text>
                </View>
                {item.hexCode && (
                  <Text variant="bodySmall" style={styles.hexCode}>
                    {item.hexCode}
                  </Text>
                )}
              </View>
              <View style={styles.itemActions}>
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
          <Text style={styles.emptyText}>No hay colores</Text>
        }
      />

      {/* Dialog de confirmación */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar eliminación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de eliminar este color?</Text>
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
