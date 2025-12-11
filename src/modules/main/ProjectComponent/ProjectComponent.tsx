import styles from './projectComponentStyle.module.scss';

interface IProjectComponent {
  name: string;
  onClick?: () => void;
}

export const ProjectComponent = ({ name, onClick }: IProjectComponent) => (
  <div className={styles.container}>
    <button onClick={onClick} className={styles.container__button}>
      <p className={styles.container__buttonText}>{name}</p>
    </button>
    <div className={styles.container__rightContent}>
      <div className={styles.container__rightContentTop}>
        <img width={25} height={25} src='/empImg.svg' />
        <img width={25} height={25} src='/chatIcon.svg' />
        <img width={25} height={25} src='/settingIcon.svg' />
      </div>
      <p>Last activity: yesterday</p>
    </div>
  </div>
);
