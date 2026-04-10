import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';
import styles from './AuthPages.module.css';

/**
 * After OAuth redirect, the server sends back:
 *   /auth/callback?token=xxx&user=<base64-encoded-json>
 * This page extracts the token + user and logs them in.
 */
export const OAuthCallbackPage = () => {
  const [params] = useSearchParams();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userRaw = params.get('user');

    if (token && userRaw) {
      try {
        const user: User = JSON.parse(atob(userRaw));
        setAuth(user, token);
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    } else {
      navigate('/login?error=oauth_missing', { replace: true });
    }
  }, [params, setAuth, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', color: '#6b7280' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        Completing sign in…
      </div>
    </div>
  );
};
