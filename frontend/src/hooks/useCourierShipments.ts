import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourierShipmentsRequest,
  getCourierShipmentRequest,
  createCourierShipmentRequest,
  updateCourierShipmentRequest,
  updateCourierShipmentStatusRequest,
  addCourierTimelineEventRequest,
  deleteCourierShipmentRequest,
  getCourierShipmentStatsRequest,
} from '../api/client';

export interface CourierShipmentFilters {
  status?: string;
  campaignId?: string;
  influencerId?: string;
  sendStoreId?: string;
  returnStoreId?: string;
  startDate?: string;
  endDate?: string;
}

export const useCourierShipments = (filters: CourierShipmentFilters = {}) => {
  return useQuery({
    queryKey: ['courier-shipments', filters],
    queryFn: async () => {
      return getCourierShipmentsRequest(filters);
    },
  });
};

export const useCourierShipment = (id: string) => {
  return useQuery({
    queryKey: ['courier-shipments', id],
    queryFn: async () => {
      return getCourierShipmentRequest(id);
    },
    enabled: !!id,
  });
};

export const useCreateCourierShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: Record<string, any>
    ) => {
      return createCourierShipmentRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-shipments'] });
    },
  });
};

export const useUpdateCourierShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any> & { id: string }) => {
      return updateCourierShipmentRequest(id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courier-shipments'] });
      queryClient.invalidateQueries({
        queryKey: ['courier-shipments', data.id],
      });
    },
  });
};

export const useUpdateCourierShipmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return updateCourierShipmentStatusRequest(id, status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courier-shipments'] });
      queryClient.invalidateQueries({
        queryKey: ['courier-shipments', data.id],
      });
    },
  });
};

export const useAddCourierTimelineEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      event,
    }: {
      id: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event: Record<string, any>;
    }) => {
      return addCourierTimelineEventRequest(id, event);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courier-shipments'] });
      queryClient.invalidateQueries({
        queryKey: ['courier-shipments', data.id],
      });
    },
  });
};

export const useDeleteCourierShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteCourierShipmentRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-shipments'] });
    },
  });
};

export const useCourierShipmentStats = () => {
  return useQuery({
    queryKey: ['courier-shipments', 'stats'],
    queryFn: async () => {
      return getCourierShipmentStatsRequest();
    },
  });
};
