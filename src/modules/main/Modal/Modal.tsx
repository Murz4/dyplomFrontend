import { ReactNode } from 'react';

import styles from './modal.module.scss';

interface IModalProps {
  children?: ReactNode;
  onClosed: () => void;
}

export const Modal = ({ onClosed }: IModalProps) => (
  <div onClick={() => onClosed()} className={styles.container__wrapper}>
    <div onClick={event => event.stopPropagation()} className={styles.container}>
      <img style={{ width: '100%', height: '100%' }} src='/modalArtBoard.png' />
    </div>
  </div>
);
