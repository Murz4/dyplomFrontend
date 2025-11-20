import { useState } from 'react';

import styles from './calendarStyles.module.scss';

//@ts-ignore

export const Calendar = ({ currentDate, setCurrentDate }) => {
  // const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
  const [events, setEvents] = useState([
    {
      date: '2025-11-26',
      title: 'Discuss the quarter',
      time: '12:30-13:45',
      room: 'Room 307',
      color: '#FCD34D',
      icon: '✏️',
    },
    { date: '2025-11-26', title: 'Prepare a report', time: '15:00-15:20', color: '#EF4444', icon: '●' },
    { date: '2025-11-28', title: 'Current project', time: '11:30-13:45', room: 'Room -', color: '#10B981', icon: '✏️' },
    { date: '2025-12-03', title: 'Submit a presentation', time: '11:00-11:15', color: '#EF4444', icon: '●' },
    { date: '2025-12-03', title: 'Current project', time: '11:30-12:40', color: '#10B981', icon: '●' },
    { date: '2025-12-03', title: 'Client meeting', time: '18:00-19:40', color: '#F97316', icon: '●' },
    {
      date: '2025-12-05',
      title: 'Discuss the quarter',
      time: '12:30-12:45',
      room: 'Room 304',
      color: '#FCD34D',
      badge: 'Meeting',
      icon: '✏️',
    },
    {
      date: '2025-12-17',
      title: 'Check your email',
      time: '12:30-13:45',
      room: 'Room -',
      color: '#3B82F6',
      icon: '✏️',
    },
    { date: '2025-12-18', title: 'Project plan', time: '11:30-13:45', color: '#F97316', icon: '●' },
    { date: '2025-12-18', title: 'Prepare a report', time: '15:00-15:20', color: '#EF4444', icon: '●' },
    {
      date: '2025-12-27',
      title: 'Draft for edits',
      time: '12:30-13:45',
      room: 'Room -',
      color: '#F97316',
      badge: 'Deadline',
      icon: '✏️',
    },
  ]);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };
  const getEventsForDay = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };
  // const handleDayClick = (day: number, month: number, year: number) => {
  //   const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  //   alert(`Clicked date: ${dateStr}`);
  // };

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
                  style={{ borderLeftColor: event.color }}
                >
                  <div className={styles['custom-calendar__events-card-header']}>
                    <span className={styles['custom-calendar__events-card-header-title']}>{event.title}</span>
                    <span className={styles['custom-calendar__events-card-header-icon']}>{event.icon}</span>
                  </div>
                  {event.badge && <span className={styles['custom-calendar__events-card-badge']}>{event.badge}</span>}
                  <div className={styles['custom-calendar__events-card-time']}>{event.time}</div>
                  {event.room && <div className={styles['custom-calendar__events-card-room']}>📍{event.room}</div>}
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
                  style={{ borderLeftColor: event.color }}
                >
                  <div className={styles['custom-calendar__events-card-header']}>
                    <span className={styles['custom-calendar__events-card-header-title']}>{event.title}</span>
                    <span className={styles['custom-calendar__events-card-header-icon']}>{event.icon}</span>
                  </div>
                  {event.badge && (
                    <span
                      className={styles['custom-calendar__events-card-badge']}
                      style={{ backgroundColor: event.color }}
                    >
                      {event.badge}
                    </span>
                  )}
                  <div className={styles['custom-calendar__events-card-time']}>{event.time}</div>
                  {event.room && <div className={styles['custom-calendar__events-card-room']}>📍{event.room}</div>}
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
                  style={{ borderLeftColor: event.color }}
                >
                  <div className={styles['custom-calendar__events-card-header']}>
                    <span className={styles['custom-calendar__events-card-header-title']}>{event.title}</span>
                    <span className={styles['custom-calendar__events-card-header-icon']}>{event.icon}</span>
                  </div>
                  {event.badge && <span className={styles['custom-calendar__events-card-badge']}>{event.badge}</span>}
                  <div className={styles['custom-calendar__events-card-time']}>{event.time}</div>
                  {event.room && <div className={styles['custom-calendar__events-card-room']}>📍{event.room}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles['custom-calendar']}>
      {/* <div className={styles['custom-calendar__header']}>
        <button onClick={prevMonth} className={styles['custom-calendar__header-btn']}>
          ←
        </button>
        <h2 className={styles['custom-calendar__header-title']}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={nextMonth} className={styles['custom-calendar__header-btn']}>
          →
        </button>
      </div> */}
      <div className={styles['custom-calendar__weekdays']}>
        {weekDays.map(day => (
          <div key={day} className={styles['custom-calendar__weekdays-day']}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles['custom-calendar__grid']}>{renderCalendar()}</div>
    </div>
  );
};
