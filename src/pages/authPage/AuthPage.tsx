import ArtBoardTop from '/artBoardTop.png';
import ArtBoardBottom from '/artBoardBottom.png';

import styles from './authPage.module.scss';

export const AuthPage = () => (
  <div className={styles.container}>
    <img style={{ maxWidth: '100%', maxHeight: '100%', position: 'absolute', left: 0, top: 0 }} src={ArtBoardTop} />
    <img
      style={{ maxWidth: '100%', maxHeight: '100%', position: 'absolute', right: 0, bottom: 0 }}
      src={ArtBoardBottom}
    />
  </div>
);
