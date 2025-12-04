import { ReactNode } from 'react';
import { IoAddOutline } from 'react-icons/io5';

import styles from './TaskComponentStyle.module.scss';

interface ITaskComponentProps {
  taskType: 'today' | 'week' | 'urgently';
  children: ReactNode;
}

const TASK_CONFIG = {
  today: {
    label: 'Today',
    header: styles.container__headerToday,
    containerType: styles.container__containerPrimary,
    contentType: styles.container__contentPrimary,
  },
  week: {
    label: 'Week',
    header: styles.container__headerWeek,
    containerType: styles.container__containerSecondary,
    contentType: styles.container__contentSecondary,
  },
  urgently: {
    label: 'Urgently',
    header: styles.container__headerUrgently,
    containerType: styles.container__containerPrimary,
    contentType: styles.container__contentPrimary,
  },
} as const;

export const TaskComponent = ({ taskType, children }: ITaskComponentProps) => {
  const config = TASK_CONFIG[taskType];

  return (
    <div className={`${styles.container} ${config.containerType}`}>
      <div className={`${styles.container__headerWrapper} ${config.header}`}>
        <p className={styles.container__title}>{config.label}</p>
        <IoAddOutline size={35} />
      </div>
      <div className={styles.container__main}>
        <div className={`${styles.container__content} ${config.contentType}`}>
          {children}
          <div />
        </div>
      </div>
    </div>
  );
};
