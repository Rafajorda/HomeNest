import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => StyleSheet.create({
  header: {
    padding: 16,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
    elevation: 2,
  },
  count: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
  },
});
