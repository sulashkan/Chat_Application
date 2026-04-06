import { InputHTMLAttributes, ReactNode, useState } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const InputField = ({ icon, rightIcon, onRightIconClick, ...props }: InputFieldProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`${styles.wrap} ${focused ? styles.focused : ''}`}>
      {icon && <span className={styles.leftIcon}>{icon}</span>}
      <input
        className={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {rightIcon && (
        <button type="button" className={styles.rightBtn} onClick={onRightIconClick} tabIndex={-1}>
          {rightIcon}
        </button>
      )}
    </div>
  );
};
