import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, CreateUserDto, UpdateUserDto } from '../../types/user';
import { API_URL } from '../../config/api';
import { getValidAccessToken } from '../../services/tokenService';

interface PaginatedResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

const getHeaders = async (): Promise<HeadersInit> => {
  const token = await getValidAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// GET /users - Lista de usuarios con paginación
export const useUsersQuery = (page: number = 1, limit: number = 20) => {
  return useQuery<PaginatedResponse>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: await getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
  });
};

// GET /users/:id - Obtener usuario por ID
export const useUserQuery = (id: number, options?: { enabled?: boolean }) => {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'GET',
        headers: await getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: options?.enabled,
  });
};

// POST /users - Crear usuario
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// PUT /users/:id - Actualizar usuario
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: UpdateUserDto }) => {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

// DELETE /users/:id - Eliminar usuario
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// PUT /users/:id/toggle-status - Cambiar estado del usuario
export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/users/${id}/toggle-status`, {
        method: 'PUT',
        headers: await getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
};
