import axios from 'axios';
import { AuthResponse, LoginPayload, RegisterPayload, SafeUser } from '../types/auth';
import { 
  ScrapeProfileRequest, 
  ScrapeProfileResponse, 
  RunStatusResponse, 
  ApifyRunResult,
  InstagramProfileData 
} from '../types/models';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
});

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
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
export const scrapeProfileRequest = async (payload: ScrapeProfileRequest): Promise<ScrapeProfileResponse> => {
  const { data } = await apiClient.post<ScrapeProfileResponse>('/apify/scrape-profile', payload);
  return data;
};

export const getRunStatusRequest = async (runId: string): Promise<RunStatusResponse> => {
  const { data } = await apiClient.get<RunStatusResponse>(`/apify/run/${runId}/status`);
  return data;
};

export const getRunResultsRequest = async (runId: string): Promise<ApifyRunResult> => {
  const { data } = await apiClient.get<ApifyRunResult>(`/apify/run/${runId}/results`);
  return data;
};

export const createInfluencerFromScrapedDataRequest = async (
  scrapedData: InstagramProfileData,
  additionalData?: any
): Promise<any> => {
  const { data } = await apiClient.post('/influencers/from-scraped-data', {
    scrapedData,
    additionalData,
  });
  return data;
};

export default apiClient;
