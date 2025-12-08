import { useField } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { IoTimeOutline } from 'react-icons/io5';
import styles from './customTimePickerStyle.module.scss';

interface CustomTimePickerProps {
  name: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CustomTimePicker = ({ name, placeholder = 'Select time', disabled = false }: CustomTimePickerProps) => {
  const [field, meta, helpers] = useField(name);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (field.value) {
      const [h, m] = field.value.split(':').map(Number);
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [field.value]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      const timeString = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      helpers.setValue(timeString, true);
    }
  };

  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      helpers.setValue(timeString, true);
      setIsOpen(false);
    }
  };

  const displayValue = field.value || placeholder;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={styles.timePicker} ref={pickerRef}>
      <div
        className={`${styles.timePicker__trigger} ${
          meta.error && meta.touched ? styles.timePicker__triggerError : ''
        } ${disabled ? styles.timePicker__triggerDisabled : ''}`}
        onClick={handleToggle}
      >
        <span className={field.value ? styles.timePicker__value : styles.timePicker__placeholder}>{displayValue}</span>
        <IoTimeOutline size={20} className={styles.timePicker__icon} />
      </div>

      {isOpen && (
        <div className={styles.timePicker__dropdown}>
          <div className={styles.timePicker__column}>
            <div className={styles.timePicker__columnHeader}>Hours</div>
            <div className={styles.timePicker__scrollArea}>
              {hours.map(hour => (
                <div
                  key={hour}
                  className={`${styles.timePicker__item} ${
                    selectedHour === hour ? styles.timePicker__itemSelected : ''
                  }`}
                  onClick={() => handleHourClick(hour)}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.timePicker__separator}>:</div>

          <div className={styles.timePicker__column}>
            <div className={styles.timePicker__columnHeader}>Minutes</div>
            <div className={styles.timePicker__scrollArea}>
              {minutes.map(minute => (
                <div
                  key={minute}
                  className={`${styles.timePicker__item} ${
                    selectedMinute === minute ? styles.timePicker__itemSelected : ''
                  }`}
                  onClick={() => handleMinuteClick(minute)}
                >
                  {minute.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
