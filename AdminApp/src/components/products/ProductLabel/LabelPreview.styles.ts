import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
// Calcular ancho de la etiqueta: 90% del ancho de pantalla, máximo 500px
const labelWidth = Math.min(screenWidth * 0.9, 500);
// Altura proporcional: mantener aspecto 2:1 (ancho:alto)
const labelHeight = labelWidth / 2;
// QR size: ~30% del ancho de la etiqueta
const qrSize = Math.min(labelWidth * 0.26, 130);

export const getStyles = (theme: any) => StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  label: {
    width: labelWidth,
    height: labelHeight,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  qrSection: {
    width: qrSize + 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: labelWidth > 400 ? 20 : 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: labelWidth > 400 ? 36 : 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 8,
  },
  productDescription: {
    fontSize: labelWidth > 400 ? 11 : 10,
    color: '#444',
    lineHeight: labelWidth > 400 ? 16 : 14,
    marginBottom: 6,
  },
  productDetails: {
    fontSize: labelWidth > 400 ? 11 : 10,
    color: '#666',
    marginBottom: 4,
  },
  colorsSection: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  colorsLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8,
  },
  colorCircles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  colorCircleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 4,
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    marginRight: 4,
  },
  colorCircleSelected: {
    backgroundColor: '#333',
  },
  colorName: {
    fontSize: 11,
    color: '#333',
  },
});
