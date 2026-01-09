import { useEffect, useState } from 'react';
import styles from './calendarStyles.module.scss';
import { clearCache, fetchTasks } from '@common/store/slicer/getTasksSlice';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getTaskById } from '@common/store/slicer/taskSlice';
import { TaskModal } from '@common/components/TaskModal/TaskModal';

interface IEvent {
  id: number;
  date: string;
  title: string;
  project: string;
  priority: string;
  isCompleted: boolean;
}

export const Calendar = ({ currentDate }: { currentDate: Date; setCurrentDate: (date: Date) => void }) => {
  const dispatch = useAppDispatch();
  const { tasks, loading: tasksLoading } = useAppSelector(state => state.getTasks);
  const { task: selectedTask, loading: taskLoading, error: taskError } = useAppSelector(state => state.task);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('id', selectedTask?.id);
  }, [selectedTask]);

  const getPriorityText = (priorityId: number): string => {
    switch (priorityId) {
      case 1:
        return 'urgent';
      case 2:
        return 'high';
      case 3:
        return 'normal';
      case 4:
        return 'low';
      default:
        return 'normal';
    }
  };

  const getPriorityColor = (priority: string, isCompleted: boolean) => {
    if (isCompleted) {
      return '#9333EA';
    }
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

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    dispatch(fetchTasks({ year, month }));
  }, [currentDate, dispatch]);

  useEffect(
    () => () => {
      dispatch(clearCache());
    },
    [dispatch]
  );

  useEffect(() => {
    const formattedEvents: IEvent[] = tasks.map(task => {
      const startAt = task.start_at ?? '';
      const deadlineAt = task.deadline_at ?? '';

      const startDate = startAt.split('T')[0] || '';
      const deadlineDate = deadlineAt.split('T')[0] || startDate || '';

      const startTime = startAt.split('T')[1]?.slice(0, 5);
      const deadlineTime = deadlineAt.split('T')[1]?.slice(0, 5);

      const id = task.task_id ?? (task as any).id ?? 0;

      let subtitle = task.description || `Project ${task.project_id || ''}`;

      const hasWithoutTime = task.without_time !== undefined;
      const isWithoutTime = hasWithoutTime && task.without_time === true;

      if (hasWithoutTime) {
        if (isWithoutTime) {
          if (startDate && deadlineDate && startDate !== deadlineDate) {
            subtitle = `${startDate.replace(/-/g, '.')} – ${deadlineDate.replace(/-/g, '.')}`;
          } else if (deadlineDate) {
            subtitle = deadlineDate.replace(/-/g, '.');
          }
        } else {
          if (startDate === deadlineDate && startDate) {
            if (startTime && deadlineTime && startTime !== deadlineTime) {
              subtitle = `${startDate.replace(/-/g, '.')} ${startTime}–${deadlineTime}`;
            } else if (startTime) {
              subtitle = `${startDate.replace(/-/g, '.')} в ${startTime}`;
            }
          } else {
            const startPart = startTime ? `${startDate.replace(/-/g, '.')} ${startTime}` : startDate.replace(/-/g, '.');
            const endPart = deadlineTime
              ? `${deadlineDate.replace(/-/g, '.')} ${deadlineTime}`
              : deadlineDate.replace(/-/g, '.');
            subtitle = `${startPart} – ${endPart}`;
          }
        }
      }

      return {
        id,
        date: deadlineDate,
        title: task.name,
        project: subtitle,
        priority: getPriorityText(task.priority_id),
        isCompleted: task.is_completed,
      };
    });

    setEvents(formattedEvents);
  }, [tasks]);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openTaskModal = (taskId: number) => {
    dispatch(getTaskById(taskId));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
                  style={{ backgroundColor: getPriorityColor(event.priority, event.isCompleted) }}
                  onClick={() => openTaskModal(event.id)}
                >
                  <div className={styles['custom-calendar__events-card-title']}>{event.title}</div>
                  <div className={styles['custom-calendar__events-card-project']}>{event.project}</div>
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
      days.push(
        <div key={day} className={`${styles['custom-calendar__grid-day']} ${isCurrentDay ? styles.today : ''}`}>
          <div className={styles['custom-calendar__day-number']}>{day}</div>
          {dayEvents.length > 0 && (
            <div className={styles['custom-calendar__events']}>
              {dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={styles['custom-calendar__events-card']}
                  style={{ backgroundColor: getPriorityColor(event.priority, event.isCompleted) }}
                  onClick={() => openTaskModal(event.id)}
                >
                  <div className={styles['custom-calendar__events-card-title']}>{event.title}</div>
                  <div className={styles['custom-calendar__events-card-project']}>{event.project}</div>
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
                  style={{ backgroundColor: getPriorityColor(event.priority, event.isCompleted) }}
                  onClick={() => openTaskModal(event.id)}
                >
                  <div className={styles['custom-calendar__events-card-title']}>{event.title}</div>
                  <div className={styles['custom-calendar__events-card-project']}>{event.project}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (tasksLoading) {
    return (
      <div className={styles['custom-calendar']}>
        <div className={styles['custom-calendar__loading']}>
          <div className={styles['custom-calendar__loading-spinner']}>
            <div className={styles['custom-calendar__loading-spinner-ring']} />
            <div className={styles['custom-calendar__loading-spinner-ring']} />
            <div className={styles['custom-calendar__loading-spinner-ring']} />
          </div>
          <p className={styles['custom-calendar__loading-text']}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <div className={styles['custom-calendar']}>
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
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentDate={currentDate}
        //@ts-ignore
        task={selectedTask}
        loading={taskLoading}
        error={taskError}
      />
    </>
  );
};
