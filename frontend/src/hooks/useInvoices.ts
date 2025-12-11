import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvoiceImage } from '../types/models';
import {
  getInvoicesRequest,
  getInvoiceRequest,
  uploadInvoiceRequest,
  updateInvoiceRequest,
  updateInvoiceStatusRequest,
  linkInvoiceToCampaignRequest,
  linkInvoiceToProductRequest,
  deleteInvoiceRequest,
} from '../api/client';

export interface InvoiceFilters {
  status?: string;
  campaignId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}

export const useInvoices = (filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      return getInvoicesRequest(filters);
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      return getInvoiceRequest(id);
    },
    enabled: !!id,
  });
};

export const useUploadInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata?: Record<string, any>;
    }) => {
      return uploadInvoiceRequest(file, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<InvoiceImage> & { id: string }) => {
      return updateInvoiceRequest(id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return updateInvoiceStatusRequest(id, status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
    },
  });
};

export const useLinkInvoiceToCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      campaignId,
    }: {
      invoiceId: string;
      campaignId: string;
    }) => {
      return linkInvoiceToCampaignRequest(invoiceId, campaignId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useLinkInvoiceToProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      productId,
    }: {
      invoiceId: string;
      productId: string;
    }) => {
      return linkInvoiceToProductRequest(invoiceId, productId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteInvoiceRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
