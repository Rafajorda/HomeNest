/**
 * Componente ProductColorSelector
 * 
 * Selector de colores del producto
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, HelperText, Divider, useTheme } from 'react-native-paper';
import { Color } from '../../types/product';

interface ProductColorSelectorProps {
  colors: Color[];
  selectedIds: string[];
  error?: string;
  onToggle: (id: string) => void;
}

export const ProductColorSelector = ({
  colors: colorsList,
  selectedIds,
  error,
  onToggle,
}: ProductColorSelectorProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Colores *
      </Text>

      <View style={styles.chipContainer}>
        {colorsList.map((color) => (
          <Chip
            key={color.id}
            selected={selectedIds.includes(color.id)}
            onPress={() => onToggle(color.id)}
            style={[
              styles.chip,
              selectedIds.includes(color.id) && styles.chipSelected,
            ]}
            textStyle={selectedIds.includes(color.id) && styles.chipSelectedText}
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
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.outline,
  },
});
