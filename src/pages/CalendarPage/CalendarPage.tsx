import { useState } from 'react';
import styles from './calendarPage.module.scss';
import { Calendar } from '@modules/CalendarPage/Calendar/Calendar';
import { SmallCalendar } from '@modules/SmallCalendar/SmallCalendar';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className={styles.container}>
      <div className={styles.container__main}>
        <div className={styles.container__smallCalendar}>
          <SmallCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </div>

        <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </div>
    </div>
  );
};
