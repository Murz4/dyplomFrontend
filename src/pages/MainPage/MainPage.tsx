import artBoardCenter from '/artBoardMain.png';

import { Header } from '@common/components/Header/Header';

import styles from './mainPage.module.scss';

export const MainPage = () => (
  <div className={styles.container}>
    <div>
      <img className={styles.container__img} src={artBoardCenter} />
      <div style={{ zIndex: 1, position: 'relative' }}>
        <Header />
      </div>
    </div>
  </div>
);
