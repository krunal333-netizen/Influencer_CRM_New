import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../types/models';
import {
  getProductsRequest,
  getProductRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
  importProductsCsvRequest,
} from '../api/client';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sku?: string;
  asCode?: string;
}

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      return getProductsRequest(filters);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      return getProductRequest(id);
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      return createProductRequest(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Product) => {
      return updateProductRequest(id, product);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteProductRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useImportProductsCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return importProductsCsvRequest(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
