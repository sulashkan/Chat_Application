import { ReactNode } from 'react';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const AuthCard = ({ icon, title, subtitle, children }: AuthCardProps) => {
  return (
    <div className={styles.card}>
      {icon && <div className={styles.iconWrap}>{icon}</div>}
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.body}>{children}</div>
    </div>
  );
};
