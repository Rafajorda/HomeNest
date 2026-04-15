import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Appbar, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CreateUserDto, UpdateUserDto, UserRole } from '../types/user';
import { getUserById, createUser, updateUser } from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme';
import { UserFormFields, UserRoleSelector, AvatarPreview } from '../components/users';

const UserFormScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const isEditing = !!id;
  const isEditingSelf = isEditing && currentUser && parseInt(id!) === currentUser.id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    avatar: '',
    role: UserRole.USER,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      loadUser(parseInt(id));
    }
  }, [id]);

  const loadUser = async (userId: number) => {
    try {
      setInitialLoading(true);
      const user = await getUserById(userId);
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        avatar: user.avatar || '',
        role: user.role,
        password: '',
      });
    } catch (error) {
      console.error('Error loading user:', error);
      alert('Error al cargar el usuario');
      router.push('/users-dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!isEditing && !(formData as CreateUserDto).password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEditing && id) {
        const updateData: UpdateUserDto = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          avatar: formData.avatar,
          role: formData.role,
        };
        if ((formData as CreateUserDto).password) {
          updateData.password = (formData as CreateUserDto).password;
        }
        await updateUser(parseInt(id), updateData);
        alert('Usuario actualizado correctamente');
      } else {
        await createUser(formData as CreateUserDto);
        alert('Usuario creado correctamente');
      }
      router.push('/users-dashboard');
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push('/users-dashboard')} />
          <Appbar.Content title="Cargando..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.push('/users-dashboard')} />
        <Appbar.Content title={isEditing ? 'Editar Usuario' : 'Crear Usuario'} />
        <Appbar.Action 
          icon="content-save" 
          onPress={handleSubmit}
          disabled={loading}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <AvatarPreview avatarUrl={formData.avatar} />

        <UserFormFields
          formData={formData}
          errors={errors}
          isEditing={isEditing}
          onFieldChange={handleFieldChange}
        />

        <UserRoleSelector
          role={formData.role || UserRole.USER}
          isEditingSelf={!!isEditingSelf}
          onRoleChange={handleRoleChange}
        />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.push('/users-dashboard')}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.light.primary,
  },
});

export default UserFormScreen;
