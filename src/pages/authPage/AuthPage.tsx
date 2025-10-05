import ArtBoardTop from '/artBoardTop.png';
import ArtBoardBottom from '/artBoardBottom.png';
import styles from './authPage.module.scss';
import { CustomInput } from '@common/components/CustomInput/CustomInput';
import { Link } from 'react-router-dom';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';

export const AuthPage = () => (
  <div className={styles.container}>
    <img className={styles.container__artTop} src={ArtBoardTop} alt='Decorative art board top' />
    <img className={styles.container__artBottom} src={ArtBoardBottom} alt='Decorative art board bottom' />

    <div className={styles.container__main}>
      <div className={styles.container__mainContent}>
        <div className={styles.container__inputsContainer}>
          <CustomInput label='Email' placeholder='Email' />
          <CustomInput label='Password' placeholder='Password' />
          <p className={styles.container__forgotPassword}>Forgot your password?</p>
        </div>
        <div className={styles.container__buttonsWrapper}>
          <div className={styles.container__loginButton}>
            <HeaderButton style={{ fontSize: '24px' }}>Log In</HeaderButton>
          </div>
          <p className={styles.container__divider}>or</p>
          <div className={styles.container__signupButton}>
            <HeaderButton style={{ fontSize: '24px' }}>Sign Up</HeaderButton>
          </div>
        </div>
      </div>
    </div>
  </div>
);
