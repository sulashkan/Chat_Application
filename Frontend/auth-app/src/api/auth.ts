import apiClient from './client';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { AuthResponse, LoginPayload, RegisterPayload, OAuthProvider, User } from '../types/auth';


export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  return data;
};


export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload);
  return data;
};


export const getUsers = async (): Promise<AxiosResponse<User[]>> => {
  return apiClient.get('/api/users');
};


export const getProtectedData = async (): Promise<{ message: string; data: unknown }> => {
  const { data } = await apiClient.get('/api/protected');
  return data;
};


export const initiateOAuth = (provider: OAuthProvider): void => {
  const BASE_URL = (
    (import.meta as { env: Record<string, string | undefined> }).env.VITE_API_URL ||
    'http://localhost:5000'
  ).replace(/\/$/, '');
  window.location.href = `${BASE_URL}/api/auth/${provider}`;
};


export const logout = (): void => {
  localStorage.removeItem('auth_token');
};

export const sendUserRequest = (userId: string) => {
  return apiClient.post(`/api/users/request/${userId}`);
};

export const acceptUserRequest = (userId: string) => {
  return apiClient.post(`/api/users/request/${userId}/accept`);
};

export const rejectUserRequest = (userId: string) => {
  return apiClient.post(`/api/users/request/${userId}/reject`);
};

export const cancelUserRequest = (userId: string) => {
  return apiClient.post(`/api/users/request/${userId}/cancel`).catch(async (err) => {
    if (!axios.isAxiosError(err) || err.response?.status !== 404) {
      return Promise.reject(err);
    }

    try {
      return await apiClient.post(`/api/users/request/${userId}/take-back`);
    } catch (takeBackErr) {
      if (!axios.isAxiosError(takeBackErr) || takeBackErr.response?.status !== 404) {
        return Promise.reject(takeBackErr);
      }
      return apiClient.post(`/api/users/request/${userId}/reject`);
    }
  });
};


export const removeUserContact = (userId: string) => {
  return apiClient.post(`/api/users/contact/${userId}/remove`).catch((err) => {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return apiClient.post(`/api/users/request/${userId}/remove`);
    }
    return Promise.reject(err);
  });
};

export const blockUserContact = (userId: string) => {
  return apiClient.post(`/api/users/contact/${userId}/block`).catch((err) => {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return apiClient.post(`/api/users/request/${userId}/block`);
    }
    return Promise.reject(err);
  });
};

export const getMessages = (chatId: string) => {
  return apiClient.get(`/api/messages/${chatId}`);
};

export const getMyChats = () => {
  return apiClient.get('/api/chats');
};

export const getOrCreatePrivateChat = (userId: string) => {
  return apiClient.post('/api/chats/private', { userId });
};

export const createGroupChat = (name: string, memberIds: string[]) => {
  return apiClient.post('/api/chats/group', { name, memberIds });
};

export const updateGroupChat = (chatId: string, name: string) => {
  return apiClient.patch(`/api/chats/${chatId}/group`, { name });
};

export const addGroupMembers = (chatId: string, memberIds: string[]) => {
  return apiClient.post(`/api/chats/${chatId}/group/members`, { memberIds });
};

export const removeGroupMember = (chatId: string, memberId: string) => {
  return apiClient.delete(`/api/chats/${chatId}/group/members/${memberId}`);
};

export const leaveGroupChat = (chatId: string) => {
  return apiClient.post(`/api/chats/${chatId}/group/leave`);
};
