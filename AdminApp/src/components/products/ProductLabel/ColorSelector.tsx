/**
 * ColorSelector
 * 
 * Selector de colores para marcar en la etiqueta
 */

import React from 'react';
import { View } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { Color } from '../../../types/color';
import { styles } from './ColorSelector.styles';

interface ColorSelectorProps {
  colors: Color[];
  selectedColors: string[];
  onToggleColor: (colorName: string) => void;
}

export const ColorSelector = ({ colors, selectedColors, onToggleColor }: ColorSelectorProps) => {
  if (!colors || colors.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.title}>
        Selecciona colores a marcar:
      </Text>
      <View style={styles.colorList}>
        {colors.map((color) => (
          <View key={color.id} style={styles.colorItem}>
            <Checkbox
              status={selectedColors.includes(color.name) ? 'checked' : 'unchecked'}
              onPress={() => onToggleColor(color.name)}
            />
            <Text>{color.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
