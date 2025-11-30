import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Campaign } from '../types/models';
import apiClient from '../api/client';

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data } = await apiClient.get<Campaign[]>('/campaigns');
      return data;
    },
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<Campaign>('/campaigns', campaign);
      return data;
    },
    onMutate: async (newCampaign) => {
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(['campaigns']);

      if (previousCampaigns) {
        queryClient.setQueryData<Campaign[]>(['campaigns'], [
          ...previousCampaigns,
          {
            ...newCampaign,
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      return { previousCampaigns };
    },
    onError: (err, newCampaign, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(['campaigns'], context.previousCampaigns);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...campaign }: Campaign) => {
      const { data } = await apiClient.put<Campaign>(`/campaigns/${id}`, campaign);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
