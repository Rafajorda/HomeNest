import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { UserManager } from '../components/UserManager';

const UsersDashboardScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.push('/dashboard')} />
        <Appbar.Content title="Gestión de Usuarios" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <UserManager />
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default UsersDashboardScreen;
