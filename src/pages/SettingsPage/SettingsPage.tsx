import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import { CustomInput } from '@common/components/CustomInput/CustomInput';
import { ArchivedProjectItem } from '@modules/settings/ArchivedProjectItem';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getProjects, removeProject, resetProjects } from '@common/store/slicer/getProjectsSlice';
import styles from './settingsPage.module.scss';
import { patchArchive } from 'src/api/patchArchive';
import { patchChangeName } from 'src/api/patchChangeName';
import { getUserName } from '@common/store/slicer/fullNameSlice';
import { patchChangePassword } from 'src/api/patchChangePassword';

const changeNameSchema = Yup.object({
  firstName: Yup.string().min(2, 'Minimum 2 characters').required('Required field'),
  lastName: Yup.string().min(2, 'Minimum 2 characters').required('Required field'),
});

const changeEmailSchema = Yup.object({
  newEmail: Yup.string().email('Invalid email').required('Required field'),
  password: Yup.string().required('Enter password to confirm'),
});

const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Required field'),
  newPassword: Yup.string().min(6, 'Minimum 6 characters').required('Required field'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Confirm new password'),
});

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<'archive' | 'name' | 'email' | 'password' | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const projectsState = useAppSelector(state => state.projects);

  const archivedProjects = projectsState.items.filter(project => project.is_archived);

  const handleClose = () => {
    setActiveSection(null);
    setSuccessMessage(null);
  };

  useLayoutEffect(() => {
    if (activeSection === 'archive') {
      setError(null);
      dispatch(resetProjects());
      dispatch(getProjects({ limit: 10 }));
    }
  }, [activeSection, dispatch]);

  const loadMoreArchived = async () => {
    if (isLoadingMore || !projectsState.hasMore || !projectsState.nextCursor || projectsState.loading) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await dispatch(getProjects({ cursor: projectsState.nextCursor, limit: 10 })).unwrap();
    } catch (err) {
      console.error('Failed to load more archived projects:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const currentTarget = observerTarget.current;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && projectsState.hasMore && !projectsState.loading && !isLoadingMore) {
          loadMoreArchived();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [projectsState.hasMore, projectsState.loading, projectsState.nextCursor, isLoadingMore]);

  const handleRestore = async (projectId: number) => {
    setRestoringId(projectId);
    setError(null);

    try {
      await patchArchive({ project_id: projectId, is_archived: false });
      dispatch(removeProject(projectId));
    } catch (err: any) {
      console.error('Failed to restore project:', err);
      setError(err.message || 'Failed to restore project');
    } finally {
      setRestoringId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.querySelector(`.${styles.container__formContainer}`)?.contains(event.target as Node)
      ) {
        setActiveSection(null);
      }
    };

    if (activeSection) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeSection]);

  return (
    <div className={styles.container}>
      <h1 className={styles.container__title}>Settings</h1>

      <div className={styles.container__settingsList}>
        <div
          className={styles.container__settingsItem}
          onClick={() => setActiveSection('archive')}
          role='button'
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActiveSection('archive')}
        >
          <span className={styles.container__settingsItemLabel}>Project Archive</span>
          <span className={styles.container__settingsItemArrow}>→</span>
        </div>

        <div
          className={styles.container__settingsItem}
          onClick={() => setActiveSection('name')}
          role='button'
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActiveSection('name')}
        >
          <span className={styles.container__settingsItemLabel}>Change First & Last Name</span>
          <span className={styles.container__settingsItemArrow}>→</span>
        </div>

        {/* <div
          className={styles.container__settingsItem}
          onClick={() => setActiveSection('email')}
          role='button'
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActiveSection('email')}
        >
          <span className={styles.container__settingsItemLabel}>Change Email</span>
          <span className={styles.container__settingsItemArrow}>→</span>
        </div> */}

        <div
          className={styles.container__settingsItem}
          onClick={() => setActiveSection('password')}
          role='button'
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActiveSection('password')}
        >
          <span className={styles.container__settingsItemLabel}>Change Password</span>
          <span className={styles.container__settingsItemArrow}>→</span>
        </div>
      </div>

      {activeSection && (
        <div className={styles.container__formOverlay} ref={overlayRef}>
          <div className={styles.container__formContainer}>
            <button className={styles.container__backButton} onClick={handleClose}>
              ← Back
            </button>

            {activeSection === 'archive' && (
              <div className={styles.container__archiveSection}>
                <h2 className={styles.container__title}>Project Archive</h2>

                {projectsState.loading && archivedProjects.length === 0 && (
                  <div className={styles.container__loadingState}>
                    <div className={styles.container__spinner} />
                    <p className={styles.container__loadingText}>Loading archived projects...</p>
                  </div>
                )}

                {(projectsState.error || error) && (
                  <div className={styles.container__errorState}>
                    <div className={styles.container__errorIcon}>⚠️</div>
                    <h3 className={styles.container__errorTitle}>Oops! Something went wrong</h3>
                    <p className={styles.container__errorMessage}>{error || projectsState.error}</p>
                    <button
                      className={styles.container__retryButton}
                      onClick={() => {
                        setError(null);
                        dispatch(resetProjects());
                        dispatch(getProjects({ limit: 10 }));
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!projectsState.loading && !projectsState.error && !error && archivedProjects.length === 0 && (
                  <div className={styles.container__emptyState}>
                    <div className={styles.container__emptyIcon}>📁</div>
                    <h3 className={styles.container__emptyTitle}>No archived projects</h3>
                    <p className={styles.container__emptyDescription}>
                      All your projects are active. Archive one to see it here.
                    </p>
                  </div>
                )}

                {!projectsState.loading && !projectsState.error && !error && archivedProjects.length > 0 && (
                  <div className={styles.container__archiveList}>
                    {archivedProjects.map(project => (
                      <ArchivedProjectItem
                        key={project.id}
                        projectName={project.name}
                        creatorName={project.creator.name || 'Unknown'}
                        creatorSurname={project.creator.surname || 'Unknown'}
                        onRestore={() => handleRestore(project.id)}
                        isRestoring={restoringId === project.id}
                      />
                    ))}

                    {projectsState.hasMore && (
                      <div ref={observerTarget} className={styles.loadMoreTrigger}>
                        {isLoadingMore && (
                          <div className={styles.container__loadingMore}>
                            <div className={styles.container__spinner} />
                            <p>Loading more archived projects...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'name' && (
              <Formik
                initialValues={{ firstName: '', lastName: '' }}
                validationSchema={changeNameSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setError(null);
                  try {
                    await patchChangeName({ name: values.firstName, surname: values.lastName });
                    dispatch(getUserName());
                    handleClose();
                  } catch (err: any) {
                    setError(err.message || 'Invalid update name');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, touched }) => (
                  <Form className={styles.container__form}>
                    <h2 className={styles.container__title}>Change Name</h2>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>First Name</p>
                      <Field name='firstName'>
                        {({ field }: any) => <CustomInput {...field} placeholder='Enter first name' />}
                      </Field>
                      {errors.firstName && touched.firstName && (
                        <div className={styles.container__error}>{errors.firstName}</div>
                      )}
                    </div>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>Last Name</p>
                      <Field name='lastName'>
                        {({ field }: any) => <CustomInput {...field} placeholder='Enter last name' />}
                      </Field>
                      {errors.lastName && touched.lastName && (
                        <div className={styles.container__error}>{errors.lastName}</div>
                      )}
                    </div>
                    {error && (
                      <div className={styles.container__error} style={{ marginBottom: '16px' }}>
                        {error}
                      </div>
                    )}
                    <HeaderButton type='submit' className={styles.container__submitButton}>
                      Save Changes
                    </HeaderButton>
                  </Form>
                )}
              </Formik>
            )}

            {activeSection === 'email' && (
              <Formik
                initialValues={{ newEmail: '', password: '' }}
                validationSchema={changeEmailSchema}
                onSubmit={values => {
                  console.log('Email change:', values);
                  alert('Confirmation email sent to new address');
                  handleClose();
                }}
              >
                {({ errors, touched }) => (
                  <Form className={styles.container__form}>
                    <h2 className={styles.container__title}>Change Email</h2>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>New Email</p>
                      <Field name='newEmail'>
                        {({ field }: any) => <CustomInput {...field} placeholder='example@mail.com' />}
                      </Field>
                      {errors.newEmail && touched.newEmail && (
                        <div className={styles.container__error}>{errors.newEmail}</div>
                      )}
                    </div>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>Current Password</p>
                      <Field name='password' type='password'>
                        {({ field }: any) => <CustomInput {...field} placeholder='Enter password' type='password' />}
                      </Field>
                      {errors.password && touched.password && (
                        <div className={styles.container__error}>{errors.password}</div>
                      )}
                    </div>

                    <HeaderButton type='submit' className={styles.container__submitButton}>
                      Update Email
                    </HeaderButton>
                  </Form>
                )}
              </Formik>
            )}

            {activeSection === 'password' && (
              <Formik
                initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                validationSchema={changePasswordSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setError(null);
                  try {
                    await patchChangePassword({
                      old_password: values.currentPassword,
                      new_password: values.newPassword,
                    });
                    setSuccessMessage('Password updated successfully!');
                    setTimeout(() => {
                      handleClose();
                    }, 500);
                  } catch (err: any) {
                    setError(err.message || 'Failed to change password');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, touched }) => (
                  <Form className={styles.container__form}>
                    <h2 className={styles.container__title}>Change Password</h2>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>Current Password</p>
                      <Field name='currentPassword' type='password'>
                        {({ field }: any) => (
                          <CustomInput {...field} placeholder='Enter current password' type='password' />
                        )}
                      </Field>
                      {errors.currentPassword && touched.currentPassword && (
                        <div className={styles.container__error}>{errors.currentPassword}</div>
                      )}
                    </div>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>New Password</p>
                      <Field name='newPassword' type='password'>
                        {({ field }: any) => (
                          <CustomInput {...field} placeholder='At least 6 characters' type='password' />
                        )}
                      </Field>
                      {errors.newPassword && touched.newPassword && (
                        <div className={styles.container__error}>{errors.newPassword}</div>
                      )}
                    </div>

                    <div className={styles.container__formGroup}>
                      <p className={styles.container__label}>Confirm New Password</p>
                      <Field name='confirmPassword' type='password'>
                        {({ field }: any) => (
                          <CustomInput {...field} placeholder='Repeat new password' type='password' />
                        )}
                      </Field>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <div className={styles.container__error}>{errors.confirmPassword}</div>
                      )}
                    </div>

                    {error && (
                      <div className={styles.container__error} style={{ marginBottom: '16px', textAlign: 'center' }}>
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div style={{ color: 'green', marginBottom: '16px', textAlign: 'center' }}>{successMessage}</div>
                    )}

                    <HeaderButton type='submit' className={styles.container__submitButton}>
                      Update Password
                    </HeaderButton>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
