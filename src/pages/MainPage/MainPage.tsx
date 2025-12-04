import artBoardCenter from '/artBoardMain.png';

import styles from './mainPage.module.scss';

export const MainPage = () => (
  <div className={styles.container}>
    <div>
      <img className={styles.container__img} src={artBoardCenter} />
    </div>
  </div>
);
