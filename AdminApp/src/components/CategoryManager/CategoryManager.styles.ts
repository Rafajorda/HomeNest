import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    flex: 1,
    marginHorizontal: 3,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  statusRow: {
    marginTop: 2,
  },
  itemStatus: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },
  activeStatus: {
    color: '#4caf50',
  },
  inactiveStatus: {
    color: '#f44336',
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconButton: {
    margin: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: theme.colors.onSurfaceVariant,
  },
});
