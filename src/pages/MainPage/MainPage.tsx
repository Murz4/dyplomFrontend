import { useLayoutEffect, useState } from 'react';
import styles from './mainPage.module.scss';
import { ProjectComponent } from '@modules/main/ProjectComponent/ProjectComponent';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getProjects } from '@common/store/slicer/getProjectsSlice';

export const MainPage = () => {
  const [error, setError] = useState<string | null>(null);
  const projects = useAppSelector(state => state.projects);
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log(24);
        await dispatch(getProjects({ cursor: 0, limit: 10 })).unwrap();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching projects:', err);
      } finally {
      }
    };

    fetchProjects();
  }, [projects.items.length]);

  const handleClickProject = (index: number) => {
    console.log(index);
  };

  if (projects.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.container__leftSide} />
        <div className={styles.container__main}>
          <div className={styles.container__headerMain}>
            <p className={styles.container__text}>Recent projects</p>
          </div>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.container__leftSide} />
        <div className={styles.container__main}>
          <div className={styles.container__headerMain}>
            <p className={styles.container__text}>Recent projects</p>
          </div>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Oops! Something went wrong</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.container__leftSide} />
        <div className={styles.container__main}>
          <div className={styles.container__headerMain}>
            <p className={styles.container__text}>Recent projects</p>
            <p className={styles.container__text} style={{ textDecoration: 'underline', marginTop: 2 }}>
              0
            </p>
          </div>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h3 className={styles.emptyTitle}>No projects yet</h3>
            <p className={styles.emptyDescription}>Start creating your first project and bring your ideas to life!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__leftSide} />
      <div className={styles.container__main}>
        <div className={styles.container__headerMain}>
          <p className={styles.container__text}>Recent projects</p>
          <p className={styles.container__text} style={{ textDecoration: 'underline', marginTop: 2 }}>
            {projects.items.length}
          </p>
        </div>
        {projects.items.map((item, index) => (
          <ProjectComponent onClick={() => handleClickProject(index)} name={item.name} key={item.id} />
        ))}
      </div>
    </div>
  );
};
