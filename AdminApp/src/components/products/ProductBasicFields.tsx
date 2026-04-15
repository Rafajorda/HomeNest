/**
 * Componente ProductBasicFields
 * 
 * Campos básicos del producto (nombre, descripción, material, precio)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText, Text, useTheme } from 'react-native-paper';
import { CreateProductInput } from '../../types/product';

interface ProductBasicFieldsProps {
  formData: CreateProductInput;
  fieldErrors: Record<string, string>;
  onFieldChange: <K extends keyof CreateProductInput>(field: K, value: CreateProductInput[K]) => void;
}

export const ProductBasicFields = ({
  formData,
  fieldErrors,
  onFieldChange,
}: ProductBasicFieldsProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Información Básica
      </Text>

      <TextInput
        label="Nombre del producto *"
        value={formData.name}
        onChangeText={(text) => onFieldChange('name', text)}
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
        onChangeText={(text) => onFieldChange('description', text)}
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
        onChangeText={(text) => onFieldChange('material', text)}
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
          onFieldChange('price', price);
        }}
        mode="outlined"
        keyboardType="decimal-pad"
        error={!!fieldErrors.price}
        style={styles.input}
      />
      <HelperText type="error" visible={!!fieldErrors.price}>
        {fieldErrors.price}
      </HelperText>

      <TextInput
        label="Dimensiones"
        value={formData.dimensions || ''}
        onChangeText={(text) => onFieldChange('dimensions', text)}
        mode="outlined"
        placeholder="Ejemplo: 20x30x40 cm"
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Imagen del Producto
      </Text>

      <TextInput
        label="URL de la imagen"
        value={formData.imageUrl || ''}
        onChangeText={(text) => onFieldChange('imageUrl', text)}
        mode="outlined"
        placeholder="https://ejemplo.com/imagen.jpg"
        error={!!fieldErrors.imageUrl}
        style={styles.input}
      />
      <HelperText type="error" visible={!!fieldErrors.imageUrl}>
        {fieldErrors.imageUrl}
      </HelperText>

      <TextInput
        label="Descripción de la imagen"
        value={formData.imageAlt || ''}
        onChangeText={(text) => onFieldChange('imageAlt', text)}
        mode="outlined"
        placeholder="Descripción para accesibilidad"
        error={!!fieldErrors.imageAlt}
        style={styles.input}
      />
      <HelperText type="error" visible={!!fieldErrors.imageAlt}>
        {fieldErrors.imageAlt}
      </HelperText>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  input: {
    marginBottom: 4,
    backgroundColor: theme.colors.surface,
  },
});
