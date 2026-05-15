/**
 * Componente ProductLabel
 * 
 * Genera una etiqueta/pegatina imprimible del producto
 */

import React, { useRef, useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
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
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const theme = useTheme();
  const styles = getStyles(theme);

  // URL que apunta al producto
  const productUrl = `myapp://product/${product.id}`;

  // Hook para imprimir
  const { handlePrint } = usePrintLabel({ product, selectedColors, viewShotRef });

  // Toggle de selección de color
  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId)
        ? prev.filter(c => c !== colorId)
        : [...prev, colorId]
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
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet,
          ]}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.previewBlock}>
            {/* Vista previa de la etiqueta */}
            <LabelPreview
              ref={viewShotRef}
              product={product}
              selectedColors={selectedColors}
              productUrl={productUrl}
            />
          </View>

          {/* Selector de colores */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.selectorBlock}>
              <ColorSelector
                colors={product.colors}
                selectedColors={selectedColors}
                onToggleColor={toggleColor}
              />
            </View>
          )}
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