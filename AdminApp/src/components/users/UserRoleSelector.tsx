/**
 * Componente UserRoleSelector
 * 
 * Selector de rol con validación de auto-edición
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { colors } from '../../theme';
import { UserRole } from '../../types/user';

interface UserRoleSelectorProps {
  role: UserRole;
  isEditingSelf: boolean;
  onRoleChange: (role: UserRole) => void;
}

export const UserRoleSelector = ({
  role,
  isEditingSelf,
  onRoleChange,
}: UserRoleSelectorProps) => {
  return (
    <View>
      <Text variant="titleSmall" style={styles.sectionTitle}>
        Rol del usuario
      </Text>
      {isEditingSelf && (
        <Text style={styles.warningText}>
          ℹ️ No puedes cambiar tu propio rol
        </Text>
      )}
      <SegmentedButtons
        value={role || UserRole.USER}
        onValueChange={(value) => onRoleChange(value as UserRole)}
        buttons={[
          { value: UserRole.USER, label: 'Usuario', disabled: !!isEditingSelf },
          { value: UserRole.ADMIN, label: 'Administrador', disabled: !!isEditingSelf },
        ]}
        style={styles.segmentedButtons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: colors.light.text,
  },
  warningText: {
    color: colors.light.warning,
    fontSize: 12,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
});
