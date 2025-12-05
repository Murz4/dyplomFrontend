import { useEffect, useState } from 'react';
import styles from './calendarPage.module.scss';
import { Calendar } from '@modules/CalendarPage/Calendar/Calendar';
import { SmallCalendar } from '@modules/SmallCalendar/SmallCalendar';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  // const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.container__main}>
        {isMobile === true ? null : (
          <div className={styles.container__smallCalendar}>
            <SmallCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
          </div>
        )}
        <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </div>
    </div>
  );
};
