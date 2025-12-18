import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@common/store/hooks';
import styles from './inviteHandlerPage.module.scss';
import { getJoinLink } from 'src/api/getJoinLink';

type Status = 'loading' | 'success' | 'error' | 'redirecting';

export const InviteHandlerPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);

  const [status, setStatus] = useState<Status>('loading');
  const [title, setTitle] = useState('Processing project invitation...');
  const [subtitle, setSubtitle] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setTitle('Invalid invitation link');
      setSubtitle(null);
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    const performJoin = async () => {
      try {
        const message = await getJoinLink(token);

        const successMessage = typeof message === 'string' ? message : 'You have successfully joined the project!';

        setStatus('success');
        setTitle(successMessage);
        setSubtitle('Redirecting to the app...');
        localStorage.removeItem('pendingInviteToken');

        setTimeout(() => navigate('/'), 1500);
      } catch (error: any) {
        console.error('Join error:', error);

        let errorMessage = 'Failed to join the project';

        if (error?.response?.data?.detail) {
          const detail = error.response.data.detail;
          if (Array.isArray(detail)) {
            errorMessage = detail
              .map((d: { msg?: string }) => d.msg || '')
              .filter(Boolean)
              .join('. ');
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          }
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setStatus('error');
        setTitle(errorMessage);
        setSubtitle('Redirecting to home page...');
        localStorage.removeItem('pendingInviteToken');

        setTimeout(() => navigate('/'), 3000);
      }
    };

    if (isAuthenticated) {
      performJoin();
    } else {
      localStorage.setItem('pendingInviteToken', token);

      setStatus('redirecting');
      setTitle('You need to log in to accept the invitation');
      setSubtitle('Redirecting to login page...');

      setTimeout(() => navigate('/login'), 1500);
    }
  }, [token, isAuthenticated, navigate]);

  return (
    <div className={styles.invitePage}>
      <div className={styles.invitePage__card}>
        {status === 'loading' && (
          <div className={`${styles.invitePage__icon} ${styles.invitePage__loadingIcon}`}>⏳</div>
        )}
        {status === 'success' && (
          <div className={`${styles.invitePage__icon} ${styles.invitePage__successIcon}`}>✅</div>
        )}
        {status === 'error' && <div className={`${styles.invitePage__icon} ${styles.invitePage__errorIcon}`}>❌</div>}
        {status === 'redirecting' && (
          <div className={`${styles.invitePage__icon} ${styles.invitePage__redirectIcon}`}>🔐</div>
        )}

        <h1 className={styles.invitePage__title}>{title}</h1>

        {subtitle && <p className={styles.invitePage__subtitle}>{subtitle}</p>}

        {status === 'loading' && <div className={styles.invitePage__spinner} />}
      </div>
    </div>
  );
};
