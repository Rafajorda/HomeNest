/**
 * Componente ProductLabel
 * 
 * Genera una etiqueta/pegatina imprimible del producto
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { Product } from '../../../types/product';
import { getStyles } from './ProductLabel.styles';
import { ColorSelector } from './ColorSelector';
import { LabelPreview } from './LabelPreview';
import { usePrintLabel } from './usePrintLabel';

interface ProductLabelProps {
  product: Product;
  onClose: () => void;
}

export const ProductLabel = ({ product, onClose }: ProductLabelProps) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const theme = useTheme();
  const styles = getStyles(theme);

  // URL que apunta al producto
  const productUrl = `myapp://product/${product.id}`;

  // Hook para imprimir
  const { handlePrint } = usePrintLabel({ product, selectedColors });

  // Toggle de selección de color
  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text variant="titleLarge" style={styles.title}>
          Vista previa de etiqueta
        </Text>
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Selector de colores */}
          {product.colors && product.colors.length > 0 && (
            <ColorSelector
              colors={product.colors}
              selectedColors={selectedColors}
              onToggleColor={toggleColor}
            />
          )}

          {/* Vista previa de la etiqueta */}
          <LabelPreview
            product={product}
            selectedColors={selectedColors}
            productUrl={productUrl}
          />
        </ScrollView>

        {/* Acciones */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.button}
          >
            Cancelar
          </Button>
          
          <Button
            mode="contained"
            onPress={handlePrint}
            style={styles.button}
            icon="printer"
          >
            Imprimir
          </Button>
        </View>
      </Surface>
    </View>
  );
};