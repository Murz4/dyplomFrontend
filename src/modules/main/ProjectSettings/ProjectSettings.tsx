import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import styles from './projectSettings.module.scss';
import { FaKey, FaPen, FaTrashAlt } from 'react-icons/fa';
import { GoCheckbox } from 'react-icons/go';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { deleteProject } from 'src/api/deleteProject';
import { clearProject } from '@common/store/slicer/projectDataSlice';
import { removeProject } from '@common/store/slicer/getProjectsSlice';
import { patchArchive } from 'src/api/patchArchive';

type PageType =
  | 'main'
  | 'rename'
  | 'archive-confirm'
  | 'archive-success'
  | 'archive-error'
  | 'delete-confirm-1'
  | 'delete-confirm-2'
  | 'delete-success'
  | 'delete-error';

interface ProjectSettingsProps {
  onClosed: () => void;
}

export const ProjectSettings = ({ onClosed }: ProjectSettingsProps) => {
  const currentProjectName = useAppSelector(state => state.projectData.projectName);
  const currentProjectId = useAppSelector(state => state.projectData.projectId);
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const handleArchive = async () => {
    if (!currentProjectId) {
      return;
    }

    setIsArchiving(true);
    setArchiveError(null);

    try {
      await patchArchive({ project_id: currentProjectId, is_archived: true });
      setCurrentPage('archive-success');
      console.log(23233232);
      setTimeout(() => {
        dispatch(removeProject(currentProjectId));
        onClosed();
        dispatch(clearProject());
      }, 500);
    } catch (error: any) {
      let errorMessage = 'Failed to archive project. Please try again.';

      if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to archive this project.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setArchiveError(errorMessage);
      setCurrentPage('archive-error');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRenameClick = () => {
    setCurrentPage('rename');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmed || !currentProjectId) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProject(currentProjectId);
      setCurrentPage('delete-success');
      setTimeout(() => {
        dispatch(removeProject(currentProjectId));
        onClosed();
        dispatch(clearProject());
      }, 500);
    } catch (error: any) {
      let errorMessage = 'Failed to delete project. Please try again.';

      if (error?.response?.status === 403) {
        errorMessage = 'You are not the owner of this project and cannot delete it.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setDeleteError(errorMessage);
      setCurrentPage('delete-error');
    } finally {
      setIsDeleting(false);
    }
  };

  const validationSchema = Yup.object({
    newName: Yup.string()
      .trim()
      .required('Project name is required')
      .min(1, 'Name cannot be empty')
      .notOneOf([currentProjectName], 'New name must be different from the current one')
      .max(100, 'Name is too long'),
  });

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return (
          <div className={styles.settings}>
            <h2 className={styles.settings__title}>Project Settings</h2>
            <div className={styles.settings__menu}>
              <button onClick={handleRenameClick} className={styles.settings__item}>
                <FaPen />
                <p>Project Name: {currentProjectName}</p>
              </button>
              <button className={styles.settings__item}>
                <FaKey />
                <p>Project Access Settings</p>
              </button>
              <button
                onClick={() => setCurrentPage('archive-confirm')}
                className={`${styles.settings__item} ${styles['settings__item--complete']}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GoCheckbox size={18} color='black' strokeWidth={0.5} />
                  <p style={{ fontSize: 14, fontWeight: '500', color: 'black', marginTop: 2 }}>Complete Project</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentPage('delete-confirm-1')}
                className={`${styles.settings__item} ${styles['settings__item--delete']}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaTrashAlt size={16} color='white' />
                  <p style={{ fontSize: 14, fontWeight: '500', color: 'white', marginTop: 2 }}>Delete Project</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 'rename':
        return (
          <div className={styles.page}>
            <button
              onClick={() => setCurrentPage('main')}
              className={styles.page__backButton}
              aria-label='Back to settings'
            >
              ← Back
            </button>
            <h3 className={styles.page__title}>Edit Project Name</h3>

            <Formik
              initialValues={{ newName: currentProjectName }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                const trimmedName = values.newName.trim();

                try {
                  setSubmitting(true);
                  setStatus(null);

                  setStatus({ success: true });
                  setTimeout(() => setCurrentPage('main'), 800);
                } catch (error: any) {
                  setStatus({
                    error: error?.message || 'Failed to update project name. Please try again.',
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status, dirty }) => (
                <Form>
                  <Field
                    name='newName'
                    type='text'
                    className={styles.renameInput}
                    placeholder='Enter new project name'
                    autoFocus
                  />

                  <ErrorMessage name='newName'>
                    {msg => <div style={{ color: '#ff4444', marginBottom: '15px', fontSize: '14px' }}>{msg}</div>}
                  </ErrorMessage>

                  {status?.success && (
                    <div style={{ color: '#4caf50', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}>
                      Project name successfully updated!
                    </div>
                  )}

                  {status?.error && (
                    <div style={{ color: '#ff4444', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}>
                      {status.error}
                    </div>
                  )}

                  <div className={styles.page__buttons}>
                    <button
                      type='submit'
                      disabled={isSubmitting || !dirty}
                      className={`${styles.page__button} ${styles['page__button--primary']}`}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type='button'
                      onClick={() => setCurrentPage('main')}
                      className={`${styles.page__button} ${styles['page__button--secondary']}`}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        );

      case 'archive-confirm':
        return (
          <div className={styles.page}>
            <button onClick={() => setCurrentPage('main')} className={styles.page__backButton} disabled={isArchiving}>
              ← Back
            </button>
            <h3 className={styles.page__title}>Are you sure you want to archive this project?</h3>
            <div className={styles.page__buttons}>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className={`${styles.page__button} ${styles['page__button--primary']}`}
              >
                {isArchiving ? 'Archiving...' : 'Sure'}
              </button>
              <button
                onClick={() => setCurrentPage('main')}
                disabled={isArchiving}
                className={`${styles.page__button} ${styles['page__button--secondary']}`}
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'archive-success':
        return (
          <div className={styles.page}>
            <h3 className={styles.page__title}>The project has been archived!</h3>
            <img style={{ width: 128, height: 128, alignSelf: 'center' }} src='/docs.svg' alt='Archived' />
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              This window will close automatically...
            </p>
          </div>
        );

      case 'archive-error':
        return (
          <div className={styles.page}>
            <button onClick={() => setCurrentPage('archive-confirm')} className={styles.page__backButton}>
              ← Back
            </button>

            <h3 className={styles.page__title} style={{ color: '#ff4444' }}>
              Failed to archive project
            </h3>

            <p style={{ textAlign: 'center', color: '#ff4444', fontSize: '15px', margin: '20px 0' }}>{archiveError}</p>

            <div className={styles.page__buttons}>
              <button
                onClick={() => setCurrentPage('main')}
                className={`${styles.page__button} ${styles['page__button--secondary']}`}
              >
                Back to Settings
              </button>
            </div>
          </div>
        );

      case 'delete-confirm-1':
        return (
          <div className={styles.page}>
            <button onClick={() => setCurrentPage('main')} className={styles.page__backButton}>
              ← Back
            </button>
            <h3 className={styles.page__title}>Are you sure you want to delete this project?</h3>
            <div className={styles.page__buttons}>
              <button
                onClick={() => setCurrentPage('delete-confirm-2')}
                className={`${styles.page__button} ${styles['page__button--primary']}`}
              >
                Sure
              </button>
              <button
                onClick={() => setCurrentPage('main')}
                className={`${styles.page__button} ${styles['page__button--secondary']}`}
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'delete-confirm-2':
        return (
          <div className={styles.page}>
            <button
              onClick={() => setCurrentPage('delete-confirm-1')}
              className={styles.page__backButton}
              disabled={isDeleting}
            >
              ← Back
            </button>

            <div className={styles.page__checkboxContainer}>
              <label className={styles.page__checkboxLabel}>
                <input
                  type='checkbox'
                  checked={deleteConfirmed}
                  onChange={e => setDeleteConfirmed(e.target.checked)}
                  className={styles.page__checkbox}
                  disabled={isDeleting}
                />
                <span>I confirm that the deleted project will no longer be able to be restored.</span>
              </label>
            </div>

            <div className={styles.page__buttons}>
              <button
                onClick={handleDeleteConfirm}
                disabled={!deleteConfirmed || isDeleting}
                className={`${styles.page__button} ${styles['page__button--primary']}`}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setCurrentPage('delete-confirm-1')}
                disabled={isDeleting}
                className={`${styles.page__button} ${styles['page__button--secondary']}`}
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'delete-success':
        return (
          <div className={styles.page}>
            <h3 className={styles.page__title}>The project has been successfully deleted!</h3>
            <img style={{ width: 128, height: 128, alignSelf: 'center' }} src='/trash.svg' alt='Deleted' />
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              This window will close automatically...
            </p>
          </div>
        );

      case 'delete-error':
        return (
          <div className={styles.page}>
            <button onClick={() => setCurrentPage('delete-confirm-2')} className={styles.page__backButton}>
              ← Back
            </button>

            <h3 className={styles.page__title} style={{ color: '#ff4444' }}>
              Failed to delete project
            </h3>

            <p style={{ textAlign: 'center', color: '#ff4444', fontSize: '15px', margin: '20px 0' }}>{deleteError}</p>

            <div className={styles.page__buttons}>
              <button
                onClick={() => setCurrentPage('main')}
                className={`${styles.page__button} ${styles['page__button--secondary']}`}
              >
                Back to Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div onClick={onClosed} className={styles.container__wrapper}>
      <div onClick={e => e.stopPropagation()} className={styles.container}>
        <button
          onClick={onClosed}
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: '50%',
            transition: 'background-color 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label='Close modal'
        >
          <IoCloseOutline size={30} color='#333' />
        </button>

        <div className={styles.modal__body}>{renderPage()}</div>
      </div>
    </div>
  );
};
