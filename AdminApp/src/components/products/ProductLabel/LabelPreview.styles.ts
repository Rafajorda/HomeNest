import { StyleSheet } from 'react-native';

export const getStyles = (theme: any, labelWidth: number, qrSize: number) => StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  label: {
    width: labelWidth,
    minHeight: Math.round(labelWidth * 0.5),
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  qrSection: {
    width: qrSize + 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    minHeight: qrSize + 28,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: labelWidth > 540 ? 22 : labelWidth > 400 ? 20 : 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: labelWidth > 540 ? 40 : labelWidth > 400 ? 36 : 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 8,
  },
  productDescription: {
    fontSize: labelWidth > 540 ? 12 : labelWidth > 400 ? 11 : 10,
    color: '#444',
    lineHeight: labelWidth > 540 ? 18 : labelWidth > 400 ? 16 : 14,
    marginBottom: 6,
  },
  productDetails: {
    fontSize: labelWidth > 540 ? 12 : labelWidth > 400 ? 11 : 10,
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
