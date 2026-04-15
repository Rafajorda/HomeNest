/**
 * Componente AvatarPreview
 * 
 * Vista previa del avatar del usuario
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from '../../theme';

interface AvatarPreviewProps {
  avatarUrl?: string;
}

export const AvatarPreview = ({ avatarUrl }: AvatarPreviewProps) => {
  if (!avatarUrl) return null;

  return (
    <View style={styles.avatarContainer}>
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.light.primary,
  },
});
