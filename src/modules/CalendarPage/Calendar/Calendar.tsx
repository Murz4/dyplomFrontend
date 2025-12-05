import { useEffect, useState } from 'react';
import styles from './calendarStyles.module.scss';

//@ts-ignore

export const Calendar = ({ currentDate, setCurrentDate }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  // const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return '#FF6773';
      case 'high':
        return '#FEBC51';
      case 'normal':
        return '#C4E565';
      case 'low':
        return '#97A5E5';
      default:
        return '#9CA3AF';
    }
  };

  const events = [
    {
      date: '2025-11-26',
      title: 'Discuss the quarter',
      project: 'Q4 Planning',
      priority: 'urgent',
    },
    {
      date: '2025-11-26',
      title: 'Prepare a report',
      project: 'Finance Team',
      priority: 'high',
    },
    {
      date: '2025-11-28',
      title: 'Current project',
      project: 'Development',
      priority: 'normal',
    },
    {
      date: '2025-12-03',
      title: 'Submit a presentation',
      project: 'Marketing',
      priority: 'urgent',
    },
    {
      date: '2025-12-03',
      title: 'Current project',
      project: 'Development',
      priority: 'normal',
    },
    {
      date: '2025-12-03',
      title: 'Client meeting',
      project: 'Sales',
      priority: 'high',
    },
    {
      date: '2025-12-05',
      title: 'Discuss the quarter',
      project: 'Q4 Planning',
      priority: 'normal',
    },
    {
      date: '2025-12-17',
      title: 'Check your email',
      project: 'Administration',
      priority: 'low',
    },
    {
      date: '2025-12-18',
      title: 'Project plan',
      project: 'Product Team',
      priority: 'high',
    },
    {
      date: '2025-12-18',
      title: 'Prepare a report',
      project: 'Finance Team',
      priority: 'urgent',
    },
    {
      date: '2025-12-27',
      title: 'Draft for edits',
      project: 'Content Team',
      priority: 'normal',
    },
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getEventsForDay = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonthDate);
    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayEvents = getEventsForDay(day, prevMonthDate.getMonth(), prevMonthDate.getFullYear());
      days.push(
        <div key={`prev-${day}`} className={`${styles['custom-calendar__grid-day']} ${styles['other-month']}`}>
          <div className={styles['custom-calendar__day-number']}>{day}</div>
          {dayEvents.length > 0 && (
            <div className={styles['custom-calendar__events']}>
              {dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={styles['custom-calendar__events-card']}
                  style={{ backgroundColor: getPriorityColor(event.priority) }}
                >
                  <div className={styles['custom-calendar__events-card-title']}>{event.title}</div>
                  <div className={styles['custom-calendar__events-card-project']}>{event.project}</div>
                  <div className={styles['custom-calendar__events-card-menu']}>⋯</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day, currentDate.getMonth(), currentDate.getFullYear());
      const isCurrentDay = isToday(day, currentDate.getMonth(), currentDate.getFullYear());
      console.log(isCurrentDay, 'her');
      days.push(
        <div key={day} className={`${styles['custom-calendar__grid-day']} ${isCurrentDay ? styles.today : ''}`}>
          <div className={styles['custom-calendar__day-number']}>{day}</div>
          {dayEvents.length > 0 && (
            <div className={styles['custom-calendar__events']}>
              {dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={styles['custom-calendar__events-card']}
                  style={{ backgroundColor: getPriorityColor(event.priority) }}
                >
                  <div className={styles['custom-calendar__events-card-title']}>{event.title}</div>
                  <div className={styles['custom-calendar__events-card-project']}>{event.project}</div>
                  <div className={styles['custom-calendar__events-card-menu']}>⋯</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);

    for (let day = 1; day <= remainingCells; day++) {
      const dayEvents = getEventsForDay(day, nextMonthDate.getMonth(), nextMonthDate.getFullYear());
      days.push(
        <div key={`next-${day}`} className={`${styles['custom-calendar__grid-day']} ${styles['other-month']}`}>
          <div className={styles['custom-calendar__day-number']}>{day}</div>
          {dayEvents.length > 0 && (
            <div className={styles['custom-calendar__events']}>
              {dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={styles['custom-calendar__events-card']}
                  style={{ backgroundColor: getPriorityColor(event.priority) }}
                >
                  <div className={styles['custom-calendar__events-card-title']}>{event.title}</div>
                  <div className={styles['custom-calendar__events-card-project']}>{event.project}</div>
                  <div className={styles['custom-calendar__events-card-menu']}>⋯</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };
  //TODO: Add mobile adaptive [weekday with renderCalendar() in both div]
  return (
    <>
      {isMobile === true ? (
        <div className={styles['custom-calendar']}>
          {/* <div className={styles['custom-calendar__weekdays']}>

      </div> */}
          <div className={styles['custom-calendar__grid']}>
            {weekDays.map(day => (
              <div key={day} className={styles['custom-calendar__weekdays-day']}>
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className={styles['custom-calendar']}>
          <div className={styles['custom-calendar__weekdays']}>
            {weekDays.map(day => (
              <div key={day} className={styles['custom-calendar__weekdays-day']}>
                {day}
              </div>
            ))}
          </div>
          <div className={styles['custom-calendar__grid']}>{renderCalendar()}</div>
        </div>
      )}
    </>
  );
};
