import apiClient from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, OAuthProvider } from '../types/auth';


export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  return data;
};


export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload);
  return data;
};


export const getUsers = async (): Promise<{ message?: string; users: unknown[] }> => {
  const { data } = await apiClient.get('/api/users');
  return { users: data, message: 'Users fetched successfully' };
};


export const getProtectedData = async (): Promise<{ message: string; data: unknown }> => {
  const { data } = await apiClient.get('/api/protected');
  return data;
};


export const initiateOAuth = (provider: OAuthProvider): void => {
  const BASE_URL = (import.meta as { env: Record<string, string | undefined> }).env.VITE_API_URL || 'http://localhost:5000';
  window.location.href = `${BASE_URL}/api/auth/${provider}`;
};


export const logout = (): void => {
  localStorage.removeItem('auth_token');
};
