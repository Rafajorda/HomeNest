/**
 * Pantalla de Configuración
 *
 * Permite al usuario personalizar:
 * - Tema de la aplicación (claro/oscuro)
 * - Otras configuraciones futuras
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Appbar,
  List,
  Switch,
  Text,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../stores/themeStore';

export const SettingsScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();

  const isDarkMode = themeMode === 'dark';

  /**
   * Maneja el cambio de tema
   */
  const handleThemeToggle = async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Configuración" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Sección de Apariencia */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Apariencia
          </Text>
          
          <List.Item
            title="Tema Oscuro"
            description={isDarkMode ? 'Desactivar para usar tema claro' : 'Activar para reducir el brillo de la pantalla'}
            left={(props) => (
              <List.Icon
                {...props}
                icon={isDarkMode ? 'weather-night' : 'weather-sunny'}
                color={theme.colors.primary}
              />
            )}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Información de la App */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Información
          </Text>

          <List.Item
            title="Versión"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />

          <List.Item
            title="Admin Panel"
            description="Sistema de gestión de productos y pedidos"
            left={(props) => <List.Icon {...props} icon="application" />}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  bottomPadding: {
    height: 32,
  },
});

export default SettingsScreen;
