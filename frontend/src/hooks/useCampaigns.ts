import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Campaign } from '../types/models';
import {
  getCampaignsRequest,
  getCampaignRequest,
  createCampaignRequest,
  updateCampaignRequest,
  deleteCampaignRequest,
  assignCampaignInfluencerRequest,
  unassignCampaignInfluencerRequest,
  linkCampaignProductRequest,
  unlinkCampaignProductRequest,
} from '../api/client';

export interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  storeId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

export const useCampaigns = (filters: CampaignFilters = {}) => {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      return getCampaignsRequest(filters);
    },
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      return getCampaignRequest(id);
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      return createCampaignRequest(campaign);
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
      return updateCampaignRequest(id, campaign);
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
      await deleteCampaignRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useAssignCampaignInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      campaignId: string;
      influencerId: string;
      rate: number;
      status?: string;
      deliverables?: string;
      deliverableType?: string;
      expectedDate?: string;
      notes?: string;
    }) => {
      const { campaignId, ...payload } = params;
      return assignCampaignInfluencerRequest(campaignId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({
        queryKey: ['campaigns', data.campaignId],
      });
    },
  });
};

export const useUnassignCampaignInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      influencerId,
    }: {
      campaignId: string;
      influencerId: string;
    }) => {
      await unassignCampaignInfluencerRequest(campaignId, influencerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useLinkCampaignProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      campaignId: string;
      productId: string;
      quantity: number;
      discount?: string;
      plannedQty?: number;
      notes?: string;
      dueDate?: string;
    }) => {
      const { campaignId, ...payload } = params;
      return linkCampaignProductRequest(campaignId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({
        queryKey: ['campaigns', data.campaignId],
      });
    },
  });
};

export const useUnlinkCampaignProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      productId,
    }: {
      campaignId: string;
      productId: string;
    }) => {
      await unlinkCampaignProductRequest(campaignId, productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
