import styles from './messageStyle.module.scss';

interface IMessageProps {
  title: string;
  message: string;
}

export const Message = ({ title, message }: IMessageProps) => (
  <div className={styles.container}>
    <p className={styles.container__title}>{title}</p>
    <p className={styles.container__text}>{message}</p>
  </div>
);
