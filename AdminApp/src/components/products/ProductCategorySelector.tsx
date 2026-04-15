/**
 * Componente ProductCategorySelector
 * 
 * Selector de categorías del producto
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, HelperText, Divider, useTheme } from 'react-native-paper';
import { Category } from '../../types/product';

interface ProductCategorySelectorProps {
  categories: Category[];
  selectedIds: string[];
  error?: string;
  onToggle: (id: string) => void;
}

export const ProductCategorySelector = ({
  categories,
  selectedIds,
  error,
  onToggle,
}: ProductCategorySelectorProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Categorías *
      </Text>

      <View style={styles.chipContainer}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedIds.includes(category.id)}
            onPress={() => onToggle(category.id)}
            style={[
              styles.chip,
              selectedIds.includes(category.id) && styles.chipSelected,
            ]}
            textStyle={selectedIds.includes(category.id) && styles.chipSelectedText}
            mode="outlined"
          >
            {category.name}
          </Chip>
        ))}
      </View>
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  divider: {
    marginVertical: 20,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
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
  chipSelected: {
    backgroundColor: theme.colors.primary,
  },
  chipSelectedText: {
    color: theme.colors.onPrimary,
  },
});
