/**
 * React Query hooks para productos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config/api';
import { getValidAccessToken } from '../../services/tokenService';
import type { Product, CreateProductInput } from '../../types/product';

// Obtener todos los productos
export function useProductsQuery() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener productos');
      const result = await response.json();
      // El backend devuelve { data: [...], total: number }
      return result.data || result;
    },
  });
}

// Obtener un producto por ID
export function useProductQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: async () => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener producto');
      return response.json();
    },
    enabled: options?.enabled ?? !!id,
  });
}

// Crear producto
export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: CreateProductInput) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Error al crear producto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Subir modelo 3D a un producto existente
export function useUploadModel3DMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, file }: { productId: string; file: any }) => {
      const token = await getValidAccessToken();
      const formData = new FormData();
      
      // Crear blob del archivo
      const blob = await fetch(file.uri).then(r => r.blob());
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'model/gltf-binary',
        name: file.name || 'model.glb'
      } as any);
      
      const response = await fetch(`${API_URL}/product/${productId}/model`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir modelo 3D');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
    },
  });
}

// Eliminar modelo 3D de un producto
export function useDeleteModel3DMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product/${id}/model`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al eliminar modelo 3D');
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}

// Actualizar producto
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductInput> }) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar producto');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
}

// Eliminar producto
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al eliminar producto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Toggle status del producto
export function useToggleProductStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getValidAccessToken();
      const response = await fetch(`${API_URL}/product/${id}/toggle-status`, {
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}
