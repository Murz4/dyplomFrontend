import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import dinosaurImage from '/dinosaurImage.svg';

import styles from './header.module.scss';

export const Header = () => (
  <div className={styles.container}>
    <img src={dinosaurImage} />
    <div className={styles.container__buttons}>
      <div style={{ width: 70 }}>
        <HeaderButton>Create</HeaderButton>
      </div>
      <div style={{ width: 70 }}>
        <HeaderButton>Join</HeaderButton>
      </div>
    </div>
  </div>
);
