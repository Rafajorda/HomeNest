import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontWeight: '600',
    color: theme.colors.onBackground,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minHeight: 56,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  icon: {
    margin: 0,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  currentFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 4,
  },
  checkIcon: {
    margin: 0,
  },
  currentFileText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
  },
});
