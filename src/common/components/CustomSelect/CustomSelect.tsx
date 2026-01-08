import { useField } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import styles from './customSelectStyle.module.scss';

interface CustomSelectProps {
  name: string;
  options: Array<{ value: number | string; label: string; disabled?: boolean }>;
  placeholder?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  variant?: 'blue' | 'white';
}

export const CustomSelect = ({
  name,
  options,
  placeholder = 'Select option',
  isLoading = false,
  loadingMessage = 'Loading...',
  variant = 'blue',
}: CustomSelectProps) => {
  const [field, meta, helpers] = useField(name);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === field.value);

  const handleSelect = (value: number | string) => {
    helpers.setValue(value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.customSelect} ${variant === 'white' ? styles.whiteVariant : ''}`} ref={selectRef}>
      <div
        className={`${styles.customSelect__trigger} ${
          meta.error && meta.touched ? styles.customSelect__triggerError : ''
        }`}
        onClick={handleToggle}
      >
        <span className={selectedOption ? styles.customSelect__selected : styles.customSelect__placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IoChevronDown
          className={`${styles.customSelect__arrow} ${isOpen ? styles.customSelect__arrowOpen : ''}`}
          size={20}
        />
      </div>

      {isOpen && (
        <div className={styles.customSelect__dropdown}>
          {isLoading && options.length === 0 ? (
            <div className={styles.customSelect__loading}>
              <div className={styles.customSelect__spinner} />
              <span>{loadingMessage}</span>
            </div>
          ) : (
            <>
              {options.map(option => (
                <div
                  key={option.value}
                  className={`${styles.customSelect__option} ${
                    field.value === option.value ? styles.customSelect__optionSelected : ''
                  } ${option.disabled ? styles.customSelect__optionDisabled : ''}`}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  style={option.disabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                >
                  {option.label}
                </div>
              ))}

              {isLoading && options.length > 0 && (
                <div className={styles.customSelect__loadingMore}>
                  <div className={styles.customSelect__spinnerSmall} />
                  <span>Loading more...</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
