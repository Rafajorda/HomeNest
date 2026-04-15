/**
 * React Query hooks para categorías
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config/api';
import { getValidAccessToken } from '../../services/tokenService';
import type { Category, CreateCategoryDto } from '../../types/category';

// Obtener todas las categorías
export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/category`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener categorías');
      return response.json();
    },
  });
}

// Obtener una categoría por ID
export function useCategoryQuery(id: string) {
  return useQuery<Category>({
    queryKey: ['categories', id],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/category/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener categoría');
      return response.json();
    },
    enabled: !!id,
  });
}

// Crear categoría
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: CreateCategoryDto) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/category`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error('Error al crear categoría');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Actualizar categoría
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateCategoryDto }) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/category/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar categoría');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
    },
  });
}

// Eliminar categoría
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/category/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al eliminar categoría');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Toggle status de categoría
export function useToggleCategoryStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/category/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al cambiar estado');
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', id] });
    },
  });
}
