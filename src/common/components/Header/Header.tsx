import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import dinosaurImage from '/dinosaurImage.svg';
import { useState } from 'react';
import { Modal } from '@modules/main/Modal/Modal';

import styles from './header.module.scss';

export const Header = () => {
  const [isClosed, setIsClosed] = useState(true);
  console.log(isClosed);

  return (
    <div className={styles.container}>
      <img src={dinosaurImage} />
      <div className={styles.container__buttons}>
        <div style={{ width: 70 }}>
          <HeaderButton onClick={() => setIsClosed(false)}>Create</HeaderButton>
        </div>
        <div style={{ width: 70 }}>
          <HeaderButton>Join</HeaderButton>
        </div>
      </div>
      {isClosed === true ? null : <Modal onClosed={() => setIsClosed(true)} />}
    </div>
  );
};
