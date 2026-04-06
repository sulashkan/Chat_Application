// Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type OAuthProvider = 'google' | 'facebook' | 'apple';
