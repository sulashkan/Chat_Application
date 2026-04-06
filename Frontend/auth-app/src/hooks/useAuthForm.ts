import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import type { LoginPayload, RegisterPayload } from '../types/auth';

export const useAuthForm = () => {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await login(payload);
      setAuth(user, token);
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await register(payload);
      setAuth(user, token);
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleRegister, loading, error, setError };
};
