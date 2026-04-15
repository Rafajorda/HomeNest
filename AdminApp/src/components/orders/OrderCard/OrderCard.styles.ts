import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  orderId: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  date: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  total: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  productsSection: {
    marginBottom: 8,
  },
  productsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  productsList: {
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  productName: {
    flex: 1,
    color: theme.colors.onBackground,
  },
  productQuantity: {
    color: theme.colors.onSurfaceVariant,
    marginLeft: 8,
  },
  productsPreview: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  expandButton: {
    margin: 0,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
});
