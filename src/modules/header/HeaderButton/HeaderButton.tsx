import { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './headerButton.module.scss';

interface IHeaderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const HeaderButton = (props: IHeaderButtonProps) => {
  const { children, ...restProps } = props;
  return (
    <button className={styles.container} {...restProps}>
      {children}
    </button>
  );
};
