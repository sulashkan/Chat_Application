// Auth Types
export interface User {
  id: string;
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  contacts?: string[];
  sentRequests?: string[];
  receivedRequests?: string[];
  isContact?: boolean;
  requestSent?: boolean;
  requestReceived?: boolean;
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
