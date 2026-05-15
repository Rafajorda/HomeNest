/**
 * usePrintLabel
 * 
 * Hook para manejar la lógica de impresión de etiquetas
 */

import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import ViewShot from 'react-native-view-shot';
import QRCode from 'qrcode';
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
      let qrImageUri: string;
      const productUrl = `myapp://product/${product.id}`;

      // En web, generar un QR embebido para evitar imágenes rotas al imprimir o guardar PDF
      // En mobile/tablet, capturar la vista
      if (Platform.OS === 'web') {
        qrImageUri = await QRCode.toDataURL(productUrl, {
          width: 130,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } else {
        // En mobile/tablet, capturar la vista y convertirla a data URL
        if (!viewShotRef.current) {
          Alert.alert('Error', 'No se pudo acceder a la vista');
          return;
        }

        const captured = await (viewShotRef.current as any).capture?.({
          result: 'base64',
          format: 'png',
          quality: 1,
        });
        
        if (!captured) {
          Alert.alert('Error', 'No se pudo generar la etiqueta');
          return;
        }
        
        qrImageUri = captured.startsWith('data:') ? captured : `data:image/png;base64,${captured}`;
      }

      // Generar HTML de colores
      const colorsHtml = product.colors && product.colors.length > 0
        ? product.colors.map(color => {
            const isSelected = selectedColors.includes(color.id);
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
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                min-height: 100vh;
              }
              
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
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
                page-break-inside: avoid;
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
                -webkit-user-select: none;
                user-select: none;
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="qr-section">
                <img src="${qrImageUri}" width="130" height="130" />
              </div>
              <div class="info-section">
                <div class="product-name">${product.name}</div>
                <div class="product-price">€${Number(product.price || 0).toFixed(2)}</div>
                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                ${product.dimensions ? `<div class="product-details">Tamaño: ${product.dimensions}</div>` : ''}
                ${colorsHtml ? `<div class="colors-section"><strong style="font-size: 11px; margin-right: 8px;">Colores:</strong>${colorsHtml}</div>` : ''}
              </div>
            </div>
          </body>
        </html>
      `;

      // Imprimir según la plataforma
      if (Platform.OS === 'web') {
        // En web: abrir ventana emergente con el HTML y llamar a window.print()
        if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
          const printWindow = (globalThis as any).window.open('', '_blank', 'width=600,height=400');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            
            // Esperar a que la imagen del QR cargue antes de imprimir
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                // Cerrar la ventana después de imprimir (opcional)
                // printWindow.close();
              }, 250);
            };
          } else {
            Alert.alert('Error', 'No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén permitidos.');
          }
        } else {
          // Fallback a expo-print si no hay acceso a window
          await Print.printAsync({
            html,
            width: 500,
            height: 250,
          });
        }
      } else {
        // En mobile/tablet: usar expo-print
        await Print.printAsync({
          html,
          width: 500,
          height: 250,
        });
      }

      console.log('[ProductLabel] Etiqueta enviada a imprimir');
    } catch (error) {
      console.error('[ProductLabel] Error printing:', error);
      Alert.alert('Error', 'No se pudo imprimir la etiqueta');
    }
  };

  return { handlePrint };
};
