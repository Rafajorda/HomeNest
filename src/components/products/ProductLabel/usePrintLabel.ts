/**
 * usePrintLabel
 * 
 * Hook para manejar la lógica de impresión de etiquetas
 */

import { Alert } from 'react-native';
import * as Print from 'expo-print';
import ViewShot from 'react-native-view-shot';
import { Product } from '../../../types/product';
import { colors } from '../../../theme';

interface UsePrintLabelProps {
  product: Product;
  selectedColors: string[];
  viewShotRef: React.RefObject<ViewShot | null>;
}

export const usePrintLabel = ({ product, selectedColors, viewShotRef }: UsePrintLabelProps) => {
  const handlePrint = async () => {
    try {
      if (!viewShotRef.current) return;

      // Capturar la vista como imagen
      const uri = await viewShotRef.current.capture?.();
      
      if (!uri) {
        Alert.alert('Error', 'No se pudo generar la etiqueta');
        return;
      }

      // Generar HTML de colores
      const colorsHtml = product.colors && product.colors.length > 0
        ? product.colors.map(color => {
            const isSelected = selectedColors.includes(color.name);
            return `
              <div style="display: inline-flex; align-items: center; margin-right: 10px;">
                <div style="width: 16px; height: 16px; border: 2px solid #333; border-radius: 50%; margin-right: 4px; ${isSelected ? 'background: #333;' : ''}"></div>
                <span style="font-size: 11px;">${color.name}</span>
              </div>
            `;
          }).join('')
        : '';

      // Crear HTML para imprimir
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
              }
              .label {
                width: 500px;
                height: 250px;
                border: 2px solid ${colors.light.primary};
                border-radius: 8px;
                padding: 15px;
                background: white;
                display: flex;
                flex-direction: row;
              }
              .qr-section {
                width: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
              }
              .info-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .product-name {
                font-size: 20px;
                font-weight: bold;
                color: #000;
                margin-bottom: 10px;
              }
              .product-price {
                font-size: 36px;
                font-weight: bold;
                color: ${colors.light.primary};
                text-align: center;
                margin: 10px 0;
              }
              .product-description {
                font-size: 11px;
                color: #444;
                line-height: 1.4;
                margin-bottom: 8px;
              }
              .product-details {
                font-size: 11px;
                color: #666;
                margin-bottom: 5px;
              }
              .colors-section {
                margin-top: 8px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
              }
              img {
                display: block;
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="qr-section">
                <img src="${uri}" width="130" height="130" />
              </div>
              <div class="info-section">
                <div class="product-name">${product.name}</div>
                <div class="product-price">€${product.price.toFixed(2)}</div>
                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                ${product.dimensions ? `<div class="product-details">Tamaño: ${product.dimensions}</div>` : ''}
                ${colorsHtml ? `<div class="colors-section"><strong style="font-size: 11px; margin-right: 8px;">Colores:</strong>${colorsHtml}</div>` : ''}
              </div>
            </div>
          </body>
        </html>
      `;

      // Imprimir
      await Print.printAsync({
        html,
        width: 500,
        height: 250,
      });

      console.log('[ProductLabel] Etiqueta enviada a imprimir');
    } catch (error) {
      console.error('[ProductLabel] Error printing:', error);
      Alert.alert('Error', 'No se pudo imprimir la etiqueta');
    }
  };

  return { handlePrint };
};
