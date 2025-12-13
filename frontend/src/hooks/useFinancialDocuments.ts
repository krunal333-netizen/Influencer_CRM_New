import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFinancialDocumentsRequest,
  getFinancialDocumentRequest,
  createFinancialDocumentRequest,
  updateFinancialDocumentRequest,
  updateFinancialDocumentStatusRequest,
  markFinancialDocumentPaidRequest,
  deleteFinancialDocumentRequest,
  getFinancialDocumentStatsByTypeRequest,
  getFinancialDocumentStatsByFirmRequest,
} from '../api/client';
import { FinancialDocument } from '../types/models';

export const useFinancialDocuments = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['financial-documents', filters],
    queryFn: () => getFinancialDocumentsRequest(filters),
  });
};

export const useFinancialDocument = (id: string | undefined) => {
  return useQuery({
    queryKey: ['financial-documents', id],
    queryFn: () => getFinancialDocumentRequest(id!),
    enabled: !!id,
  });
};

export const useCreateFinancialDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createFinancialDocumentRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
    },
  });
};

export const useUpdateFinancialDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateFinancialDocumentRequest(id, payload),
    onSuccess: (data: FinancialDocument) => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      queryClient.invalidateQueries({ queryKey: ['financial-documents', data.id] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
    },
  });
};

export const useUpdateFinancialDocumentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFinancialDocumentStatusRequest(id, status),
    onSuccess: (data: FinancialDocument) => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      queryClient.invalidateQueries({ queryKey: ['financial-documents', data.id] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
    },
  });
};

export const useMarkFinancialDocumentPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paidDate }: { id: string; paidDate?: string }) =>
      markFinancialDocumentPaidRequest(id, paidDate),
    onSuccess: (data: FinancialDocument) => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      queryClient.invalidateQueries({ queryKey: ['financial-documents', data.id] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
    },
  });
};

export const useDeleteFinancialDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFinancialDocumentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
    },
  });
};

export const useFinancialDocumentStatsByType = () => {
  return useQuery({
    queryKey: ['financial-stats', 'by-type'],
    queryFn: () => getFinancialDocumentStatsByTypeRequest(),
  });
};

export const useFinancialDocumentStatsByFirm = () => {
  return useQuery({
    queryKey: ['financial-stats', 'by-firm'],
    queryFn: () => getFinancialDocumentStatsByFirmRequest(),
  });
};
