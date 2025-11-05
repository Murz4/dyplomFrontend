import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import dinosaurImage from '/dinosaurImage.svg';
import { useState } from 'react';
import { Modal } from '@modules/main/Modal/Modal';

import styles from './header.module.scss';
import { CustomInput } from '../CustomInput/CustomInput';
import { StepItem } from '../StepItem/StepItem';

export const Header = () => {
  const [isClosed, setIsClosed] = useState(true);

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
      {isClosed === true ? null : (
        <Modal onClosed={() => setIsClosed(true)}>
          <div className={styles.container__modalWrapper}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 37 }}>
              <p className={styles.container__modalTitle}>Create your project</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <p className={styles.container__modalLabel}>Name</p>
                <CustomInput placeholder='Enter the project name' />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <HeaderButton style={{ borderRadius: 15, width: 88, height: 35 }}>Next</HeaderButton>
              </div>
              <StepItem colored={true} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
