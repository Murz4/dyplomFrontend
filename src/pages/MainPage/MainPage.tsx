import { useLayoutEffect, useState } from 'react';
import styles from './mainPage.module.scss';
import { ProjectComponent } from '@modules/main/ProjectComponent/ProjectComponent';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getProjects } from '@common/store/slicer/getProjectsSlice';
import { ParticipantsModal } from '@modules/main/ProjectModal/ParticipantsModal';
import { getProjectMembers } from 'src/api/getProjectMembers';
import { ProjectSettings } from '@modules/main/ProjectSettings/ProjectSettings';
import { setProject } from '@common/store/slicer/projectDataSlice';

export const MainPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const projects = useAppSelector(state => state.projects);
  const dispatch = useAppDispatch();
  const [participants, setParticipants] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const filteredProjectsArray = projects.items.filter(item => item.is_archived === false);

  useLayoutEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log(24);
        await dispatch(getProjects({ cursor: 0, limit: 10 })).unwrap();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, [filteredProjectsArray.length]);

  const handleClickProject = (index: number) => {
    console.log(index);
  };

  const handleClickParticipants = async (index: number) => {
    setLoadingMembers(true);
    setShowParticipantsModal(true);
    try {
      const membersArray = await getProjectMembers(index);
      console.log(index);
      setParticipants(membersArray);
    } catch (error) {
      console.error('Error loading members:', error.message);
      setParticipants([]);
    } finally {
      setLoadingMembers(false);
    }
  };
  const handleClickSettings = async (index: number, name: string) => {
    await dispatch(setProject({ id: index, name: name }));

    setShowSettingsModal(true);
  };

  if (projects.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.container__main}>
          <div className={styles.container__headerMain}>
            <p className={styles.container__text}>Projects</p>
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
        <div className={styles.container__main}>
          <div className={styles.container__headerMain}>
            <p className={styles.container__text}>Projects</p>
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

  if (filteredProjectsArray.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.container__main}>
          <div className={styles.container__headerMain}>
            <p className={styles.container__text}>Projects</p>
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
      <div className={styles.container__main}>
        <div className={styles.container__headerMain}>
          <p className={styles.container__text}>Projects</p>
          <p className={styles.container__text} style={{ textDecoration: 'underline', marginTop: 2 }}>
            {filteredProjectsArray.length}
          </p>
        </div>
        {filteredProjectsArray.map((item, index) => (
          <ProjectComponent
            onClickUsers={() => handleClickParticipants(item.id)}
            onClick={() => handleClickProject(index)}
            creatorName={item.creator.full_name}
            onClickSettings={() => handleClickSettings(item.id, item.name)}
            name={item.name}
            key={item.id}
          />
        ))}
      </div>
      {showParticipantsModal && (
        <ParticipantsModal
          onClosed={() => {
            setShowParticipantsModal(false);
            setParticipants([]);
            setLoadingMembers(false);
          }}
          participants={participants}
          loading={loadingMembers}
        />
      )}
      {showSettingsModal && <ProjectSettings onClosed={() => setShowSettingsModal(false)} />}
    </div>
  );
};
