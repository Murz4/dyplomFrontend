import styles from './projectComponentStyle.module.scss';

interface IProjectComponent {
  name: string;
  creatorName: string;
  creatorSurname: string;
  onClick?: () => void;
  onClickUsers?: () => void;
  onClickSettings?: () => void;
}

export const ProjectComponent = ({
  name,
  onClick,
  onClickUsers,
  onClickSettings,
  creatorName,
  creatorSurname,
}: IProjectComponent) => (
  <div className={styles.container}>
    <button onClick={onClick} className={styles.container__button}>
      <p className={styles.container__buttonText}>{name}</p>
    </button>
    <div className={styles.container__rightContent}>
      <div className={styles.container__rightContentTop}>
        <img
          onClick={onClickUsers}
          width={25}
          height={25}
          style={{ cursor: 'pointer' }}
          src='/empImg.svg'
          alt='emp image'
        />
        <img
          onClick={onClickSettings}
          width={25}
          height={25}
          style={{ cursor: 'pointer' }}
          src='/settingIcon.svg'
          alt='settings icon'
        />
      </div>
      <p style={{ fontSize: 20, color: 'black', fontWeight: 500 }}>
        creator:
        <span style={{ fontSize: 20, color: 'orange', fontWeight: 'bold' }}>
          {creatorName} {creatorSurname}
        </span>
      </p>
    </div>
  </div>
);
