/**
 * React Query hooks para colores
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config/api';
import { getValidAccessToken } from '../../services/tokenService';
import type { Color, CreateColorDto } from '../../types/color';

// Obtener todos los colores
export function useColorsQuery() {
  return useQuery<Color[]>({
    queryKey: ['colors'],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/color`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener colores');
      return response.json();
    },
  });
}

// Obtener un color por ID
export function useColorQuery(id: string) {
  return useQuery<Color>({
    queryKey: ['colors', id],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/color/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener color');
      return response.json();
    },
    enabled: !!id,
  });
}

// Crear color
export function useCreateColorMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (colorData: CreateColorDto) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/color`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(colorData),
      });
      if (!response.ok) throw new Error('Error al crear color');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });
}

// Actualizar color
export function useUpdateColorMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateColorDto }) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/color/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar color');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      queryClient.invalidateQueries({ queryKey: ['colors', variables.id] });
    },
  });
}

// Eliminar color
export function useDeleteColorMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/color/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al eliminar color');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });
}
