import styles from './smallCalendarStyles.module.scss';

//@ts-ignore
export const SmallCalendar = ({ currentDate, setCurrentDate }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const renderDays = () => {
    const days = [];
    const today = new Date();

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonthDate);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div key={`prev-${day}`} className={`${styles.day} ${styles.otherMonth}`}>
          {day}
        </div>
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        i === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      days.push(
        <div key={`current-${i}`} className={`${styles.day} ${isToday ? styles.today : ''}`}>
          {i}
        </div>
      );
    }

    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className={`${styles.day} ${styles.otherMonth}`}>
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.smallCalendar}>
      <div className={styles.header}>
        <button onClick={prevMonth}>←</button>
        <span>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={nextMonth}>→</button>
      </div>

      <div className={styles.weekdays}>
        {weekDays.map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className={styles.grid}>{renderDays()}</div>
    </div>
  );
};
