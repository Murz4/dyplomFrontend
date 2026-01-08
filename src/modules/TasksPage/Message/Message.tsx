import styles from './messageStyle.module.scss';

interface IMessageProps {
  title: string;
  message: string;
  task: {
    priority_id: number;
    is_completed: boolean;
  };
  onClick: () => void;
}

export const Message = ({ title, message, task, onClick }: IMessageProps) => {
  const getPriorityColor = (): string => {
    if (task.is_completed) {
      return '#9333EA';
    }

    switch (task.priority_id) {
      case 1:
        return '#FF6773';
      case 2:
        return '#FEBC51';
      case 3:
        return '#C4E565';
      case 4:
        return '#97A5E5';
      default:
        return '#9CA3AF';
    }
  };

  const priorityColor = getPriorityColor();

  return (
    <div onClick={onClick} className={styles.container}>
      <div className={styles.priorityStripe} style={{ backgroundColor: priorityColor }} />

      <div className={styles.content}>
        <p className={styles.container__title}>{title}</p>
        <p className={styles.container__text}>{message || 'There is no description'}</p>
      </div>
    </div>
  );
};
