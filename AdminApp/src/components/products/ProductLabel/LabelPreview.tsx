/**
 * LabelPreview
 * 
 * Vista previa de la etiqueta con QR y datos del producto
 */

import React, { forwardRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { Product } from '../../../types/product';
import { useTheme } from 'react-native-paper';
import { getStyles } from './LabelPreview.styles';

interface LabelPreviewProps {
  product: Product;
  selectedColors: string[];
  productUrl: string;
}

// Calcular tamaño del QR de forma consistente con los estilos
const { width: screenWidth } = Dimensions.get('window');
const labelWidth = Math.min(screenWidth * 0.9, 500);
const qrSize = Math.min(labelWidth * 0.26, 130);

export const LabelPreview = forwardRef<ViewShot, LabelPreviewProps>(
  ({ product, selectedColors, productUrl }, ref) => {
    const theme = useTheme();
    const styles = getStyles(theme);
    
    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.container}
      >
        <View style={styles.label} collapsable={false}>
          {/* Código QR (izquierda) */}
          <View style={styles.qrSection} collapsable={false}>
            <QRCode
              value={productUrl}
              size={qrSize}
              backgroundColor="white"
              color="#000000"
            />
          </View>

          {/* Información del producto (derecha) */}
          <View style={styles.infoSection}>
            {/* Nombre arriba */}
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>

            {/* Precio en grande en medio */}
            <Text style={styles.productPrice}>
              €{Number(product.price || 0).toFixed(2)}
            </Text>

            {/* Descripción */}
            {product.description && (
              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description}
              </Text>
            )}

            {/* Tamaño */}
            {product.dimensions && (
              <Text style={styles.productDetails}>
                Tamaño: {product.dimensions}
              </Text>
            )}

            {/* Colores con círculos */}
            {product.colors && product.colors.length > 0 && (
              <View style={styles.colorsSection}>
                <Text style={styles.colorsLabel}>Colores:</Text>
                <View style={styles.colorCircles}>
                  {product.colors.map((color) => (
                    <View key={color.id} style={styles.colorCircleItem}>
                      <View style={[
                        styles.colorCircle,
                        selectedColors.includes(color.name) && styles.colorCircleSelected
                      ]} />
                      <Text style={styles.colorName}>{color.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ViewShot>
    );
  }
);

LabelPreview.displayName = 'LabelPreview';
