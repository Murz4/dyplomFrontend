import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import dinosaurImage from '/dinosaurImage.svg';
import { useState } from 'react';
import { Modal } from '@modules/main/Modal/Modal';

import styles from './header.module.scss';
import { CustomInput } from '../CustomInput/CustomInput';
import { StepItem } from '../StepItem/StepItem';
import { DropDown } from '../DropDown/DropDown';

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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              width: '100%',
            }}
          >
            <p className={styles.container__modalTitle}>Create your project</p>
            {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <p className={styles.container__modalLabel}>Name</p>
              <CustomInput placeholder='Enter the project name' />
            </div> */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <p className={styles.container__modalLabel}>Purpose</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 20, color: 'black' }}>Select the category:</p>
                <DropDown title='Workinga'>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p>Education</p>
                    <p>Entertainment</p>
                    <p>Business</p>
                  </div>
                </DropDown>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
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
