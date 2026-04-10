import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/auth/AuthCard';
import { InputField } from '../components/auth/InputField';
import { OAuthButtons } from '../components/auth/OAuthButtons';
import { useAuthForm } from '../hooks/useAuthForm';
import styles from './AuthPages.module.css';

const LoginIcon = () => (
  <div className={styles.iconBox}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  </div>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ closed }: { closed: boolean }) => closed ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { handleLogin, loading, error } = useAuthForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const pageError =
    oauthError === 'oauth_failed'
      ? 'Google sign in could not be completed. Please try again.'
      : oauthError === 'oauth_missing'
      ? 'Google sign in did not return the required login data.'
      : oauthError === 'google_oauth_not_configured'
      ? 'Google sign in is not configured on the server yet.'
      : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await handleLogin({ email, password });
    if (ok) navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgCircle3} />
      </div>
      <AuthCard
        icon={<LoginIcon />}
        title="Sign in with email"
        subtitle="Make a new doc to bring your words, data, and teams together. For free"
      >
        <form onSubmit={onSubmit} className={styles.form}>
          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon />}
            required
            autoComplete="email"
          />
          <InputField
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon />}
            rightIcon={<EyeIcon closed={!showPw} />}
            onRightIconClick={() => setShowPw(!showPw)}
            required
            autoComplete="current-password"
          />

          {(error || pageError) && <p className={styles.error}>{error || pageError}</p>}

          <div className={styles.forgot}>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Get Started'}
          </button>
        </form>

        <OAuthButtons />

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.switchLink}>Sign up</Link>
        </p>
      </AuthCard>
    </div>
  );
};
