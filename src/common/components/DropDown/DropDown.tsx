import { useState } from 'react';
import styles from './dropDown.module.scss';
import { ChevronDown } from 'lucide-react';

interface DropdownBlockProps {
  title?: string;
  children?: React.ReactNode;
}

export const DropDown: React.FC<DropdownBlockProps> = ({ title = 'Select', children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
      <button type='button' className={styles.dropdown__header} onClick={() => setIsOpen(prev => !prev)}>
        <span>{title}</span>
        <ChevronDown size={18} className={`${styles.dropdown__icon} ${isOpen ? styles.dropdown__icon_open : ''}`} />
      </button>

      <div className={`${styles.dropdown__content} ${isOpen ? styles.dropdown__content_open : ''}`}>
        <div className={styles.dropdown__inner}>{children ?? <p>Dropdown content...</p>}</div>
      </div>
    </div>
  );
};
