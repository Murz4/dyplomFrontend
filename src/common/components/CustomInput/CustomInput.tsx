import { InputHTMLAttributes } from 'react';

import styles from './customInput.module.scss';

interface ICustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
}

export const CustomInput = ({ label, ...props }: ICustomInputProps) => (
  <div className={styles.inputContainer}>
    <input
      className={styles.inputContainer__input}
      style={
        label === undefined
          ? { paddingTop: 5, paddingLeft: 15, paddingRight: 15, paddingBottom: 5 }
          : { paddingTop: 15, paddingLeft: 15, paddingRight: 15, paddingBottom: 5 }
      }
      id={label}
      placeholder={label}
      {...props}
    />
    <label htmlFor={label} className={styles.inputContainer__label}>
      {label}
    </label>
  </div>
);
