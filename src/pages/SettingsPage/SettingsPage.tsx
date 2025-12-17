import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { HeaderButton } from '@modules/header/HeaderButton/HeaderButton';
import { CustomInput } from '@common/components/CustomInput/CustomInput';
import { ArchivedProjectItem } from '@modules/settings/ArchivedProjectItem';
import { useAppDispatch, useAppSelector } from '@common/store/hooks';
import { getProjects } from '@common/store/slicer/getProjectsSlice';
import styles from './settingsPage.module.scss';
import { patchArchive } from 'src/api/patchArchive';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects);

  const archivedProjects = projects.items.filter(project => project.is_archived === true);

  const handleClose = () => setActiveSection(null);

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

  useLayoutEffect(() => {
    if (activeSection === 'archive') {
      const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
          await dispatch(getProjects({ cursor: 0, limit: 10 })).unwrap();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load projects');
          console.error('Error fetching projects:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    }
  }, [activeSection, dispatch]);

  const handleRestore = async (projectId: number) => {
    setRestoringId(projectId);
    try {
      patchArchive({ project_id: projectId, is_archived: false });
      await dispatch(getProjects({ cursor: 0, limit: 10 })).unwrap();
    } catch (err) {
      console.error('Failed to restore project:', err);
    } finally {
      setRestoringId(null);
    }
  };

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

        <div
          className={styles.container__settingsItem}
          onClick={() => setActiveSection('email')}
          role='button'
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActiveSection('email')}
        >
          <span className={styles.container__settingsItemLabel}>Change Email</span>
          <span className={styles.container__settingsItemArrow}>→</span>
        </div>

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

                {loading && (
                  <div className={styles.container__loadingState}>
                    <div className={styles.container__spinner} />
                    <p className={styles.container__loadingText}>Loading archived projects...</p>
                  </div>
                )}

                {error && !loading && (
                  <div className={styles.container__errorState}>
                    <div className={styles.container__errorIcon}>Warning</div>
                    <h3 className={styles.container__errorTitle}>Oops! Something went wrong</h3>
                    <p className={styles.container__errorMessage}>{error}</p>
                    <button
                      className={styles.container__retryButton}
                      onClick={() => {
                        setError(null);
                        dispatch(getProjects({ cursor: 0, limit: 50 }));
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && archivedProjects.length === 0 && (
                  <div className={styles.container__emptyState}>
                    <div className={styles.container__emptyIcon}>Folder</div>
                    <h3 className={styles.container__emptyTitle}>No archived projects</h3>
                    <p className={styles.container__emptyDescription}>
                      All your projects are active. Archive one to see it here.
                    </p>
                  </div>
                )}

                {!loading && !error && archivedProjects.length > 0 && (
                  <div className={styles.container__archiveList}>
                    {archivedProjects.map(project => (
                      <ArchivedProjectItem
                        key={project.id}
                        projectName={project.name}
                        creatorName={project.creator.full_name || 'Unknown'}
                        onRestore={() => handleRestore(project.id)}
                        isRestoring={restoringId === project.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'name' && (
              <Formik
                initialValues={{ firstName: '', lastName: '' }}
                validationSchema={changeNameSchema}
                onSubmit={values => {
                  console.log('Name change:', values);
                  alert('Name updated successfully!');
                  handleClose();
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
                onSubmit={values => {
                  console.log('Password change:', values);
                  alert('Password updated successfully!');
                  handleClose();
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
