/**
 * Componente UserFormFields
 * 
 * Campos básicos del formulario de usuario
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { colors } from '../../theme';
import { CreateUserDto, UpdateUserDto } from '../../types/user';

interface UserFormFieldsProps {
  formData: CreateUserDto | UpdateUserDto;
  errors: Record<string, string>;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export const UserFormFields = ({
  formData,
  errors,
  isEditing,
  onFieldChange,
}: UserFormFieldsProps) => {
  return (
    <View>
      <TextInput
        label="Nombre de usuario *"
        value={formData.username}
        onChangeText={(text) => onFieldChange('username', text)}
        mode="outlined"
        style={styles.input}
        error={!!errors.username}
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username}</Text>
      )}

      <TextInput
        label="Email *"
        value={formData.email}
        onChangeText={(text) => onFieldChange('email', text)}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        error={!!errors.email}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}

      <TextInput
        label={isEditing ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
        value={(formData as any).password || ''}
        onChangeText={(text) => onFieldChange('password', text)}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        error={!!errors.password}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <TextInput
        label="Nombre"
        value={formData.firstName || ''}
        onChangeText={(text) => onFieldChange('firstName', text)}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Apellido"
        value={formData.lastName || ''}
        onChangeText={(text) => onFieldChange('lastName', text)}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Dirección"
        value={formData.address || ''}
        onChangeText={(text) => onFieldChange('address', text)}
        mode="outlined"
        multiline
        numberOfLines={2}
        style={styles.input}
      />

      <TextInput
        label="URL del Avatar"
        value={formData.avatar || ''}
        onChangeText={(text) => onFieldChange('avatar', text)}
        mode="outlined"
        autoCapitalize="none"
        style={styles.input}
        placeholder="https://ejemplo.com/avatar.jpg"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 4,
    backgroundColor: colors.light.surface,
  },
  errorText: {
    color: colors.light.error,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
});
