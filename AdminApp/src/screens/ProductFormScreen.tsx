/**
 * Formulario de producto (crear/editar)
 * 
 * Componente reutilizable para crear o editar productos
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Button,
  ActivityIndicator,
  Text,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useProductForm } from '../hooks/useProductForm';
import { useUploadModel3DMutation, useDeleteModel3DMutation } from '../hooks/queries';
import {
  ProductBasicFields,
  ProductCategorySelector,
  ProductColorSelector,
} from '../components/products';
import { FileUpload3D } from '../components/common';

interface ProductFormScreenProps {
  productId?: string;
}

export default function ProductFormScreen({ productId }: ProductFormScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    formData,
    categories,
    colors: colorsList,
    isLoadingOptions,
    isLoadingProduct,
    isSubmitting,
    fieldErrors,
    error,
    isEditMode,
    product,
    updateField,
    handleCategoryToggle,
    handleColorToggle,
    handleSubmit: submitForm,
  } = useProductForm({ productId });

  const uploadModel3DMutation = useUploadModel3DMutation();
  const deleteModel3DMutation = useDeleteModel3DMutation();
  
  const [selectedModel3DFile, setSelectedModel3DFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  } | null>(null);

  const handleSubmit = async () => {
    // Primero guardar el producto
    await submitForm();
    
    // Si hay un modelo 3D seleccionado y estamos en modo edición, subirlo
    if (selectedModel3DFile && productId) {
      try {
        await uploadModel3DMutation.mutateAsync({
          productId,
          file: selectedModel3DFile,
        });
        Alert.alert('Éxito', 'Producto y modelo 3D guardados correctamente');
      } catch (error) {
        Alert.alert('Advertencia', 'Producto guardado pero el modelo 3D no pudo subirse');
      }
    }
  };

  const handleDeleteModel3D = async () => {
    if (!productId) return;
    
    Alert.alert(
      'Eliminar modelo 3D',
      '¿Estás seguro de que quieres eliminar el modelo 3D?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteModel3DMutation.mutateAsync(productId);
              setSelectedModel3DFile(null);
              Alert.alert('Éxito', 'Modelo 3D eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el modelo 3D');
            }
          },
        },
      ]
    );
  };

  const isLoading = isLoadingOptions || isLoadingProduct;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Cargando producto...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ProductBasicFields
          formData={formData}
          fieldErrors={fieldErrors}
          onFieldChange={updateField}
        />

        <ProductCategorySelector
          categories={categories}
          selectedIds={formData.categoryIds}
          error={fieldErrors.categoryIds}
          onToggle={handleCategoryToggle}
        />

        <ProductColorSelector
          colors={colorsList}
          selectedIds={formData.colorIds}
          error={fieldErrors.colorIds}
          onToggle={handleColorToggle}
        />

        {/* Subir modelo 3D (solo en modo edición) */}
        {isEditMode && productId && (
          <FileUpload3D
            onFileSelected={setSelectedModel3DFile}
            onDelete={handleDeleteModel3D}
            currentModelUrl={product?.model3DPath}
            isUploading={uploadModel3DMutation.isPending}
            isDeleting={deleteModel3DMutation.isPending}
          />
        )}

        {/* Mensaje de error general */}
        {error && (
          <Text variant="bodyMedium" style={styles.errorText}>
            {error}
          </Text>
        )}

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => router.push('/products')}
            disabled={isSubmitting}
            style={styles.button}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          >
            {isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    color: theme.colors.error,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
