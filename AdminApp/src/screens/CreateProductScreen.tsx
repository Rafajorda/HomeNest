/**
 * Pantalla de creación de productos
 * 
 * Formulario para crear nuevos productos con:
 * - Validación con Zod
 * - Selección de categorías y colores
 * - Upload de modelo 3D (opcional)
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  SegmentedButtons,
  Chip,
  ActivityIndicator,
  Text,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCreateProduct } from '../hooks/useCreateProduct';

export default function CreateProductScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    formData,
    categories,
    colors,
    isLoadingOptions,
    isSubmitting,
    error,
    fieldErrors,
    handleSubmit,
    handleCategoryToggle,
    handleColorToggle,
    updateField,
  } = useCreateProduct();

  if (isLoadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando opciones...</Text>
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
        {/* Información básica */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Información Básica
        </Text>

        <TextInput
          label="Nombre del producto *"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          mode="outlined"
          error={!!fieldErrors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.name}>
          {fieldErrors.name}
        </HelperText>

        <TextInput
          label="Descripción *"
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          error={!!fieldErrors.description}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.description}>
          {fieldErrors.description}
        </HelperText>

        <TextInput
          label="Material *"
          value={formData.material}
          onChangeText={(text) => updateField('material', text)}
          mode="outlined"
          error={!!fieldErrors.material}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.material}>
          {fieldErrors.material}
        </HelperText>

        <TextInput
          label="Precio *"
          value={formData.price ? formData.price.toString() : ''}
          onChangeText={(text) => {
            const price = parseFloat(text) || 0;
            updateField('price', price);
          }}
          mode="outlined"
          keyboardType="decimal-pad"
          error={!!fieldErrors.price}
          style={styles.input}
          left={<TextInput.Icon icon="currency-usd" />}
        />
        <HelperText type="error" visible={!!fieldErrors.price}>
          {fieldErrors.price}
        </HelperText>

        <TextInput
          label="Dimensiones (opcional)"
          value={formData.dimensions || ''}
          onChangeText={(text) => updateField('dimensions', text)}
          mode="outlined"
          style={styles.input}
          placeholder="Ej: 120x80x75 cm"
        />

        <Divider style={styles.divider} />

        {/* Categorías */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Categorías *
        </Text>

        <View style={styles.chipContainer}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={formData.categoryIds.includes(category.id)}
              onPress={() => handleCategoryToggle(category.id)}
              style={styles.chip}
              mode="outlined"
            >
              {category.name}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!fieldErrors.categoryIds}>
          {fieldErrors.categoryIds}
        </HelperText>

        <Divider style={styles.divider} />

        {/* Colores */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Colores *
        </Text>

        <View style={styles.chipContainer}>
          {colors.map((color) => (
            <Chip
              key={color.id}
              selected={formData.colorIds.includes(color.id)}
              onPress={() => handleColorToggle(color.id)}
              style={styles.chip}
              mode="outlined"
              avatar={
                color.hexCode ? (
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: color.hexCode },
                    ]}
                  />
                ) : undefined
              }
            >
              {color.name}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!fieldErrors.colorIds}>
          {fieldErrors.colorIds}
        </HelperText>

        <Divider style={styles.divider} />

        {/* Imagen del producto */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Imagen del Producto (opcional)
        </Text>

        <TextInput
          label="URL de la imagen"
          value={formData.imageUrl || ''}
          onChangeText={(text) => updateField('imageUrl', text)}
          mode="outlined"
          style={styles.input}
          placeholder="https://ejemplo.com/imagen.jpg"
          keyboardType="url"
          error={!!fieldErrors.imageUrl}
        />
        <HelperText type="error" visible={!!fieldErrors.imageUrl}>
          {fieldErrors.imageUrl}
        </HelperText>

        <TextInput
          label="Descripción de la imagen"
          value={formData.imageAlt || ''}
          onChangeText={(text) => updateField('imageAlt', text)}
          mode="outlined"
          style={styles.input}
          placeholder="Ej: Silla de madera vista frontal"
          error={!!fieldErrors.imageAlt}
        />
        <HelperText type="error" visible={!!fieldErrors.imageAlt}>
          {fieldErrors.imageAlt}
        </HelperText>

        {/* Error general */}
        {error && (
          <HelperText type="error" visible style={styles.errorText}>
            {error}
          </HelperText>
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
            Crear Producto
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
  },
  loadingText: {
    marginTop: 12,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 4,
  },
  divider: {
    marginVertical: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    marginBottom: 4,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
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
