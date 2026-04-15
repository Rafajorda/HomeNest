/**
 * React Query hooks para pedidos (orders)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config/api';
import { getValidAccessToken } from '../../services/tokenService';
import type { Order } from '../../types/order';

/**
 * Hook para obtener todos los pedidos (solo admin)
 */
export function useOrdersQuery() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/order`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener pedidos');
      return response.json();
    },
  });
}

/**
 * Hook para obtener un pedido por ID
 */
export function useOrderQuery(id: number, options?: { enabled?: boolean }) {
  return useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/order/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener pedido');
      return response.json();
    },
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook para actualizar el estado de un pedido
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/order/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Error al actualizar estado del pedido');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook para eliminar un pedido
 */
export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/order/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar pedido');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
