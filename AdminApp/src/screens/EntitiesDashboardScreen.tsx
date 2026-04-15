import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SegmentedButtons, Appbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CategoryManager } from '../components/CategoryManager';
import { ColorManager } from '../components/ColorManager';

const EntitiesDashboardScreen = () => {
  const [selectedEntity, setSelectedEntity] = useState('categories');
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.push('/dashboard')} />
        <Appbar.Content title="Gestión de Entidades" />
      </Appbar.Header>

      <SegmentedButtons
        value={selectedEntity}
        onValueChange={setSelectedEntity}
        buttons={[
          { value: 'categories', label: 'Categorías' },
          { value: 'colors', label: 'Colores' },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.content}>
        {selectedEntity === 'categories' && <CategoryManager />}
        {selectedEntity === 'colors' && <ColorManager />}
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  segmentedButtons: {
    margin: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default EntitiesDashboardScreen;
