import axios from 'axios';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  SafeUser,
} from '../types/auth';
import {
  ScrapeProfileRequest,
  ScrapeProfileResponse,
  RunStatusResponse,
  ApifyRunResult,
  InstagramProfileData,
  Campaign,
  Product,
  InfluencerCampaignLink,
  CampaignProduct,
  PaginatedResponse,
  CsvImportResult,
  InvoiceImage,
  CourierShipment,
} from '../types/models';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
});

export const loginRequest = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const registerRequest = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    '/auth/register',
    payload
  );
  return data;
};

export const refreshRequest = async (): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
  return data;
};

export const meRequest = async (): Promise<SafeUser> => {
  const { data } = await apiClient.get<SafeUser>('/auth/me');
  return data;
};

export const logoutRequest = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// Apify API functions
export const scrapeProfileRequest = async (
  payload: ScrapeProfileRequest
): Promise<ScrapeProfileResponse> => {
  const { data } = await apiClient.post<ScrapeProfileResponse>(
    '/apify/scrape-profile',
    payload
  );
  return data;
};

export const getRunStatusRequest = async (
  runId: string
): Promise<RunStatusResponse> => {
  const { data } = await apiClient.get<RunStatusResponse>(
    `/apify/run/${runId}/status`
  );
  return data;
};

export const getRunResultsRequest = async (
  runId: string
): Promise<ApifyRunResult> => {
  const { data } = await apiClient.get<ApifyRunResult>(
    `/apify/run/${runId}/results`
  );
  return data;
};

export const createInfluencerFromScrapedDataRequest = async (
  scrapedData: InstagramProfileData,
  additionalData?: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const { data } = await apiClient.post<Record<string, unknown>>(
    '/influencers/from-scraped-data',
    {
      scrapedData,
      additionalData,
    }
  );
  return data;
};

// Campaign endpoints
export const getCampaignsRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
): Promise<PaginatedResponse<Campaign>> => {
  const { data } = await apiClient.get<PaginatedResponse<Campaign>>(
    '/campaigns',
    { params }
  );
  return data;
};

export const getCampaignRequest = async (id: string): Promise<Campaign> => {
  const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
  return data;
};

export const createCampaignRequest = async (
  payload: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Campaign> => {
  const { data } = await apiClient.post<Campaign>('/campaigns', payload);
  return data;
};

export const updateCampaignRequest = async (
  id: string,
  payload: Partial<Campaign>
): Promise<Campaign> => {
  const { data } = await apiClient.put<Campaign>(`/campaigns/${id}`, payload);
  return data;
};

export const deleteCampaignRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/campaigns/${id}`);
};

export const updateCampaignStatusRequest = async (
  id: string,
  status: string
): Promise<Campaign> => {
  const { data } = await apiClient.patch<Campaign>(`/campaigns/${id}/status`, {
    status,
  });
  return data;
};

// Campaign-Product endpoints
export const linkCampaignProductRequest = async (
  campaignId: string,
  payload: {
    productId: string;
    quantity: number;
    discount?: string;
    plannedQty?: number;
    notes?: string;
    dueDate?: string;
  }
): Promise<CampaignProduct> => {
  const { data } = await apiClient.post<CampaignProduct>(
    `/campaigns/${campaignId}/products`,
    payload
  );
  return data;
};

export const unlinkCampaignProductRequest = async (
  campaignId: string,
  productId: string
): Promise<void> => {
  await apiClient.delete(`/campaigns/${campaignId}/products/${productId}`);
};

export const getCampaignProductsRequest = async (
  campaignId: string
): Promise<CampaignProduct[]> => {
  const { data } = await apiClient.get<CampaignProduct[]>(
    `/campaigns/${campaignId}/products`
  );
  return data;
};

// Campaign-Influencer endpoints
export const assignCampaignInfluencerRequest = async (
  campaignId: string,
  payload: {
    influencerId: string;
    rate: number;
    status?: string;
    deliverables?: string;
    deliverableType?: string;
    expectedDate?: string;
    notes?: string;
  }
): Promise<InfluencerCampaignLink> => {
  const { data } = await apiClient.post<InfluencerCampaignLink>(
    `/campaigns/${campaignId}/influencers`,
    payload
  );
  return data;
};

export const unassignCampaignInfluencerRequest = async (
  campaignId: string,
  influencerId: string
): Promise<void> => {
  await apiClient.delete(
    `/campaigns/${campaignId}/influencers/${influencerId}`
  );
};

export const getCampaignInfluencersRequest = async (
  campaignId: string
): Promise<InfluencerCampaignLink[]> => {
  const { data } = await apiClient.get<InfluencerCampaignLink[]>(
    `/campaigns/${campaignId}/influencers`
  );
  return data;
};

// Product endpoints
export const getProductsRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
): Promise<PaginatedResponse<Product>> => {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(
    '/products',
    { params }
  );
  return data;
};

export const getProductRequest = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
};

export const createProductRequest = async (
  payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> => {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
};

export const updateProductRequest = async (
  id: string,
  payload: Partial<Product>
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
  return data;
};

export const deleteProductRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const importProductsCsvRequest = async (
  file: File
): Promise<CsvImportResult<Product>> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<CsvImportResult<Product>>(
    '/products/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

// Invoice endpoints
export const uploadInvoiceRequest = async (
  file: File,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
): Promise<InvoiceImage> => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });
  }
  const { data } = await apiClient.post<InvoiceImage>(
    '/invoices/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

export const getInvoicesRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
): Promise<InvoiceImage[]> => {
  const { data } = await apiClient.get<InvoiceImage[]>('/invoices', { params });
  return data;
};

export const getInvoiceRequest = async (id: string): Promise<InvoiceImage> => {
  const { data } = await apiClient.get<InvoiceImage>(`/invoices/${id}`);
  return data;
};

export const updateInvoiceRequest = async (
  id: string,
  payload: Partial<InvoiceImage>
): Promise<InvoiceImage> => {
  const { data } = await apiClient.put<InvoiceImage>(
    `/invoices/${id}`,
    payload
  );
  return data;
};

export const updateInvoiceStatusRequest = async (
  id: string,
  status: string
): Promise<InvoiceImage> => {
  const { data } = await apiClient.patch<InvoiceImage>(
    `/invoices/${id}/status`,
    { status }
  );
  return data;
};

export const linkInvoiceToCampaignRequest = async (
  id: string,
  campaignId: string
): Promise<InvoiceImage> => {
  const { data } = await apiClient.post<InvoiceImage>(
    `/invoices/${id}/link-campaign`,
    { campaignId }
  );
  return data;
};

export const linkInvoiceToProductRequest = async (
  id: string,
  productId: string
): Promise<InvoiceImage> => {
  const { data } = await apiClient.post<InvoiceImage>(
    `/invoices/${id}/link-product`,
    { productId }
  );
  return data;
};

export const deleteInvoiceRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/invoices/${id}`);
};

// Courier Shipment endpoints
export const getCourierShipmentsRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
): Promise<CourierShipment[]> => {
  const { data } = await apiClient.get<CourierShipment[]>(
    '/courier-shipments',
    { params }
  );
  return data;
};

export const getCourierShipmentRequest = async (
  id: string
): Promise<CourierShipment> => {
  const { data } = await apiClient.get<CourierShipment>(
    `/courier-shipments/${id}`
  );
  return data;
};

export const createCourierShipmentRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
): Promise<CourierShipment> => {
  const { data } = await apiClient.post<CourierShipment>(
    '/courier-shipments',
    payload
  );
  return data;
};

export const updateCourierShipmentRequest = async (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
): Promise<CourierShipment> => {
  const { data } = await apiClient.put<CourierShipment>(
    `/courier-shipments/${id}`,
    payload
  );
  return data;
};

export const updateCourierShipmentStatusRequest = async (
  id: string,
  status: string
): Promise<CourierShipment> => {
  const { data } = await apiClient.patch<CourierShipment>(
    `/courier-shipments/${id}/status`,
    { status }
  );
  return data;
};

export const addCourierTimelineEventRequest = async (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: Record<string, any>
): Promise<CourierShipment> => {
  const { data } = await apiClient.post<CourierShipment>(
    `/courier-shipments/${id}/timeline-event`,
    event
  );
  return data;
};

export const deleteCourierShipmentRequest = async (
  id: string
): Promise<void> => {
  await apiClient.delete(`/courier-shipments/${id}`);
};

export const getCourierShipmentStatsRequest = async (): Promise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>
> => {
  const { data } = await apiClient.get('/courier-shipments/stats/aggregate');
  return data;
};

// Financial Document endpoints
export const getFinancialDocumentsRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
): Promise<PaginatedResponse<FinancialDocument>> => {
  const { data } = await apiClient.get<PaginatedResponse<FinancialDocument>>(
    '/financial-documents',
    { params }
  );
  return data;
};

export const getFinancialDocumentRequest = async (
  id: string
): Promise<FinancialDocument> => {
  const { data } = await apiClient.get<FinancialDocument>(
    `/financial-documents/${id}`
  );
  return data;
};

export const createFinancialDocumentRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
): Promise<FinancialDocument> => {
  const { data } = await apiClient.post<FinancialDocument>(
    '/financial-documents',
    payload
  );
  return data;
};

export const updateFinancialDocumentRequest = async (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
): Promise<FinancialDocument> => {
  const { data } = await apiClient.put<FinancialDocument>(
    `/financial-documents/${id}`,
    payload
  );
  return data;
};

export const updateFinancialDocumentStatusRequest = async (
  id: string,
  status: string
): Promise<FinancialDocument> => {
  const { data } = await apiClient.patch<FinancialDocument>(
    `/financial-documents/${id}/status`,
    { status }
  );
  return data;
};

export const markFinancialDocumentPaidRequest = async (
  id: string,
  paidDate?: string
): Promise<FinancialDocument> => {
  const { data } = await apiClient.patch<FinancialDocument>(
    `/financial-documents/${id}/mark-paid`,
    { paidDate }
  );
  return data;
};

export const deleteFinancialDocumentRequest = async (
  id: string
): Promise<void> => {
  await apiClient.delete(`/financial-documents/${id}`);
};

export const getFinancialDocumentStatsByTypeRequest = async (): Promise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>
> => {
  const { data } = await apiClient.get('/financial-documents/stats/by-type');
  return data;
};

export const getFinancialDocumentStatsByFirmRequest = async (): Promise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>[]
> => {
  const { data } = await apiClient.get('/financial-documents/stats/by-firm');
  return data;
};

export default apiClient;
