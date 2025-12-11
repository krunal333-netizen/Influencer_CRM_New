import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Influencer } from '../types/models';
import apiClient from '../api/client';

export interface InfluencerFilters {
  limit?: number;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const useInfluencers = (filters?: InfluencerFilters) => {
  return useQuery({
    queryKey: ['influencers', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Influencer[]>('/influencers', {
        params: filters,
      });
      return data;
    },
  });
};

export const useInfluencer = (id: string) => {
  return useQuery({
    queryKey: ['influencers', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Influencer>(`/influencers/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      influencer: Omit<Influencer, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      const { data } = await apiClient.post<Influencer>(
        '/influencers',
        influencer
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
};

export const useUpdateInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...influencer }: Influencer) => {
      const { data } = await apiClient.put<Influencer>(
        `/influencers/${id}`,
        influencer
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers', data.id] });
    },
  });
};

export const useDeleteInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/influencers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
};
