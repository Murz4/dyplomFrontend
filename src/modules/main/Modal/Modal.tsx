import { IoCloseOutline } from 'react-icons/io5';

import styles from './modal.module.scss';

interface IModalProps {
  children?: any;
  onClosed: () => void;
}

export const Modal = ({ onClosed, children }: IModalProps) => (
  <div onClick={() => onClosed()} className={styles.container__wrapper}>
    <div onClick={event => event.stopPropagation()} className={styles.container}>
      <button
        onClick={onClosed}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          borderRadius: '50%',
          transition: 'background-color 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        aria-label='Close modal'
      >
        <IoCloseOutline size={30} color='#333' />
      </button>

      {children}
    </div>
  </div>
);
