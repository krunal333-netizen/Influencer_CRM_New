import axios from 'axios';
import { AuthResponse, LoginPayload, RegisterPayload, SafeUser } from '../types/auth';

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

export default apiClient;
