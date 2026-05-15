import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  surface: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    maxHeight: '92%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  scrollContentTablet: {
    paddingBottom: 4,
    justifyContent: 'flex-start',
  },
  previewBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 280,
    justifyContent: 'center',
  },
  selectorBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
  },
});
