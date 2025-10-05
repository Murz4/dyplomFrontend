import { InputHTMLAttributes } from 'react';

import styles from './CustomInput.module.scss';

interface ICustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CustomInput = ({ label, ...props }: ICustomInputProps) => (
  <div className={styles.inputContainer}>
    <input className={styles.inputContainer__input} id={label} placeholder={label} {...props} />
    <label htmlFor={label} className={styles.inputContainer__label}>
      {label}
    </label>
  </div>
);
