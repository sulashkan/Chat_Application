import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, getProtectedData } from '../api/auth';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [protectedData, setProtectedData] = useState<{ message: string; data: unknown } | null>(null);
  const [users, setUsers] = useState<Array<{ id?: string; name?: string; email?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProtected();
    fetchUsers();
  }, []);

  const fetchProtected = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProtectedData();
      setProtectedData(data);
    } catch {
      setError('Failed to fetch protected data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response.users as Array<{ id?: string; name?: string; email?: string }>);
    } catch {
      setError('Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className={styles.greeting}>Welcome back,</p>
              <p className={styles.userName}>{user?.name ?? user?.email ?? 'User'}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </header>

      
      </div>
    </div>
  );
};
