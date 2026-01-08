import { useField } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { IoTimeOutline } from 'react-icons/io5';
import styles from './customTimePickerStyle.module.scss';

interface CustomTimePickerProps {
  name: string;
  placeholder?: string;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
  variant?: 'blue' | 'white';
}

export const CustomTimePicker = ({
  name,
  placeholder = 'Select time',
  disabled = false,
  minTime,
  maxTime,
  variant = 'blue',
}: CustomTimePickerProps) => {
  const [field, meta, helpers] = useField(name);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const timeToMinutes = (time: string | undefined): number | null => {
    if (!time) {
      return null;
    }
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minTimeInMinutes = timeToMinutes(minTime);
  const maxTimeInMinutes = timeToMinutes(maxTime);

  const isHourDisabled = (hour: number): boolean => {
    if (minTimeInMinutes !== null) {
      if (hour < Math.floor(minTimeInMinutes / 60)) {
        return true;
      }
    }

    if (maxTimeInMinutes !== null) {
      if (hour > Math.floor(maxTimeInMinutes / 60)) {
        return true;
      }
    }

    return false;
  };

  const isMinuteDisabled = (minute: number): boolean => {
    if (selectedHour === null) {
      return false;
    }

    const currentTotalMinutes = selectedHour * 60 + minute;

    if (minTimeInMinutes !== null) {
      if (currentTotalMinutes <= minTimeInMinutes) {
        return true;
      }
    }

    if (maxTimeInMinutes !== null) {
      if (currentTotalMinutes >= maxTimeInMinutes) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    if (field.value) {
      const [h, m] = field.value.split(':').map(Number);
      setSelectedHour(h);
      setSelectedMinute(m);
    } else {
      setSelectedHour(null);
      setSelectedMinute(null);
    }
  }, [field.value]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  const handleHourClick = (hour: number) => {
    if (isHourDisabled(hour)) {
      return;
    }

    setSelectedHour(hour);

    if (selectedMinute !== null && !isMinuteDisabled(selectedMinute)) {
      const timeString = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      helpers.setValue(timeString, true);
    }
  };

  const handleMinuteClick = (minute: number) => {
    if (isMinuteDisabled(minute)) {
      return;
    }

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
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className={`${styles.timePicker} ${variant === 'white' ? styles.whiteVariant : ''}`} ref={pickerRef}>
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
              {hours.map(hour => {
                const disabled = isHourDisabled(hour);
                return (
                  <div
                    key={hour}
                    className={`${styles.timePicker__item} ${
                      selectedHour === hour ? styles.timePicker__itemSelected : ''
                    } ${disabled ? styles.timePicker__itemDisabled : ''}`}
                    onClick={() => handleHourClick(hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.timePicker__separator}>:</div>

          <div className={styles.timePicker__column}>
            <div className={styles.timePicker__columnHeader}>Minutes</div>
            <div className={styles.timePicker__scrollArea}>
              {minutes.map(minute => {
                const disabled = isMinuteDisabled(minute);
                return (
                  <div
                    key={minute}
                    className={`${styles.timePicker__item} ${
                      selectedMinute === minute ? styles.timePicker__itemSelected : ''
                    } ${disabled ? styles.timePicker__itemDisabled : ''}`}
                    onClick={() => handleMinuteClick(minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
