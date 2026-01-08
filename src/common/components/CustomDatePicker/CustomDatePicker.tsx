import React, { useEffect, useRef, useState } from 'react';
import styles from './customDatePickerStyles.module.scss';

interface CustomDatePickerProps {
  value: string;
  onChange: (dateString: string) => void;
  minDate?: Date;
  placeholder?: string;
  variant?: 'blue' | 'white';
}

const formatDisplayDate = (dateString: string): string => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  minDate = new Date(new Date().setHours(0, 0, 0, 0)),
  placeholder = 'DD.MM.YYYY',
  variant = 'blue',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayWeekday = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    currentDate.setHours(0, 0, 0, 0);

    const isDisabled = currentDate < minDate;
    const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();
    const isToday = currentDate.getTime() === today.getTime();

    days.push(
      <button
        key={day}
        type='button'
        disabled={isDisabled}
        className={`${styles.day} ${isDisabled ? styles.disabled : ''} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
        onClick={() => {
          if (!isDisabled) {
            onChange(formatDateForInput(currentDate));
            setIsOpen(false);
          }
        }}
      >
        {day}
      </button>
    );
  }

  const displayText = value ? formatDisplayDate(value) : placeholder;

  return (
    <div className={`${styles.wrapper} ${variant === 'white' ? styles.whiteVariant : ''}`}>
      <button type='button' className={styles.triggerButton} disabled={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <span className={`${styles.displayText} ${!value ? styles.placeholder : ''}`}>{displayText}</span>
      </button>

      {isOpen && (
        <div ref={popoverRef} className={styles.popover}>
          <div className={styles.header}>
            <button type='button' className={styles.navButton} onClick={prevMonth}>
              ‹
            </button>
            <span className={styles.monthYear}>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button type='button' className={styles.navButton} onClick={nextMonth}>
              ›
            </button>
          </div>

          <div className={styles.grid}>
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
              <div key={d} className={styles.dayName}>
                {d}
              </div>
            ))}
            {days}
          </div>
        </div>
      )}
    </div>
  );
};
